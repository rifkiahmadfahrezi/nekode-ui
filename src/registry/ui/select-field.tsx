"use client";

import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectFieldOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectFieldGroup {
  label?: string;
  options: SelectFieldOption[];
}

export interface SelectFieldProps {
  label?: string;
  description?: string;
  error?: string;
  placeholder?: string;
  /** Flat list of options. Use `groups` instead if you need labeled option groups. */
  options?: SelectFieldOption[];
  groups?: SelectFieldGroup[];
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  /** Passed to the underlying `Field` wrapper (e.g. orientation, data-invalid overrides). */
  fieldClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
  leftSection?: React.ReactNode;
}

export const SelectField = React.forwardRef<
  HTMLButtonElement,
  SelectFieldProps
>(
  (
    {
      label,
      description,
      error,
      placeholder = "Select an option",
      options,
      groups,
      name,
      id,
      value,
      defaultValue,
      onValueChange,
      disabled,
      required,
      fieldClassName,
      labelClassName,
      triggerClassName,
      orientation = "vertical",
      leftSection,
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const describedBy = description ? descriptionId : undefined;

    const renderOptions = (opts: SelectFieldOption[]) =>
      opts.map((opt) => (
        <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </SelectItem>
      ));

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

        <div className="relative flex items-center">
          {leftSection && (
            <div
              aria-hidden="true"
              className="absolute left-3 z-10 flex items-center text-muted-foreground [&>svg]:size-4 pointer-events-none"
            >
              {leftSection}
            </div>
          )}

          <Select
            name={name}
            value={value}
            defaultValue={defaultValue}
            onValueChange={(value) => onValueChange?.(value as string)}
            disabled={disabled}
            required={required}
          >
            <SelectTrigger
              id={inputId}
              ref={ref}
              aria-required={required || undefined}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              aria-errormessage={errorId}
              className={cn("w-full", leftSection && "pl-9", triggerClassName)}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {groups
                ? groups.map((group, i) => (
                    <React.Fragment key={group.label ?? i}>
                      {i > 0 && <SelectSeparator />}
                      <SelectGroup>
                        {group.label && (
                          <SelectLabel>{group.label}</SelectLabel>
                        )}
                        {renderOptions(group.options)}
                      </SelectGroup>
                    </React.Fragment>
                  ))
                : renderOptions(options ?? [])}
            </SelectContent>
          </Select>
        </div>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

SelectField.displayName = "SelectField";
