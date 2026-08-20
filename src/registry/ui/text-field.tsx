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

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode
  /** Passed to the underlying `Field` wrapper (e.g. orientation, data-invalid overrides). */
  fieldClassName?: string
  /** @deprecated use `fieldClassName` */
  wrapperClassName?: string
  labelClassName?: string
  inputClassName?: string
  orientation?: "vertical" | "horizontal" | "responsive"
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      description,
      error,
      leftSection,
      rightSection,
      className,
      fieldClassName,
      wrapperClassName,
      labelClassName,
      inputClassName,
      orientation = "vertical",
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorId = error ? `${inputId}-error` : undefined

    // aria-describedby only points to the description (extra context).
    // The error is wired separately via aria-errormessage so screen
    // readers don't read both a stale description and an error at once.
    const describedBy = description ? descriptionId : undefined

    return (
      <Field
        orientation={orientation}
        data-invalid={error ? true : undefined}
        className={cn(fieldClassName, wrapperClassName)}
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

        <div className="relative flex items-center">
          {leftSection && (
            <div
              aria-hidden="true"
              className="absolute left-3 flex items-center text-muted-foreground [&>svg]:size-4 pointer-events-none"
            >
              {leftSection}
            </div>
          )}

          <Input
            id={inputId}
            ref={ref}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            aria-errormessage={errorId}
            className={cn(
              leftSection && "pl-9",
              rightSection && "pr-9",
              className,
              inputClassName
            )}
            {...props}
          />

          {rightSection && (
            <div
              aria-hidden="true"
              className="absolute right-3 flex items-center text-muted-foreground [&>svg]:size-4"
            >
              {rightSection}
            </div>
          )}
        </div>

        {description && !error && (
          <FieldDescription id={descriptionId}>
            {description}
          </FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    )
  }
)

TextField.displayName = "TextField"