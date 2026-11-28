"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
  type SortStatus,
} from "@/components/ui/datatable";
import {
  DataTableVirtualBody,
  type DataTableVirtualizer,
} from "@/components/ui/datatable/DataTableVirtualBody";

type Order = {
  id: number;
  customer: string;
  city: string;
  status: "paid" | "pending" | "refunded";
  total: number;
};

const ROW_COUNT = 10_000;
const customers = ["Ayu", "Budi", "Citra", "Dimas", "Eka", "Fajar", "Gita"];
const cities = ["Jakarta", "Bandung", "Surabaya", "Medan", "Makassar"];
const statuses: Order["status"][] = ["paid", "pending", "refunded"];

// Deterministic so server and client render the same rows.
const orders: Order[] = Array.from({ length: ROW_COUNT }, (_, index) => ({
  id: index + 1,
  customer: `${customers[index % customers.length]} ${index + 1}`,
  city: cities[(index * 7) % cities.length],
  status: statuses[(index * 13) % statuses.length],
  total: 50_000 + ((index * 7919) % 950) * 1_000,
}));

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const columns: DataTableColumn<Order>[] = [
  { accessor: "id", title: "#", width: 80, sortable: true },
  { accessor: "customer", title: "Customer", sortable: true },
  { accessor: "city", title: "City" },
  { accessor: "status", title: "Status" },
  {
    accessor: "total",
    title: "Total",
    textAlign: "right",
    sortable: true,
    render: (order) => currency.format(order.total),
  },
];

export function DataTableVirtualDemo() {
  const [sortStatus, setSortStatus] = React.useState<SortStatus<Order>>({
    columnAccessor: "id",
    direction: "asc",
  });
  const [selected, setSelected] = React.useState<Order[]>([]);
  const virtualizerRef = React.useRef<DataTableVirtualizer | null>(null);

  const sorted = React.useMemo(() => {
    const key = sortStatus.columnAccessor as keyof Order;
    const dir = sortStatus.direction === "asc" ? 1 : -1;
    return [...orders].sort((a, b) =>
      a[key] < b[key] ? -dir : a[key] > b[key] ? dir : 0,
    );
  }, [sortStatus]);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
        <span>
          {ROW_COUNT.toLocaleString("en-US")} rows,{" "}
          {selected.length.toLocaleString("en-US")} selected
        </span>
        <div className="ml-auto flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => virtualizerRef.current?.scrollToIndex(0)}
          >
            Top
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              virtualizerRef.current?.scrollToIndex(4_999, { align: "center" })
            }
          >
            Row 5,000
          </Button>
        </div>
      </div>
      <DataTable
        data={sorted}
        columns={columns}
        idAccessor="id"
        height={420}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        selectedRecords={selected}
        onSelectedRecordsChange={setSelected}
        renderRowSubContent={(order) => (
          <p className="text-muted-foreground text-sm">
            Order #{order.id} for {order.customer} in {order.city}:{" "}
            {currency.format(order.total)} ({order.status}).
          </p>
        )}
      >
        <DataTableVirtualBody virtualizerRef={virtualizerRef} />
      </DataTable>
    </div>
  );
}
