"use client";

import * as React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DataTableColumn } from "./types";

interface DataTableFooterProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  selectable: boolean;
  expandable: boolean;
  selectionColWidth: number;
  expandColWidth: number;
  getColumnKey: (col: DataTableColumn<T>) => string;
  pinnedCellStyle: (col: DataTableColumn<T>) => React.CSSProperties;
  pinnedCellClassName: (col: DataTableColumn<T>, zIndexClass: string, bgClassName?: string) => string;
  sticky: boolean;
  variant: "bordered" | "borderless";
}

export function DataTableFooter<T>({
  columns,
  data,
  selectable,
  expandable,
  selectionColWidth,
  expandColWidth,
  getColumnKey,
  pinnedCellStyle,
  pinnedCellClassName,
  sticky,
  variant,
}: DataTableFooterProps<T>) {
  const hasFooter = columns.some((c) => c.footer != null);
  if (!hasFooter) return null;

  return (
    <tfoot
      className={cn(sticky && "sticky bottom-0 z-20", variant === "borderless" && "[&_tr]:border-0")}
    >
      <TableRow className={cn("bg-muted font-medium hover:bg-muted", variant === "borderless" && "border-0")}>
        {selectable && <TableCell className="sticky left-0 z-10 bg-muted" style={{ width: selectionColWidth }} />}
        {expandable && (
          <TableCell
            className="sticky z-10 bg-muted"
            style={{ left: selectable ? selectionColWidth : 0, width: expandColWidth }}
          />
        )}
        {columns.map((col) => {
          const key = getColumnKey(col);
          return (
            <TableCell
              key={key}
              className={cn(
                pinnedCellClassName(col, "z-10", "bg-muted"),
                col.textAlign === "center" && "text-center",
                col.textAlign === "right" && "text-right",
                col.className
              )}
              style={{ ...pinnedCellStyle(col), ...col.style }}
            >
              {typeof col.footer === "function" ? col.footer(data) : col.footer}
            </TableCell>
          );
        })}
      </TableRow>
    </tfoot>
  );
}
