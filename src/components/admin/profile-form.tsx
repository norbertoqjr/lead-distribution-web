'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Lock } from 'lucide-react';
import { http, toMessage } from '@/lib/http';
import { profileSchema, type Me, type ProfileInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardCard } from './dashboard-card';
import { FieldError, FormError } from './field-error';

export function ProfileForm({ user }: { user: Me }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: {
      name: user.name ?? '',
      currentPassword: '',
      newPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);
    setSaved(false);

    try {
      await http.patch('/auth/me', {
        name: values.name,
        // Password fields are only sent when a new one was actually typed.
        ...(values.newPassword
          ? {
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            }
          : {}),
      });

      // Clear the password fields so they are not left filled on screen.
      reset({ name: values.name, currentPassword: '', newPassword: '' });
      setSaved(true);
      router.refresh();
    } catch (error) {
      setFormError(toMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-3.5" noValidate>
      <DashboardCard title="Profile">
        <div className="space-y-4">
          <FormError message={formError} />

          {saved && (
            <p
              role="status"
              className="border-success/40 bg-success-muted text-success flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Your changes have been saved.
            </p>
          )}

          <div>
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              className="mt-1.5"
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1.5">
              <Input
                id="email"
                type="email"
                value={user.email}
                readOnly
                // readOnly rather than disabled: a disabled field is skipped by
                // the keyboard and read as unavailable, when the value here is
                // meaningful and worth copying.
                aria-describedby="email-hint"
                className="bg-muted text-muted-foreground pr-10"
              />
              <Lock
                className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
            <p id="email-hint" className="text-muted-foreground mt-1 text-xs">
              Your email is the sign-in identifier and cannot be changed here.
            </p>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Password">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Leave both fields empty to keep your current password.
          </p>

          <div>
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.currentPassword)}
              className="mt-1.5"
              {...register('currentPassword')}
            />
            <FieldError message={errors.currentPassword?.message} />
          </div>

          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.newPassword)}
              className="mt-1.5"
              {...register('newPassword')}
            />
            <FieldError message={errors.newPassword?.message} />
          </div>
        </div>
      </DashboardCard>

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
