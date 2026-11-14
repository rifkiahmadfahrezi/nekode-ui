"use client";

import type * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDataTableContext } from "./context";

export interface DataTableRecordsPerPageProps {
  value: number;
  onValueChange: (recordsPerPage: number) => void;
  options?: number[];
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Opt-in "Rows per page" select, kept in its own file so tables that don't
 * need it don't ship `Select`. Place it inside `DataTablePagination`:
 *
 *   <DataTablePagination {...pagination}>
 *     <DataTableRecordsPerPage value={perPage} onValueChange={setPerPage} />
 *   </DataTablePagination>
 */
export function DataTableRecordsPerPage({
  value,
  onValueChange,
  options = [10, 25, 50, 100],
  label = "Rows per page",
  disabled,
  className,
}: DataTableRecordsPerPageProps) {
  const table = useDataTableContext();

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {label != null && <span className="text-muted-foreground">{label}</span>}
      <Select
        value={String(value)}
        onValueChange={(v) => {
          if (v != null) onValueChange(Number(v));
        }}
        disabled={disabled ?? table.fetching}
      >
        <SelectTrigger className="h-8 w-[70px]" aria-label="Rows per page">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
