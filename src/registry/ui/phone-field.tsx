"use client";

import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
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
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface PhoneCountry {
  /** ISO 3166-1 alpha-2 code, e.g. `"ID"`. */
  code: string;
  name: string;
  /** Calling code with the leading `+`, e.g. `"+62"`. */
  dialCode: string;
}

/** A compact default list. Pass `countries` to use your own. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "AR", name: "Argentina", dialCode: "+54" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "AT", name: "Austria", dialCode: "+43" },
  { code: "BD", name: "Bangladesh", dialCode: "+880" },
  { code: "BE", name: "Belgium", dialCode: "+32" },
  { code: "BR", name: "Brazil", dialCode: "+55" },
  { code: "BN", name: "Brunei", dialCode: "+673" },
  { code: "KH", name: "Cambodia", dialCode: "+855" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "CL", name: "Chile", dialCode: "+56" },
  { code: "CN", name: "China", dialCode: "+86" },
  { code: "CO", name: "Colombia", dialCode: "+57" },
  { code: "CZ", name: "Czechia", dialCode: "+420" },
  { code: "DK", name: "Denmark", dialCode: "+45" },
  { code: "EG", name: "Egypt", dialCode: "+20" },
  { code: "FI", name: "Finland", dialCode: "+358" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "GR", name: "Greece", dialCode: "+30" },
  { code: "HK", name: "Hong Kong", dialCode: "+852" },
  { code: "HU", name: "Hungary", dialCode: "+36" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "ID", name: "Indonesia", dialCode: "+62" },
  { code: "IE", name: "Ireland", dialCode: "+353" },
  { code: "IL", name: "Israel", dialCode: "+972" },
  { code: "IT", name: "Italy", dialCode: "+39" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "KE", name: "Kenya", dialCode: "+254" },
  { code: "LA", name: "Laos", dialCode: "+856" },
  { code: "MY", name: "Malaysia", dialCode: "+60" },
  { code: "MX", name: "Mexico", dialCode: "+52" },
  { code: "MM", name: "Myanmar", dialCode: "+95" },
  { code: "NL", name: "Netherlands", dialCode: "+31" },
  { code: "NZ", name: "New Zealand", dialCode: "+64" },
  { code: "NG", name: "Nigeria", dialCode: "+234" },
  { code: "NO", name: "Norway", dialCode: "+47" },
  { code: "PK", name: "Pakistan", dialCode: "+92" },
  { code: "PE", name: "Peru", dialCode: "+51" },
  { code: "PH", name: "Philippines", dialCode: "+63" },
  { code: "PL", name: "Poland", dialCode: "+48" },
  { code: "PT", name: "Portugal", dialCode: "+351" },
  { code: "QA", name: "Qatar", dialCode: "+974" },
  { code: "RO", name: "Romania", dialCode: "+40" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { code: "SG", name: "Singapore", dialCode: "+65" },
  { code: "ZA", name: "South Africa", dialCode: "+27" },
  { code: "KR", name: "South Korea", dialCode: "+82" },
  { code: "ES", name: "Spain", dialCode: "+34" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94" },
  { code: "SE", name: "Sweden", dialCode: "+46" },
  { code: "CH", name: "Switzerland", dialCode: "+41" },
  { code: "TW", name: "Taiwan", dialCode: "+886" },
  { code: "TH", name: "Thailand", dialCode: "+66" },
  { code: "TL", name: "Timor-Leste", dialCode: "+670" },
  { code: "TR", name: "Türkiye", dialCode: "+90" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "VN", name: "Vietnam", dialCode: "+84" },
];

/** Turns `"ID"` into the 🇮🇩 regional-indicator emoji. */
function flagEmoji(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

const digitsOnly = (s: string) => s.replace(/\D/g, "");

/** Who gets a calling code shared by several countries, unless one is preferred. */
const SHARED_CODE_OWNERS: Record<string, string> = { "1": "US", "7": "RU" };

/** True while `digits` could still grow into a longer calling code ("35" -> "351"). */
function isPartialDialCode(digits: string, countries: PhoneCountry[]) {
  return countries.some((c) => {
    const dial = digitsOnly(c.dialCode);
    return dial.length > digits.length && dial.startsWith(digits);
  });
}

/**
 * Splits an international number (`"+62812..."`) into a country and the
 * national part. `preferred` wins ties for shared codes like `+1`; without
 * it, `+1` is the United States.
 */
export function parsePhoneNumber(
  value: string,
  countries: PhoneCountry[] = PHONE_COUNTRIES,
  preferred?: string,
): { country?: PhoneCountry; national: string } {
  const digits = digitsOnly(value);
  if (!value.trim().startsWith("+")) return { national: digits };
  let best: PhoneCountry | undefined;
  for (const c of countries) {
    const dial = digitsOnly(c.dialCode);
    if (!digits.startsWith(dial)) continue;
    const bestLen = best ? digitsOnly(best.dialCode).length : 0;
    const rank = (x: PhoneCountry) =>
      x.code === preferred ? 2 : SHARED_CODE_OWNERS[dial] === x.code ? 1 : 0;
    if (
      dial.length > bestLen ||
      (best && dial.length === bestLen && rank(c) > rank(best))
    ) {
      best = c;
    }
  }
  return best
    ? {
        country: best,
        national: digits.slice(digitsOnly(best.dialCode).length),
      }
    : { national: digits };
}

export interface PhoneFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue" | "onChange"
  > {
  label?: string;
  description?: string;
  error?: string;
  /** Full international number, e.g. `"+6281234567890"`. Empty string when blank. */
  value?: string;
  defaultValue?: string;
  /** Called with the international number (`""` while the national part is empty). */
  onValueChange?: (value: string) => void;
  /** ISO code of the country selected before a value picks one. Defaults to `"ID"`. */
  defaultCountry?: string;
  /** Called when the selected country changes. */
  onCountryChange?: (country: PhoneCountry) => void;
  /**
   * Switch country from the digits typed at the start, without a `+`.
   * With the US selected, typing `62` selects Indonesia and the rest is the
   * local number. Off by default because local numbers can start with a
   * calling code too (an Indonesian `81…` would select Japan). A typed or
   * pasted `+` always switches country, whatever this is set to.
   */
  autoDetectCountry?: boolean;
  /** Countries offered in the picker. Defaults to `PHONE_COUNTRIES`. */
  countries?: PhoneCountry[];
  /** Placeholder for the picker's search box. */
  searchPlaceholder?: string;
  /** Shown when the search matches no country. */
  emptyText?: string;
  /** Passed to the underlying `Field` wrapper. */
  fieldClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

export const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(
  (
    {
      label,
      description,
      error,
      value,
      defaultValue,
      onValueChange,
      defaultCountry = "ID",
      onCountryChange,
      countries = PHONE_COUNTRIES,
      autoDetectCountry = false,
      searchPlaceholder = "Search country...",
      emptyText = "No country found.",
      placeholder = "812 3456 7890",
      fieldClassName,
      labelClassName,
      inputClassName,
      className,
      orientation = "vertical",
      id,
      name,
      disabled,
      required,
      onBlur,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const listId = `${inputId}-countries`;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = description ? descriptionId : undefined;

    const fallbackCountry =
      countries.find((c) => c.code === defaultCountry) ?? countries[0];

    const [state, setState] = React.useState(() => {
      const parsed = parsePhoneNumber(
        value ?? defaultValue ?? "",
        countries,
        defaultCountry,
      );
      return {
        country: parsed.country ?? fallbackCountry,
        national: parsed.national,
      };
    });
    const { country, national } = state;

    // The last value we emitted. A controlled `value` that matches it is just
    // our own echo; anything else (a reset, a server value) is re-parsed.
    const emittedRef = React.useRef(value ?? defaultValue ?? "");
    const [isFocused, setIsFocused] = React.useState(false);
    React.useEffect(() => {
      if (value === undefined || value === emittedRef.current || isFocused)
        return;
      emittedRef.current = value;
      const parsed = parsePhoneNumber(value, countries, country.code);
      setState((s) => ({
        country: parsed.country ?? s.country,
        national: parsed.national,
      }));
    }, [value, isFocused, countries, country.code]);

    const emit = (nextCountry: PhoneCountry, nextNational: string) => {
      // Drop the trunk prefix ("0812" -> "+62812") but keep it on screen so
      // the field doesn't swallow the first key the user presses. A "+" that
      // doesn't name a known calling code yet ("+6") isn't a number at all.
      const subscriber = nextNational.startsWith("+")
        ? ""
        : nextNational.replace(/^0+/, "");
      const out = subscriber ? `${nextCountry.dialCode}${subscriber}` : "";
      setState({ country: nextCountry, national: nextNational });
      if (out !== emittedRef.current) {
        emittedRef.current = out;
        onValueChange?.(out);
      }
    };

    // Auto-detect only looks at the first digits typed into an empty field;
    // after a switch (or once the number is longer than any calling code) the
    // rest is the local number. Clearing the field re-arms it.
    const detectArmedRef = React.useRef(national === "");

    const switchTo = (next: PhoneCountry, nextNational: string) => {
      if (next.code !== country.code) onCountryChange?.(next);
      emit(next, nextNational);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
      event,
    ) => {
      const raw = event.target.value;
      // "+44 20 7946 0958", typed or pasted, switches the country too.
      if (raw.trim().startsWith("+")) {
        const parsed = parsePhoneNumber(raw, countries, country.code);
        const digits = digitsOnly(raw).slice(0, 15);
        if (parsed.country && !isPartialDialCode(digits, countries)) {
          detectArmedRef.current = false;
          switchTo(parsed.country, parsed.national);
        } else {
          // Still typing the calling code: keep the "+" on screen.
          emit(country, `+${digits}`);
        }
        return;
      }

      const digits = digitsOnly(raw).slice(0, 15);
      if (digits === "") {
        detectArmedRef.current = true;
      } else if (autoDetectCountry && detectArmedRef.current) {
        const { country: match, national: rest } = parsePhoneNumber(
          `+${digits}`,
          countries,
          country.code,
        );
        // Wait for the whole code: "35" could still become "351" or "358".
        if (match && rest === "" && !isPartialDialCode(digits, countries)) {
          detectArmedRef.current = false;
          switchTo(match, "");
          return;
        }
        if (digits.length > 4 || digits.startsWith("0"))
          detectArmedRef.current = false;
      }
      emit(country, digits);
    };

    const selectCountry = (next: PhoneCountry) => {
      detectArmedRef.current = false;
      switchTo(next, national.startsWith("+") ? "" : national);
    };

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
          <InputGroupAddon align="inline-start" className="pl-1">
            <CountryPicker
              countries={countries}
              selected={country}
              onSelect={selectCountry}
              disabled={disabled}
              listId={listId}
              searchPlaceholder={searchPlaceholder}
              emptyText={emptyText}
            />
          </InputGroupAddon>
          <InputGroupInput
            id={inputId}
            ref={ref}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={placeholder}
            value={national}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            aria-errormessage={errorId}
            onChange={handleChange}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            className={inputClassName}
            {...props}
          />
          {name && (
            <input type="hidden" name={name} value={emittedRef.current} />
          )}
        </InputGroup>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

PhoneField.displayName = "PhoneField";

interface CountryPickerProps {
  countries: PhoneCountry[];
  selected: PhoneCountry;
  onSelect: (country: PhoneCountry) => void;
  disabled?: boolean;
  listId: string;
  searchPlaceholder: string;
  emptyText: string;
}

function CountryPicker({
  countries,
  selected,
  onSelect,
  disabled,
  listId,
  searchPlaceholder,
  emptyText,
}: CountryPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    const qDigits = digitsOnly(q);
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q ||
        (qDigits !== "" && digitsOnly(c.dialCode).startsWith(qDigits)),
    );
  }, [countries, query]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setQuery("");
      setActive(Math.max(0, countries.indexOf(selected)));
    }
  };

  React.useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (country: PhoneCountry | undefined) => {
    if (!country) return;
    onSelect(country);
    setOpen(false);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(filtered[active]);
    }
  };

  const optionId = (code: string) => `${listId}-${code}`;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        type="button"
        disabled={disabled}
        aria-label={`Country code: ${selected.name} (${selected.dialCode})`}
        className="flex h-7 items-center gap-1 rounded-[calc(var(--radius)-5px)] px-1.5 text-sm text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none"
      >
        <span aria-hidden="true" className="text-base leading-none">
          {flagEmoji(selected.code)}
        </span>
        <span className="tabular-nums">{selected.dialCode}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-3.5 text-muted-foreground"
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-0 p-0">
        <div className="flex items-center gap-2 border-b px-3">
          <SearchIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <input
            // biome-ignore lint/a11y/noAutofocus: focus the search when the picker opens
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={
              filtered[active] ? optionId(filtered[active].code) : undefined
            }
            aria-label="Search country"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={handleKeyDown}
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Countries"
          className="max-h-64 overflow-y-auto p-1"
        >
          {filtered.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          )}
          {filtered.map((c, i) => {
            const isSelected = c.code === selected.code;
            return (
              <div
                key={c.code}
                id={optionId(c.code)}
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                data-index={i}
                data-highlighted={i === active || undefined}
                onMouseMove={() => setActive(i)}
                onClick={() => choose(c)}
                className="flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {flagEmoji(c.code)}
                </span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {c.dialCode}
                </span>
                <CheckIcon
                  aria-hidden="true"
                  className={cn("size-4", !isSelected && "invisible")}
                />
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
