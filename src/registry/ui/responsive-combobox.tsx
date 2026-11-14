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
  ComboboxField,
  type ComboboxFieldOption,
  type ComboboxFieldProps,
} from "@/components/ui/combobox-field";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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

export type ResponsiveComboboxOption = ComboboxFieldOption;

export interface ResponsiveComboboxProps extends ComboboxFieldProps {
  /** Drawer heading on mobile. Falls back to `label`, then `placeholder`. */
  drawerTitle?: string;
  /** Optional helper text under the drawer heading on mobile. */
  drawerDescription?: string;
  /** Placeholder of the search input inside the mobile drawer. */
  searchPlaceholder?: string;
}

const triggerClassName =
  "flex min-h-9 w-full min-w-0 items-center rounded-md border border-input bg-transparent py-1.5 pr-16 pl-2.5 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

const itemClassName =
  "py-2.5 data-selected:bg-primary/10 data-selected:font-medium data-selected:text-primary data-selected:data-highlighted:bg-primary/15 data-selected:data-highlighted:text-primary";

/**
 * Searchable single select. Renders `ComboboxField` (popover) on desktop and
 * a trigger that opens a bottom `Drawer` with the search list on mobile.
 */
export const ResponsiveCombobox = React.forwardRef<
  HTMLInputElement,
  ResponsiveComboboxProps
>(({ drawerTitle, drawerDescription, searchPlaceholder, ...props }, ref) => {
  const isMobile = useIsMobile();

  if (!isMobile) return <ComboboxField ref={ref} {...props} />;

  return (
    <ResponsiveComboboxDrawer
      ref={ref}
      drawerTitle={drawerTitle}
      drawerDescription={drawerDescription}
      searchPlaceholder={searchPlaceholder}
      {...props}
    />
  );
});

ResponsiveCombobox.displayName = "ResponsiveCombobox";

const ResponsiveComboboxDrawer = React.forwardRef<
  HTMLInputElement,
  ResponsiveComboboxProps
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
      orientation = "vertical",
      drawerTitle,
      drawerDescription,
      searchPlaceholder = "Search...",
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const generatedId = React.useId();
    const triggerId = id ?? generatedId;
    const descriptionId = description ? `${triggerId}-description` : undefined;
    const errorId = error ? `${triggerId}-error` : undefined;

    const isDisabled = disabled || loading;
    const selectedItem = React.useMemo(
      () => options.find((item) => item.value === value) ?? null,
      [options, value],
    );

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
            className={cn(triggerClassName, inputClassName)}
          >
            <span
              className={cn(
                "truncate",
                !selectedItem && "text-muted-foreground",
              )}
            >
              {selectedItem?.label ?? placeholder}
            </span>
          </button>
          <div className="absolute right-1.5 flex items-center gap-0.5">
            {loading ? (
              <Loader2Icon
                aria-hidden="true"
                className="mx-1 size-4 animate-spin text-muted-foreground"
              />
            ) : (
              showClear &&
              selectedItem && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Clear selection"
                  disabled={isDisabled}
                  onClick={() => onValueChange(undefined)}
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

        {name && <input type="hidden" name={name} value={value ?? ""} />}

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent onOpenAutoFocus={(event) => event.preventDefault()}>
            <DrawerHeader>
              <DrawerTitle>{drawerTitle ?? label ?? placeholder}</DrawerTitle>
              <DrawerDescription
                className={cn(!drawerDescription && "sr-only")}
              >
                {drawerDescription ?? "Search and pick one option."}
              </DrawerDescription>
            </DrawerHeader>
            <Combobox
              inline
              open={open}
              items={options}
              itemToStringLabel={(item: ComboboxFieldOption) => item.label}
              itemToStringValue={(item: ComboboxFieldOption) => item.value}
              value={selectedItem}
              onValueChange={(item: ComboboxFieldOption | null) => {
                onValueChange(item ? item.value : undefined);
                setOpen(false);
              }}
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
              <ComboboxList className="max-h-none min-h-0 flex-1 px-3 pt-2 pb-6">
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
            </Combobox>
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

ResponsiveComboboxDrawer.displayName = "ResponsiveComboboxDrawer";
