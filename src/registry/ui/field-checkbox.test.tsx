import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FieldCheckbox, FieldCheckboxGroup } from "./field-checkbox";

const options = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Push", value: "push" },
];

describe("FieldCheckbox", () => {
  it("toggles through its label and wires the error", () => {
    const onCheckedChange = vi.fn();
    render(
      <FieldCheckbox
        label="Accept terms"
        error="Required"
        onCheckedChange={onCheckedChange}
      />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Required").id).toBe(
      checkbox.getAttribute("aria-errormessage"),
    );
    fireEvent.click(screen.getByText("Accept terms"));
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });
});

describe("FieldCheckboxGroup", () => {
  it("returns checked values in option order", () => {
    const onValueChange = vi.fn();
    render(
      <FieldCheckboxGroup
        label="Notifications"
        options={options}
        value={["push"]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Email" }));
    expect(onValueChange).toHaveBeenCalledWith(["email", "push"]);
  });

  it("unchecks a value and works uncontrolled", () => {
    render(
      <FieldCheckboxGroup
        label="Notifications"
        options={options}
        defaultValue={["email", "sms"]}
      />,
    );
    const email = screen.getByRole("checkbox", { name: "Email" });
    expect(email).toHaveAttribute("aria-checked", "true");
    fireEvent.click(email);
    expect(email).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: "SMS" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("disables individual options", () => {
    render(
      <FieldCheckboxGroup
        options={[...options, { label: "Fax", value: "fax", disabled: true }]}
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Fax" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
