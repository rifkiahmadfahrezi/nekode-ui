"use client";

import { ChevronRight } from "lucide-react";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTableRowMenuContext } from "./context";
import type { DataTableColumn } from "./types";

interface DataTableRowProps<T> {
  record: T;
  rowIndex: number;
  columns: DataTableColumn<T>[];
  selectable: boolean;
  expandable: boolean;
  selectionColWidth: number;
  expandColWidth: number;
  isSelected: boolean;
  isExpanded: boolean;
  canExpand: boolean;
  renderSubContent?: (record: T, rowIndex: number) => React.ReactNode;
  onToggleSelect: (record: T, rowIndex: number, shiftKey: boolean) => void;
  onToggleExpand: (record: T) => void;
  onRowClick?: (record: T, rowIndex: number) => void;
  expandOnRowClick: boolean;
  highlightOnHover: boolean;
  rowClassName?: string;
  rowStyle?: React.CSSProperties;
  getColumnKey: (col: DataTableColumn<T>) => string;
  pinnedCellStyle: (col: DataTableColumn<T>) => React.CSSProperties;
  pinnedCellClassName: (
    col: DataTableColumn<T>,
    zIndexClass: string,
    bgClassName?: string,
  ) => string;
  leadingGutter: number;
  totalCols: number;
  variant: "bordered" | "borderless";
  rowRef?: (
    element: HTMLTableRowElement | null,
    record: T,
    rowIndex: number,
  ) => void;
}

function DataTableRowInner<T>({
  record,
  rowIndex,
  columns,
  selectable,
  expandable,
  selectionColWidth,
  expandColWidth,
  isSelected,
  isExpanded,
  canExpand,
  renderSubContent,
  onToggleSelect,
  onToggleExpand,
  onRowClick,
  expandOnRowClick,
  highlightOnHover,
  rowClassName,
  rowStyle,
  getColumnKey,
  pinnedCellStyle,
  pinnedCellClassName,
  leadingGutter,
  totalCols,
  variant,
  rowRef,
}: DataTableRowProps<T>) {
  const shiftKeyRef = React.useRef(false);
  const menu = React.useContext(DataTableRowMenuContext);

  function handleRowClick() {
    if (expandable && canExpand && expandOnRowClick) onToggleExpand(record);
    onRowClick?.(record, rowIndex);
  }

  const rowShellClassName = cn(
    highlightOnHover && "hover:bg-muted/50",
    (onRowClick || (canExpand && expandOnRowClick)) && "cursor-pointer",
    variant === "borderless" && "border-0",
    rowClassName,
  );

  const cells = (
    <React.Fragment>
      {selectable && (
        <TableCell
          className="sticky left-0 z-10 bg-background"
          style={{ width: selectionColWidth }}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => {
              onToggleSelect(record, rowIndex, shiftKeyRef.current);
              // Reset so a later keyboard toggle isn't treated as shift-click.
              shiftKeyRef.current = false;
            }}
            onClick={(e: React.MouseEvent) => {
              shiftKeyRef.current = e.shiftKey;
            }}
            aria-label={`Select record ${rowIndex + 1}`}
          />
        </TableCell>
      )}
      {expandable && (
        <TableCell
          className="sticky z-10 bg-background"
          style={{
            left: selectable ? selectionColWidth : 0,
            width: expandColWidth,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {canExpand && (
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
              onClick={() => onToggleExpand(record)}
              aria-label={isExpanded ? "Collapse row" : "Expand row"}
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-90",
                )}
              />
            </button>
          )}
        </TableCell>
      )}
      {columns.map((col) => {
        const key = getColumnKey(col);
        return (
          <TableCell
            key={key}
            className={cn(
              pinnedCellClassName(col, "z-10"),
              col.textAlign === "center" && "text-center",
              col.textAlign === "right" && "text-right",
              col.className,
            )}
            style={{ ...pinnedCellStyle(col), ...col.style }}
          >
            {col.render
              ? col.render(record, rowIndex)
              : String((record as Record<string, unknown>)[col.accessor] ?? "")}
          </TableCell>
        );
      })}
    </React.Fragment>
  );

  const mainRow = (
    <TableRow
      ref={(el: HTMLTableRowElement | null) => rowRef?.(el, record, rowIndex)}
      data-state={isSelected ? "selected" : undefined}
      className={rowShellClassName}
      style={rowStyle}
      onClick={handleRowClick}
      {...(menu && {
        onContextMenu: (e: React.MouseEvent<HTMLTableRowElement>) =>
          menu.onContextMenu(e, record, rowIndex),
        onTouchStart: (e: React.TouchEvent<HTMLTableRowElement>) =>
          menu.onTouchStart(e, record, rowIndex),
        onTouchMove: menu.onTouchMove,
        onTouchEnd: menu.onTouchEnd,
        onTouchCancel: menu.onTouchEnd,
      })}
    >
      {cells}
    </TableRow>
  );

  if (!canExpand || !isExpanded) return mainRow;

  return (
    <React.Fragment>
      {mainRow}
      <TableRow
        className={cn(
          "hover:bg-transparent",
          variant === "borderless" && "border-0",
        )}
      >
        <TableCell colSpan={totalCols} className="bg-muted/30 p-0">
          <div style={{ paddingLeft: leadingGutter }} className="px-4 py-3">
            {renderSubContent?.(record, rowIndex)}
          </div>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// `rowStyle` is often a function returning a fresh object per call, so
// compare by value instead of identity to keep the row memo effective.
function shallowEqualStyle(
  a: React.CSSProperties | undefined,
  b: React.CSSProperties | undefined,
) {
  if (a === b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a) as (keyof React.CSSProperties)[];
  if (aKeys.length !== Object.keys(b).length) return false;
  return aKeys.every((k) => a[k] === b[k]);
}

function propsAreEqual<T>(
  prev: Readonly<DataTableRowProps<T>>,
  next: Readonly<DataTableRowProps<T>>,
) {
  return (
    prev.record === next.record &&
    prev.rowIndex === next.rowIndex &&
    prev.isSelected === next.isSelected &&
    prev.isExpanded === next.isExpanded &&
    prev.canExpand === next.canExpand &&
    prev.columns === next.columns &&
    prev.rowClassName === next.rowClassName &&
    shallowEqualStyle(prev.rowStyle, next.rowStyle) &&
    prev.pinnedCellStyle === next.pinnedCellStyle &&
    prev.pinnedCellClassName === next.pinnedCellClassName &&
    prev.getColumnKey === next.getColumnKey &&
    prev.onToggleSelect === next.onToggleSelect &&
    prev.onToggleExpand === next.onToggleExpand &&
    prev.onRowClick === next.onRowClick &&
    prev.renderSubContent === next.renderSubContent &&
    prev.selectable === next.selectable &&
    prev.expandable === next.expandable &&
    prev.expandOnRowClick === next.expandOnRowClick &&
    prev.highlightOnHover === next.highlightOnHover &&
    prev.leadingGutter === next.leadingGutter &&
    prev.totalCols === next.totalCols &&
    prev.variant === next.variant &&
    prev.rowRef === next.rowRef
  );
}

export const DataTableRow = React.memo(
  DataTableRowInner,
  propsAreEqual,
) as typeof DataTableRowInner;
