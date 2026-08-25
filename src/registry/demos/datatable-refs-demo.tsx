"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/datatable";

type Release = { id: number; version: string; date: string };
const releases: Release[] = [
  { id: 1, version: "v2.4.0", date: "25 Aug 2026" },
  { id: 2, version: "v2.3.1", date: "12 Aug 2026" },
  { id: 3, version: "v2.3.0", date: "01 Aug 2026" },
];
const columns: DataTableColumn<Release>[] = [
  { accessor: "version", title: "Version" },
  { accessor: "date", title: "Released" },
];

export function DataTableRefsDemo() {
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [message, setMessage] = React.useState(
    "Use the button to inspect the forwarded table ref.",
  );

  return (
    <div className="w-full max-w-xl space-y-3">
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          setMessage(
            `Table contains ${tableRef.current?.rows.length ?? 0} rendered rows.`,
          )
        }
      >
        Inspect table ref
      </Button>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {message}
      </p>
      <DataTable
        data={releases}
        columns={columns}
        idAccessor="id"
        tableRef={tableRef}
        rowRef={(element, release) =>
          element?.setAttribute("data-release", release.version)
        }
      />
    </div>
  );
}
