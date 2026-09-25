import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComboboxField } from "./combobox-field";
import { ComboboxMultiField } from "./combobox-multi-field";
import { SelectField } from "./select-field";

const options = [
  { label: "United States", value: "us" },
  { label: "Indonesia", value: "id" },
];

function formValues(container: HTMLElement, name: string) {
  return new FormData(
    container.querySelector("form") as HTMLFormElement,
  ).getAll(name);
}

describe("option fields: form gets value, UI shows label", () => {
  it("SelectField", () => {
    const { container } = render(
      <form>
        <SelectField
          label="Country"
          name="country"
          options={options}
          value="id"
        />
      </form>,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Indonesia");
    expect(screen.getByRole("combobox")).not.toHaveTextContent(/^id$/);
    expect(formValues(container, "country")).toEqual(["id"]);
  });

  it("ComboboxField", () => {
    const { container } = render(
      <form>
        <ComboboxField
          label="Country"
          name="country"
          options={options}
          value="id"
          onValueChange={() => {}}
        />
      </form>,
    );
    expect(screen.getByLabelText("Country")).toHaveValue("Indonesia");
    expect(formValues(container, "country")).toEqual(["id"]);
  });

  it("ComboboxMultiField", () => {
    const { container } = render(
      <form>
        <ComboboxMultiField
          label="Countries"
          name="countries"
          options={options}
          value={["us", "id"]}
          onValueChange={() => {}}
        />
      </form>,
    );
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("Indonesia")).toBeInTheDocument();
    expect(formValues(container, "countries")).toEqual(["us", "id"]);
  });
});
