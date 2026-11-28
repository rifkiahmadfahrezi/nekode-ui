"use client";

import { ChevronDown, PlusCircle } from "lucide-react";
import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DataTableFacetOption {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Text used by the option search. Defaults to `label` when it's a string, else `value`. */
  keywords?: string;
}

export interface DataTableFacetedFilterProps {
  /** Button label and the popover's accessible name, e.g. "Status". */
  title: string;
  options: DataTableFacetOption[];
  /** Selected option values. */
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Row count shown next to each option, e.g. from `useDataTableFilters().getFacetCounts`. */
  counts?: Map<string, number> | Record<string, number>;
  /**
   * Show a search box above the options. Defaults to `true` once there are
   * more than 7 options.
   */
  searchable?: boolean;
  /** Selected labels shown in the button before collapsing to "N selected". */
  maxBadges?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
}

function optionText(option: DataTableFacetOption) {
  if (option.keywords) return option.keywords;
  return typeof option.label === "string" ? option.label : option.value;
}

function countOf(
  counts: DataTableFacetedFilterProps["counts"],
  value: string,
): number | undefined {
  if (!counts) return undefined;
  if (counts instanceof Map) return counts.get(value) ?? 0;
  return counts[value] ?? 0;
}

/**
 * Dashed "+ Status" button that opens a checkbox list. Selecting several
 * values matches rows with any of them. Uses `Popover` and `Checkbox`, so
 * tables without facets never ship either.
 */
export function DataTableFacetedFilter({
  title,
  options,
  value,
  onValueChange,
  counts,
  searchable,
  maxBadges = 2,
  icon,
  disabled,
  className,
  align = "start",
}: DataTableFacetedFilterProps) {
  const [query, setQuery] = React.useState("");
  const listId = React.useId();
  const selected = React.useMemo(() => new Set(value), [value]);
  const showSearch = searchable ?? options.length > 7;

  const visibleOptions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => optionText(o).toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (optionValue: string) => {
    // Keep the order of `options`, not click order.
    const next = new Set(selected);
    if (next.has(optionValue)) next.delete(optionValue);
    else next.add(optionValue);
    onValueChange(options.map((o) => o.value).filter((v) => next.has(v)));
  };

  // Arrow keys move between the checkboxes, like a listbox.
  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const boxes = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="checkbox"]'),
    );
    if (boxes.length === 0) return;
    event.preventDefault();
    const current = boxes.indexOf(document.activeElement as HTMLElement);
    let next = current;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = boxes.length - 1;
    else if (event.key === "ArrowDown")
      next = current < 0 ? 0 : Math.min(boxes.length - 1, current + 1);
    else next = current < 0 ? boxes.length - 1 : Math.max(0, current - 1);
    boxes[next]?.focus();
  };

  const selectedOptions = options.filter((o) => selected.has(o.value));

  return (
    <Popover
      onOpenChange={(open: boolean) => {
        if (!open) setQuery("");
      }}
    >
      <PopoverTrigger
        disabled={disabled}
        aria-label={
          selectedOptions.length
            ? `${title}: ${selectedOptions.length} selected`
            : title
        }
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "h-8 gap-1.5 border-dashed px-2.5",
          selectedOptions.length > 0 && "border-solid",
          className,
        )}
      >
        {icon ?? <PlusCircle aria-hidden="true" />}
        <span>{title}</span>
        {selectedOptions.length > 0 && (
          <>
            <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-border" />
            {selectedOptions.length > maxBadges ? (
              <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-xs font-normal text-secondary-foreground">
                {selectedOptions.length} selected
              </span>
            ) : (
              selectedOptions.map((o) => (
                <span
                  key={o.value}
                  className="rounded-sm bg-secondary px-1.5 py-0.5 text-xs font-normal text-secondary-foreground"
                >
                  {o.label}
                </span>
              ))
            )}
          </>
        )}
        <ChevronDown aria-hidden="true" className="opacity-50" />
      </PopoverTrigger>
      <PopoverContent align={align} className="w-56 gap-0 p-0">
        {showSearch && (
          <div className="border-b p-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  document
                    .getElementById(listId)
                    ?.querySelector<HTMLElement>('[role="checkbox"]')
                    ?.focus();
                }
              }}
              placeholder={`Search ${title.toLowerCase()}…`}
              aria-label={`Search ${title} options`}
              aria-controls={listId}
              className="h-8"
            />
          </div>
        )}
        <div
          id={listId}
          role="group"
          aria-label={title}
          className="max-h-64 overflow-y-auto p-1"
          onKeyDown={handleListKeyDown}
        >
          {visibleOptions.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No options found.
            </p>
          ) : (
            visibleOptions.map((option) => {
              const count = countOf(counts, option.value);
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground has-focus-visible:bg-accent"
                >
                  <Checkbox
                    checked={selected.has(option.value)}
                    onCheckedChange={() => toggle(option.value)}
                  />
                  {option.icon && (
                    <span
                      aria-hidden="true"
                      className="flex text-muted-foreground [&_svg]:size-4"
                    >
                      {option.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {count !== undefined && (
                    <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  )}
                </label>
              );
            })
          )}
        </div>
        {selectedOptions.length > 0 && (
          <div className="border-t p-1">
            <button
              type="button"
              className="w-full rounded-sm px-2 py-1.5 text-center text-sm hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none"
              onClick={() => onValueChange([])}
            >
              Clear filter
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
