import Link from 'next/link';
import { Route } from 'lucide-react';
import { logout } from '@/lib/actions';
import { AdminNav } from './nav';
import { Button } from '@/components/ui/button';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="bg-card border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-2">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="bg-accent text-accent-foreground grid size-7 place-items-center rounded-md">
                <Route className="size-4" aria-hidden="true" />
              </span>
              Lead Distribution
            </Link>
            <AdminNav />
          </div>

          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  );
}
