"use client";

import * as React from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface FieldRadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface FieldRadioProps
  extends Omit<React.ComponentProps<typeof RadioGroup>, "children" | "onBlur"> {
  options: FieldRadioOption[];
  label?: string;
  description?: string;
  error?: string;
  /** Render each option as a bordered, clickable choice card instead of a plain radio row. */
  asCard?: boolean;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  fieldSetClassName?: string;
  legendClassName?: string;
  itemClassName?: string;
  radioClassName?: string;
}

export const FieldRadio = React.forwardRef<
  React.ComponentRef<typeof RadioGroup>,
  FieldRadioProps
>(
  (
    {
      options,
      label,
      description,
      error,
      asCard = false,
      disabled,
      required,
      fieldSetClassName,
      legendClassName,
      itemClassName,
      radioClassName,
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

    return (
      <FieldSet
        className={fieldSetClassName}
        // Only report blur when focus leaves the whole group, not when arrow
        // keys move it between radios.
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
            {required && (
              <>
                <span aria-hidden="true" className="text-destructive ml-0.5">
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </FieldLegend>
        )}

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        <RadioGroup
          id={groupId}
          ref={ref}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-errormessage={errorId}
          {...props}
        >
          {options.map((option) => {
            const itemId = `${groupId}-${option.value}`;
            const itemDisabled = disabled || option.disabled;

            const radio = (
              <RadioGroupItem
                value={option.value}
                id={itemId}
                disabled={itemDisabled}
                className={radioClassName}
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
                    <FieldContent>
                      <FieldTitle>{option.label}</FieldTitle>
                      {option.description && (
                        <FieldDescription>
                          {option.description}
                        </FieldDescription>
                      )}
                    </FieldContent>
                    {radio}
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
                {radio}
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
        </RadioGroup>

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </FieldSet>
    );
  },
);

FieldRadio.displayName = "FieldRadio";
