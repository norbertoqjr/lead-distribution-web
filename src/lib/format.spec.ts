import {
  formatDateTime,
  formatRelative,
  formatWorkingDays,
  minutesToTime,
} from "./format";

describe("minutesToTime", () => {
  it.each([
    [0, "00:00"],
    [540, "09:00"],
    [1080, "18:00"],
    [1439, "23:59"],
    [90, "01:30"],
  ])("renders %i minutes as %s", (minutes, expected) => {
    expect(minutesToTime(minutes)).toBe(expected);
  });

  it("wraps the end of day to 00:00 rather than showing 24:00", () => {
    // 1440 is the stored value for "closes at midnight"; a time input rejects
    // 24:00, so it has to come back as 00:00.
    expect(minutesToTime(1440)).toBe("00:00");
  });

  it("clamps values outside a day instead of producing nonsense", () => {
    expect(minutesToTime(-30)).toBe("00:00");
    expect(minutesToTime(9999)).toBe("00:00");
  });
});

describe("formatWorkingDays", () => {
  it("names the days", () => {
    expect(formatWorkingDays("1,2,3,4,5")).toBe("Mon, Tue, Wed, Thu, Fri");
  });

  it("collapses a full week to a phrase", () => {
    expect(formatWorkingDays("1,2,3,4,5,6,7")).toBe("Every day");
  });

  it("handles a single day", () => {
    expect(formatWorkingDays("7")).toBe("Sun");
  });

  it("says None for an empty set rather than rendering blank", () => {
    expect(formatWorkingDays("")).toBe("None");
  });

  it("ignores values outside 1-7", () => {
    expect(formatWorkingDays("0,1,8,9")).toBe("Mon");
  });

  it("tolerates stray whitespace", () => {
    expect(formatWorkingDays("1, 2 ,3")).toBe("Mon, Tue, Wed");
  });
});

describe("formatDateTime", () => {
  it("renders a dash for a lead that was never assigned", () => {
    // assignedAt is null until a broker receives the lead; the column must not
    // show "Invalid Date".
    expect(formatDateTime(null)).toBe("—");
  });

  it("renders a dash for an unparseable value rather than Invalid Date", () => {
    expect(formatDateTime("not-a-date")).toBe("—");
  });

  it("formats deterministically, so server and client agree", () => {
    // Pinned locale and timezone: an unpinned format renders differently in
    // Node and the browser, which React reports as a hydration mismatch.
    expect(formatDateTime("2024-01-01T09:05:00.000Z", "UTC")).toBe(
      "1 Jan 2024, 09:05",
    );
  });
});

describe("formatRelative", () => {
  const now = new Date("2024-06-15T12:00:00.000Z");
  const ago = (seconds: number) =>
    new Date(now.getTime() - seconds * 1000).toISOString();

  it("collapses the last few seconds into just now", () => {
    expect(formatRelative(ago(5), now)).toBe("just now");
    expect(formatRelative(ago(44), now)).toBe("just now");
  });

  it("switches to minutes at the threshold", () => {
    expect(formatRelative(ago(45), now)).toBe("1 minute ago");
  });

  it.each([
    [60 * 5, "5 minutes ago"],
    [60 * 60, "1 hour ago"],
    [60 * 60 * 5, "5 hours ago"],
    [60 * 60 * 24, "yesterday"],
    [60 * 60 * 24 * 3, "3 days ago"],
    [60 * 60 * 24 * 10, "last week"],
    [60 * 60 * 24 * 60, "2 months ago"],
  ])("renders %i seconds ago as %s", (seconds, expected) => {
    expect(formatRelative(ago(seconds), now)).toBe(expected);
  });

  it("falls back to an absolute date beyond a year", () => {
    // "2 years ago" stops being useful; at that point the reader wants the
    // actual date.
    expect(formatRelative(ago(60 * 60 * 24 * 400), now)).toMatch(/\d{4}/);
  });

  it("handles a future timestamp without saying it was in the past", () => {
    const soon = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    expect(formatRelative(soon, now)).toBe("in 1 hour");
  });

  it("renders a dash for null and for garbage", () => {
    expect(formatRelative(null, now)).toBe("—");
    expect(formatRelative("nonsense", now)).toBe("—");
  });
});
