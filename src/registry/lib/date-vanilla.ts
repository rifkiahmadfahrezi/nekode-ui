interface FormatDisplayOptions {
  options?: Intl.DateTimeFormatOptions;
  locale?: string;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
  ["second", 1000],
];

/** Format a `Date` as `yyyy-MM-dd` (e.g. for API payloads, `<input type="date">`). */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse an ISO 8601 string — `"2026-09-19"` or `"2026-09-19T10:30:00Z"` — into a `Date`. */
export function parseISODate(value: string): Date {
  return new Date(value);
}

/**
 * Format a `Date` for display in the UI using `Intl.DateTimeFormat`.
 * Defaults to a long, human-readable date. Pass `options` to customize (e.g. `{ dateStyle: "short" }`).
 */
export function formatDateDisplay(
  date: Date,
  { options = { dateStyle: "long" }, locale }: FormatDisplayOptions = {},
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** Check whether a `Date` is a valid date (not `Invalid Date`). */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

/** Check whether an ISO 8601 string is valid and can be parsed into a `Date`. */
export function isValidISODate(value: string): boolean {
  return isValidDate(new Date(value));
}

/** Format a `Date` as a time string (e.g. `"10:30 AM"`) for UI display. */
export function formatTimeDisplay(
  date: Date,
  { options = { timeStyle: "short" }, locale }: FormatDisplayOptions = {},
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** Format a `Date` as a relative time string (e.g. `"2 days ago"`, `"in 3 hours"`). */
export function formatRelativeDate(date: Date, locale?: string): string {
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diffMs) >= ms || unit === "second") {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }

  return rtf.format(0, "second");
}

/** Check whether two `Date`s fall on the same calendar day. */
export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Check whether a `Date` is before the current time. */
export function isPastDate(date: Date): boolean {
  return date.getTime() < Date.now();
}
