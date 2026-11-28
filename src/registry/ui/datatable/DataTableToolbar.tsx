"use client";

import { Search, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DATATABLE_TOOLBAR_SLOT, DataTableContext } from "./context";

export interface DataTableToolbarProps {
  /** Usually `DataTableSearch`, `DataTableFacetedFilter`s and `DataTableResetFilters`. */
  children?: React.ReactNode;
  /** Rendered on the right edge, e.g. an "Add user" button. */
  actions?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Opt-in row of filter controls. As a child of `DataTable` it renders above
 * the table, inside its border:
 *
 *   <DataTable data={filters.filteredData} columns={columns}>
 *     <DataTableToolbar>
 *       <DataTableSearch value={filters.search} onValueChange={filters.setSearch} />
 *       <DataTableFacetedFilter title="Role" options={roles} ... />
 *       <DataTableResetFilters visible={filters.isFiltered} onReset={filters.reset} />
 *     </DataTableToolbar>
 *   </DataTable>
 *
 * It also works on its own, outside the table.
 */
export function DataTableToolbar({
  children,
  actions,
  className,
  ref,
}: DataTableToolbarProps) {
  // Null outside a table: no divider then.
  const table = React.useContext(DataTableContext);
  return (
    <div
      ref={ref}
      role="group"
      aria-label="Table filters"
      data-slot="datatable-toolbar"
      className={cn(
        "flex flex-wrap items-center gap-2",
        table && "px-3 py-3",
        table?.variant === "bordered" && "border-b",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {children}
      </div>
      {actions != null && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

(DataTableToolbar as unknown as Record<symbol, boolean>)[
  DATATABLE_TOOLBAR_SLOT
] = true;

export interface DataTableSearchProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value: string;
  onValueChange: (value: string) => void;
  /**
   * Waits this many ms after the last keystroke before calling
   * `onValueChange`. Handy when each search hits the server. `0` = instant.
   */
  debounceMs?: number;
  /** Class for the wrapper; `className` goes on the `<input>`. */
  wrapperClassName?: string;
}

/**
 * Search box with a clear button. `Escape` clears it. Controlled: pass the
 * query and filter the data yourself (or with `useDataTableFilters`).
 */
export function DataTableSearch({
  value,
  onValueChange,
  debounceMs = 0,
  placeholder = "Search…",
  "aria-label": ariaLabel = "Search records",
  className,
  wrapperClassName,
  onKeyDown,
  ref,
  ...props
}: DataTableSearchProps) {
  const [draft, setDraft] = React.useState(value);
  const innerRef = React.useRef<HTMLInputElement>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Follow outside changes (e.g. "Reset filters") unless a debounced edit
  // is still pending.
  React.useEffect(() => {
    if (!timer.current) setDraft(value);
  }, [value]);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const commit = (next: string, immediate = false) => {
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (immediate || debounceMs <= 0) {
      onValueChange(next);
      return;
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      onValueChange(next);
    }, debounceMs);
  };

  const setRefs = (el: HTMLInputElement | null) => {
    innerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div
      className={cn("relative w-full sm:w-64", wrapperClassName)}
      data-slot="datatable-search"
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={setRefs}
        type="search"
        value={draft}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "h-8 pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden",
          className,
        )}
        onChange={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (e.key === "Escape" && draft) {
            e.preventDefault();
            e.stopPropagation();
            commit("", true);
          }
        }}
        {...props}
      />
      {draft && (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          onClick={() => {
            commit("", true);
            innerRef.current?.focus();
          }}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export interface DataTableResetFiltersProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  onReset: () => void;
  /** Hide the button while nothing is filtered. Defaults to `true` (always shown). */
  visible?: boolean;
}

/** "Reset" button that clears every filter. Hide it with `visible={isFiltered}`. */
export function DataTableResetFilters({
  onReset,
  visible = true,
  children = "Reset",
  variant = "ghost",
  size = "sm",
  className,
  ...props
}: DataTableResetFiltersProps) {
  if (!visible) return null;
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("h-8 px-2", className)}
      onClick={onReset}
      {...props}
    >
      {children}
      <X aria-hidden="true" />
    </Button>
  );
}
