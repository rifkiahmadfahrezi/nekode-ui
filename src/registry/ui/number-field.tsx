"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

/** Used to format on blur (e.g. "0.00") when `decimal` is true but `decimalPlaces` wasn't set. */
const DEFAULT_DECIMAL_PLACES = 2

export interface NumberFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "value" | "defaultValue"
  > {
  label?: string
  description?: string
  error?: string
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode
  /** Passed to the underlying `Field` wrapper (e.g. orientation, data-invalid overrides). */
  fieldClassName?: string
  labelClassName?: string
  inputClassName?: string
  orientation?: "vertical" | "horizontal" | "responsive"
  value?: number | string
  defaultValue?: number | string
  min?: number
  max?: number
  step?: number
  /**
   * Allow decimal (float) input at all. Defaults to `true`.
   * Set to `false` to restrict the field to integers only.
   */
  decimal?: boolean
  /**
   * Max digits allowed after the decimal point, e.g. `2` for `12.34`.
   * Only applies when `decimal` is `true`. Extra digits are truncated
   * as the user types (not rounded), so partial entry like `1.5` isn't
   * clobbered mid-typing. Also used to format the value on blur
   * (defaults to 2, e.g. `0.00`) when `decimal` is `true`.
   */
  decimalPlaces?: number
  /** Allow a leading `-`. Defaults to `true` unless `min` is `>= 0`. */
  allowNegative?: boolean
  /**
   * On blur: snap an out-of-range value to the nearest bound (`min`/`max`),
   * and fall back an empty/incomplete value to `0` (formatted as `0.00`
   * when `decimal` is true). Defaults to `true`.
   */
  clampOnBlur?: boolean
  /** Called with a parsed number (or `undefined` when the field is cleared / not a valid number). */
  onValueChange?: (value: number | undefined) => void
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

/** Strips/limits characters so the raw string always matches the field's numeric shape. */
function sanitizeNumberString(
  raw: string,
  opts: { decimal: boolean; decimalPlaces?: number; allowNegative: boolean }
) {
  const { decimal, decimalPlaces, allowNegative } = opts
  let value = raw

  // Only digits, one leading "-", and (if decimal) one "."
  value = value.replace(decimal ? /[^\d.-]/g : /[^\d-]/g, "")

  // Collapse to a single leading "-"
  const negative = allowNegative && value.startsWith("-")
  value = value.replace(/-/g, "")
  if (negative) value = `-${value}`

  if (decimal) {
    const firstDot = value.indexOf(".")
    if (firstDot !== -1) {
      // Drop any additional "."
      value =
        value.slice(0, firstDot + 1) +
        value.slice(firstDot + 1).replace(/\./g, "")

      if (typeof decimalPlaces === "number") {
        const [intPart, decPart = ""] = value.split(".")
        value =
          decimalPlaces <= 0
            ? intPart
            : `${intPart}.${decPart.slice(0, decimalPlaces)}`
      }
    }
  }

  return value
}

function toDisplayString(value: number | string | undefined) {
  if (value === undefined || value === null) return ""
  return String(value)
}

function formatNumber(n: number, decimal: boolean, places: number) {
  return decimal ? n.toFixed(places) : String(Math.round(n))
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      label,
      description,
      error,
      leftSection,
      rightSection,
      fieldClassName,
      labelClassName,
      inputClassName,
      orientation = "vertical",
      id,
      disabled,
      required,
      min,
      max,
      step = 1,
      decimal = true,
      decimalPlaces,
      allowNegative,
      clampOnBlur = true,
      value,
      defaultValue,
      onValueChange,
      onChange,
      onBlur,
      onFocus,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const describedBy = description ? descriptionId : undefined

    const isControlled = value !== undefined
    const resolvedAllowNegative = allowNegative ?? !(typeof min === "number" && min >= 0)
    const resolvedPlaces = decimalPlaces ?? DEFAULT_DECIMAL_PLACES

    // The input's displayed text always lives in local state, even when
    // `value` is controlled. This is what lets the user type an
    // intermediate string like "1." (which isn't a valid number yet)
    // without it being clobbered by whatever the parent's onValueChange
    // echoes back (e.g. `onValueChange={(v) => setValue(v ?? 0)}` turning
    // a mid-typing `undefined` into `0`).
    const [internalValue, setInternalValue] = React.useState(() =>
      toDisplayString(value ?? defaultValue)
    )
    const [isFocused, setIsFocused] = React.useState(false)

    // Re-sync from the external `value` prop — but only while the field
    // isn't focused. While the user is actively typing we trust the local
    // buffer; syncing mid-keystroke is what causes the reset-to-0 bug.
    React.useEffect(() => {
      if (!isControlled || isFocused) return
      setInternalValue(toDisplayString(value))
    }, [isControlled, isFocused, value])

    const displayValue = internalValue

    const commit = (next: string, parsed: number | undefined) => {
      setInternalValue(next)
      onValueChange?.(parsed)
    }

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      const sanitized = sanitizeNumberString(event.target.value, {
        decimal,
        decimalPlaces,
        allowNegative: resolvedAllowNegative,
      })
      // Reflect the sanitized value back onto the event so consumers using
      // plain `onChange` (instead of `onValueChange`) see the clamped text.
      event.target.value = sanitized
      onChange?.(event)

      const isIncomplete =
        sanitized === "" || sanitized === "-" || sanitized.endsWith(".")
      commit(sanitized, isIncomplete ? undefined : Number(sanitized))
    }

    const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
      setIsFocused(true)
      onFocus?.(event)
    }

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
      setIsFocused(false)
      onBlur?.(event)
      if (!clampOnBlur) return

      const isIncomplete =
        displayValue === "" || displayValue === "-" || displayValue.endsWith(".")

      let next: number
      if (isIncomplete) {
        // Nothing usable was typed — fall back to 0, still respecting bounds.
        next = 0
        if (typeof min === "number" && min > next) next = min
        if (typeof max === "number" && max < next) next = max
      } else {
        next = Number(displayValue)
        if (typeof min === "number" && next < min) next = min
        if (typeof max === "number" && next > max) next = max
      }

      const formatted = formatNumber(next, decimal, resolvedPlaces)
      // Only touch the field if something actually needed correcting/formatting.
      if (formatted !== displayValue) commit(formatted, Number(formatted))
    }

    const clamp = (n: number) => {
      let next = n
      if (typeof min === "number") next = Math.max(min, next)
      if (typeof max === "number") next = Math.min(max, next)
      if (decimal) next = Number(next.toFixed(resolvedPlaces))
      return next
    }

    const step_ = (direction: 1 | -1) => {
      if (disabled) return
      const current = Number(displayValue) || 0
      const next = clamp(current + direction * step)
      commit(formatNumber(next, decimal, resolvedPlaces), next)
    }

    const numericValue = Number(displayValue)

    return (
      <Field
        orientation={orientation}
        data-invalid={error ? true : undefined}
        className={cn("w-full", fieldClassName)}
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

        <div className="relative flex items-center w-full">
          {leftSection && (
            <div
              aria-hidden="true"
              className="absolute left-3 flex items-center text-muted-foreground [&>svg]:size-4 pointer-events-none"
            >
              {leftSection}
            </div>
          )}

          {/*
            Deliberately `type="text"` (not `type="number"`): native number
            inputs can't be restricted to N decimal places as the user
            types, only validated after the fact. inputMode keeps the
            numeric keyboard on mobile.
          */}
          <Input
            id={inputId}
            ref={ref}
            type="text"
            inputMode={decimal ? "decimal" : "numeric"}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            aria-errormessage={errorId}
            role="spinbutton"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={Number.isNaN(numericValue) ? undefined : numericValue}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              leftSection && "pl-9",
              "pr-9",
              inputClassName,
            )}
            {...props}
          />

          {rightSection ? (
            <div
              aria-hidden="true"
              className="absolute right-3 flex items-center text-muted-foreground [&>svg]:size-4"
            >
              {rightSection}
            </div>
          ) : (
            <div className="absolute right-1 flex flex-col">
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                disabled={disabled || (typeof max === "number" && numericValue >= max)}
                onClick={() => step_(1)}
                className="px-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              >
                <svg viewBox="0 0 12 12" className="size-3" fill="none">
                  <path d="M2.5 7L6 3.5L9.5 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                disabled={disabled || (typeof min === "number" && numericValue <= min)}
                onClick={() => step_(-1)}
                className="px-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              >
                <svg viewBox="0 0 12 12" className="size-3" fill="none">
                  <path d="M2.5 5L6 8.5L9.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    )
  }
)

NumberField.displayName = "NumberField"