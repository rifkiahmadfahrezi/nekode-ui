import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DataTable } from "./DataTable";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableVirtualBody } from "./DataTableVirtualBody";
import type { DataTableColumn } from "./types";

interface Row {
  id: number;
  name: string;
}

const rows: Row[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Row ${i + 1}`,
}));

const columns: DataTableColumn<Row>[] = [{ accessor: "name", title: "Name" }];

// jsdom has no layout: give the viewport and rows a size so the
// virtualizer has something to work with.
const proto = HTMLElement.prototype;
const originals = {
  offsetHeight: Object.getOwnPropertyDescriptor(proto, "offsetHeight"),
  offsetWidth: Object.getOwnPropertyDescriptor(proto, "offsetWidth"),
  rect: proto.getBoundingClientRect,
};
beforeAll(() => {
  Object.defineProperty(proto, "offsetHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return this.tagName === "THEAD" ? 40 : 400;
    },
  });
  Object.defineProperty(proto, "offsetWidth", {
    configurable: true,
    get() {
      return 600;
    },
  });
  Object.defineProperty(proto, "clientHeight", {
    configurable: true,
    get() {
      return 400;
    },
  });
  proto.getBoundingClientRect = () =>
    ({
      height: 40,
      width: 600,
      top: 0,
      left: 0,
      bottom: 40,
      right: 600,
      x: 0,
      y: 0,
      toJSON() {},
    }) as DOMRect;
});
afterAll(() => {
  if (originals.offsetHeight)
    Object.defineProperty(proto, "offsetHeight", originals.offsetHeight);
  if (originals.offsetWidth)
    Object.defineProperty(proto, "offsetWidth", originals.offsetWidth);
  delete (proto as unknown as Record<string, unknown>).clientHeight;
  proto.getBoundingClientRect = originals.rect;
});

describe("DataTableVirtualBody", () => {
  it("mounts only a window of rows instead of every record", async () => {
    render(
      <DataTable data={rows} columns={columns} idAccessor="id" height={400}>
        <DataTableVirtualBody overscan={5} />
      </DataTable>,
    );
    await screen.findByText("Row 1");
    const mounted = document.querySelectorAll("tbody tr[data-row-index]");
    expect(mounted.length).toBeGreaterThan(0);
    expect(mounted.length).toBeLessThan(100);
    expect(screen.getByText("Row 1")).toBeInTheDocument();
    expect(screen.queryByText("Row 1000")).not.toBeInTheDocument();
  });

  it("renders inside tbody, not below the table, and keeps other children below", async () => {
    render(
      <DataTable data={rows} columns={columns} idAccessor="id" height={400}>
        <DataTableVirtualBody />
        <DataTablePagination
          page={1}
          totalRecords={1000}
          recordsPerPage={1000}
          onPageChange={() => {}}
        />
      </DataTable>,
    );
    const first = (await screen.findByText("Row 1")).closest("tr");
    expect(first?.parentElement?.tagName).toBe("TBODY");
    expect(first?.getAttribute("data-row-index")).toBe("0");
    expect(screen.getByLabelText("First page")).toBeInTheDocument();
  });

  it("still shows the empty state", () => {
    render(
      <DataTable data={[]} columns={columns} idAccessor="id" height={400}>
        <DataTableVirtualBody />
      </DataTable>,
    );
    expect(screen.getByText("No records to show")).toBeInTheDocument();
  });
});
