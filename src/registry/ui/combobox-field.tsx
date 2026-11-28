"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { Loader2Icon, XIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface ComboboxFieldOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/** Props shared by the single and the `multiple` mode. */
export interface ComboboxFieldBaseProps {
  label?: string;
  description?: string;
  error?: string;
  /**
   * Shown while nothing is selected. Defaults to `"Select an option"`, or
   * `"Select options"` when `multiple` is set.
   */
  placeholder?: string;
  emptyText?: string;
  options: ComboboxFieldOption[];
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  /**
   * Show a spinner in place of the clear button and disable the field.
   * Use this while options are being fetched asynchronously.
   */
  loading?: boolean;
  /** Show a clear ("x") button once a value is selected. Defaults to `true`. */
  showClear?: boolean;
  /** Auto-highlight the first matching item while filtering. */
  autoHighlight?: boolean;
  /** Passed to the underlying `Field` wrapper (e.g. orientation, data-invalid overrides). */
  fieldClassName?: string;
  labelClassName?: string;
  /** Applied to the input (single) or the chips container (`multiple`). */
  inputClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

/** Single select: `value` is a `string`. This is the default mode. */
export interface ComboboxFieldSingleProps extends ComboboxFieldBaseProps {
  multiple?: false;
  value: string;
  onValueChange: (value: string | undefined) => void;
  /** Only available with `multiple`. */
  overflow?: never;
  /** Only available with `multiple`. */
  showAllSelectedLabel?: never;
}

/** Multi select: `value` is a `string[]` and selections render as chips. */
export interface ComboboxFieldMultipleProps extends ComboboxFieldBaseProps {
  multiple: true;
  value: string[];
  onValueChange: (value: string[]) => void;
  /**
   * What to do when selected chips don't fit on one line.
   * `"stack"` wraps them onto new lines, `"hide"` keeps one line and
   * collapses the rest into an "and N more..." label. Defaults to `"stack"`.
   */
  overflow?: "stack" | "hide";
  /**
   * Replace the chips with "All N items are selected" once every option is
   * selected. Defaults to `true` for `overflow="hide"`, `false` for `"stack"`.
   */
  showAllSelectedLabel?: boolean;
}

/**
 * `multiple` decides the shape of `value` and `onValueChange`:
 * omit it (or pass `false`) for `string`, pass `true` for `string[]`.
 */
export type ComboboxFieldProps =
  | ComboboxFieldSingleProps
  | ComboboxFieldMultipleProps;

const itemClassName =
  "data-selected:bg-primary/10 data-selected:font-medium data-selected:text-primary data-selected:data-highlighted:bg-primary/15 data-selected:data-highlighted:text-primary";

// Mirrors ComboboxChip's classes so hidden measuring copies match real chip widths.
const chipMeasureClass =
  "flex h-[calc(--spacing(5.5))] w-fit shrink-0 items-center gap-1 rounded-sm px-1.5 pr-0 text-xs font-medium whitespace-nowrap";
// Room kept for the search input (`min-w-16`) on the chip row.
const INPUT_MIN_WIDTH = 64;

function useFieldIds(
  id: string | undefined,
  description?: string,
  error?: string,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return {
    inputId,
    descriptionId: description ? `${inputId}-description` : undefined,
    errorId: error ? `${inputId}-error` : undefined,
  };
}

function ComboboxFieldShell({
  label,
  description,
  error,
  required,
  isDisabled,
  inputId,
  descriptionId,
  errorId,
  fieldClassName,
  labelClassName,
  orientation = "vertical",
  children,
}: Pick<
  ComboboxFieldBaseProps,
  | "label"
  | "description"
  | "error"
  | "required"
  | "fieldClassName"
  | "labelClassName"
  | "orientation"
> & {
  isDisabled?: boolean;
  inputId: string;
  descriptionId?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
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

      {children}

      {description && !error && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}

      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
}

const ComboboxFieldSingle = React.forwardRef<
  HTMLInputElement,
  ComboboxFieldSingleProps
>(
  (
    {
      label,
      description,
      error,
      placeholder = "Select an option",
      emptyText = "No results found.",
      options,
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
      orientation,
    },
    ref,
  ) => {
    const { inputId, descriptionId, errorId } = useFieldIds(
      id,
      description,
      error,
    );
    const isDisabled = disabled || loading;
    const selectedItem = React.useMemo(
      () => options.find((item) => item.value === value) ?? null,
      [options, value],
    );

    return (
      <ComboboxFieldShell
        label={label}
        description={description}
        error={error}
        required={required}
        isDisabled={isDisabled}
        inputId={inputId}
        descriptionId={descriptionId}
        errorId={errorId}
        fieldClassName={fieldClassName}
        labelClassName={labelClassName}
        orientation={orientation}
      >
        <div className="relative flex items-center">
          <Combobox
            items={options}
            itemToStringLabel={(item) => item.label}
            itemToStringValue={(item) => item.value}
            name={name}
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
              placeholder={placeholder}
              aria-required={required || undefined}
              aria-invalid={!!error}
              aria-describedby={description ? descriptionId : undefined}
              aria-errormessage={errorId}
              showClear={loading ? false : showClear}
              className={cn("w-full", loading && "pr-9", inputClassName)}
              disabled={loading || disabled}
            >
              {loading && (
                <div
                  aria-hidden="true"
                  className="absolute right-3 flex items-center text-muted-foreground pointer-events-none"
                >
                  <Loader2Icon className="size-4 animate-spin" />
                </div>
              )}
            </ComboboxInput>
            <ComboboxContent>
              <ComboboxEmpty>{emptyText}</ComboboxEmpty>
              <ComboboxList>
                {(item: ComboboxFieldOption) => (
                  <ComboboxItem
                    key={item.value}
                    value={item}
                    disabled={item.disabled}
                    className={itemClassName}
                  >
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </ComboboxFieldShell>
    );
  },
);

ComboboxFieldSingle.displayName = "ComboboxFieldSingle";

const ComboboxFieldMultiple = React.forwardRef<
  HTMLInputElement,
  ComboboxFieldMultipleProps
>(
  (
    {
      label,
      description,
      error,
      placeholder = "Select options",
      emptyText = "No results found.",
      options,
      name,
      id,
      value,
      onValueChange,
      disabled,
      required,
      loading,
      showClear = true,
      autoHighlight,
      overflow = "stack",
      showAllSelectedLabel = overflow === "hide",
      fieldClassName,
      labelClassName,
      inputClassName,
      orientation,
    },
    ref,
  ) => {
    const { inputId, descriptionId, errorId } = useFieldIds(
      id,
      description,
      error,
    );

    const anchorRef = useComboboxAnchor();
    const measureRef = React.useRef<HTMLDivElement>(null);

    const isDisabled = disabled || loading;
    const selectedItems = React.useMemo(
      () => options.filter((item) => value.includes(item.value)),
      [options, value],
    );
    const allSelected =
      showAllSelectedLabel &&
      options.length > 0 &&
      selectedItems.length === options.length;
    const collapse = overflow === "hide" && !allSelected;

    const [visibleCount, setVisibleCount] = React.useState(
      selectedItems.length,
    );

    React.useLayoutEffect(() => {
      const container = anchorRef.current;
      const measure = measureRef.current;
      if (!collapse || !container || !measure) return;

      const compute = () => {
        const style = getComputedStyle(container);
        const gap = Number.parseFloat(style.columnGap) || 0;
        const available =
          container.clientWidth -
          Number.parseFloat(style.paddingLeft) -
          Number.parseFloat(style.paddingRight) -
          INPUT_MIN_WIDTH;
        const nodes = Array.from(measure.children) as HTMLElement[];
        const moreWidth = (nodes.pop()?.offsetWidth ?? 0) + gap;

        let used = 0;
        let count = 0;
        for (const [index, node] of nodes.entries()) {
          const width = node.offsetWidth + gap;
          const hasRest = index < nodes.length - 1;
          if (used + width + (hasRest ? moreWidth : 0) > available) break;
          used += width;
          count++;
        }
        setVisibleCount(count);
      };

      compute();
      const observer = new ResizeObserver(compute);
      observer.observe(container);
      return () => observer.disconnect();
    }, [collapse, selectedItems, anchorRef]);

    const shownItems = collapse
      ? selectedItems.slice(0, visibleCount)
      : selectedItems;
    const hiddenCount = selectedItems.length - shownItems.length;

    return (
      <ComboboxFieldShell
        label={label}
        description={description}
        error={error}
        required={required}
        isDisabled={isDisabled}
        inputId={inputId}
        descriptionId={descriptionId}
        errorId={errorId}
        fieldClassName={fieldClassName}
        labelClassName={labelClassName}
        orientation={orientation}
      >
        <Combobox
          multiple
          items={options}
          itemToStringLabel={(item: ComboboxFieldOption) => item.label}
          itemToStringValue={(item: ComboboxFieldOption) => item.value}
          name={name}
          value={selectedItems}
          onValueChange={(items: ComboboxFieldOption[]) =>
            onValueChange(items.map((item) => item.value))
          }
          disabled={isDisabled}
          autoHighlight={autoHighlight}
        >
          <ComboboxChips
            ref={anchorRef}
            className={cn(
              "relative w-full pr-9",
              collapse && "flex-nowrap overflow-hidden",
              isDisabled && "cursor-not-allowed opacity-50",
              inputClassName,
            )}
          >
            {allSelected ? (
              <span className="shrink-0 px-1 text-sm">
                All {options.length} items are selected
              </span>
            ) : (
              shownItems.map((item) => (
                <ComboboxChip key={item.value} className="shrink-0">
                  {item.label}
                </ComboboxChip>
              ))
            )}
            {hiddenCount > 0 && (
              <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                and {hiddenCount} more...
              </span>
            )}
            <ComboboxChipsInput
              id={inputId}
              ref={ref}
              placeholder={selectedItems.length ? undefined : placeholder}
              aria-required={required || undefined}
              aria-invalid={!!error}
              aria-describedby={description ? descriptionId : undefined}
              aria-errormessage={errorId}
              disabled={isDisabled}
            />
            <div className="absolute right-1.5 flex items-center">
              {loading ? (
                <Loader2Icon
                  aria-hidden="true"
                  className="mx-1 size-4 animate-spin text-muted-foreground"
                />
              ) : (
                showClear &&
                selectedItems.length > 0 && (
                  <ComboboxPrimitive.Clear
                    aria-label="Clear selection"
                    disabled={isDisabled}
                    render={<Button variant="ghost" size="icon-xs" />}
                  >
                    <XIcon aria-hidden="true" className="pointer-events-none" />
                  </ComboboxPrimitive.Clear>
                )
              )}
            </div>
            {collapse && (
              <div
                ref={measureRef}
                aria-hidden="true"
                className="invisible absolute top-0 left-0 flex"
              >
                {selectedItems.map((item) => (
                  <span key={item.value} className={chipMeasureClass}>
                    {item.label}
                    <span className="-ml-1 size-6" />
                  </span>
                ))}
                <span className="text-xs whitespace-nowrap">
                  and {selectedItems.length} more...
                </span>
              </div>
            )}
          </ComboboxChips>
          <ComboboxContent anchor={anchorRef}>
            <ComboboxEmpty>{emptyText}</ComboboxEmpty>
            <ComboboxList>
              {(item: ComboboxFieldOption) => (
                <ComboboxItem
                  key={item.value}
                  value={item}
                  disabled={item.disabled}
                  className={itemClassName}
                >
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </ComboboxFieldShell>
    );
  },
);

ComboboxFieldMultiple.displayName = "ComboboxFieldMultiple";

/**
 * Searchable, labeled combobox. Pass `multiple` to select several options:
 * `value` becomes `string[]` and selections render as removable chips.
 */
export const ComboboxField = React.forwardRef<
  HTMLInputElement,
  ComboboxFieldProps
>((props, ref) =>
  props.multiple ? (
    <ComboboxFieldMultiple ref={ref} {...props} />
  ) : (
    <ComboboxFieldSingle ref={ref} {...props} />
  ),
);

ComboboxField.displayName = "ComboboxField";
