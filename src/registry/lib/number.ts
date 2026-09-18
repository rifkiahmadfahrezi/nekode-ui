interface MinMaxOptions {
  min: number;
  max: number;
}

interface FormatNumberOptions {
  options?: Intl.NumberFormatOptions;
  locale?: string;
}

interface FormatCurrencyOptions {
  currency: string;
  locale?: string;
}

/** Clamp a number between `min` and `max`. */
export function clamp(value: number, { min, max }: MinMaxOptions): number {
  return Math.min(Math.max(value, min), max);
}

/** Check whether a number falls within `[min, max]`, inclusive. */
export function isBetween(value: number, { min, max }: MinMaxOptions): boolean {
  return value >= min && value <= max;
}

/** Return a random integer between `min` and `max`, inclusive. */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Format a number using `Intl.NumberFormat`, e.g. `formatNumber(1234.5)` → `"1,234.5"`. */
export function formatNumber(
  value: number,
  { options, locale }: FormatNumberOptions = {},
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/** Format a number as currency, e.g. `formatCurrency(19.9, { currency: "USD" })` → `"$19.90"`. */
export function formatCurrency(
  value: number,
  { currency, locale }: FormatCurrencyOptions,
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    value,
  );
}

/** Format a number in compact notation, e.g. `formatCompactNumber(1500)` → `"1.5K"`. */
export function formatCompactNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale, { notation: "compact" }).format(value);
}
