'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { http } from '@/lib/http';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu({
  name,
  email,
}: {
  name: string | null;
  email?: string;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const label = name?.trim() || 'Admin';
  const initials = label.slice(0, 2).toUpperCase();

  async function signOut() {
    setSigningOut(true);

    try {
      await http.post('/auth/logout');
    } catch {
      // The cookie is cleared by the proxy on the way back; even if the API
      // call fails, push to login rather than stranding a half-signed-in user.
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:bg-secondary/70 flex items-center gap-3 rounded-full py-1 pr-2 pl-1 transition-colors"
        aria-label="Account menu"
      >
        <Avatar className="ring-background size-10 ring-2">
          <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Name and email are decoration next to the avatar; hidden on small
            screens per the responsive block in the design. */}
        <span className="hidden text-left sm:block">
          <span className="block text-[0.9375rem] leading-tight font-semibold">
            {label}
          </span>
          {email && (
            <span className="text-muted-foreground block text-[0.8125rem]">
              {email}
            </span>
          )}
        </span>

        <ChevronDown className="text-muted-foreground size-4" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel className="font-normal">
          <span className="block font-semibold">{label}</span>
          {email && (
            <span className="text-muted-foreground block text-xs">{email}</span>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/account">
            <UserRound className="size-4" aria-hidden="true" />
            Account profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Destructive action, visually separated from navigation. */}
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onSelect={(event) => {
            event.preventDefault();
            void signOut();
          }}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
