import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { parseISODate, toISODateString } from "../lib/date-vanilla";
import { DataTable } from "./datatable";
import { DatePickerField } from "./date-picker-field";
import { FieldRadio } from "./field-radio";
import { FileField } from "./file-field";
import { NumberField } from "./number-field";
import { PasswordField } from "./password-field";
import { TextareaField } from "./textarea-field";
import { TimePickerField } from "./time-picker-field";

describe("registry regressions", () => {
  it("parseISODate keeps date-only strings on the same local day", () => {
    expect(toISODateString(parseISODate("2026-09-25"))).toBe("2026-09-25");
  });

  it("className does not wipe internal padding", () => {
    render(<PasswordField label="Pw" className="custom" />);
    expect(screen.getByLabelText("Pw")).toHaveClass("custom", "pr-9");
    render(<NumberField label="Num" className="custom" />);
    expect(screen.getByLabelText("Num")).toHaveClass("custom", "pr-9");
  });

  it("NumberField follows a controlled reset to undefined and allows empty", () => {
    const { rerender } = render(<NumberField label="Qty" value={5} />);
    const input = screen.getByLabelText("Qty");
    expect(input).toHaveValue("5");
    rerender(<NumberField label="Qty" value={undefined} />);
    expect(input).toHaveValue("");
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input).toHaveValue("");
  });

  it("NumberField steps with arrow keys", () => {
    render(<NumberField label="Qty" defaultValue={1} decimal={false} />);
    const input = screen.getByLabelText("Qty");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("2");
  });

  it("TextareaField counter follows controlled value", () => {
    const { rerender } = render(
      <TextareaField label="Msg" showCount value="hello" onChange={() => {}} />,
    );
    expect(screen.getByText("5")).toBeInTheDocument();
    rerender(
      <TextareaField label="Msg" showCount value="" onChange={() => {}} />,
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("DatePickerField keeps today selectable with minDate={new Date()}", async () => {
    render(<DatePickerField label="Date" minDate={new Date()} />);
    await userEvent.click(screen.getByLabelText("Date"));
    const today = String(new Date().getDate());
    const day = screen
      .getAllByRole("button")
      .find((b) => b.textContent === today && !b.closest("[data-outside]"));
    expect(day).toBeDefined();
    expect(day).not.toBeDisabled();
  });

  it("FileField ignores a duplicate file", () => {
    const onValueChange = vi.fn();
    const file = new File(["a"], "a.txt", { lastModified: 1 });
    const { container } = render(
      <FileField
        multiple
        defaultValue={[file]}
        onValueChange={onValueChange}
      />,
    );
    const input = container.querySelector(
      "input[type=file]",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(onValueChange).toHaveBeenLastCalledWith([file]);
  });

  it("TimePickerField 12h submits HH:mm", () => {
    const { container } = render(
      <form>
        <TimePickerField name="t" timeFormat="12h" value="15:30" />
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    expect(new FormData(form).getAll("t")).toEqual(["15:30"]);
  });

  it("FieldRadio only blurs when focus leaves the group", () => {
    const onBlur = vi.fn();
    render(
      <FieldRadio
        onBlur={onBlur}
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
      />,
    );
    const [a, b] = screen.getAllByRole("radio");
    fireEvent.blur(a, { relatedTarget: b });
    expect(onBlur).not.toHaveBeenCalled();
    fireEvent.blur(b, { relatedTarget: document.body });
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("pagination with two ellipses has unique keys", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <DataTable
        data={[{ id: 1, name: "Ada" }]}
        columns={[{ accessor: "name" }]}
        pagination={{
          page: 5,
          totalRecords: 100,
          recordsPerPage: 10,
          onPageChange: () => {},
        }}
      />,
    );
    // page 5 of 10 renders [1, …, 4, 5, 6, …, 10]
    expect(
      error.mock.calls.some((c) => String(c[0]).includes("same key")),
    ).toBe(false);
    error.mockRestore();
  });
});
