"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

function RequiredIndicator() {
  return (
    <>
      <span aria-hidden="true" className="text-destructive ml-0.5">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

export interface FieldCheckboxProps
  extends Omit<React.ComponentProps<typeof Checkbox>, "id"> {
  label?: string;
  description?: string;
  error?: string;
  id?: string;
  /** Render as a bordered, clickable choice card instead of a plain label row. */
  asCard?: boolean;
  fieldClassName?: string;
  labelClassName?: string;
  checkboxClassName?: string;
}

export const FieldCheckbox = React.forwardRef<
  React.ComponentRef<typeof Checkbox>,
  FieldCheckboxProps
>(
  (
    {
      label,
      description,
      error,
      asCard = false,
      fieldClassName,
      labelClassName,
      checkboxClassName,
      id,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;
    const descriptionId = description ? `${checkboxId}-description` : undefined;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const describedBy = description ? descriptionId : undefined;

    const checkbox = (
      <Checkbox
        id={checkboxId}
        ref={ref}
        disabled={disabled}
        required={required}
        aria-required={required || undefined}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        aria-errormessage={errorId}
        className={checkboxClassName}
        {...props}
      />
    );

    if (asCard) {
      return (
        <div className={cn("flex flex-col gap-1", fieldClassName)}>
          <FieldLabel
            htmlFor={checkboxId}
            className={cn(
              disabled && "opacity-70 cursor-not-allowed",
              labelClassName,
            )}
          >
            <Field
              orientation="horizontal"
              data-invalid={error ? true : undefined}
            >
              {checkbox}
              <FieldContent>
                {label && (
                  <FieldTitle>
                    {label}
                    {required && <RequiredIndicator />}
                  </FieldTitle>
                )}
                {description && !error && (
                  <FieldDescription id={descriptionId}>
                    {description}
                  </FieldDescription>
                )}
              </FieldContent>
            </Field>
          </FieldLabel>
          {error && <FieldError id={errorId}>{error}</FieldError>}
        </div>
      );
    }

    return (
      <Field
        orientation="horizontal"
        data-invalid={error ? true : undefined}
        className={fieldClassName}
      >
        {checkbox}
        <FieldContent>
          {label && (
            <FieldLabel
              htmlFor={checkboxId}
              className={cn(
                error && "text-destructive",
                disabled && "opacity-70 cursor-not-allowed",
                labelClassName,
              )}
            >
              {label}
              {required && <RequiredIndicator />}
            </FieldLabel>
          )}
          {description && !error && (
            <FieldDescription id={descriptionId}>
              {description}
            </FieldDescription>
          )}
          {error && <FieldError id={errorId}>{error}</FieldError>}
        </FieldContent>
      </Field>
    );
  },
);

FieldCheckbox.displayName = "FieldCheckbox";

export interface FieldCheckboxGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface FieldCheckboxGroupProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "children" | "defaultValue" | "onBlur"
  > {
  options: FieldCheckboxGroupOption[];
  label?: string;
  description?: string;
  error?: string;
  /** Checked option values (controlled). */
  value?: string[];
  /** Initially checked option values (uncontrolled). */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Form field name shared by every checkbox, for native form submission. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Render each option as a bordered, clickable choice card instead of a plain checkbox row. */
  asCard?: boolean;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  fieldSetClassName?: string;
  legendClassName?: string;
  itemClassName?: string;
  checkboxClassName?: string;
}

export const FieldCheckboxGroup = React.forwardRef<
  HTMLDivElement,
  FieldCheckboxGroupProps
>(
  (
    {
      options,
      label,
      description,
      error,
      value: valueProp,
      defaultValue,
      onValueChange,
      name,
      asCard = false,
      disabled,
      required,
      fieldSetClassName,
      legendClassName,
      itemClassName,
      checkboxClassName,
      className,
      id,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const groupId = id ?? generatedId;
    const descriptionId = description ? `${groupId}-description` : undefined;
    const errorId = error ? `${groupId}-error` : undefined;
    const describedBy = description ? descriptionId : undefined;

    const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(
      defaultValue ?? [],
    );
    const value = valueProp ?? uncontrolledValue;

    const toggle = (optionValue: string, checked: boolean) => {
      const next = checked
        ? [...value, optionValue]
        : value.filter((v) => v !== optionValue);
      // Keep the order of `options` so the value is stable regardless of click order.
      const ordered = options
        .map((option) => option.value)
        .filter((v) => next.includes(v));
      if (valueProp === undefined) setUncontrolledValue(ordered);
      onValueChange?.(ordered);
    };

    return (
      <FieldSet
        className={fieldSetClassName}
        // Only report blur when focus leaves the whole group, not when Tab
        // moves it between checkboxes.
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            onBlur?.(event);
        }}
      >
        {label && (
          <FieldLegend
            variant="label"
            data-invalid={error ? true : undefined}
            className={cn(error && "text-destructive", legendClassName)}
          >
            {label}
            {required && <RequiredIndicator />}
          </FieldLegend>
        )}

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        <div
          id={groupId}
          ref={ref}
          role="group"
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-errormessage={errorId}
          className={cn("grid gap-3", className)}
          {...props}
        >
          {options.map((option) => {
            const itemId = `${groupId}-${option.value}`;
            const itemDisabled = disabled || option.disabled;

            const checkbox = (
              <Checkbox
                id={itemId}
                name={name}
                value={option.value}
                checked={value.includes(option.value)}
                onCheckedChange={(checked) => toggle(option.value, checked)}
                disabled={itemDisabled}
                aria-invalid={!!error}
                className={checkboxClassName}
              />
            );

            if (asCard) {
              return (
                <FieldLabel
                  key={option.value}
                  htmlFor={itemId}
                  className={cn(
                    itemDisabled && "opacity-70 cursor-not-allowed",
                    itemClassName,
                  )}
                >
                  <Field orientation="horizontal">
                    {checkbox}
                    <FieldContent>
                      <FieldTitle>{option.label}</FieldTitle>
                      {option.description && (
                        <FieldDescription>
                          {option.description}
                        </FieldDescription>
                      )}
                    </FieldContent>
                  </Field>
                </FieldLabel>
              );
            }

            return (
              <Field
                key={option.value}
                orientation="horizontal"
                className={itemClassName}
              >
                {checkbox}
                <FieldContent>
                  <FieldLabel
                    htmlFor={itemId}
                    className={cn(
                      itemDisabled && "opacity-70 cursor-not-allowed",
                    )}
                  >
                    {option.label}
                  </FieldLabel>
                  {option.description && (
                    <FieldDescription>{option.description}</FieldDescription>
                  )}
                </FieldContent>
              </Field>
            );
          })}
        </div>

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </FieldSet>
    );
  },
);

FieldCheckboxGroup.displayName = "FieldCheckboxGroup";
