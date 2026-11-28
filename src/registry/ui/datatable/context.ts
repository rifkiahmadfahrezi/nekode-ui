"use client";

import * as React from "react";

/** Layout state the table shares with opt-in parts rendered as its children. */
export interface DataTableContextValue {
  variant: "bordered" | "borderless";
  sticky: boolean;
  fetching: boolean;
}

export const DataTableContext =
  React.createContext<DataTableContextValue | null>(null);

export function useDataTableContext(): DataTableContextValue {
  return (
    React.useContext(DataTableContext) ?? {
      variant: "bordered",
      sticky: false,
      fetching: false,
    }
  );
}

/**
 * Bridge between rows and an optional `DataTableContextMenu` wrapper. Lives
 * here (not in the menu file) so the core table never imports menu code.
 * Rows forward their right-click / long-press events; the wrapper decides
 * whether to open its single shared menu for that record.
 */
export interface DataTableRowMenuBridge {
  onContextMenu: (
    event: React.MouseEvent<HTMLTableRowElement>,
    record: unknown,
    rowIndex: number,
  ) => void;
  onTouchStart: (
    event: React.TouchEvent<HTMLTableRowElement>,
    record: unknown,
    rowIndex: number,
  ) => void;
  onTouchMove: (event: React.TouchEvent<HTMLTableRowElement>) => void;
  onTouchEnd: () => void;
}

export const DataTableRowMenuContext =
  React.createContext<DataTableRowMenuBridge | null>(null);

/**
 * Marker for a child that replaces the default `<tbody>` rows, e.g.
 * `DataTableVirtualBody`. DataTable looks for it on the child's component
 * type, so the core table never imports that child's code or dependencies.
 */
export const DATATABLE_BODY_SLOT = Symbol.for("nekode.datatable.body-slot");

export function isDataTableBodySlot(
  child: React.ReactNode,
): child is React.ReactElement {
  return (
    React.isValidElement(child) &&
    typeof child.type !== "string" &&
    !!(child.type as unknown as Record<symbol, unknown>)[DATATABLE_BODY_SLOT]
  );
}

/** What DataTable hands to a body slot rendered inside its `<tbody>`. */
export interface DataTableBodyContextValue {
  /** Number of records in `data`. */
  count: number;
  /** The table's `height` prop. Without it nothing scrolls inside the table. */
  height: number | undefined;
  /** Stable key of the record at `index` (from `idAccessor`). */
  getRowKey: (index: number) => React.Key;
  /** The same row element the default body renders, for `data[index]`. */
  renderRow: (index: number) => React.ReactNode;
  /** Columns across the full width, for spacer rows' `colSpan`. */
  totalCols: number;
  /** The scrolling viewport (the div sized by `height`). */
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
  /** The table header, so its height can be used as the scroll margin. */
  headerElementRef: React.RefObject<HTMLTableSectionElement | null>;
  /**
   * Let the table scroll an off-screen row into view (e.g. for keyboard
   * navigation). Pass `null` on unmount.
   */
  registerScrollToRowIndex: (fn: ((index: number) => void) | null) => void;
}

export const DataTableBodyContext =
  React.createContext<DataTableBodyContextValue | null>(null);
