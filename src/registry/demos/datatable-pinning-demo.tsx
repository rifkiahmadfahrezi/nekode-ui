"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/datatable";

type Invoice = {
  id: string;
  customer: string;
  plan: string;
  amount: string;
  status: string;
  updated: string;
};

const invoices: Invoice[] = [
  {
    id: "INV-1048",
    customer: "Arunika Studio",
    plan: "Pro",
    amount: "Rp 1.200.000",
    status: "Paid",
    updated: "Today",
  },
  {
    id: "INV-1047",
    customer: "Nusa Digital",
    plan: "Team",
    amount: "Rp 2.400.000",
    status: "Pending",
    updated: "Yesterday",
  },
  {
    id: "INV-1046",
    customer: "Lentera Co.",
    plan: "Starter",
    amount: "Rp 490.000",
    status: "Paid",
    updated: "18 Aug",
  },
];

const columns: DataTableColumn<Invoice>[] = [
  { accessor: "id", title: "Invoice", pinned: "left", width: 120 },
  { accessor: "customer", title: "Customer", pinned: "left", width: 180 },
  { accessor: "plan", title: "Plan", width: 160 },
  { accessor: "amount", title: "Amount", width: 170, textAlign: "right" },
  { accessor: "status", title: "Status", width: 160 },
  {
    accessor: "updated",
    title: "Updated",
    pinned: "right",
    width: 120,
    textAlign: "right",
  },
];

export function DataTablePinningDemo() {
  return (
    <DataTable
      className="w-full max-w-xl"
      data={invoices}
      columns={columns}
      idAccessor="id"
    />
  );
}
