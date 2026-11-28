"use client";

import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { DATATABLE_BODY_SLOT, DataTableBodyContext } from "./context";

export type DataTableVirtualizer = Virtualizer<
  HTMLDivElement,
  HTMLTableRowElement
>;

export interface DataTableVirtualBodyProps {
  /** Row height used before a row is measured. Default `41`. */
  estimateRowHeight?: number;
  /** Rows rendered above and below the visible area. Default `10`. */
  overscan?: number;
  /** Access the underlying virtualizer, e.g. `ref.current?.scrollToIndex(500)`. */
  virtualizerRef?: React.Ref<DataTableVirtualizer | null>;
}

/**
 * Opt-in row virtualization. Render it as a child of a `DataTable` that has a
 * `height`; only the rows in view (plus `overscan`) are mounted:
 *
 *   <DataTable data={rows} columns={columns} height={480}>
 *     <DataTableVirtualBody />
 *   </DataTable>
 *
 * Rows are measured after render, so variable heights and expanded rows work.
 * This file is the only one that imports `@tanstack/react-virtual`.
 */
function DataTableVirtualBodyImpl({
  estimateRowHeight = 41,
  overscan = 10,
  virtualizerRef,
}: DataTableVirtualBodyProps) {
  const body = React.useContext(DataTableBodyContext);
  if (!body) {
    throw new Error(
      "<DataTableVirtualBody> must be a direct child of <DataTable>.",
    );
  }
  const {
    count,
    height,
    getRowKey,
    renderRow,
    totalCols,
    scrollElementRef,
    headerElementRef,
    registerScrollToRowIndex,
  } = body;

  if (height === undefined) {
    warnOnce(
      "<DataTableVirtualBody> needs a `height` on <DataTable>; without it every row is rendered.",
    );
  }

  // Rows start below the header, which sits inside the scroll viewport.
  const [headerHeight, setHeaderHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const thead = headerElementRef.current;
    if (!thead) return;
    const measure = () => setHeaderHeight(thead.offsetHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(thead);
    return () => observer.disconnect();
  }, [headerElementRef]);

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
    getItemKey: getRowKey,
    scrollMargin: headerHeight,
    indexAttribute: "data-row-index",
    measureElement: measureRowWithSubRow,
  });

  // The viewport is an ancestor, so its ref is attached after this
  // component's layout effects ran on mount. Render once more when it's there.
  const [, forceRender] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (scrollElementRef.current) forceRender();
  }, [scrollElementRef]);

  React.useImperativeHandle(virtualizerRef, () => virtualizer, [virtualizer]);

  React.useEffect(() => {
    registerScrollToRowIndex((index) =>
      virtualizer.scrollToIndex(index, { align: "auto" }),
    );
    return () => registerScrollToRowIndex(null);
  }, [registerScrollToRowIndex, virtualizer]);

  // Measure the mounted rows after every render. Rows aren't given a ref of
  // ours (that would break their memo), and expanding a row changes its
  // height without resizing the main <tr> the observer watches.
  React.useLayoutEffect(() => {
    const tbody =
      headerElementRef.current?.parentElement?.querySelector(":scope > tbody");
    if (!tbody) return;
    for (const row of Array.from(tbody.children)) {
      if (row instanceof HTMLTableRowElement && row.dataset.rowIndex) {
        virtualizer.measureElement(row);
      }
    }
  });

  const items = virtualizer.getVirtualItems();
  const paddingTop = items.length > 0 ? items[0].start - headerHeight : 0;
  const paddingBottom =
    items.length > 0
      ? virtualizer.getTotalSize() -
        (items[items.length - 1].end - headerHeight)
      : 0;

  return (
    <React.Fragment>
      {paddingTop > 0 && (
        <SpacerRow height={paddingTop} colSpan={totalCols} position="top" />
      )}
      {items.map((item) => renderRow(item.index))}
      {paddingBottom > 0 && (
        <SpacerRow
          height={paddingBottom}
          colSpan={totalCols}
          position="bottom"
        />
      )}
    </React.Fragment>
  );
}

function SpacerRow({
  height,
  colSpan,
  position,
}: {
  height: number;
  colSpan: number;
  position: "top" | "bottom";
}) {
  return (
    <tr
      aria-hidden
      data-virtual-spacer={position}
      className="border-0 hover:bg-transparent"
      style={{ height }}
    >
      <td colSpan={colSpan} style={{ padding: 0, border: 0 }} />
    </tr>
  );
}

// An expanded record renders its sub-content in the next <tr>; count it as
// part of the record's height.
function measureRowWithSubRow(row: HTMLTableRowElement) {
  let size = row.getBoundingClientRect().height;
  const next = row.nextElementSibling;
  if (next instanceof HTMLElement && next.hasAttribute("data-subrow")) {
    size += next.getBoundingClientRect().height;
  }
  return size;
}

let warned = false;
function warnOnce(message: string) {
  if (warned) return;
  warned = true;
  console.warn(message);
}

export const DataTableVirtualBody = Object.assign(DataTableVirtualBodyImpl, {
  [DATATABLE_BODY_SLOT]: true,
});
