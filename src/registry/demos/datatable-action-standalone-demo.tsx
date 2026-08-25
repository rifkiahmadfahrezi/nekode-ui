"use client";

import { Archive, Copy, Trash2 } from "lucide-react";
import { DataTableAction } from "@/components/ui/datatable";

export function DataTableActionStandaloneDemo() {
  return (
    <DataTableAction
      label="Actions for invoice INV-1048"
      items={[
        {
          key: "copy",
          label: "Copy invoice link",
          icon: <Copy className="size-4" />,
          onClick: () => window.alert("Invoice link copied"),
        },
        {
          key: "archive",
          label: "Archive",
          icon: <Archive className="size-4" />,
          onClick: () => window.alert("Invoice archived"),
        },
        {
          key: "delete",
          label: "Delete",
          icon: <Trash2 className="size-4" />,
          danger: true,
          onClick: () => window.alert("Invoice deleted"),
        },
      ]}
    />
  );
}
