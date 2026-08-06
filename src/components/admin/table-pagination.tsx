"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

/**
 * WordPress-style list pagination: an item count on the left, per-page control
 * and first/prev/next/last on the right.
 *
 * State lives in the URL rather than component state, so a page is
 * bookmarkable, survives a refresh, and comes back intact after the browser
 * back button.
 */
export function TablePagination({
  total,
  page,
  perPage,
  totalPages,
  noun = "item",
}: {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  noun?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(next: { page?: number; perPage?: number }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.page !== undefined) params.set("page", String(next.page));
    if (next.perPage !== undefined) {
      params.set("perPage", String(next.perPage));
      // Changing page size invalidates the offset: page 5 of 10-per-page does
      // not exist at 100 per page.
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  const first = total === 0 ? 0 : (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);
  const plural = total === 1 ? noun : `${noun}s`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
      <p
        className="text-muted-foreground text-sm tabular-nums"
        aria-live="polite"
      >
        {total === 0 ? (
          <>No {plural}</>
        ) : (
          <>
            Showing <span className="text-foreground font-medium">{first}</span>
            {"–"}
            <span className="text-foreground font-medium">{last}</span> of{" "}
            <span className="text-foreground font-medium">{total}</span>{" "}
            {plural}
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          <span className="hidden sm:inline">Per page</span>
          <select
            value={perPage}
            onChange={(event) => go({ perPage: Number(event.target.value) })}
            className="border-input bg-background h-9 rounded-lg border px-2 text-sm"
            aria-label="Rows per page"
          >
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="First page"
            disabled={page <= 1}
            onClick={() => go({ page: 1 })}
          >
            <ChevronsLeft className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => go({ page: page - 1 })}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>

          <span className="text-muted-foreground px-2 text-sm tabular-nums">
            Page <span className="text-foreground font-medium">{page}</span> of{" "}
            {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => go({ page: page + 1 })}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Last page"
            disabled={page >= totalPages}
            onClick={() => go({ page: totalPages })}
          >
            <ChevronsRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
