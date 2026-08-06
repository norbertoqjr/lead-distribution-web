import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Metric tile. Per statCard in docs/dashboard-design.json: title above, large
 * value below, meta and a circular action pinned to the bottom.
 *
 * `featured` uses the primary gradient. Exactly one tile per row should carry
 * it, otherwise the emphasis means nothing.
 */
export function StatCard({
  label,
  value,
  meta,
  href,
  featured = false,
  alert = false,
}: {
  label: string;
  value: number | string;
  meta?: string;
  href: string;
  featured?: boolean;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'card-interactive group flex min-h-42 flex-col justify-between rounded-3xl border p-5',
        featured
          ? 'border-transparent bg-[linear-gradient(145deg,#135D3C_0%,#1D7A4E_58%,#258657_100%)] text-white'
          : 'bg-card border-border/60',
        // Only unsent leads need the admin to act, so only that tile is marked.
        !featured && alert && 'border-warning/60',
      )}
    >
      <p className={cn('font-medium', featured ? 'text-white' : undefined)}>
        {label}
      </p>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="mt-4 text-5xl leading-none font-medium tracking-[-0.04em] tabular-nums">
            {value}
          </p>
          {meta && (
            <p
              className={cn(
                'mt-2 text-xs',
                featured ? 'text-[#BFE58B]' : 'text-[#6D8979]',
              )}
            >
              {meta}
            </p>
          )}
        </div>

        <span
          aria-hidden="true"
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-full border',
            featured
              ? 'text-foreground border-transparent bg-white'
              : 'border-[#2A342F]',
          )}
        >
          <ArrowUpRight className="size-4.5" />
        </span>
      </div>
    </Link>
  );
}
