"use client"

import * as React from "react"
import { ClockIcon } from "lucide-react"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type TimeFormat = "12h" | "24h"

export interface TimePickerFieldProps {
  label?: string
  description?: string
  error?: string
  id?: string
  name?: string
  /** Controlled value as a "HH:mm" string (24-hour internally). */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  required?: boolean
  /** "12h" shows AM/PM selector; "24h" shows plain 24-hour input. Defaults to "24h". */
  timeFormat?: TimeFormat
  fieldClassName?: string
  labelClassName?: string
  inputClassName?: string
  orientation?: "vertical" | "horizontal" | "responsive"
}

/** Parse a "HH:mm" string into { hours, minutes } (both as numbers). */
function parseTime(value: string): { hours: number; minutes: number } {
  const [h, m] = value.split(":").map(Number)
  return {
    hours: Number.isFinite(h) ? h : 0,
    minutes: Number.isFinite(m) ? m : 0,
  }
}

/** Convert hours/minutes back to a "HH:mm" string. */
function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

/** Convert 24-hour `hours` to 12-hour display value (1-12). */
function to12Hour(hours: number): number {
  const h = hours % 12
  return h === 0 ? 12 : h
}

/** Convert 12-hour display value + period back to 24-hour hours. */
function from12Hour(hour12: number, period: "AM" | "PM"): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12
  return hour12 === 12 ? 12 : hour12 + 12
}

export const TimePickerField = React.forwardRef<
  HTMLInputElement,
  TimePickerFieldProps
>(
  (
    {
      label,
      description,
      error,
      id,
      name,
      value,
      defaultValue = "00:00",
      onValueChange,
      disabled,
      required,
      timeFormat = "24h",
      fieldClassName,
      labelClassName,
      inputClassName,
      orientation = "vertical",
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const describedBy = description && !error ? descriptionId : undefined

    // Internal state (always stored as 24h)
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = React.useState(
      defaultValue ?? "00:00"
    )
    const currentValue = isControlled ? value : internalValue

    const { hours, minutes } = parseTime(currentValue)
    const [period, setPeriod] = React.useState<"AM" | "PM">(
      hours >= 12 ? "PM" : "AM"
    )

    // Keep period in sync when controlled value changes
    React.useEffect(() => {
      if (isControlled) {
        setPeriod(hours >= 12 ? "PM" : "AM")
      }
    }, [hours, isControlled])

    const commitChange = React.useCallback(
      (newHours: number, newMinutes: number) => {
        const newValue = formatTime(newHours, newMinutes)
        if (!isControlled) setInternalValue(newValue)
        onValueChange?.(newValue)
      },
      [isControlled, onValueChange]
    )

    // ── 24-hour input handler ──
    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value // "HH:mm"
      if (!isControlled) setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    // ── 12-hour: hours spin box ──
    const hour12 = to12Hour(hours)
    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseInt(e.target.value, 10)
      if (!Number.isFinite(raw)) return
      const clamped = Math.max(1, Math.min(12, raw))
      commitChange(from12Hour(clamped, period), minutes)
    }

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseInt(e.target.value, 10)
      if (!Number.isFinite(raw)) return
      const clamped = Math.max(0, Math.min(59, raw))
      commitChange(from12Hour(hour12, period), clamped)
    }

    const togglePeriod = () => {
      const newPeriod = period === "AM" ? "PM" : "AM"
      setPeriod(newPeriod)
      commitChange(from12Hour(hour12, newPeriod), minutes)
    }

    // ── keyboard spin for hour/minute ──
    const spinOnKeyDown =
      (
        current: number,
        min: number,
        max: number,
        onChange: (v: number) => void
      ) =>
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowUp") {
          e.preventDefault()
          onChange(current < max ? current + 1 : min)
        } else if (e.key === "ArrowDown") {
          e.preventDefault()
          onChange(current > min ? current - 1 : max)
        }
      }

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
              labelClassName
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

        {timeFormat === "24h" ? (
          // ─── 24-hour: native <input type="time"> ───────────────────────────
          <div className="relative flex items-center">
            <div
              aria-hidden="true"
              className="absolute left-3 flex items-center text-muted-foreground [&>svg]:size-4 pointer-events-none"
            >
              <ClockIcon />
            </div>
            <Input
              ref={ref}
              id={inputId}
              name={name}
              type="time"
              value={currentValue}
              onChange={handleNativeChange}
              disabled={disabled}
              required={required}
              aria-required={required || undefined}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              aria-errormessage={errorId}
              className={cn("pl-9", inputClassName)}
            />
          </div>
        ) : (
          // ─── 12-hour: custom HH:mm AM/PM ──────────────────────────────────
          <div
            className={cn(
              "flex h-9 w-full items-center rounded-md border border-input bg-transparent shadow-xs transition-colors",
              "focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring",
              error && "border-destructive",
              disabled && "cursor-not-allowed opacity-50",
              inputClassName
            )}
          >
            <div className="flex items-center px-3 text-muted-foreground">
              <ClockIcon className="size-4" aria-hidden="true" />
            </div>

            {/* Hours */}
            <input
              ref={ref}
              id={inputId}
              name={name}
              type="number"
              min={1}
              max={12}
              value={String(hour12).padStart(2, "0")}
              onChange={handleHourChange}
              onKeyDown={spinOnKeyDown(
                hour12,
                1,
                12,
                (v) => commitChange(from12Hour(v, period), minutes)
              )}
              disabled={disabled}
              required={required}
              aria-required={required || undefined}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              aria-errormessage={errorId}
              aria-label="Hours"
              className={cn(
                "w-10 border-0 bg-transparent text-center text-sm tabular-nums",
                "focus:outline-none focus:ring-0",
                "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              )}
            />

            <span className="select-none text-muted-foreground text-sm">:</span>

            {/* Minutes */}
            <input
              type="number"
              min={0}
              max={59}
              value={String(minutes).padStart(2, "0")}
              onChange={handleMinuteChange}
              onKeyDown={spinOnKeyDown(
                minutes,
                0,
                59,
                (v) => commitChange(from12Hour(hour12, period), v)
              )}
              disabled={disabled}
              aria-label="Minutes"
              className={cn(
                "w-10 border-0 bg-transparent text-center text-sm tabular-nums",
                "focus:outline-none focus:ring-0",
                "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              )}
            />

            {/* AM/PM toggle */}
            <button
              type="button"
              onClick={togglePeriod}
              disabled={disabled}
              aria-label={`Switch to ${period === "AM" ? "PM" : "AM"}`}
              className={cn(
                "ml-1 mr-2 rounded px-2 py-0.5 text-xs font-medium transition-colors",
                "bg-muted text-muted-foreground hover:bg-muted/80",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              {period}
            </button>
          </div>
        )}

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    )
  }
)

TimePickerField.displayName = "TimePickerField"
