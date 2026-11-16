"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDataTableContext } from "./context";
import type { DataTablePaginationProps } from "./types";
import { getPaginationRange } from "./utils";

/**
 * Opt-in pagination bar. Render it as a child of `DataTable` so it picks up
 * the table's `variant` and `fetching` state:
 *
 *   <DataTable data={rows} columns={columns}>
 *     <DataTablePagination page={page} totalRecords={total}
 *       recordsPerPage={10} onPageChange={setPage} />
 *   </DataTable>
 *
 * Children render next to the page buttons, e.g. `<DataTableRecordsPerPage />`.
 */
export function DataTablePagination({
  page,
  totalRecords,
  recordsPerPage,
  onPageChange,
  renderInfo,
  siblingCount = 1,
  disabled,
  className,
  children,
  ref,
}: DataTablePaginationProps) {
  const table = useDataTableContext();
  const isDisabled = disabled ?? table.fetching;

  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  const rangeStart = totalRecords === 0 ? 0 : (page - 1) * recordsPerPage + 1;
  const rangeEnd = Math.min(page * recordsPerPage, totalRecords);

  const pageNumbers = React.useMemo(
    () => getPaginationRange(page, totalPages, siblingCount),
    [page, totalPages, siblingCount],
  );

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        table.variant === "bordered" && "border-t",
        table.sticky && "shrink-0",
        className,
      )}
    >
      <div className="text-sm text-muted-foreground">
        {renderInfo
          ? renderInfo({
              from: rangeStart,
              to: rangeEnd,
              totalRecords,
              page,
              totalPages,
            })
          : totalRecords === 0
            ? "No records"
            : `Showing ${rangeStart}\u2013${rangeEnd} of ${totalRecords}`}
      </div>

      <div className="flex items-center gap-4">
        {children}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="First page"
            disabled={isDisabled || page <= 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Previous page"
            disabled={isDisabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((p, i) =>
            p === "ellipsis" ? (
              <span
                // left and right ellipsis can both appear; key by the page before it
                key={`ellipsis-after-${pageNumbers[i - 1]}`}
                className="flex h-8 w-8 items-center justify-center text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                key={p}
                disabled={isDisabled}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Next page"
            disabled={isDisabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Last page"
            disabled={isDisabled || page >= totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
