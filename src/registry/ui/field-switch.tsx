"use client";

import * as React from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface FieldSwitchProps
  extends Omit<React.ComponentProps<typeof Switch>, "id"> {
  label?: string;
  description?: string;
  error?: string;
  id?: string;
  /** Render as a bordered, clickable choice card instead of a plain label row. */
  asCard?: boolean;
  fieldClassName?: string;
  labelClassName?: string;
  switchClassName?: string;
}

export const FieldSwitch = React.forwardRef<
  React.ComponentRef<typeof Switch>,
  FieldSwitchProps
>(
  (
    {
      label,
      description,
      error,
      asCard = false,
      fieldClassName,
      labelClassName,
      switchClassName,
      id,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;
    const descriptionId = description ? `${switchId}-description` : undefined;
    const errorId = error ? `${switchId}-error` : undefined;
    const describedBy = description ? descriptionId : undefined;

    const switchControl = (
      <Switch
        id={switchId}
        ref={ref}
        disabled={disabled}
        required={required}
        aria-required={required || undefined}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        aria-errormessage={errorId}
        className={switchClassName}
        {...props}
      />
    );

    if (asCard) {
      return (
        <div className={cn("flex flex-col gap-1", fieldClassName)}>
          <FieldLabel
            htmlFor={switchId}
            className={cn(
              disabled && "opacity-70 cursor-not-allowed",
              labelClassName,
            )}
          >
            <Field
              orientation="horizontal"
              data-invalid={error ? true : undefined}
            >
              <FieldContent>
                {label && (
                  <FieldTitle>
                    {label}
                    {required && (
                      <>
                        <span
                          aria-hidden="true"
                          className="text-destructive ml-0.5"
                        >
                          *
                        </span>
                        <span className="sr-only"> (required)</span>
                      </>
                    )}
                  </FieldTitle>
                )}
                {description && !error && (
                  <FieldDescription id={descriptionId}>
                    {description}
                  </FieldDescription>
                )}
              </FieldContent>
              {switchControl}
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
        <FieldContent>
          {label && (
            <FieldLabel
              htmlFor={switchId}
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
          {description && !error && (
            <FieldDescription id={descriptionId}>
              {description}
            </FieldDescription>
          )}
          {error && <FieldError id={errorId}>{error}</FieldError>}
        </FieldContent>
        {switchControl}
      </Field>
    );
  },
);

FieldSwitch.displayName = "FieldSwitch";
