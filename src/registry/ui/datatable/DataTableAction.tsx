"use client";

import { MoreVertical } from "lucide-react";
import type * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { RowContextMenuItem } from "./types";

export interface DataTableActionProps {
  /** Menu items — same shape as `rowContextMenu`'s per-row return value, so
   * you can reuse the exact same list for both the right-click context menu
   * and this button. */
  items: RowContextMenuItem[];
  /** Accessible label for the trigger button. */
  label?: string;
  /** Icon shown on the trigger button. Defaults to a vertical 3-dot icon. */
  icon?: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * A "kebab" (3-dot) button that opens a menu — meant for a table's actions
 * column. Typically used together with (or instead of) `rowContextMenu`:
 *
 *   {
 *     accessor: "actions",
 *     title: "",
 *     width: 60,
 *     render: (record) => (
 *       <DataTableAction
 *         items={[
 *           { key: "edit", label: "Edit", onClick: () => editUser(record) },
 *           { key: "delete", label: "Delete", danger: true, onClick: () => deleteUser(record) },
 *         ]}
 *       />
 *     ),
 *   }
 *
 * Stops click propagation so it's safe to use inside a row that also has
 * `onRowClick` / expandable rows without accidentally triggering those.
 */
export function DataTableAction({
  items,
  label = "Open menu",
  icon,
  className,
  align = "end",
  side = "bottom",
}: DataTableActionProps) {
  if (!items.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
          className,
        )}
        aria-label={label}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {icon ?? <MoreVertical className="h-4 w-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {items.map((item) => (
          <DropdownMenuItem
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
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
