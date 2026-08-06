/** Minutes from midnight to "09:00", for display and time inputs. */
export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(1440, minutes));
  const hours = Math.floor(clamped / 60) % 24;
  const mins = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function formatWorkingDays(value: string): string {
  const days = value
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((day) => day >= 1 && day <= 7);

  if (days.length === 7) return "Every day";
  if (days.length === 0) return "None";

  return days.map((day) => DAY_LABELS[day - 1]).join(", ");
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}
