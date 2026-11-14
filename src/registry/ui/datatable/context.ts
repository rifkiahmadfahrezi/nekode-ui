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
