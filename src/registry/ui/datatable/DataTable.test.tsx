import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./DataTable";
import { DataTableContextMenu } from "./DataTableContextMenu";
import { DataTablePagination } from "./DataTablePagination";
import type { DataTableColumn } from "./types";

interface Row {
  id: number;
  name: string;
}

const data: Row[] = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
  { id: 3, name: "Alan" },
];

const columns: DataTableColumn<Row>[] = [
  { accessor: "name", title: "Name", sortable: true },
];

describe("DataTable", () => {
  it("renders one row per record with the right cell content", () => {
    render(<DataTable data={data} columns={columns} idAccessor="id" />);

    const rows = screen.getAllByRole("row");
    // header row + 3 data rows
    expect(rows).toHaveLength(4);
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.getByText("Alan")).toBeInTheDocument();
  });

  it("shows the empty state text when there is no data", () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        idAccessor="id"
        noRecordsText="Nothing here yet"
      />,
    );

    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("calls onRowClick with the clicked record", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <DataTable
        data={data}
        columns={columns}
        idAccessor="id"
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByText("Grace"));

    expect(onRowClick).toHaveBeenCalledWith(data[1], 1);
  });

  it("selects a single record on row checkbox click", async () => {
    const user = userEvent.setup();
    const onSelectedRecordsChange = vi.fn();
    render(
      <DataTable
        data={data}
        columns={columns}
        idAccessor="id"
        selectedRecords={[]}
        onSelectedRecordsChange={onSelectedRecordsChange}
      />,
    );

    await user.click(screen.getByLabelText("Select record 1"));

    expect(onSelectedRecordsChange).toHaveBeenCalledWith([data[0]]);
  });

  it("deselects an already-selected record", async () => {
    const user = userEvent.setup();
    const onSelectedRecordsChange = vi.fn();
    render(
      <DataTable
        data={data}
        columns={columns}
        idAccessor="id"
        selectedRecords={[data[0]]}
        onSelectedRecordsChange={onSelectedRecordsChange}
      />,
    );

    await user.click(screen.getByLabelText("Select record 1"));

    expect(onSelectedRecordsChange).toHaveBeenCalledWith([]);
  });

  it("selects every row on the page via the header checkbox", async () => {
    const user = userEvent.setup();
    const onSelectedRecordsChange = vi.fn();
    render(
      <DataTable
        data={data}
        columns={columns}
        idAccessor="id"
        selectedRecords={[]}
        onSelectedRecordsChange={onSelectedRecordsChange}
      />,
    );

    await user.click(screen.getByLabelText("Select all records"));

    expect(onSelectedRecordsChange).toHaveBeenCalledWith(data);
  });

  it("clears the page selection when the header checkbox is toggled off", async () => {
    const user = userEvent.setup();
    const onSelectedRecordsChange = vi.fn();
    render(
      <DataTable
        data={data}
        columns={columns}
        idAccessor="id"
        selectedRecords={data}
        onSelectedRecordsChange={onSelectedRecordsChange}
      />,
    );

    await user.click(screen.getByLabelText("Select all records"));

    expect(onSelectedRecordsChange).toHaveBeenCalledWith([]);
  });

  it("reports ascending sort on first click and descending on the next", async () => {
    const user = userEvent.setup();
    const onSortStatusChange = vi.fn();
    const { rerender } = render(
      <DataTable
        data={data}
        columns={columns}
        idAccessor="id"
        sortStatus={undefined}
        onSortStatusChange={onSortStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(onSortStatusChange).toHaveBeenLastCalledWith({
      columnAccessor: "name",
      direction: "asc",
    });

    rerender(
      <DataTable
        data={data}
        columns={columns}
        idAccessor="id"
        sortStatus={{ columnAccessor: "name", direction: "asc" }}
        onSortStatusChange={onSortStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(onSortStatusChange).toHaveBeenLastCalledWith({
      columnAccessor: "name",
      direction: "desc",
    });
  });

  it("expands a row to show its sub content and collapses it again", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        data={data}
        columns={columns}
        idAccessor="id"
        renderRowSubContent={(record) => <span>Details for {record.name}</span>}
      />,
    );

    expect(screen.queryByText("Details for Ada")).not.toBeInTheDocument();

    await user.click(screen.getAllByLabelText("Expand row")[0]);
    expect(screen.getByText("Details for Ada")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Collapse row"));
    expect(screen.queryByText("Details for Ada")).not.toBeInTheDocument();
  });

  it("renders custom column content via render()", () => {
    const withRender: DataTableColumn<Row>[] = [
      {
        accessor: "name",
        title: "Name",
        render: (record) => record.name.toUpperCase(),
      },
    ];
    render(<DataTable data={data} columns={withRender} idAccessor="id" />);

    expect(screen.getByText("ADA")).toBeInTheDocument();
  });

  it("keeps row checkboxes out of the row click handler", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <DataTable
        data={data}
        columns={columns}
        idAccessor="id"
        onRowClick={onRowClick}
        selectedRecords={[]}
        onSelectedRecordsChange={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText("Select record 1"));

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("renders a pagination control when pagination props are given", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <DataTable data={data} columns={columns} idAccessor="id">
        <DataTablePagination
          page={1}
          totalRecords={30}
          recordsPerPage={10}
          onPageChange={onPageChange}
        />
      </DataTable>,
    );

    expect(screen.getByText("Showing 1–10 of 30")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables pagination while the parent table is fetching", () => {
    render(
      <DataTable data={data} columns={columns} idAccessor="id" fetching>
        <DataTablePagination
          page={1}
          totalRecords={30}
          recordsPerPage={10}
          onPageChange={() => {}}
        />
      </DataTable>,
    );

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("opens the shared context menu only for rows that have items", () => {
    const onView = vi.fn();
    const items = (record: Row) =>
      record.id === 2
        ? undefined
        : [{ key: "view", label: `View ${record.name}`, onClick: onView }];
    render(
      <DataTableContextMenu items={items}>
        <DataTable data={data} columns={columns} idAccessor="id" />
      </DataTableContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText("Ada"));
    expect(screen.getByText("View Ada")).toBeInTheDocument();

    // A row without items doesn't get our menu, so the browser's stays.
    const event = createEvent.contextMenu(screen.getByText("Grace"));
    fireEvent(screen.getByText("Grace"), event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("calls context menu items only for the right-clicked row, at open time", () => {
    const items = vi.fn((record: Row) => [
      { key: "view", label: `View ${record.name}`, onClick: () => {} },
    ]);
    render(
      <DataTableContextMenu items={items}>
        <DataTable data={data} columns={columns} idAccessor="id" />
      </DataTableContextMenu>,
    );
    expect(items).not.toHaveBeenCalled();

    fireEvent.contextMenu(screen.getByText("Alan"));
    expect(items).toHaveBeenCalledTimes(1);
    expect(items).toHaveBeenCalledWith(data[2], 2);
    expect(screen.getByText("View Alan")).toBeInTheDocument();
  });

  it("offsets pinned columns by their measured width, not a guess", () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const width = this.dataset.colKey === "name" ? 230 : 0;
        return {
          width,
          height: 0,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: width,
          bottom: 0,
          toJSON() {},
        } as DOMRect;
      });
    render(
      <DataTable
        data={data}
        idAccessor="id"
        columns={[
          { accessor: "name", title: "Name", pinned: "left", width: "20%" },
          { accessor: "id", title: "Id", pinned: "left" },
        ]}
      />,
    );
    // Without measuring, "Id" would sit at the 150px fallback.
    expect(screen.getByRole("columnheader", { name: "Id" })).toHaveStyle({
      left: "230px",
    });
    rect.mockRestore();
  });

  it("re-renders only the toggled row when selection changes", async () => {
    const user = userEvent.setup();
    const renders: Record<number, number> = {};
    const countingColumns: DataTableColumn<Row>[] = [
      {
        accessor: "name",
        render: (record) => {
          renders[record.id] = (renders[record.id] ?? 0) + 1;
          return record.name;
        },
      },
    ];

    function Harness() {
      const [selected, setSelected] = React.useState<Row[]>([]);
      return (
        <DataTable
          data={data}
          columns={countingColumns}
          idAccessor="id"
          selectedRecords={selected}
          onSelectedRecordsChange={setSelected}
          onRowClick={() => {}}
        />
      );
    }
    render(<Harness />);
    const before = { ...renders };

    await user.click(screen.getByRole("checkbox", { name: "Select record 1" }));

    expect(renders[1]).toBe(before[1] + 1);
    expect(renders[2]).toBe(before[2]);
    expect(renders[3]).toBe(before[3]);
  });
});
