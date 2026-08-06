import { Skeleton } from '@/components/ui/skeleton';

/**
 * Matches the shape of the table it replaces, so the page does not reflow when
 * real rows arrive. A centred spinner would tell the user less and shift more.
 */
export function TableSkeleton({
  columns = 6,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border" aria-hidden="true">
      <div className="bg-muted/40 flex gap-4 border-b px-4 py-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 px-4 py-4 not-first:border-t">
          {Array.from({ length: columns }).map((_, column) => (
            <Skeleton key={column} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
