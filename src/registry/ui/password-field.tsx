"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: string;
  leftSection?: React.ReactNode;
  /** Passed to the underlying `Field` wrapper (e.g. orientation, data-invalid overrides). */
  fieldClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
  /** Hide the built-in show/hide toggle button. */
  hideToggle?: boolean;
  /** Controlled visibility state. Omit to let the component manage it internally. */
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

export const PasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(
  (
    {
      label,
      description,
      error,
      leftSection,
      fieldClassName,
      labelClassName,
      inputClassName,
      orientation = "vertical",
      id,
      disabled,
      required,
      hideToggle,
      visible,
      onVisibleChange,
      autoComplete = "current-password",
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const describedBy = description ? descriptionId : undefined;

    const [internalVisible, setInternalVisible] = React.useState(false);
    const isVisible = visible ?? internalVisible;
    const toggleVisible = () => {
      const next = !isVisible;
      onVisibleChange?.(next);
      if (visible === undefined) setInternalVisible(next);
    };

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
              className="absolute left-3 flex items-center text-muted-foreground [&>svg]:size-4 pointer-events-none"
            >
              {leftSection}
            </div>
          )}

          <Input
            id={inputId}
            ref={ref}
            type={isVisible ? "text" : "password"}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            aria-errormessage={errorId}
            autoComplete={autoComplete}
            className={cn(
              leftSection && "pl-9",
              !hideToggle && "pr-9",
              inputClassName,
            )}
            {...props}
          />

          {!hideToggle && (
            <button
              type="button"
              onClick={toggleVisible}
              disabled={disabled}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              tabIndex={0}
              className="absolute right-3 flex items-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none [&>svg]:size-4"
            >
              {isVisible ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

PasswordField.displayName = "PasswordField";
