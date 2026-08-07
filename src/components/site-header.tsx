import Link from "next/link";
import { cookies } from "next/headers";
import { Route } from "lucide-react";
import { Button } from "@/components/ui/button";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "lds_session";

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
    /* Floating bar: sticks to the top and sits over the page rather than
       occupying a band of it, so a full-bleed banner runs underneath. The
       blur keeps the links legible against whatever scrolls past. */
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="bg-card/85 border-border/60 shadow-[0_1px_3px_rgb(16_19_17_/_0.06)] mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-4 rounded-full border px-4 backdrop-blur-md sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold hover:no-underline"
        >
          <span className="bg-accent text-accent-foreground grid size-7 place-items-center rounded-md">
            <Route className="size-4" aria-hidden="true" />
          </span>
          Lead Distribution
        </Link>

        {/* Health moved to the footer: it is a diagnostic, not a
            destination. The header carries the one action that matters. */}
        <nav aria-label="Main" className="flex items-center gap-1">
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
