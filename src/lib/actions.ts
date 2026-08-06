'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  brokerSchema,
  distributionResponseSchema,
  formSchema,
  leadFormSchema,
  loginSchema,
  setBrokersSchema,
} from './schemas';
import { ApiError, apiFetch } from './api';

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'lds_session';

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

/** Zod issues flattened into the shape the forms render. */
function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}

function failure(error: unknown): ActionState {
  if (error instanceof ApiError) return { error: error.message };
  return { error: 'Something went wrong. Please try again.' };
}

export async function login(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const url = process.env.BACKEND_URL;
  if (!url) return { error: 'BACKEND_URL is not configured' };

  let response: Response;

  try {
    response = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
  } catch {
    return { error: 'Cannot reach the API. Is the backend running?' };
  }

  if (!response.ok) {
    return { error: 'Incorrect email or password' };
  }

  // Lift the token out of the API's Set-Cookie and reissue it on this origin,
  // so the browser holds a first-party httpOnly cookie and never learns the
  // backend's address.
  const setCookie = response.headers.get('set-cookie') ?? '';
  const token = new RegExp(`${SESSION_COOKIE}=([^;]+)`).exec(setCookie)?.[1];

  if (!token) return { error: 'The API did not return a session' };

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  redirect('/dashboard');
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}

export async function createBroker(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = brokerSchema.safeParse({
    name: formData.get('name'),
    isActive: formData.get('isActive') === 'on',
    dailyCap: formData.get('dailyCap'),
    timezone: formData.get('timezone'),
    openMinute: toMinutes(formData.get('openTime')),
    closeMinute: toMinutes(formData.get('closeTime')),
    workingDays: formData.getAll('workingDays').map(Number),
  });

  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  try {
    await apiFetch('/brokers', z.unknown(), {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });
  } catch (error) {
    return failure(error);
  }

  revalidatePath('/brokers');
  return { success: true };
}

export async function toggleBroker(
  id: number,
  isActive: boolean,
): Promise<ActionState> {
  try {
    await apiFetch(`/brokers/${id}`, z.unknown(), {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  } catch (error) {
    return failure(error);
  }

  revalidatePath('/brokers');
  return { success: true };
}

export async function createForm(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = formSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
  });

  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  try {
    await apiFetch('/forms', z.unknown(), {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });
  } catch (error) {
    return failure(error);
  }

  revalidatePath('/form');
  revalidatePath('/distribution');
  return { success: true };
}

export async function createDistribution(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brokerIds = formData.getAll('brokerIds').map(Number);

  try {
    await apiFetch('/distributions', distributionResponseSchema, {
      method: 'POST',
      body: JSON.stringify({ brokerIds }),
    });
  } catch (error) {
    // Carries the exam's required message verbatim when no form exists yet.
    return failure(error);
  }

  revalidatePath('/distribution');
  return { success: true };
}

export async function setDistributionBrokers(
  distributionId: number,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brokerIds = formData.getAll('brokerIds').map(Number);

  const parsed = setBrokersSchema.safeParse({
    brokers: brokerIds.map((brokerId) => ({
      brokerId,
      percentage: formData.get(`percentage-${brokerId}`) ?? 0,
      isActive: formData.get(`active-${brokerId}`) !== 'off',
    })),
  });

  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  try {
    await apiFetch(
      `/distributions/${distributionId}/brokers`,
      distributionResponseSchema,
      { method: 'PATCH', body: JSON.stringify(parsed.data) },
    );
  } catch (error) {
    return failure(error);
  }

  revalidatePath('/distribution');
  return { success: true };
}

export async function assignLead(
  leadId: number,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brokerId = Number(formData.get('brokerId'));

  if (!Number.isInteger(brokerId) || brokerId < 1) {
    return { error: 'Choose a broker' };
  }

  try {
    await apiFetch(`/leads/${leadId}/assign`, z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ brokerId }),
    });
  } catch (error) {
    return failure(error);
  }

  revalidatePath('/leads');
  revalidatePath('/distribution');
  return { success: true };
}

/** Public form submission. No session involved. */
export async function submitLead(
  slug: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = leadFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
  });

  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const url = process.env.BACKEND_URL;
  if (!url) return { error: 'BACKEND_URL is not configured' };

  try {
    const response = await fetch(
      `${url}/api/public/forms/${encodeURIComponent(slug)}/submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return { error: 'We could not submit your details. Please try again.' };
    }
  } catch {
    return { error: 'We could not reach the server. Please try again.' };
  }

  return { success: true };
}

/** "09:00" to minutes from midnight. */
function toMinutes(value: FormDataEntryValue | null): number {
  if (typeof value !== 'string' || !value.includes(':')) return 0;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}
