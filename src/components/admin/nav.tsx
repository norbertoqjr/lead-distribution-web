'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/brokers', label: 'Brokers' },
  { href: '/form', label: 'Form' },
  { href: '/distribution', label: 'Distribution' },
  { href: '/leads', label: 'Leads' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            // aria-current so the active page is announced, not just coloured.
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors',
              active
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
