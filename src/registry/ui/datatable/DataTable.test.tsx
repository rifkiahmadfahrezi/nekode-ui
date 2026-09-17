import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./DataTable";
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
      <DataTable
        data={data}
        columns={columns}
        idAccessor="id"
        pagination={{
          page: 1,
          totalRecords: 30,
          recordsPerPage: 10,
          onPageChange,
        }}
      />,
    );

    expect(screen.getByText("Showing 1–10 of 30")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
