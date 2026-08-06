'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { http } from '@/lib/http';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);

    try {
      await http.post('/auth/logout');
    } catch {
      // Even if the API call fails the local cookie is cleared below, so the
      // admin is not stranded in a half-signed-in state.
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={pending}>
      {pending ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
