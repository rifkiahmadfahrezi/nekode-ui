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

export interface ComboboxMultiFieldOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface ComboboxMultiFieldProps {
  label?: string;
  description?: string;
  error?: string;
  placeholder?: string;
  emptyText?: string;
  options: ComboboxMultiFieldOption[];
  name?: string;
  id?: string;
  value: string[];
  onValueChange: (value: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  /** Show a spinner in place of the clear button and disable the field. */
  loading?: boolean;
  /** Show a clear-all ("x") button once a value is selected. Defaults to `true`. */
  showClear?: boolean;
  /** Auto-highlight the first matching item while filtering. */
  autoHighlight?: boolean;
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
  fieldClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

// Mirrors ComboboxChip's classes so hidden measuring copies match real chip widths.
const chipMeasureClass =
  "flex h-[calc(--spacing(5.5))] w-fit shrink-0 items-center gap-1 rounded-sm px-1.5 pr-0 text-xs font-medium whitespace-nowrap";
// Room kept for the search input (`min-w-16`) on the chip row.
const INPUT_MIN_WIDTH = 64;

export const ComboboxMultiField = React.forwardRef<
  HTMLInputElement,
  ComboboxMultiFieldProps
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
      orientation = "vertical",
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = description ? descriptionId : undefined;

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

        <Combobox
          multiple
          items={options}
          itemToStringLabel={(item: ComboboxMultiFieldOption) => item.label}
          itemToStringValue={(item: ComboboxMultiFieldOption) => item.value}
          name={name}
          value={selectedItems}
          onValueChange={(items: ComboboxMultiFieldOption[]) =>
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
              aria-describedby={describedBy}
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
              {(item: ComboboxMultiFieldOption) => (
                <ComboboxItem
                  key={item.value}
                  value={item}
                  disabled={item.disabled}
                  className="data-selected:bg-primary/10 data-selected:font-medium data-selected:text-primary data-selected:data-highlighted:bg-primary/15 data-selected:data-highlighted:text-primary"
                >
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

ComboboxMultiField.displayName = "ComboboxMultiField";
