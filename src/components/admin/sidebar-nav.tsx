'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  LayoutDashboard,
  Share2,
  Users,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/brokers', label: 'Brokers', icon: Users },
  { href: '/form', label: 'Lead form', icon: FileText },
  { href: '/distribution', label: 'Distribution', icon: Share2 },
  { href: '/leads', label: 'Leads', icon: Inbox },
];

/**
 * Sidebar navigation. The active item is marked by a left rail plus weight,
 * per the sidebar.activeItem block in docs/dashboard-design.json — no filled
 * background, so the sidebar stays quiet.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex h-11.5 items-center gap-3 rounded-[0.875rem] px-3 text-[0.9375rem] transition-colors',
              active
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-secondary hover:text-primary font-medium',
            )}
          >
            {active && (
              <span
                aria-hidden="true"
                className="bg-primary absolute top-1/2 -left-4 h-10 w-1.5 -translate-y-1/2 rounded-r-full"
              />
            )}
            <item.icon className="size-5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
