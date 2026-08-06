import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    // LoginForm reads searchParams for the post-login redirect, which needs a
    // Suspense boundary or the whole route opts out of prerendering.
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
