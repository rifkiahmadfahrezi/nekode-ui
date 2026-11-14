"use client";

import * as React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import {
  type DataTableRowMenuBridge,
  DataTableRowMenuContext,
} from "./context";
import type { RowContextMenuItem } from "./types";

const LONG_PRESS_DELAY = 500;
const LONG_PRESS_MOVE_TOLERANCE = 10;

export interface DataTableContextMenuProps<T> {
  /**
   * Items for the row that was right-clicked (or long-pressed). Called only
   * at that moment, with that row's record, so per-row conditions always see
   * the latest data. Return `undefined` or `[]` to keep the browser's native
   * menu on that row.
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
 * A single menu is shared by every row: rows only forward their right-click,
 * and `items` runs for the clicked row when the menu opens, not on render.
 * Kept out of the core table so tables without a menu never ship it.
 */
export function DataTableContextMenu<T>({
  items,
  children,
}: DataTableContextMenuProps<T>) {
  const [activeItems, setActiveItems] = React.useState<RowContextMenuItem[]>(
    [],
  );
  // Base UI renders the trigger as a <div>, Radix as a <span>.
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const itemsRef = React.useRef(items);
  React.useLayoutEffect(() => {
    itemsRef.current = items;
  });

  const bridge = React.useMemo<DataTableRowMenuBridge>(() => {
    let longPress: {
      timer: ReturnType<typeof setTimeout>;
      x: number;
      y: number;
    } | null = null;

    const cancelLongPress = () => {
      if (longPress) clearTimeout(longPress.timer);
      longPress = null;
    };

    // Opens the shared menu at (x, y) for this record. Returns false when the
    // row has no items, so the caller leaves the native menu alone.
    const openAt = (
      x: number,
      y: number,
      record: unknown,
      rowIndex: number,
    ) => {
      const next = itemsRef.current(record as T, rowIndex);
      const trigger = triggerRef.current;
      if (!next || next.length === 0 || !trigger) return false;
      setActiveItems(next);
      // Re-dispatch on the hidden trigger: both Base UI and Radix anchor the
      // menu at the event's coordinates, so it opens under the cursor.
      trigger.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 2,
        }),
      );
      return true;
    };

    return {
      onContextMenu: (event, record, rowIndex) => {
        cancelLongPress();
        if (openAt(event.clientX, event.clientY, record, rowIndex)) {
          event.preventDefault();
        }
      },
      // iOS Safari never fires `contextmenu` on long-press, so emulate it.
      onTouchStart: (event, record, rowIndex) => {
        cancelLongPress();
        if (event.touches.length !== 1) return;
        const { clientX: x, clientY: y } = event.touches[0];
        longPress = {
          x,
          y,
          timer: setTimeout(() => {
            longPress = null;
            openAt(x, y, record, rowIndex);
          }, LONG_PRESS_DELAY),
        };
      },
      onTouchMove: (event) => {
        if (!longPress) return;
        const touch = event.touches[0];
        if (
          !touch ||
          Math.abs(touch.clientX - longPress.x) > LONG_PRESS_MOVE_TOLERANCE ||
          Math.abs(touch.clientY - longPress.y) > LONG_PRESS_MOVE_TOLERANCE
        ) {
          cancelLongPress();
        }
      },
      onTouchEnd: cancelLongPress,
    };
  }, []);

  return (
    <DataTableRowMenuContext.Provider value={bridge}>
      {children}
      <ContextMenu>
        <ContextMenuTrigger
          ref={(el: HTMLElement | null) => {
            triggerRef.current = el;
          }}
          aria-hidden
          tabIndex={-1}
          className="hidden"
        />
        <ContextMenuContent>
          {activeItems.map((item) => (
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
    </DataTableRowMenuContext.Provider>
  );
}
