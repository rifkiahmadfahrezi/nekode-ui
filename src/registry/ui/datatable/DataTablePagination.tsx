"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataTablePaginationProps } from "./types";
import { getPaginationRange } from "./utils";

interface Props {
  pagination: DataTablePaginationProps;
  variant: "bordered" | "borderless";
  sticky: boolean;
  footerRef?: React.Ref<HTMLDivElement>;
  fetching?: boolean;
}

export function DataTablePagination({ pagination, variant, sticky, footerRef, fetching }: Props) {
  const totalPages = Math.max(1, Math.ceil(pagination.totalRecords / pagination.recordsPerPage));
  const rangeStart = pagination.totalRecords === 0 ? 0 : (pagination.page - 1) * pagination.recordsPerPage + 1;
  const rangeEnd = Math.min(pagination.page * pagination.recordsPerPage, pagination.totalRecords);

  const pageNumbers = React.useMemo(
    () => getPaginationRange(pagination.page, totalPages, pagination.siblingCount ?? 1),
    [pagination.page, totalPages, pagination.siblingCount]
  );

  return (
    <div
      ref={footerRef}
      className={cn(
        "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        variant === "bordered" && "border-t",
        sticky && "shrink-0"
      )}
    >
      <div className="text-sm text-muted-foreground">
        {pagination.renderInfo
          ? pagination.renderInfo({
              from: rangeStart,
              to: rangeEnd,
              totalRecords: pagination.totalRecords,
              page: pagination.page,
              totalPages,
            })
          : pagination.totalRecords === 0
          ? "No records"
          : `Showing ${rangeStart}\u2013${rangeEnd} of ${pagination.totalRecords}`}
      </div>
      <div className="flex items-center gap-4">
        {pagination.onRecordsPerPageChange && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Rows per page</span>
            <Select
              value={String(pagination.recordsPerPage)}
              onValueChange={(v) => pagination.onRecordsPerPageChange?.(Number(v))}
              disabled={fetching}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(pagination.recordsPerPageOptions ?? [10, 25, 50, 100]).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={fetching || pagination.page <= 1}
            onClick={() => pagination.onPageChange(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pageNumbers.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                key={p}
                disabled={fetching}
                variant={p === pagination.page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => pagination.onPageChange(p)}
              >
                {p}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={fetching || pagination.page >= totalPages}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={fetching || pagination.page >= totalPages}
            onClick={() => pagination.onPageChange(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
