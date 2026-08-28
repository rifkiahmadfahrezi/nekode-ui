"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DataTableColumn, SortStatus } from "./types";

interface DataTableHeaderProps<T> {
  columns: DataTableColumn<T>[];
  selectable: boolean;
  expandable: boolean;
  selectionColWidth: number;
  expandColWidth: number;
  selectionChecked: boolean;
  selectionIndeterminate: boolean;
  onSelectionChange: () => void;
  sortStatus?: SortStatus<T>;
  onSort: (col: DataTableColumn<T>) => void;
  getColumnKey: (col: DataTableColumn<T>) => string;
  pinnedCellStyle: (col: DataTableColumn<T>) => React.CSSProperties;
  pinnedCellClassName: (
    col: DataTableColumn<T>,
    zIndexClass: string,
    bgClassName?: string,
  ) => string;
  headerClassName?: string;
  headerStyle?: React.CSSProperties;
  sticky: boolean;
  variant: "bordered" | "borderless";
}

function DataTableHeaderInner<T>(
  {
    columns,
    selectable,
    expandable,
    selectionColWidth,
    expandColWidth,
    selectionChecked,
    selectionIndeterminate,
    onSelectionChange,
    sortStatus,
    onSort,
    getColumnKey,
    pinnedCellStyle,
    pinnedCellClassName,
    headerClassName,
    headerStyle,
    sticky,
    variant,
  }: DataTableHeaderProps<T>,
  ref: React.Ref<HTMLTableSectionElement>,
) {
  function renderSortIcon(col: DataTableColumn<T>) {
    if (!col.sortable) return null;
    if (sortStatus?.columnAccessor !== col.accessor) {
      return (
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/60" />
      );
    }
    return sortStatus.direction === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  }

  return (
    <TableHeader
      ref={ref}
      className={cn(
        sticky && "sticky top-0 z-20 bg-background",
        variant === "borderless" && "[&_tr]:border-0",
      )}
    >
      <TableRow
        className={cn(variant === "borderless" && "border-0", headerClassName)}
        style={headerStyle}
      >
        {selectable && (
          <TableHead
            className="sticky left-0 z-20 bg-background"
            style={{ width: selectionColWidth }}
          >
            <Checkbox
              checked={selectionChecked}
              indeterminate={selectionIndeterminate}
              onCheckedChange={() => onSelectionChange()}
              aria-label="Select all records"
            />
          </TableHead>
        )}
        {expandable && (
          <TableHead
            className="sticky z-20 bg-background"
            style={{
              left: selectable ? selectionColWidth : 0,
              width: expandColWidth,
            }}
          />
        )}
        {columns.map((col) => {
          const key = getColumnKey(col);
          return (
            <TableHead
              key={key}
              className={cn(
                "bg-background",
                pinnedCellClassName(col, "z-20"),
                col.textAlign === "center" && "text-center",
                col.textAlign === "right" && "text-right",
                col.className,
              )}
              style={{
                width: col.width,
                ...pinnedCellStyle(col),
                ...col.style,
              }}
            >
              <div className="flex items-center gap-1.5">
                {col.sortable ? (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 font-medium hover:text-foreground"
                    onClick={() => onSort(col)}
                  >
                    <span>{col.title ?? col.accessor}</span>
                    {renderSortIcon(col)}
                  </button>
                ) : (
                  <span className="font-medium">
                    {col.title ?? col.accessor}
                  </span>
                )}
              </div>
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}

export const DataTableHeader = React.forwardRef(DataTableHeaderInner) as <T>(
  props: DataTableHeaderProps<T> & { ref?: React.Ref<HTMLTableSectionElement> },
) => React.ReactElement;
