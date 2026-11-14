"use client";

import * as React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  type DataTableRowMenuBridge,
  DataTableRowMenuContext,
} from "./context";
import type { RowContextMenuItem } from "./types";

export interface DataTableContextMenuProps<T> {
  /**
   * Items for a row. Return `undefined` or `[]` to keep the browser's native
   * menu on that row. Wrap it in `useCallback` so rows only re-render when
   * their own data changes.
   */
  items: (record: T, rowIndex: number) => RowContextMenuItem[] | undefined;
  /** Usually a single `<DataTable />`. */
  children: React.ReactNode;
}

/**
 * Opt-in right-click menu for `DataTable` rows. Wrap the table with it:
 *
 *   <DataTableContextMenu items={getRowActions}>
 *     <DataTable data={rows} columns={columns} />
 *   </DataTableContextMenu>
 *
 * Kept out of the core table so tables without a context menu never ship
 * `ContextMenu`.
 */
export function DataTableContextMenu<T>({
  items,
  children,
}: DataTableContextMenuProps<T>) {
  const bridge = React.useMemo<DataTableRowMenuBridge>(
    () => ({
      renderRow: ({ record, rowIndex, rowProps, children: cells }) => (
        <ContextMenuRow
          items={items(record as T, rowIndex)}
          rowProps={rowProps}
        >
          {cells}
        </ContextMenuRow>
      ),
    }),
    [items],
  );

  return (
    <DataTableRowMenuContext.Provider value={bridge}>
      {children}
    </DataTableRowMenuContext.Provider>
  );
}

function ContextMenuRow({
  items,
  rowProps,
  children,
}: {
  items: RowContextMenuItem[] | undefined;
  rowProps: React.ComponentProps<typeof TableRow>;
  children: React.ReactNode;
}) {
  if (!items || items.length === 0)
    return <TableRow {...rowProps}>{children}</TableRow>;

  return (
    <ContextMenu>
      <ContextMenuTrigger render={<TableRow {...rowProps} />}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {items.map((item) => (
          <ContextMenuItem
            key={item.key}
            disabled={item.disabled}
            onClick={item.onClick}
            className={cn(
              item.danger && "text-destructive focus:text-destructive",
            )}
          >
            {item.icon && (
              <span className="mr-2 flex items-center">{item.icon}</span>
            )}
            {item.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
