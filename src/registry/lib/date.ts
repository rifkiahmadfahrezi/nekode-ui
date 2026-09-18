import {
  format,
  formatDistanceToNow,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
} from "date-fns";

/** Format a `Date` as `yyyy-MM-dd` (e.g. for API payloads, `<input type="date">`). */
export function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Parse an ISO 8601 string — `"2026-09-19"` or `"2026-09-19T10:30:00Z"` — into a `Date`. */
export function parseISODate(value: string): Date {
  return parseISO(value);
}

/** Format a `Date` for display in the UI. Defaults to a long, human-readable format. */
export function formatDateDisplay(date: Date, formatStr = "PPP"): string {
  return format(date, formatStr);
}

/** Check whether a `Date` is a valid date (not `Invalid Date`). */
export function isValidDate(date: Date): boolean {
  return isValid(date);
}

/** Check whether an ISO 8601 string is valid and can be parsed into a `Date`. */
export function isValidISODate(value: string): boolean {
  return isValid(parseISO(value));
}

/** Format a `Date` as a time string (e.g. `"10:30 AM"`) for UI display. */
export function formatTimeDisplay(date: Date, formatStr = "p"): string {
  return format(date, formatStr);
}

/** Format a `Date` as a relative time string (e.g. `"2 days ago"`, `"in 3 hours"`). */
export function formatRelativeDate(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/** Check whether two `Date`s fall on the same calendar day. */
export function isSameCalendarDay(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

/** Check whether a `Date` is before the current time. */
export function isPastDate(date: Date): boolean {
  return isBefore(date, new Date());
}
