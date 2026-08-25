"use client";

import * as React from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/datatable";

type Member = { id: number; name: string; team: string };

const members: Member[] = [
  { id: 1, name: "Alya Putri", team: "Design" },
  { id: 2, name: "Bima Pratama", team: "Engineering" },
  { id: 3, name: "Citra Dewi", team: "Marketing" },
  { id: 4, name: "Dimas Saputra", team: "Engineering" },
  { id: 5, name: "Eka Lestari", team: "Product" },
];

const columns: DataTableColumn<Member>[] = [
  { accessor: "name", title: "Member" },
  { accessor: "team", title: "Team" },
];

export function DataTableSelectionDemo() {
  const [selectedRecords, setSelectedRecords] = React.useState<Member[]>([]);

  return (
    <div className="w-full max-w-xl space-y-3">
      <p className="text-sm text-muted-foreground">
        {selectedRecords.length
          ? `${selectedRecords.length} member${selectedRecords.length === 1 ? "" : "s"} selected`
          : "Select rows, then shift-click another checkbox to select a range."}
      </p>
      <DataTable
        data={members}
        columns={columns}
        idAccessor="id"
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
      />
    </div>
  );
}
