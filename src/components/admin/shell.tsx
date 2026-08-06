import Link from "next/link";
import { ArrowLeft, Route } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { meSchema } from "@/lib/schemas";
import { SidebarNav } from "./sidebar-nav";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";
import { Toaster } from "@/components/ui/sonner";

/**
 * Admin app shell: fixed sidebar, floating topbar, tinted content panel.
 * Metrics come from docs/dashboard-design.json (layout.appShell, layout.sidebar,
 * layout.topbar, layout.content).
 */
/** Never throws: a failed profile lookup must not blank the whole shell. */
async function currentUser() {
  try {
    return await apiFetch("/auth/me", meSchema);
  } catch {
    return null;
  }
}

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  return (
    <div className="bg-background min-h-dvh p-2 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-2">
      {/* Sidebar is a real landmark on desktop; on mobile it lives in a Sheet
          rendered from the topbar instead. */}
      <aside className="border-border/75 bg-card hidden rounded-3xl border px-4 py-6 lg:flex lg:flex-col">
        <Link
          href="/"
          className="mb-11 flex h-10 items-center gap-3 px-3 text-xl font-semibold"
        >
          <span className="bg-accent text-accent-foreground grid size-8 place-items-center rounded-xl">
            <Route className="size-4.5" aria-hidden="true" />
          </span>
          Lead Distribution
        </Link>

        <p className="text-muted-foreground mx-3 mb-3 text-xs font-medium uppercase">
          Manage
        </p>

        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-col gap-2">
        <header className="border-border/75 bg-card flex h-18 items-center justify-between gap-4 rounded-3xl border px-4 sm:px-6 lg:h-22">
          <div className="flex min-w-0 items-center gap-3">
            <MobileNav />
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold lg:hidden"
            >
              <span className="bg-accent text-accent-foreground grid size-8 place-items-center rounded-xl">
                <Route className="size-4.5" aria-hidden="true" />
              </span>
              <span className="sr-only sm:not-sr-only">Lead Distribution</span>
            </Link>
          </div>

          <UserMenu name={user?.name ?? null} email={user?.email} />
        </header>

        <main
          id="main"
          className="bg-content min-h-[calc(100dvh-6.5rem)] rounded-3xl p-4 sm:p-6"
        >
          {children}
        </main>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Shown above the title on detail pages, so the list is one click away. */
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        {back && (
          <Link
            href={back.href}
            className="text-muted-foreground hover:text-foreground mb-2 -ml-1 inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2 text-[0.9375rem]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-border/70 rounded-3xl border border-dashed p-10 text-center">
      <p className="font-semibold">{title}</p>
      <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
        {description}
      </p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
