"use client";

import * as React from "react";
import { Table, TableBody } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTableEmptyState } from "./DataTableEmptyState";
import { DataTableFooter } from "./DataTableFooter";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableLoader } from "./DataTableLoader";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableRow } from "./DataTableRow";
import type {
  BaseDataTableProps,
  DataTableColumn,
  RequiredSortProps,
  SortDirection,
  SortProps,
} from "./types";
import {
  computeOrderedColumns,
  computePinOffsets,
  getColumnKey,
  getRecordId,
  useMergedRef,
} from "./utils";

export type {
  DataTableColumn,
  DataTablePaginationProps,
  RowContextMenuItem,
  SortDirection,
  SortStatus,
} from "./types";

const SELECTION_COL_WIDTH = 44;
const EXPAND_COL_WIDTH = 40;
const DEFAULT_PINNED_WIDTH = 150;

export function DataTable<
  T extends Record<string, any>,
  Cols extends readonly DataTableColumn<T>[] = DataTableColumn<T>[],
>(
  props: BaseDataTableProps<T> & {
    columns: Cols;
  } & (Cols[number]["sortable"] extends true
      ? RequiredSortProps<T>
      : SortProps<T>),
) {
  const {
    data,
    fetching = false,
    columns,
    idAccessor,
    selectedRecords,
    onSelectedRecordsChange,
    height,
    rowContextMenu,
    pagination,
    noRecordsText = "No records to show",
    highlightOnHover = true,
    onRowClick,
    className,
    variant = "bordered",
    rowClassName,
    rowStyle,
    headerClassName,
    headerStyle,
    renderRowSubContent,
    rowExpandable,
    expandOnRowClick = true,
    singleExpand = false,
    expandedRecordIds,
    onExpandedRecordIdsChange,
    headerRef,
    bodyRef,
    footerRef,
    tableRef,
    scrollViewportRef,
    rowRef,
    sortStatus,
    onSortStatusChange,
  } = props as BaseDataTableProps<T> & SortProps<T>;

  const selectable = !!onSelectedRecordsChange;
  const expandable = !!renderRowSubContent;
  const sticky = !!height;

  /* ------------------------------- Selection ------------------------------ */

  const selectedIds = React.useMemo(
    () =>
      new Set((selectedRecords ?? []).map((r) => getRecordId(r, idAccessor))),
    [selectedRecords, idAccessor],
  );

  const pageSelectedCount = React.useMemo(
    () =>
      data.filter((r) => selectedIds.has(getRecordId(r, idAccessor))).length,
    [data, selectedIds, idAccessor],
  );
  const allChecked = data.length > 0 && pageSelectedCount === data.length;
  const someChecked = pageSelectedCount > 0 && !allChecked;

  const [lastSelectionIndex, setLastSelectionIndex] = React.useState<
    number | null
  >(null);

  const handleToggleSelect = React.useCallback(
    (record: T, rowIndex: number, shiftKey: boolean) => {
      if (!onSelectedRecordsChange) return;
      const id = getRecordId(record, idAccessor);

      if (shiftKey && lastSelectionIndex !== null) {
        const [start, end] =
          lastSelectionIndex < rowIndex
            ? [lastSelectionIndex, rowIndex]
            : [rowIndex, lastSelectionIndex];
        const rangeRecords = data.slice(start, end + 1);
        const willSelect = !selectedIds.has(id);
        if (willSelect) {
          const merged = [...(selectedRecords ?? [])];
          const existing = new Set(
            merged.map((r) => getRecordId(r, idAccessor)),
          );
          for (const r of rangeRecords) {
            const rid = getRecordId(r, idAccessor);
            if (!existing.has(rid)) {
              merged.push(r);
              existing.add(rid);
            }
          }
          onSelectedRecordsChange(merged);
        } else {
          const rangeIds = new Set(
            rangeRecords.map((r) => getRecordId(r, idAccessor)),
          );
          onSelectedRecordsChange(
            (selectedRecords ?? []).filter(
              (r) => !rangeIds.has(getRecordId(r, idAccessor)),
            ),
          );
        }
      } else if (selectedIds.has(id)) {
        onSelectedRecordsChange(
          (selectedRecords ?? []).filter(
            (r) => getRecordId(r, idAccessor) !== id,
          ),
        );
      } else {
        onSelectedRecordsChange([...(selectedRecords ?? []), record]);
      }
      setLastSelectionIndex(rowIndex);
    },
    [
      onSelectedRecordsChange,
      selectedRecords,
      selectedIds,
      idAccessor,
      data,
      lastSelectionIndex,
    ],
  );

  const handleToggleAll = React.useCallback(() => {
    if (!onSelectedRecordsChange) return;
    if (allChecked) {
      const idsOnPage = new Set(data.map((r) => getRecordId(r, idAccessor)));
      onSelectedRecordsChange(
        (selectedRecords ?? []).filter(
          (r) => !idsOnPage.has(getRecordId(r, idAccessor)),
        ),
      );
    } else {
      const merged = [...(selectedRecords ?? [])];
      const existing = new Set(merged.map((r) => getRecordId(r, idAccessor)));
      for (const r of data) {
        const id = getRecordId(r, idAccessor);
        if (!existing.has(id)) {
          merged.push(r);
          existing.add(id);
        }
      }
      onSelectedRecordsChange(merged);
    }
  }, [onSelectedRecordsChange, allChecked, data, selectedRecords, idAccessor]);

  /* ------------------------------- Expansion ------------------------------ */

  const [internalExpanded, setInternalExpanded] = React.useState<
    Set<React.Key>
  >(new Set());
  const isExpandControlled = expandedRecordIds !== undefined;
  const expandedSet = React.useMemo(
    () =>
      new Set(
        isExpandControlled ? expandedRecordIds : Array.from(internalExpanded),
      ),
    [isExpandControlled, expandedRecordIds, internalExpanded],
  );

  const toggleExpand = React.useCallback(
    (record: T) => {
      const id = getRecordId(record, idAccessor);
      let next: Set<React.Key>;
      if (singleExpand) {
        next = expandedSet.has(id) ? new Set() : new Set([id]);
      } else {
        next = new Set(expandedSet);
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      if (isExpandControlled) onExpandedRecordIdsChange?.(Array.from(next));
      else setInternalExpanded(next);
    },
    [
      expandedSet,
      singleExpand,
      isExpandControlled,
      onExpandedRecordIdsChange,
      idAccessor,
    ],
  );

  /* --------------------------------- Sort ---------------------------------- */

  const handleSort = React.useCallback(
    (col: DataTableColumn<T>) => {
      if (!col.sortable || !onSortStatusChange) return;
      const isCurrent = sortStatus?.columnAccessor === col.accessor;
      const nextDirection: SortDirection =
        isCurrent && sortStatus?.direction === "asc" ? "desc" : "asc";
      onSortStatusChange({
        columnAccessor: col.accessor,
        direction: nextDirection,
      });
    },
    [onSortStatusChange, sortStatus],
  );

  /* -------------------------------- Pinning -------------------------------- */

  const orderedColumns = React.useMemo(
    () => computeOrderedColumns(columns),
    [columns],
  );
  const leadingGutter =
    (selectable ? SELECTION_COL_WIDTH : 0) +
    (expandable ? EXPAND_COL_WIDTH : 0);

  const { leftOffsets, rightOffsets, leftPinnedCols, rightPinnedCols } =
    React.useMemo(
      () =>
        computePinOffsets(orderedColumns, leadingGutter, DEFAULT_PINNED_WIDTH),
      [orderedColumns, leadingGutter],
    );

  const pinnedCellStyle = React.useCallback(
    (col: DataTableColumn<T>): React.CSSProperties => {
      const key = getColumnKey(col);
      if (col.pinned === "left")
        return { position: "sticky", left: leftOffsets[key] };
      if (col.pinned === "right")
        return { position: "sticky", right: rightOffsets[key] };
      return {};
    },
    [leftOffsets, rightOffsets],
  );

  const pinnedCellClassName = React.useCallback(
    (
      col: DataTableColumn<T>,
      zIndexClass: string,
      bgClassName: string = "bg-background",
    ) => {
      const isLastLeft =
        leftPinnedCols.length > 0 &&
        leftPinnedCols[leftPinnedCols.length - 1] === col;
      const isFirstRight =
        rightPinnedCols.length > 0 && rightPinnedCols[0] === col;
      return cn(
        col.pinned && "sticky",
        col.pinned && bgClassName,
        col.pinned && zIndexClass,
        col.pinned === "left" &&
          isLastLeft &&
          "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]",
        col.pinned === "right" &&
          isFirstRight &&
          "shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]",
      );
    },
    [leftPinnedCols, rightPinnedCols],
  );

  /* ------------------------------ Scroll shadow ----------------------------- */

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const mergedScrollRef = useMergedRef(scrollRef, scrollViewportRef);
  const [scrollShadow, setScrollShadow] = React.useState({
    left: false,
    right: false,
  });

  const updateScrollShadow = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollShadow({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  React.useEffect(() => {
    updateScrollShadow();
    window.addEventListener("resize", updateScrollShadow);
    return () => window.removeEventListener("resize", updateScrollShadow);
  }, [updateScrollShadow, data, orderedColumns]);

  /* ------------------------------ Pagination -------------------------------- */

  const totalCols =
    orderedColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0);

  /* --------------------------------- Render --------------------------------- */

  return (
    <div
      className={cn(
        "rounded-md",
        variant === "bordered" && "border",
        className,
      )}
    >
      <div className="relative">
        <DataTableLoader fetching={fetching} />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-25 w-6 bg-gradient-to-r from-black/10 to-transparent opacity-0 transition-opacity dark:from-white/10",
            scrollShadow.left && "opacity-100",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-25 w-6 bg-gradient-to-l from-black/10 to-transparent opacity-0 transition-opacity dark:from-white/10",
            scrollShadow.right && "opacity-100",
          )}
        />

        <div
          ref={mergedScrollRef}
          onScroll={updateScrollShadow}
          style={height ? { height, overflow: "auto" } : { overflow: "auto" }}
        >
          <Table
            ref={tableRef}
            className="min-w-full"
            style={{
              tableLayout: columns.some((c) => c.width) ? "fixed" : "auto",
            }}
          >
            <DataTableHeader<T>
              ref={headerRef}
              columns={orderedColumns}
              selectable={selectable}
              expandable={expandable}
              selectionColWidth={SELECTION_COL_WIDTH}
              expandColWidth={EXPAND_COL_WIDTH}
              selectionChecked={allChecked}
              selectionIndeterminate={someChecked}
              onSelectionChange={handleToggleAll}
              sortStatus={sortStatus}
              onSort={handleSort}
              getColumnKey={getColumnKey}
              pinnedCellStyle={pinnedCellStyle}
              pinnedCellClassName={pinnedCellClassName}
              headerClassName={headerClassName}
              headerStyle={headerStyle}
              sticky={sticky}
              variant={variant}
            />

            <TableBody ref={bodyRef}>
              {data.length === 0 ? (
                <DataTableEmptyState
                  text={fetching ? "" : noRecordsText}
                  colSpan={totalCols}
                />
              ) : (
                data.map((record, rowIndex) => {
                  const rowId = getRecordId(record, idAccessor);
                  const isSelected = selectedIds.has(rowId);
                  const isExpanded = expandedSet.has(rowId);
                  const canExpand =
                    expandable &&
                    (rowExpandable ? rowExpandable(record, rowIndex) : true);
                  const contextMenuItems = rowContextMenu?.(record, rowIndex);
                  const resolvedRowClassName =
                    typeof rowClassName === "function"
                      ? rowClassName(record, rowIndex)
                      : rowClassName;
                  const resolvedRowStyle =
                    typeof rowStyle === "function"
                      ? rowStyle(record, rowIndex)
                      : rowStyle;

                  return (
                    <DataTableRow<T>
                      key={rowId}
                      record={record}
                      rowIndex={rowIndex}
                      columns={orderedColumns}
                      selectable={selectable}
                      expandable={expandable}
                      selectionColWidth={SELECTION_COL_WIDTH}
                      expandColWidth={EXPAND_COL_WIDTH}
                      isSelected={isSelected}
                      isExpanded={isExpanded}
                      canExpand={canExpand}
                      renderSubContent={renderRowSubContent}
                      onToggleSelect={handleToggleSelect}
                      onToggleExpand={toggleExpand}
                      onRowClick={onRowClick}
                      expandOnRowClick={expandOnRowClick}
                      highlightOnHover={highlightOnHover}
                      rowClassName={resolvedRowClassName}
                      rowStyle={resolvedRowStyle}
                      contextMenuItems={contextMenuItems}
                      getColumnKey={getColumnKey}
                      pinnedCellStyle={pinnedCellStyle}
                      pinnedCellClassName={pinnedCellClassName}
                      leadingGutter={leadingGutter}
                      totalCols={totalCols}
                      variant={variant}
                      rowRef={rowRef}
                    />
                  );
                })
              )}
            </TableBody>

            <DataTableFooter
              columns={orderedColumns}
              data={data}
              selectable={selectable}
              expandable={expandable}
              selectionColWidth={SELECTION_COL_WIDTH}
              expandColWidth={EXPAND_COL_WIDTH}
              getColumnKey={getColumnKey}
              pinnedCellStyle={pinnedCellStyle}
              pinnedCellClassName={pinnedCellClassName}
              sticky={sticky}
              variant={variant}
            />
          </Table>
        </div>
      </div>

      {pagination && (
        <DataTablePagination
          pagination={pagination}
          variant={variant}
          sticky={sticky}
          footerRef={footerRef}
          fetching={fetching}
        />
      )}
    </div>
  );
}

export default DataTable;
