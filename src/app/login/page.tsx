'use client';

import { useActionState } from 'react';
import { Route } from 'lucide-react';
import { login, type ActionState } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SubmitButton } from '@/components/admin/submit-button';
import { FieldError, FormError } from '@/components/admin/field-error';

const initialState: ActionState = {};

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="bg-accent text-accent-foreground mb-2 grid size-9 place-items-center rounded-md">
            <Route className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Admin access to the lead distribution platform.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={formAction} className="space-y-4" noValidate>
            <FormError message={state.error} />

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                aria-invalid={Boolean(state.fieldErrors?.email)}
                aria-describedby={
                  state.fieldErrors?.email ? 'email-error' : undefined
                }
                className="mt-1.5"
              />
              <span id="email-error">
                <FieldError message={state.fieldErrors?.email} />
              </span>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(state.fieldErrors?.password)}
                aria-describedby={
                  state.fieldErrors?.password ? 'password-error' : undefined
                }
                className="mt-1.5"
              />
              <span id="password-error">
                <FieldError message={state.fieldErrors?.password} />
              </span>
            </div>

            <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
