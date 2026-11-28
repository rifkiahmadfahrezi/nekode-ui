"use client";

import * as React from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/datatable";

type Order = {
  id: string;
  customer: string;
  total: number;
  status: "paid" | "pending" | "refunded";
  items: string[];
};

const orders: Order[] = [
  {
    id: "INV-1001",
    customer: "Alya Putri",
    total: 250_000,
    status: "paid",
    items: ["Kaos", "Topi"],
  },
  {
    id: "INV-1002",
    customer: "Bima Pratama",
    total: 1_200_000,
    status: "pending",
    items: ["Sepatu"],
  },
  {
    id: "INV-1003",
    customer: "Citra Dewi",
    total: 87_500,
    status: "paid",
    items: ["Stiker", "Gantungan kunci"],
  },
  {
    id: "INV-1004",
    customer: "Dimas Saputra",
    total: 430_000,
    status: "refunded",
    items: ["Jaket"],
  },
  {
    id: "INV-1005",
    customer: "Eka Lestari",
    total: 610_000,
    status: "paid",
    items: ["Tas", "Botol minum"],
  },
  {
    id: "INV-1006",
    customer: "Fajar Nugroho",
    total: 99_000,
    status: "pending",
    items: ["Kaos kaki"],
  },
];

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const columns: DataTableColumn<Order>[] = [
  { accessor: "id", title: "Invoice", width: 120 },
  { accessor: "customer", title: "Customer" },
  {
    accessor: "status",
    title: "Status",
    render: (o) => <span className="capitalize">{o.status}</span>,
  },
  {
    accessor: "total",
    title: "Total",
    textAlign: "right",
    render: (o) => currency.format(o.total),
  },
];

const KEYS: [string, string][] = [
  ["↑ ↓", "move"],
  ["Home / End", "first / last"],
  ["Enter", "open"],
  ["Space", "select (Shift for range)"],
  ["→ ←", "expand / collapse"],
];

export function DataTableKeyboardDemo() {
  const [selected, setSelected] = React.useState<Order[]>([]);
  const [opened, setOpened] = React.useState<Order | null>(null);
  const [active, setActive] = React.useState<Order | null>(null);

  return (
    <div className="w-full max-w-3xl space-y-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {KEYS.map(([key, action]) => (
          <li key={key}>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
              {key}
            </kbd>{" "}
            {action}
          </li>
        ))}
      </ul>
      <DataTable
        data={orders}
        columns={columns}
        idAccessor="id"
        keyboardNavigation
        onActiveRowChange={setActive}
        onRowClick={setOpened}
        expandOnRowClick={false}
        selectedRecords={selected}
        onSelectedRecordsChange={setSelected}
        renderRowSubContent={(o) => (
          <p className="text-sm text-muted-foreground">
            Items: {o.items.join(", ")}
          </p>
        )}
      />
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {opened
          ? `Opened ${opened.id} (${opened.customer}).`
          : active
            ? `Focused ${active.id}. Press Enter to open it.`
            : "Tab into the table, then use the keys above."}{" "}
        {selected.length > 0 && `${selected.length} selected.`}
      </p>
    </div>
  );
}
