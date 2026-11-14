"use client";

import { ChevronDownIcon, Loader2Icon, XIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  ComboboxMultiField,
  type ComboboxMultiFieldOption,
  type ComboboxMultiFieldProps,
} from "@/components/ui/combobox-multi-field";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type ResponsiveMultiSelectOption = ComboboxMultiFieldOption;

export interface ResponsiveMultiSelectProps extends ComboboxMultiFieldProps {
  /** Drawer heading on mobile. Falls back to `label`, then `placeholder`. */
  drawerTitle?: string;
  /** Optional helper text under the drawer heading on mobile. */
  drawerDescription?: string;
  /** Placeholder of the search input inside the mobile drawer. */
  searchPlaceholder?: string;
  /** Label of the button that closes the mobile drawer. Defaults to `"Done"`. */
  doneText?: string;
}

const triggerClassName =
  "flex min-h-9 w-full min-w-0 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent py-1.5 pr-16 pl-2.5 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

const itemClassName =
  "py-2.5 data-selected:bg-primary/10 data-selected:font-medium data-selected:text-primary data-selected:data-highlighted:bg-primary/15 data-selected:data-highlighted:text-primary";

/**
 * Searchable multi select. Renders `ComboboxMultiField` (chips + popover) on
 * desktop and a trigger that opens a bottom `Drawer` with the search list on
 * mobile.
 */
export const ResponsiveMultiSelect = React.forwardRef<
  HTMLInputElement,
  ResponsiveMultiSelectProps
>(
  (
    { drawerTitle, drawerDescription, searchPlaceholder, doneText, ...props },
    ref,
  ) => {
    const isMobile = useIsMobile();

    if (!isMobile) return <ComboboxMultiField ref={ref} {...props} />;

    return (
      <ResponsiveMultiSelectDrawer
        ref={ref}
        drawerTitle={drawerTitle}
        drawerDescription={drawerDescription}
        searchPlaceholder={searchPlaceholder}
        doneText={doneText}
        {...props}
      />
    );
  },
);

ResponsiveMultiSelect.displayName = "ResponsiveMultiSelect";

const ResponsiveMultiSelectDrawer = React.forwardRef<
  HTMLInputElement,
  ResponsiveMultiSelectProps
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
      drawerTitle,
      drawerDescription,
      searchPlaceholder = "Search...",
      doneText = "Done",
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const generatedId = React.useId();
    const triggerId = id ?? generatedId;
    const descriptionId = description ? `${triggerId}-description` : undefined;
    const errorId = error ? `${triggerId}-error` : undefined;

    const isDisabled = disabled || loading;
    const selectedItems = React.useMemo(
      () => options.filter((item) => value.includes(item.value)),
      [options, value],
    );
    const allSelected =
      showAllSelectedLabel &&
      options.length > 0 &&
      selectedItems.length === options.length;

    let summary: React.ReactNode;
    if (selectedItems.length === 0) {
      summary = <span className="text-muted-foreground">{placeholder}</span>;
    } else if (allSelected) {
      summary = <span>All {options.length} items are selected</span>;
    } else if (overflow === "hide") {
      summary = (
        <>
          <span className="flex h-5.5 min-w-0 items-center truncate rounded-sm bg-muted px-1.5 text-xs font-medium">
            {selectedItems[0].label}
          </span>
          {selectedItems.length > 1 && (
            <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
              and {selectedItems.length - 1} more...
            </span>
          )}
        </>
      );
    } else {
      summary = selectedItems.map((item) => (
        <span
          key={item.value}
          className="flex h-5.5 items-center rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap"
        >
          {item.label}
        </span>
      ));
    }

    return (
      <Field
        orientation={orientation}
        data-invalid={error ? true : undefined}
        className={fieldClassName}
      >
        {label && (
          <FieldLabel
            htmlFor={triggerId}
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

        <div className="relative flex items-center">
          <button
            type="button"
            id={triggerId}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-invalid={!!error}
            aria-describedby={description ? descriptionId : undefined}
            aria-errormessage={errorId}
            disabled={isDisabled}
            onClick={() => setOpen(true)}
            className={cn(
              triggerClassName,
              overflow === "hide" && "flex-nowrap",
              inputClassName,
            )}
          >
            {summary}
          </button>
          <div className="absolute right-1.5 flex items-center gap-0.5">
            {loading ? (
              <Loader2Icon
                aria-hidden="true"
                className="mx-1 size-4 animate-spin text-muted-foreground"
              />
            ) : (
              showClear &&
              selectedItems.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Clear selection"
                  disabled={isDisabled}
                  onClick={() => onValueChange([])}
                >
                  <XIcon aria-hidden="true" />
                </Button>
              )
            )}
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none mx-1 size-4 text-muted-foreground"
            />
          </div>
        </div>

        {name &&
          value.map((item) => (
            <input key={item} type="hidden" name={name} value={item} />
          ))}

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent onOpenAutoFocus={(event) => event.preventDefault()}>
            <DrawerHeader>
              <DrawerTitle>{drawerTitle ?? label ?? placeholder}</DrawerTitle>
              <DrawerDescription
                className={cn(!drawerDescription && "sr-only")}
              >
                {drawerDescription ??
                  `${selectedItems.length} of ${options.length} selected`}
              </DrawerDescription>
            </DrawerHeader>
            <Combobox
              multiple
              inline
              open={open}
              items={options}
              itemToStringLabel={(item: ComboboxMultiFieldOption) => item.label}
              itemToStringValue={(item: ComboboxMultiFieldOption) => item.value}
              value={selectedItems}
              onValueChange={(items: ComboboxMultiFieldOption[]) =>
                onValueChange(items.map((item) => item.value))
              }
              autoHighlight={autoHighlight}
            >
              <div className="px-4">
                <ComboboxInput
                  ref={ref}
                  showTrigger={false}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="w-full"
                />
              </div>
              <ComboboxEmpty className="flex empty:hidden">
                {emptyText}
              </ComboboxEmpty>
              <ComboboxList className="max-h-none min-h-0 flex-1 px-3 pt-2">
                {(item: ComboboxMultiFieldOption) => (
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
            </Combobox>
            <DrawerFooter className="flex-row border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={selectedItems.length === 0}
                onClick={() => onValueChange([])}
              >
                Clear
              </Button>
              <DrawerClose asChild>
                <Button type="button" className="flex-1">
                  {doneText} ({selectedItems.length})
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

ResponsiveMultiSelectDrawer.displayName = "ResponsiveMultiSelectDrawer";
