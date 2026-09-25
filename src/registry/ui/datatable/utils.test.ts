import { describe, expect, it } from "vitest";
import type { DataTableColumn } from "./types";
import {
  computeOrderedColumns,
  computePinOffsets,
  createSequenceColumn,
  getColumnKey,
  getPaginationRange,
  getRecordId,
  getSequenceNumber,
} from "./utils";

interface Row {
  id: number;
  name: string;
}

describe("getRecordId", () => {
  const record: Row = { id: 1, name: "Ada" };

  it("uses idAccessor key when given", () => {
    expect(getRecordId(record, "id")).toBe(1);
  });

  it("uses idAccessor function when given", () => {
    expect(getRecordId(record, (r) => `row-${r.id}`)).toBe("row-1");
  });

  it("falls back to record.id when no idAccessor", () => {
    expect(getRecordId(record)).toBe(record.id);
  });

  it("falls back to JSON.stringify when no idAccessor and no id", () => {
    const noId = { name: "Ada" };
    expect(getRecordId(noId)).toBe(JSON.stringify(noId));
  });
});

describe("getColumnKey", () => {
  it("prefers explicit id over accessor", () => {
    const col: DataTableColumn<Row> = { accessor: "name", id: "custom" };
    expect(getColumnKey(col)).toBe("custom");
  });

  it("falls back to accessor when no id", () => {
    const col: DataTableColumn<Row> = { accessor: "name" };
    expect(getColumnKey(col)).toBe("name");
  });
});

describe("computeOrderedColumns", () => {
  it("moves left-pinned columns first and right-pinned columns last", () => {
    const columns: DataTableColumn<Row>[] = [
      { accessor: "name" },
      { accessor: "id", pinned: "right" },
      { accessor: "extra", pinned: "left" },
    ];
    expect(computeOrderedColumns(columns).map((c) => c.accessor)).toEqual([
      "extra",
      "name",
      "id",
    ]);
  });

  it("preserves relative order within each group", () => {
    const columns: DataTableColumn<Row>[] = [
      { accessor: "a", pinned: "left" },
      { accessor: "b", pinned: "left" },
      { accessor: "c" },
      { accessor: "d" },
    ];
    expect(computeOrderedColumns(columns).map((c) => c.accessor)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });
});

describe("computePinOffsets", () => {
  it("stacks left-pinned offsets after the leading gutter, using column width or default", () => {
    const columns: DataTableColumn<Row>[] = [
      { accessor: "a", pinned: "left", width: 100 },
      { accessor: "b", pinned: "left" },
    ];
    const { leftOffsets, leftPinnedCols } = computePinOffsets(columns, 44, 150);
    expect(leftPinnedCols.map((c) => c.accessor)).toEqual(["a", "b"]);
    expect(leftOffsets.a).toBe(44);
    expect(leftOffsets.b).toBe(144);
  });

  it("stacks right-pinned offsets from the trailing edge in reverse order", () => {
    const columns: DataTableColumn<Row>[] = [
      { accessor: "a", pinned: "right", width: 100 },
      { accessor: "b", pinned: "right" },
    ];
    const { rightOffsets } = computePinOffsets(columns, 0, 150);
    expect(rightOffsets.b).toBe(0);
    expect(rightOffsets.a).toBe(150);
  });
});

describe("getPaginationRange", () => {
  it("returns every page when total fits within the visible window", () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("adds an ellipsis on the right when current page is near the start", () => {
    expect(getPaginationRange(1, 10)).toEqual([1, 2, "ellipsis", 10]);
  });

  it("adds an ellipsis on the left when current page is near the end", () => {
    expect(getPaginationRange(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });

  it("adds ellipses on both sides when current page is in the middle", () => {
    expect(getPaginationRange(5, 10)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
  });
});

describe("getSequenceNumber", () => {
  it("numbers from 1 when no pagination is given", () => {
    expect(getSequenceNumber(0)).toBe(1);
    expect(getSequenceNumber(4)).toBe(5);
  });

  it("offsets by page and recordsPerPage when paginating", () => {
    expect(getSequenceNumber(0, 2, 10)).toBe(11);
    expect(getSequenceNumber(9, 2, 10)).toBe(20);
  });
});

describe("createSequenceColumn", () => {
  it("defaults to a '__sequence' accessor and 'No.' title", () => {
    const col = createSequenceColumn<Row>();
    expect(col.accessor).toBe("__sequence");
    expect(col.title).toBe("No.");
    expect(col.render?.({ id: 1, name: "Ada" }, 0)).toBe(1);
  });

  it("continues numbering across pages when given page/recordsPerPage", () => {
    const col = createSequenceColumn<Row>({ page: 3, recordsPerPage: 5 });
    expect(col.render?.({ id: 1, name: "Ada" }, 0)).toBe(11);
  });

  it("allows overriding the accessor to avoid field collisions", () => {
    const col = createSequenceColumn<Row>({ accessor: "rowNumber" });
    expect(col.accessor).toBe("rowNumber");
  });
});
