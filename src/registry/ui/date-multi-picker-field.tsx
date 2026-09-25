"use client";

import { format, getDaysInMonth, startOfDay } from "date-fns";
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

/** Start-of-month date for comparison purposes. */
function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

/** End-of-month date for comparison purposes. */
function endOfMonth(year: number, month: number) {
  return new Date(year, month, getDaysInMonth(new Date(year, month)));
}

// ─── types ────────────────────────────────────────────────────────────────────

export interface DateMultiPickerFieldProps {
  label?: string;
  description?: string;
  error?: string;
  id?: string;
  name?: string;
  value?: Date[];
  defaultValue?: Date[];
  onValueChange?: (dates: Date[] | undefined) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  /** date-fns format string for each selected date in the trigger label. Defaults to `"PPP"`. */
  dateFormat?: string;
  /** Max number of dates shown in the trigger before collapsing to a count (e.g. "3 dates selected"). Defaults to `2`. */
  maxLabels?: number;
  /** Earliest selectable date — also filters month/year options. */
  minDate?: Date;
  /** Latest selectable date — also filters month/year options. */
  maxDate?: Date;
  fieldClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

// ─── component ────────────────────────────────────────────────────────────────

export const DateMultiPickerField = React.forwardRef<
  HTMLButtonElement,
  DateMultiPickerFieldProps
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
      placeholder = "Pick dates",
      dateFormat = "PPP",
      maxLabels = 2,
      minDate: minDateProp,
      maxDate: maxDateProp,
      fieldClassName,
      labelClassName,
      triggerClassName,
      orientation = "vertical",
    },
    ref,
  ) => {
    // Calendar days are local midnight, so compare against the start of
    // `minDate`'s day — otherwise `minDate={new Date()}` disables today.
    // Keyed on time so inline `new Date(...)` props don't churn memos.
    const minTime = minDateProp ? startOfDay(minDateProp).getTime() : undefined;
    const maxTime = maxDateProp?.getTime();
    const minDate = React.useMemo(
      () => (minTime === undefined ? undefined : new Date(minTime)),
      [minTime],
    );
    const maxDate = React.useMemo(
      () => (maxTime === undefined ? undefined : new Date(maxTime)),
      [maxTime],
    );

    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = description && !error ? descriptionId : undefined;

    // ── selected dates (controlled / uncontrolled) ──
    const [internalDates, setInternalDates] = React.useState<
      Date[] | undefined
    >(defaultValue);
    const isControlled = value !== undefined;
    const selectedDates = isControlled ? value : internalDates;

    // ── month/year navigation state (what the calendar is showing) ──
    const today = new Date();
    const [viewYear, setViewYear] = React.useState(
      () => selectedDates?.[0]?.getFullYear() ?? today.getFullYear(),
    );
    const [viewMonth, setViewMonth] = React.useState(
      () => selectedDates?.[0]?.getMonth() ?? today.getMonth(),
    );

    // ── year range ──
    // Default window is today-100..today+10, widened so a lone bound outside
    // it (e.g. only `minDate` in 2040) still yields a non-empty year list.
    const minYear =
      minDate?.getFullYear() ??
      Math.min(today.getFullYear() - 100, maxDate?.getFullYear() ?? Infinity);
    const maxYear =
      maxDate?.getFullYear() ?? Math.max(today.getFullYear() + 10, minYear);

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
    const handleSelect = (dates: Date[] | undefined) => {
      if (!isControlled) setInternalDates(dates);
      onValueChange?.(dates);
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

    const sortedDates = React.useMemo(
      () =>
        selectedDates
          ? [...selectedDates].sort((a, b) => a.getTime() - b.getTime())
          : undefined,
      [selectedDates],
    );

    const triggerLabel =
      sortedDates && sortedDates.length > 0
        ? sortedDates.length > maxLabels
          ? `${sortedDates.length} dates selected`
          : sortedDates.map((d) => format(d, dateFormat)).join(", ")
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
                data-empty={!selectedDates?.length}
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
              mode="multiple"
              month={new Date(viewYear, viewMonth)}
              onMonthChange={(m) => {
                setViewYear(m.getFullYear());
                setViewMonth(m.getMonth());
              }}
              selected={selectedDates}
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

DateMultiPickerField.displayName = "DateMultiPickerField";
