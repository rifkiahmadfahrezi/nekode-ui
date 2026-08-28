import type * as React from "react";
import { useCallback } from "react";
import type { DataTableColumn } from "./types";

export function getRecordId<T>(
  record: T,
  idAccessor?: keyof T | ((record: T) => React.Key),
): React.Key {
  if (typeof idAccessor === "function") return idAccessor(record);
  if (idAccessor) return record[idAccessor] as unknown as React.Key;
  return JSON.stringify(record);
}

/** Stable, module-level (never recreated) — safe to pass straight into memoized children. */
export function getColumnKey<T>(col: DataTableColumn<T>): string {
  return col.id ?? col.accessor;
}

export function computeOrderedColumns<T>(
  columns: DataTableColumn<T>[],
): DataTableColumn<T>[] {
  const left = columns.filter((c) => c.pinned === "left");
  const right = columns.filter((c) => c.pinned === "right");
  const middle = columns.filter(
    (c) => c.pinned !== "left" && c.pinned !== "right",
  );
  return [...left, ...middle, ...right];
}

export function computePinOffsets<T>(
  orderedColumns: DataTableColumn<T>[],
  leadingGutter: number,
  defaultWidth: number,
) {
  const leftPinnedCols = orderedColumns.filter((c) => c.pinned === "left");
  const rightPinnedCols = orderedColumns.filter((c) => c.pinned === "right");

  const leftOffsets: Record<string, number> = {};
  let lo = leadingGutter;
  for (const col of leftPinnedCols) {
    const key = getColumnKey(col);
    leftOffsets[key] = lo;
    lo += typeof col.width === "number" ? col.width : defaultWidth;
  }

  const rightOffsets: Record<string, number> = {};
  let ro = 0;
  for (let i = rightPinnedCols.length - 1; i >= 0; i--) {
    const col = rightPinnedCols[i];
    const key = getColumnKey(col);
    rightOffsets[key] = ro;
    ro += typeof col.width === "number" ? col.width : defaultWidth;
  }

  return { leftOffsets, rightOffsets, leftPinnedCols, rightPinnedCols };
}

export function getPaginationRange(
  current: number,
  total: number,
  siblingCount = 1,
): (number | "ellipsis")[] {
  const totalVisible = siblingCount * 2 + 5;
  if (totalVisible >= total) {
    return Array.from({ length: Math.max(total, 0) }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  const pages: (number | "ellipsis")[] = [1];
  if (showLeftEllipsis) pages.push("ellipsis");
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== total) pages.push(i);
  }
  if (showRightEllipsis) pages.push("ellipsis");
  if (total > 1) pages.push(total);
  return pages;
}

/** Merge multiple refs (object or callback) into a single stable callback ref. */
export function useMergedRef<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return useCallback((node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}

/**
 * Row number for a "No." column, accounting for pagination — e.g. row 0 on
 * page 2 with 10 records/page is #11, not #1.
 */
export function getSequenceNumber(
  rowIndex: number,
  page?: number,
  recordsPerPage?: number,
): number {
  if (page && recordsPerPage) return (page - 1) * recordsPerPage + rowIndex + 1;
  return rowIndex + 1;
}

/**
 * Ready-made column definition for a "No." / sequence-number column.
 * Pass `page`/`recordsPerPage` when paginating so numbering continues
 * across pages instead of resetting to 1 on every page.
 *
 *   columns={[createSequenceColumn({ page, recordsPerPage }), ...yourColumns]}
 */
export function createSequenceColumn<T>(options?: {
  title?: React.ReactNode;
  width?: number | string;
  page?: number;
  recordsPerPage?: number;
  /** Override the (otherwise unused) synthetic accessor/id, e.g. if "no" collides with a real field. */
  accessor?: string;
  pinned?: "left" | "right";
}): DataTableColumn<T> {
  const {
    title = "No.",
    width = 56,
    page,
    recordsPerPage,
    accessor = "__sequence",
    pinned,
  } = options ?? {};
  return {
    accessor,
    title,
    width,
    pinned,
    textAlign: "center",
    render: (_record, rowIndex) =>
      getSequenceNumber(rowIndex, page, recordsPerPage),
  };
}
