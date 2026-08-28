"use client";

import * as React from "react";
import {
  createSequenceColumn,
  DataTable,
  type DataTableColumn,
} from "@/components/ui/datatable";

type Ticket = { id: number; subject: string; priority: string };

const tickets = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  subject: `Support request #${index + 1}`,
  priority: index % 3 === 0 ? "High" : "Normal",
}));
const columns: DataTableColumn<Ticket>[] = [
  { accessor: "subject", title: "Subject" },
  { accessor: "priority", title: "Priority" },
];

export function DataTableSequenceDemo() {
  const [page, setPage] = React.useState(1);
  const recordsPerPage = 5;
  const data = tickets.slice(
    (page - 1) * recordsPerPage,
    page * recordsPerPage,
  );

  return (
    <DataTable
      className="w-full max-w-xl"
      data={data}
      columns={[
        createSequenceColumn<Ticket>({ page, recordsPerPage }),
        ...columns,
      ]}
      idAccessor="id"
      pagination={{
        page,
        totalRecords: tickets.length,
        recordsPerPage,
        onPageChange: setPage,
      }}
    />
  );
}
