/** Minutes from midnight to "09:00", for display and time inputs. */
export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(1440, minutes));
  const hours = Math.floor(clamped / 60) % 24;
  const mins = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * The stored "1,2,3" form back into the numbers the broker form edits.
 *
 * The API sends working days as a comma-separated string while the form works
 * in numbers, so editing an existing broker has to convert on the way in.
 */
export function parseWorkingDays(value: string): number[] {
  return value
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((day) => day >= 1 && day <= 7);
}

export function formatWorkingDays(value: string): string {
  const days = value
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((day) => day >= 1 && day <= 7);

  if (days.length === 7) return "Every day";
  if (days.length === 0) return "None";

  return days.map((day) => DAY_LABELS[day - 1]).join(", ");
}

/**
 * Absolute timestamp, e.g. "6 Aug 2026, 09:14".
 *
 * The locale is pinned rather than left to the runtime: Node and the browser
 * resolve the default differently, so an unpinned toLocaleString renders one
 * string on the server and another on the client, which React reports as a
 * hydration mismatch.
 */
export function formatDateTime(
  value: string | Date | null,
  timeZone?: string,
): string {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

/**
 * Human-readable elapsed time: "just now", "5 minutes ago", "3 days ago".
 *
 * Falls back to an absolute date beyond a year, where "2 years ago" stops
 * being useful and the reader wants the actual date.
 */
export function formatRelative(
  value: string | Date | null,
  now: Date = new Date(),
): string {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const absolute = Math.abs(seconds);

  if (absolute < 45) return "just now";
  if (absolute >= YEAR) return formatDateTime(date);

  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const [amount, unit]: [number, Intl.RelativeTimeFormatUnit] =
    absolute < HOUR
      ? [Math.round(seconds / MINUTE), "minute"]
      : absolute < DAY
        ? [Math.round(seconds / HOUR), "hour"]
        : absolute < WEEK
          ? [Math.round(seconds / DAY), "day"]
          : absolute < MONTH
            ? [Math.round(seconds / WEEK), "week"]
            : [Math.round(seconds / MONTH), "month"];

  return format.format(amount, unit);
}
