"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/datatable";

type Order = { id: string; customer: string; total: string; items: string[] };

const orders: Order[] = [
  {
    id: "ORD-241",
    customer: "Alya Putri",
    total: "Rp 840.000",
    items: ["Mechanical keyboard", "Wrist rest"],
  },
  {
    id: "ORD-240",
    customer: "Bima Pratama",
    total: "Rp 230.000",
    items: ["Desk mat"],
  },
  {
    id: "ORD-239",
    customer: "Citra Dewi",
    total: "Rp 1.120.000",
    items: ["Monitor arm", "Cable tray"],
  },
];

const columns: DataTableColumn<Order>[] = [
  { accessor: "id", title: "Order" },
  { accessor: "customer", title: "Customer" },
  { accessor: "total", title: "Total", textAlign: "right" },
];

export function DataTableExpandableDemo() {
  return (
    <DataTable
      className="w-full max-w-xl"
      data={orders}
      columns={columns}
      idAccessor="id"
      singleExpand
      renderRowSubContent={(order) => (
        <div className="space-y-1 text-sm">
          <p className="font-medium">Items in this order</p>
          <ul className="list-disc pl-4 text-muted-foreground">
            {order.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    />
  );
}
