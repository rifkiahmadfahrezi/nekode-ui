"use client";

import { format, getDaysInMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ─── helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Start-of-month date for comparison purposes. */
function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

/** End-of-month date for comparison purposes. */
function endOfMonth(year: number, month: number) {
  return new Date(year, month, getDaysInMonth(new Date(year, month)));
}

// ─── types ────────────────────────────────────────────────────────────────────

export interface DateRangePickerFieldProps {
  label?: string;
  description?: string;
  error?: string;
  id?: string;
  name?: string;
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  /** date-fns format string for each side of the range. Defaults to `"PPP"`. */
  dateFormat?: string;
  /** Earliest selectable date — also filters month/year options. */
  minDate?: Date;
  /** Latest selectable date — also filters month/year options. */
  maxDate?: Date;
  /** Number of months shown side by side in the calendar. Defaults to `2`. */
  numberOfMonths?: number;
  fieldClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

// ─── component ────────────────────────────────────────────────────────────────

export const DateRangePickerField = React.forwardRef<
  HTMLButtonElement,
  DateRangePickerFieldProps
>(
  (
    {
      label,
      description,
      error,
      id,
      name,
      value,
      defaultValue,
      onValueChange,
      disabled,
      required,
      placeholder = "Pick a date range",
      dateFormat = "PPP",
      minDate,
      maxDate,
      numberOfMonths = 2,
      fieldClassName,
      labelClassName,
      triggerClassName,
      orientation = "vertical",
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = description && !error ? descriptionId : undefined;

    // ── selected range (controlled / uncontrolled) ──
    const [internalRange, setInternalRange] = React.useState<
      DateRange | undefined
    >(defaultValue);
    const isControlled = value !== undefined;
    const selectedRange = isControlled ? value : internalRange;

    // ── month/year navigation state (what the calendar is showing) ──
    const today = new Date();
    const [viewYear, setViewYear] = React.useState(
      () => selectedRange?.from?.getFullYear() ?? today.getFullYear(),
    );
    const [viewMonth, setViewMonth] = React.useState(
      () => selectedRange?.from?.getMonth() ?? today.getMonth(),
    );

    // Keep view in sync when controlled value changes
    React.useEffect(() => {
      if (selectedRange?.from) {
        setViewYear(selectedRange.from.getFullYear());
        setViewMonth(selectedRange.from.getMonth());
      }
    }, [selectedRange]);

    // ── year range ──
    const minYear = minDate ? minDate.getFullYear() : today.getFullYear() - 100;
    const maxYear = maxDate ? maxDate.getFullYear() : today.getFullYear() + 10;

    // ── available months for the current viewYear ──
    const availableMonths = React.useMemo(() => {
      return MONTH_NAMES.map((name, idx) => {
        const monthEnd = endOfMonth(viewYear, idx);
        const monthStart = startOfMonth(viewYear, idx);
        const tooEarly = minDate ? monthEnd < minDate : false;
        const tooLate = maxDate ? monthStart > maxDate : false;
        return { name, idx, disabled: tooEarly || tooLate };
      });
    }, [viewYear, minDate, maxDate]);

    // ── clamp viewMonth if the current one becomes unavailable ──
    React.useEffect(() => {
      const current = availableMonths[viewMonth];
      if (current?.disabled) {
        const first = availableMonths.find((m) => !m.disabled);
        if (first) setViewMonth(first.idx);
      }
    }, [availableMonths, viewMonth]);

    // ── handlers ──
    const handleSelect = (range: DateRange | undefined) => {
      if (!isControlled) setInternalRange(range);
      onValueChange?.(range);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setViewMonth(Number(e.target.value));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const y = Number(e.target.value);
      setViewYear(y);
      const monthsForYear = MONTH_NAMES.map((_, idx) => {
        const me = endOfMonth(y, idx);
        const ms = startOfMonth(y, idx);
        return {
          idx,
          disabled:
            (minDate ? me < minDate : false) ||
            (maxDate ? ms > maxDate : false),
        };
      });
      if (monthsForYear[viewMonth]?.disabled) {
        setViewMonth(monthsForYear.find((m) => !m.disabled)?.idx ?? viewMonth);
      }
    };

    const isDateDisabled = (date: Date) => {
      return (
        (minDate ? date < minDate : false) || (maxDate ? date > maxDate : false)
      );
    };

    const selectBase =
      "h-7 rounded-md border border-input bg-background px-2 text-xs font-medium shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";

    const triggerLabel = selectedRange?.from
      ? selectedRange.to
        ? `${format(selectedRange.from, dateFormat)} – ${format(selectedRange.to, dateFormat)}`
        : format(selectedRange.from, dateFormat)
      : placeholder;

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

        <Popover>
          <PopoverTrigger
            render={
              <Button
                ref={ref}
                id={inputId}
                name={name}
                variant="outline"
                disabled={disabled}
                aria-required={required || undefined}
                aria-invalid={!!error}
                aria-describedby={describedBy}
                aria-errormessage={errorId}
                data-empty={!selectedRange?.from}
                className={cn(
                  "w-full justify-start overflow-hidden text-left font-normal",
                  "data-[empty=true]:text-muted-foreground",
                  triggerClassName,
                )}
              />
            }
          >
            <CalendarIcon aria-hidden="true" />
            <span className="truncate">{triggerLabel}</span>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            {/* ── Month / Year selects ── */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <select
                aria-label="Month"
                value={viewMonth}
                onChange={handleMonthChange}
                className={cn(selectBase, "flex-1")}
              >
                {availableMonths.map(({ name, idx, disabled: isDisabled }) => (
                  <option key={idx} value={idx} disabled={isDisabled}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Year"
                value={viewYear}
                onChange={handleYearChange}
                className={cn(selectBase, "w-[4.5rem]")}
              >
                {Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
                  const y = minYear + i;
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* ── Calendar ── */}
            <Calendar
              mode="range"
              numberOfMonths={numberOfMonths}
              month={new Date(viewYear, viewMonth)}
              onMonthChange={(m) => {
                setViewYear(m.getFullYear());
                setViewMonth(m.getMonth());
              }}
              selected={selectedRange}
              onSelect={handleSelect}
              disabled={isDateDisabled}
            />
          </PopoverContent>
        </Popover>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

DateRangePickerField.displayName = "DateRangePickerField";
