"use client";

import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

export interface CurrencyFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue" | "onChange" | "min" | "max"
  > {
  label?: string;
  description?: string;
  error?: string;
  value?: number;
  defaultValue?: number;
  /** Called with the parsed amount, or `undefined` while the field is empty. */
  onValueChange?: (value: number | undefined) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** ISO 4217 currency code. Defaults to `"USD"`. */
  currency?: string;
  /** BCP 47 locale that decides separators and symbol placement. Defaults to `"en-US"`. */
  locale?: string;
  /** How the currency is labelled. Defaults to `"symbol"`; `"none"` hides it. */
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "none";
  /** Max digits after the decimal separator. Defaults to the currency's own (2 for USD, 0 for IDR/JPY). */
  decimalPlaces?: number;
  /** Allow a leading `-`. Defaults to `false`. */
  allowNegative?: boolean;
  /** Clamped to on blur. */
  min?: number;
  /** Clamped to on blur. */
  max?: number;
  /** Passed to the underlying `Field` wrapper. */
  fieldClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

interface CurrencyFormat {
  group: string;
  decimal: string;
  symbol: string;
  symbolAfter: boolean;
  fractionDigits: number;
  formatInteger: (digits: string) => string;
}

function resolveFormat(
  locale: string,
  currency: string,
  currencyDisplay: CurrencyFieldProps["currencyDisplay"],
): CurrencyFormat {
  const display = currencyDisplay === "none" ? "symbol" : currencyDisplay;
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: display,
    numberingSystem: "latn",
  });
  const parts = money.formatToParts(1234567.5);
  const plainParts = new Intl.NumberFormat(locale, {
    numberingSystem: "latn",
  }).formatToParts(1234.5);
  const currencyIndex = parts.findIndex((p) => p.type === "currency");
  const integerIndex = parts.findIndex((p) => p.type === "integer");
  const integerFormat = new Intl.NumberFormat(locale, {
    numberingSystem: "latn",
    maximumFractionDigits: 0,
  });

  return {
    group:
      parts.find((p) => p.type === "group")?.value ??
      plainParts.find((p) => p.type === "group")?.value ??
      ",",
    decimal: plainParts.find((p) => p.type === "decimal")?.value ?? ".",
    symbol: parts[currencyIndex]?.value ?? currency,
    symbolAfter: currencyIndex > integerIndex,
    fractionDigits: money.resolvedOptions().maximumFractionDigits ?? 2,
    // BigInt keeps long amounts exact and Intl handles grouping like en-IN's lakh.
    formatInteger: (digits) =>
      digits === "" ? "" : integerFormat.format(BigInt(digits)),
  };
}

interface Parsed {
  negative: boolean;
  integer: string;
  /** `undefined` when no decimal separator was typed. */
  fraction?: string;
}

function parseInput(
  raw: string,
  fmt: CurrencyFormat,
  places: number,
  allowNegative: boolean,
): Parsed {
  const negative = allowNegative && raw.trim().startsWith("-");
  const decimalAt = raw.indexOf(fmt.decimal);
  const intRaw = decimalAt === -1 ? raw : raw.slice(0, decimalAt);
  // With 0 decimal places a typed separator ends the amount instead of
  // gluing the cents onto it (IDR "2.500.000,5" stays 2,500,000).
  const fracRaw =
    decimalAt === -1 || places === 0 ? undefined : raw.slice(decimalAt + 1);
  return {
    negative,
    integer: intRaw.replace(/\D/g, "").replace(/^0+(?=\d)/, ""),
    fraction: fracRaw?.replace(/\D/g, "").slice(0, places),
  };
}

function render(p: Parsed, fmt: CurrencyFormat) {
  const int = fmt.formatInteger(p.integer);
  const sign = p.negative ? "-" : "";
  if (p.fraction === undefined) return sign + int;
  return `${sign}${int || "0"}${fmt.decimal}${p.fraction}`;
}

function toNumber(p: Parsed): number | undefined {
  if (!p.integer && !p.fraction) return undefined;
  const n = Number(`${p.integer || "0"}.${p.fraction || "0"}`);
  return p.negative ? -n : n;
}

function fromNumber(
  n: number | undefined,
  fmt: CurrencyFormat,
  places: number,
): string {
  if (n === undefined || Number.isNaN(n)) return "";
  const [int, frac] = Math.abs(n).toFixed(places).split(".");
  return render({ negative: n < 0, integer: int, fraction: frac }, fmt);
}

/** Counts digits, minus and decimal separator: the chars that survive reformatting. */
function significantBefore(text: string, caret: number, decimal: string) {
  let count = 0;
  for (let i = 0; i < caret; i++) {
    const ch = text[i];
    if (/\d/.test(ch) || ch === "-" || ch === decimal) count++;
  }
  return count;
}

