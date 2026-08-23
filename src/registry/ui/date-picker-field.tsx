"use client";

import { format, getDaysInMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
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

/** Clamp a date to [min, max] if either bound is set. Returns the same object if already in range. */
function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && date < min) return new Date(min);
  if (max && date > max) return new Date(max);
  return date;
}

/** Start-of-month date for comparison purposes. */
function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

/** End-of-month date for comparison purposes. */
function endOfMonth(year: number, month: number) {
  return new Date(year, month, getDaysInMonth(new Date(year, month)));
}

// ─── types ────────────────────────────────────────────────────────────────────

export interface DatePickerFieldProps {
  label?: string;
  description?: string;
  error?: string;
  id?: string;
  name?: string;
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  /** date-fns format string for the trigger label. Defaults to `"PPP"`. */
  dateFormat?: string;
  /** Earliest selectable date — also filters month/year options. */
  minDate?: Date;
  /** Latest selectable date — also filters month/year options. */
  maxDate?: Date;
  /** @deprecated Use `minDate` instead. */
  fromDate?: Date;
  /** @deprecated Use `maxDate` instead. */
  toDate?: Date;
  fieldClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

// ─── component ────────────────────────────────────────────────────────────────

export const DatePickerField = React.forwardRef<
  HTMLButtonElement,
  DatePickerFieldProps
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
      placeholder = "Pick a date",
      dateFormat = "PPP",
      minDate: minDateProp,
      maxDate: maxDateProp,
      fromDate,
      toDate,
      fieldClassName,
      labelClassName,
      triggerClassName,
      orientation = "vertical",
    },
    ref,
  ) => {
    // Support deprecated fromDate/toDate aliases
    const minDate = minDateProp ?? fromDate;
    const maxDate = maxDateProp ?? toDate;

    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = description && !error ? descriptionId : undefined;

    // ── selected date (controlled / uncontrolled) ──
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(
      defaultValue,
    );
    const isControlled = value !== undefined;
    const selectedDate = isControlled ? value : internalDate;

    // ── month/year navigation state (what the calendar is showing) ──
    const today = new Date();
    const [viewYear, setViewYear] = React.useState(
      () => selectedDate?.getFullYear() ?? today.getFullYear(),
    );
    const [viewMonth, setViewMonth] = React.useState(
      () => selectedDate?.getMonth() ?? today.getMonth(),
    );

    // Keep view in sync when controlled value changes
    React.useEffect(() => {
      if (selectedDate) {
        setViewYear(selectedDate.getFullYear());
        setViewMonth(selectedDate.getMonth());
      }
    }, [selectedDate]);

    // ── year range ──
    const minYear = minDate ? minDate.getFullYear() : today.getFullYear() - 100;
    const maxYear = maxDate ? maxDate.getFullYear() : today.getFullYear() + 10;

    // ── available months for the current viewYear ──
    const availableMonths = React.useMemo(() => {
      return MONTH_NAMES.map((name, idx) => {
        // A month is disabled if its entire range falls outside [minDate, maxDate]
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
    const handleSelect = (date: Date | undefined) => {
      if (!isControlled) setInternalDate(date);
      onValueChange?.(date);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const m = Number(e.target.value);
      setViewMonth(m);
      // If a date is already selected in the same year, move it to the new month
      if (selectedDate && selectedDate.getFullYear() === viewYear) {
        const maxDay = getDaysInMonth(new Date(viewYear, m));
        const day = Math.min(selectedDate.getDate(), maxDay);
        const next = clampDate(new Date(viewYear, m, day), minDate, maxDate);
        handleSelect(next);
      }
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const y = Number(e.target.value);
      setViewYear(y);
      // Clamp the visible month into the new year's available range
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
      const targetMonth = monthsForYear[viewMonth]?.disabled
        ? (monthsForYear.find((m) => !m.disabled)?.idx ?? viewMonth)
        : viewMonth;
      setViewMonth(targetMonth);

      // Move selected date into the new year if it was in the old one
      if (selectedDate && selectedDate.getFullYear() !== y) {
        const maxDay = getDaysInMonth(new Date(y, targetMonth));
        const day = Math.min(selectedDate.getDate(), maxDay);
        const next = clampDate(new Date(y, targetMonth, day), minDate, maxDate);
        handleSelect(next);
      }
    };

    const isDateDisabled = (date: Date) => {
      return (
        (minDate ? date < minDate : false) || (maxDate ? date > maxDate : false)
      );
    };

    const selectBase =
      "h-7 rounded-md border border-input bg-background px-2 text-xs font-medium shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";

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
                data-empty={!selectedDate}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  "data-[empty=true]:text-muted-foreground",
                  triggerClassName,
                )}
              />
            }
          >
            <CalendarIcon aria-hidden="true" />
            {selectedDate ? (
              format(selectedDate, dateFormat)
            ) : (
              <span>{placeholder}</span>
            )}
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            {/* ── Month / Year selects ── */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              {/* Month selector */}
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

              {/* Year selector */}
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
              mode="single"
              month={new Date(viewYear, viewMonth)}
              onMonthChange={(m) => {
                setViewYear(m.getFullYear());
                setViewMonth(m.getMonth());
              }}
              selected={selectedDate}
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

DatePickerField.displayName = "DatePickerField";
