"use client";

import { Star } from "lucide-react";
import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface RatingFieldProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange" | "children"
  > {
  label?: string;
  description?: string;
  error?: string;
  /** Selected rating. `0` means nothing is selected. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Number of items. Defaults to `5`. */
  max?: number;
  /** Clicking the selected item again clears the rating. Defaults to `true`. */
  allowClear?: boolean;
  /** Show the value, but don't let the user change it. */
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Name for a hidden input so a plain `<form>` submit includes the value. */
  name?: string;
  size?: "sm" | "default" | "lg";
  /** Icon for each item. Defaults to lucide `Star`. Filled via `fill-current`. */
  icon?: React.ReactNode;
  /** Accessible name for each item, e.g. `(n) => \`${n} stars\``. */
  getItemLabel?: (value: number, max: number) => string;
  /** Passed to the underlying `Field` wrapper. */
  fieldClassName?: string;
  labelClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

const sizeClasses = {
  sm: "[&_svg]:size-4",
  default: "[&_svg]:size-5",
  lg: "[&_svg]:size-7",
} as const;

const defaultItemLabel = (n: number, max: number) =>
  `${n} ${n === 1 ? "star" : "stars"} out of ${max}`;

export const RatingField = React.forwardRef<HTMLDivElement, RatingFieldProps>(
  (
    {
      label,
      description,
      error,
      value,
      defaultValue = 0,
      onValueChange,
      max = 5,
      allowClear = true,
      readOnly = false,
      disabled = false,
      required,
      name,
      size = "default",
      icon,
      getItemLabel = defaultItemLabel,
      fieldClassName,
      labelClassName,
      orientation = "vertical",
      className,
      id,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const baseId = id ?? generatedId;
    const labelId = `${baseId}-label`;
    const descriptionId = description ? `${baseId}-description` : undefined;
    const errorId = error ? `${baseId}-error` : undefined;

    const [internal, setInternal] = React.useState(defaultValue);
    const current = value ?? internal;
    const [hovered, setHovered] = React.useState<number | null>(null);
    const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

    const interactive = !readOnly && !disabled;
    const displayed = interactive && hovered !== null ? hovered : current;

    const setValue = (next: number) => {
      if (!interactive) return;
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };

    const focusItem = (n: number) => itemRefs.current[n - 1]?.focus();

    const handleKeyDown = (event: React.KeyboardEvent, n: number) => {
      if (!interactive) return;
      let next: number | null = null;
      if (event.key === "ArrowRight" || event.key === "ArrowUp")
        next = Math.min(max, n + 1);
      else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
        next = Math.max(1, n - 1);
      else if (event.key === "Home") next = 1;
      else if (event.key === "End") next = max;
      if (next === null) return;
      event.preventDefault();
      setValue(next);
      focusItem(next);
    };

    // Roving tabindex: only the selected item (or the first one) is tabbable.
    const tabbable = current > 0 ? current : 1;

    return (
      <Field
        orientation={orientation}
        data-invalid={error ? true : undefined}
        className={fieldClassName}
      >
        {label && (
          <FieldLabel
            id={labelId}
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

        <div
          ref={ref}
          id={baseId}
          role="radiogroup"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={descriptionId}
          aria-errormessage={errorId}
          aria-invalid={!!error}
          aria-required={required || undefined}
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          onMouseLeave={() => setHovered(null)}
          onBlur={onBlur}
          className={cn(
            "flex w-fit items-center gap-0.5",
            sizeClasses[size],
            disabled && "opacity-50",
            className,
          )}
          {...props}
        >
          {Array.from({ length: max }, (_, index) => {
            const n = index + 1;
            const filled = n <= displayed;
            return (
              <button
                key={n}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                role="radio"
                aria-checked={n === current}
                aria-label={getItemLabel(n, max)}
                tabIndex={!disabled && n === tabbable ? 0 : -1}
                disabled={disabled}
                data-filled={filled || undefined}
                onMouseEnter={() => interactive && setHovered(n)}
                onClick={() => setValue(allowClear && n === current ? 0 : n)}
                onKeyDown={(event) => handleKeyDown(event, n)}
                className={cn(
                  "rounded-sm p-0.5 text-muted-foreground/40 outline-none transition-[color,transform] focus-visible:ring-3 focus-visible:ring-ring/50",
                  "data-filled:text-amber-400 [&_svg]:data-filled:fill-current",
                  interactive
                    ? "cursor-pointer hover:scale-110"
                    : "cursor-default",
                  error && !filled && "text-destructive/40",
                )}
              >
                {icon ?? <Star aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {name && (
          <input type="hidden" name={name} value={current > 0 ? current : ""} />
        )}

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

RatingField.displayName = "RatingField";
