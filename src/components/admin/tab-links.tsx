import Link from "next/link";
import { cn } from "@/lib/utils";

export type TabLink = {
  value: string;
  label: string;
  count?: number;
  href: string;
};

/**
 * Tabs as links rather than client state.
 *
 * The panels below are server-rendered and paginated, so the active tab has to
 * live in the URL anyway: a client-side tab would lose its panel's page number
 * on every switch, and neither tab would be linkable.
 */
export function TabLinks({
  tabs,
  active,
  label,
}: {
  tabs: TabLink[];
  active: string;
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className="bg-muted inline-flex items-center gap-1 rounded-full p-1"
    >
      {tabs.map((tab) => {
        const current = tab.value === active;

        return (
          <Link
            key={tab.value}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
              current
                ? "bg-card text-foreground shadow-[0_1px_2px_rgb(16_19_17_/_0.06)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[0.6875rem] tabular-nums",
                  current
                    ? "bg-accent text-accent-foreground"
                    : "bg-background text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
