"use client";

import { useEffect, useState } from "react";
import { formatDateTime, formatRelative } from "@/lib/format";

/**
 * Humanized timestamp: "5 minutes ago", with the absolute time on hover and
 * available to screen readers via the title.
 *
 * Server-side it renders the absolute date, and only switches to relative
 * after mount. Two reasons:
 *
 *  1. Relative time computed during SSR is already wrong by the time the page
 *     is read, and never corrects itself.
 *  2. Server and browser sit in different timezones and resolve locales
 *     differently, so rendering the same value on both would produce a
 *     hydration mismatch.
 *
 * It then ticks, so a list left open does not keep claiming "just now".
 */
export function TimeAgo({
  value,
  className,
}: {
  value: string | null;
  className?: string;
}) {
  const absolute = formatDateTime(value);
  const [label, setLabel] = useState(absolute);

  useEffect(() => {
    if (!value) return;

    const update = () => setLabel(formatRelative(value));
    update();

    // A minute is fine: nothing here changes faster than that matters.
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [value]);

  if (!value) return <span className={className}>—</span>;

  return (
    <time dateTime={value} title={absolute} className={className}>
      {label}
    </time>
  );
}
