import Link from 'next/link';
import { cookies } from 'next/headers';
import { Route } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'lds_session';

/**
 * Public header. Swaps the sign-in call to action for a link into the admin
 * once a session cookie is present.
 *
 * This is a nav affordance, not an authorization check: a stale or forged
 * cookie only changes which link is shown. The middleware guards the admin
 * routes and the API validates the token on every request.
 */
export async function SiteHeader() {
  const store = await cookies();
  const signedIn = Boolean(store.get(SESSION_COOKIE)?.value);

  return (
    <header className="bg-card border-b">
      <div className="mx-auto flex min-h-15 max-w-5xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold hover:no-underline"
        >
          <span className="bg-accent text-accent-foreground grid size-7 place-items-center rounded-md">
            <Route className="size-4" aria-hidden="true" />
          </span>
          Lead Distribution
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/health">Health</Link>
          </Button>

          {signedIn ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
