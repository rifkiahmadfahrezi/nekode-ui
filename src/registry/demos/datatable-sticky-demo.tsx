"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/datatable";

type Payment = { id: number; customer: string; amount: number; date: string };

const payments = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  customer: `Customer ${index + 1}`,
  amount: 125_000 + index * 25_000,
  date: `August ${String(index + 1).padStart(2, "0")}, 2026`,
}));

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const columns: DataTableColumn<Payment>[] = [
  { accessor: "customer", title: "Customer" },
  { accessor: "date", title: "Date" },
  {
    accessor: "amount",
    title: "Amount",
    textAlign: "right",
    render: (payment) => currency.format(payment.amount),
    footer: (rows) =>
      currency.format(
        rows.reduce((total, payment) => total + payment.amount, 0),
      ),
  },
];

export function DataTableStickyDemo() {
  return (
    <DataTable
      className="w-full max-w-xl"
      data={payments}
      columns={columns}
      idAccessor="id"
      height={300}
    />
  );
}
