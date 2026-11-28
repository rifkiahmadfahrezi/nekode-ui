"use client";

import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SliderFieldBaseProps {
  label?: string;
  description?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
  /** Name for the hidden input(s), so a plain `<form>` submit includes the value. */
  name?: string;
  id?: string;
  /** Show the current value next to the label. Defaults to `true`. */
  showValue?: boolean;
  /** Formats the value shown next to the label and the min/max hints. */
  formatValue?: (value: number) => string;
  /** Show `min` and `max` under the track. Defaults to `false`. */
  showMinMax?: boolean;
  /** Passed to the underlying `Field` wrapper. */
  fieldClassName?: string;
  labelClassName?: string;
  /** Applied to the slider root. */
  className?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

export interface SliderFieldProps extends SliderFieldBaseProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

export interface RangeSliderFieldProps extends SliderFieldBaseProps {
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  /** Text between the two values next to the label. Defaults to `" – "`. */
  separator?: string;
}

const defaultFormat = (value: number) => String(value);

/** Shadcn's Base UI Slider passes `number | number[]`, the Radix one `number[]`. */
function toArray(value: number | readonly number[]): number[] {
  return Array.isArray(value) ? [...value] : [value as number];
}

function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
) {
  const [internal, setInternal] = React.useState(defaultValue);
  const current = value ?? internal;
  const set = (next: T) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  return [current, set] as const;
}

function SliderFieldShell({
  label,
  description,
  error,
  disabled,
  required,
  min,
  max,
  showValue,
  showMinMax,
  formatValue,
  valueText,
  fieldClassName,
  labelClassName,
  orientation,
  ids,
  children,
}: Omit<SliderFieldBaseProps, "id" | "name" | "step" | "className"> & {
  min: number;
  max: number;
  formatValue: (value: number) => string;
  valueText: string;
  ids: { label: string; description?: string; error?: string };
  children: React.ReactNode;
}) {
  return (
    <Field
      orientation={orientation}
      data-invalid={error ? true : undefined}
      data-disabled={disabled || undefined}
      className={fieldClassName}
    >
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <FieldLabel
              id={ids.label}
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
          ) : (
            <span />
          )}
          {showValue && (
            <output
              aria-hidden="true"
              className="text-sm font-medium tabular-nums text-muted-foreground"
            >
              {valueText}
            </output>
          )}
        </div>
      )}

      <div className="grid gap-2 py-1">
        {children}
        {showMinMax && (
          <div
            aria-hidden="true"
            className="flex justify-between text-xs text-muted-foreground tabular-nums"
          >
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        )}
      </div>

      {description && !error && (
        <FieldDescription id={ids.description}>{description}</FieldDescription>
      )}

      {error && <FieldError id={ids.error}>{error}</FieldError>}
    </Field>
  );
}

function useFieldIds(
  id: string | undefined,
  description?: string,
  error?: string,
) {
  const generatedId = React.useId();
  const baseId = id ?? generatedId;
  return {
    baseId,
    label: `${baseId}-label`,
    description: description ? `${baseId}-description` : undefined,
    error: error ? `${baseId}-error` : undefined,
  };
}

export const SliderField = React.forwardRef<HTMLDivElement, SliderFieldProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      showValue = true,
      showMinMax = false,
      formatValue = defaultFormat,
      id,
      name,
      className,
      label,
      description,
      error,
      disabled,
      required,
      ...shell
    },
    ref,
  ) => {
    const ids = useFieldIds(id, description, error);
    const [current, setCurrent] = useControllable(
      value,
      defaultValue ?? min,
      onValueChange,
    );

    return (
      <SliderFieldShell
        {...shell}
        label={label}
        description={description}
        error={error}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        showValue={showValue}
        showMinMax={showMinMax}
        formatValue={formatValue}
        valueText={formatValue(current)}
        ids={ids}
      >
        <Slider
          ref={ref}
          id={ids.baseId}
          name={name}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          value={[current]}
          onValueChange={(next: number | readonly number[]) => {
            const [first] = toArray(next);
            if (first !== undefined) setCurrent(first);
          }}
          aria-labelledby={label ? ids.label : undefined}
          aria-describedby={ids.description}
          aria-errormessage={ids.error}
          aria-invalid={!!error}
          className={className}
        />
      </SliderFieldShell>
    );
  },
);

SliderField.displayName = "SliderField";

export const RangeSliderField = React.forwardRef<
  HTMLDivElement,
  RangeSliderFieldProps
>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      showValue = true,
      showMinMax = false,
      formatValue = defaultFormat,
      separator = " – ",
      id,
      name,
      className,
      label,
      description,
      error,
      disabled,
      required,
      ...shell
    },
    ref,
  ) => {
    const ids = useFieldIds(id, description, error);
    const [current, setCurrent] = useControllable<[number, number]>(
      value,
      defaultValue ?? [min, max],
      onValueChange,
    );

    return (
      <SliderFieldShell
        {...shell}
        label={label}
        description={description}
        error={error}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        showValue={showValue}
        showMinMax={showMinMax}
        formatValue={formatValue}
        valueText={`${formatValue(current[0])}${separator}${formatValue(current[1])}`}
        ids={ids}
      >
        <Slider
          ref={ref}
          id={ids.baseId}
          name={name}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          value={current}
          onValueChange={(next: number | readonly number[]) => {
            const [from, to] = toArray(next);
            if (from !== undefined && to !== undefined) setCurrent([from, to]);
          }}
          aria-labelledby={label ? ids.label : undefined}
          aria-describedby={ids.description}
          aria-errormessage={ids.error}
          aria-invalid={!!error}
          className={className}
        />
      </SliderFieldShell>
    );
  },
);

RangeSliderField.displayName = "RangeSliderField";
