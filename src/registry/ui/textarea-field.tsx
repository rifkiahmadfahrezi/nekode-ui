"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

export interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
  /** Passed to the underlying `Field` wrapper (e.g. orientation, data-invalid overrides). */
  fieldClassName?: string
  labelClassName?: string
  textareaClassName?: string
  orientation?: "vertical" | "horizontal" | "responsive"
  /** Show a live character counter. Pass a number to also enforce it as `maxLength`. */
  showCount?: boolean
  /** Auto-grow height to fit content, up to `maxRows` (in rows) if provided. */
  autoResize?: boolean
  maxRows?: number
}

export const TextareaField = React.forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(
  (
    {
      label,
      description,
      error,
      className,
      fieldClassName,
      labelClassName,
      textareaClassName,
      orientation = "vertical",
      id,
      disabled,
      required,
      showCount,
      autoResize,
      maxRows,
      maxLength,
      value,
      defaultValue,
      onChange,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const countId = showCount ? `${inputId}-count` : undefined

    const describedBy =
      [description ? descriptionId : null, countId].filter(Boolean).join(" ") ||
      undefined

    const innerRef = React.useRef<HTMLTextAreaElement | null>(null)
    const setRefs = (node: HTMLTextAreaElement | null) => {
      innerRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
    }

    const [count, setCount] = React.useState(
      (typeof value === "string" ? value : typeof defaultValue === "string" ? defaultValue : "")
        .length
    )

    const resize = React.useCallback(() => {
      const el = innerRef.current
      if (!el || !autoResize) return
      el.style.height = "auto"
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "20")
      const maxHeight = maxRows ? lineHeight * maxRows : Infinity
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
    }, [autoResize, maxRows])

    React.useLayoutEffect(() => {
      resize()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
      onChange?.(event)
      if (showCount) setCount(event.target.value.length)
      resize()
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

        <Textarea
          id={inputId}
          ref={setRefs}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-errormessage={errorId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(autoResize && "resize-none overflow-hidden", className, textareaClassName)}
          {...props}
        />

        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {description && !error && (
              <FieldDescription id={descriptionId}>{description}</FieldDescription>
            )}
            {error && <FieldError id={errorId}>{error}</FieldError>}
          </div>

          {showCount && (
            <span
              id={countId}
              className={cn(
                "text-xs text-muted-foreground tabular-nums shrink-0 pt-0.5",
                maxLength && count > maxLength && "text-destructive"
              )}
            >
              {count}
              {maxLength ? ` / ${maxLength}` : ""}
            </span>
          )}
        </div>
      </Field>
    )
  }
)

TextareaField.displayName = "TextareaField"