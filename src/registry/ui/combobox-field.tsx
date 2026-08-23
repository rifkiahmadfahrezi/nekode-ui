"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

export interface ComboboxFieldOption {
  label: string
  value: string
  disabled?: boolean
}

export interface ComboboxFieldProps {
  label?: string
  description?: string
  error?: string
  placeholder?: string
  emptyText?: string
  items: ComboboxFieldOption[]
  name?: string
  id?: string
  value: string
  onValueChange: (value: string | undefined) => void
  disabled?: boolean
  required?: boolean
  /**
   * Show a spinner in place of the clear button and disable the field.
   * Use this while options are being fetched asynchronously.
   */
  loading?: boolean
  /** Show a clear ("x") button once a value is selected. Defaults to `true`. */
  showClear?: boolean
  /** Auto-highlight the first matching item while filtering. */
  autoHighlight?: boolean
  /** Passed to the underlying `Field` wrapper (e.g. orientation, data-invalid overrides). */
  fieldClassName?: string
  labelClassName?: string
  inputClassName?: string
  orientation?: "vertical" | "horizontal" | "responsive"
}

export const ComboboxField = React.forwardRef<HTMLInputElement, ComboboxFieldProps>(
  (
    {
      label,
      description,
      error,
      placeholder = "Select an option",
      emptyText = "No results found.",
      items,
      name,
      id,
      value,
      onValueChange,
      disabled,
      required,
      loading,
      showClear = true,
      autoHighlight,
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
    const describedBy = description ? descriptionId : undefined

    const isDisabled = disabled || loading
    const selectedItem = React.useMemo(
      () => items.find((item) => item.value === value) ?? null,
      [items, value]
    )

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
              isDisabled && "opacity-70 cursor-not-allowed",
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
          <Combobox
              items={items}
              itemToStringValue={(item) => item.label}
              value={selectedItem}
              onValueChange={(item) =>
                onValueChange?.(item ? item.value : undefined)
              }
              disabled={isDisabled}
              autoHighlight={autoHighlight}
            >
              <ComboboxInput
                id={inputId}
                ref={ref}
                name={name}
                placeholder={placeholder}
                aria-required={required || undefined}
                aria-invalid={!!error}
                aria-describedby={describedBy}
                aria-errormessage={errorId}
                showClear={loading ? false : showClear}
                className={cn("w-full", loading && "pr-9", inputClassName)}
              />
            <ComboboxContent>
              <ComboboxEmpty>{emptyText}</ComboboxEmpty>
              <ComboboxList>
                {(item: ComboboxFieldOption) => (
                  <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          {loading && (
            <div
              aria-hidden="true"
              className="absolute right-3 flex items-center text-muted-foreground pointer-events-none"
            >
              <Loader2Icon className="size-4 animate-spin" />
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

ComboboxField.displayName = "ComboboxField"
