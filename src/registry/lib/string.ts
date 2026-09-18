interface TruncateOptions {
  length: number;
  suffix?: string;
}

interface PluralizeOptions {
  count: number;
  plural?: string;
}

interface FormatCurrencyOptions {
  currency: string;
  locale?: string;
}

/** Uppercase the first character of a string. */
export function capitalize(value: string): string {
  if (!value) return value;
  return value[0].toUpperCase() + value.slice(1);
}

/** Convert a string to Title Case (each word capitalized). */
export function toTitleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => capitalize(word.toLowerCase()));
}

/** Convert a string to a URL-safe slug, e.g. `"Hello World!"` → `"hello-world"`. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Truncate a string to `length` characters, appending `suffix` (default `"…"`) if it was cut. */
export function truncate(
  value: string,
  { length, suffix = "…" }: TruncateOptions,
): string {
  if (value.length <= length) return value;
  return value.slice(0, length) + suffix;
}

/** Check whether a string is empty or only whitespace. */
export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/** Pluralize a word based on `count`, e.g. `pluralize("item", { count: 2 })` → `"items"`. */
export function pluralize(
  word: string,
  { count, plural }: PluralizeOptions,
): string {
  if (count === 1) return word;
  return plural ?? `${word}s`;
}

/** Format a numeric string or number as currency, e.g. `formatCurrency("19.9", { currency: "USD" })` → `"$19.90"`. */
export function formatCurrency(
  value: string | number,
  { currency, locale }: FormatCurrencyOptions,
): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    numeric,
  );
}

/** Mask the local part of an email, e.g. `"john.doe@example.com"` → `"jo***@example.com"`. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

/**
 * Mask a phone number, keeping the last `visibleDigits` digits (default `4`) visible.
 * Preserves original formatting (spaces, dashes, `+`), e.g. `"+1 555-123-4567"` → `"+* ***-***-4567"`.
 */
export function maskPhoneNumber(phone: string, visibleDigits = 4): string {
  const digitCount = (phone.match(/\d/g) ?? []).length;
  if (digitCount <= visibleDigits) return phone;

  let remaining = digitCount - visibleDigits;
  return phone.replace(/\d/g, (digit) => {
    if (remaining > 0) {
      remaining--;
      return "*";
    }
    return digit;
  });
}