function caretFor(text: string, significant: number, decimal: string) {
  if (significant === 0) return 0;
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (/\d/.test(ch) || ch === "-" || ch === decimal) count++;
    if (count === significant) return i + 1;
  }
  return text.length;
}

export const CurrencyField = React.forwardRef<
  HTMLInputElement,
  CurrencyFieldProps
>(
  (
    {
      label,
      description,
      error,
      value,
      defaultValue,
      onValueChange,
      onChange,
      currency = "USD",
      locale = "en-US",
      currencyDisplay = "symbol",
      decimalPlaces,
      allowNegative = false,
      min,
      max,
      fieldClassName,
      labelClassName,
      inputClassName,
      className,
      orientation = "vertical",
      id,
      disabled,
      required,
      placeholder,
      onBlur,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = description ? descriptionId : undefined;

    const fmt = React.useMemo(
      () => resolveFormat(locale, currency, currencyDisplay),
      [locale, currency, currencyDisplay],
    );
    const places = decimalPlaces ?? fmt.fractionDigits;

    const [text, setText] = React.useState(() =>
      fromNumber(value ?? defaultValue, fmt, places),
    );
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const pendingCaret = React.useRef<number | null>(null);

    // Re-sync from a controlled `value` (a reset, a server value) unless the
    // user is typing, or the text already shows that same amount.
    const lastValueRef = React.useRef(value);
    React.useEffect(() => {
      if (isFocused) return;
      const previous = lastValueRef.current;
      lastValueRef.current = value;
      if (value === undefined) {
        // Controlled value cleared (e.g. a form reset). Uncontrolled fields
        // never get here because their value was undefined all along.
        if (previous !== undefined) setText("");
        return;
      }
      setText((current) => {
        const shown = toNumber(parseInput(current, fmt, places, allowNegative));
        return shown === value ? current : fromNumber(value, fmt, places);
      });
    }, [value, isFocused, fmt, places, allowNegative]);

    React.useLayoutEffect(() => {
      if (pendingCaret.current === null || !inputRef.current) return;
      const pos = pendingCaret.current;
      pendingCaret.current = null;
      inputRef.current.setSelectionRange(pos, pos);
    });

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
      event,
    ) => {
      const raw = event.target.value;
      const caret = event.target.selectionStart ?? raw.length;
      const parsed = parseInput(raw, fmt, places, allowNegative);
      const next = render(parsed, fmt);
      pendingCaret.current = caretFor(
        next,
        significantBefore(raw, caret, fmt.decimal),
        fmt.decimal,
      );
      setText(next);
      event.target.value = next;
      onChange?.(event);
      onValueChange?.(toNumber(parsed));
    };

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
      setIsFocused(false);
      const parsed = toNumber(parseInput(text, fmt, places, allowNegative));
      if (parsed === undefined) {
        if (text !== "") setText("");
      } else {
        let next = parsed;
        if (typeof min === "number") next = Math.max(min, next);
        if (typeof max === "number") next = Math.min(max, next);
        const formatted = fromNumber(next, fmt, places);
        setText(formatted);
        if (next !== parsed) onValueChange?.(next);
      }
      onBlur?.(event);
    };

    const symbol =
      currencyDisplay === "none" ? null : (
        <InputGroupAddon
          align={fmt.symbolAfter ? "inline-end" : "inline-start"}
        >
          <InputGroupText aria-hidden="true">{fmt.symbol}</InputGroupText>
        </InputGroupAddon>
      );

    return (
      <Field
        orientation={orientation}
        data-invalid={error ? true : undefined}
        className={fieldClassName}
      >
        {label && (
          <FieldLabel
            htmlFor={inputId}
            className={cn(
              error && "text-destructive",
              disabled && "opacity-70 cursor-not-allowed",
              labelClassName,
            )}
          >
            {label}
            {required && (
              <>
                <span aria-hidden="true" className="text-destructive ml-0.5">
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </FieldLabel>
        )}

        <InputGroup data-disabled={disabled || undefined} className={className}>
          {symbol}
          <InputGroupInput
            id={inputId}
            ref={(el) => {
              inputRef.current = el;
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
            }}
            type="text"
            inputMode={places > 0 ? "decimal" : "numeric"}
            autoComplete="off"
            placeholder={placeholder ?? fromNumber(0, fmt, places)}
            value={text}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            aria-errormessage={errorId}
            aria-label={label ? undefined : `Amount in ${currency}`}
            onChange={handleChange}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={handleBlur}
            className={cn("tabular-nums", inputClassName)}
            {...props}
          />
        </InputGroup>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

CurrencyField.displayName = "CurrencyField";
