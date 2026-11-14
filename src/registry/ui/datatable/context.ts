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
 * here (not in the menu file) so the core table never imports menu code:
 * when present, the wrapper renders each row's `<tr>` itself.
 */
export interface DataTableRowMenuBridge {
  renderRow: (args: {
    record: unknown;
    rowIndex: number;
    rowProps: React.ComponentProps<"tr">;
    children: React.ReactNode;
  }) => React.ReactNode;
}

export const DataTableRowMenuContext =
  React.createContext<DataTableRowMenuBridge | null>(null);
