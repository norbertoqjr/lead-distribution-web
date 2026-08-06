'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Route } from 'lucide-react';
import { http, toMessage } from '@/lib/http';
import { loginSchema, type LoginInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FieldError, FormError } from '@/components/admin/field-error';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    // Validate on blur, not on every keystroke — an error appearing while the
    // user is still typing their email reads as the form fighting them.
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      await http.post('/auth/login', values);

      // The destination the middleware preserved when it redirected here.
      const next = searchParams.get('next');
      router.push(next?.startsWith('/') ? next : '/dashboard');
      router.refresh();
    } catch (error) {
      setFormError(toMessage(error));
    }
  });

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
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormError message={formError} />

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                aria-invalid={Boolean(errors.email)}
                className="mt-1.5"
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                className="mt-1.5"
                {...register('password')}
              />
              <FieldError message={errors.password?.message} />
            </div>

            {/* Disabled while submitting so a double click cannot fire twice */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
