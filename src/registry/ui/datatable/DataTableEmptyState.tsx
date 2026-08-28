"use client";

import { TableCell, TableRow } from "@/components/ui/table";

export function DataTableEmptyState({
  text,
  colSpan,
}: {
  text: string;
  colSpan: number;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className="h-24 text-center text-muted-foreground"
      >
        {text}
      </TableCell>
    </TableRow>
  );
}
