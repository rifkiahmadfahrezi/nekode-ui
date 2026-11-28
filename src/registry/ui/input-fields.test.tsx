import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { CurrencyField } from "./currency-field";
import { OtpField } from "./otp-field";
import { PhoneField, parsePhoneNumber } from "./phone-field";
import { TagsField } from "./tags-field";

function Controlled<T>({
  initial,
  children,
}: {
  initial: T;
  children: (value: T, set: (v: T) => void) => React.ReactNode;
}) {
  const [value, setValue] = React.useState(initial);
  return <>{children(value, setValue)}</>;
}

describe("OtpField", () => {
  it("types across slots, skips non-digits and completes", async () => {
    const onComplete = vi.fn();
    const onValueChange = vi.fn();
    render(
      <OtpField
        label="Code"
        length={4}
        onValueChange={onValueChange}
        onComplete={onComplete}
      />,
    );
    const first = screen.getAllByRole("textbox")[0];
    expect(screen.getByRole("group", { name: /Code/ })).toBeInTheDocument();
    await userEvent.click(first);
    await userEvent.keyboard("1a234");
    expect(onValueChange).toHaveBeenLastCalledWith("1234");
    expect(onComplete).toHaveBeenCalledWith("1234");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("backspace clears and moves back; paste fills all slots", async () => {
    const onValueChange = vi.fn();
    render(<OtpField length={4} onValueChange={onValueChange} />);
    const slots = screen.getAllByRole("textbox");
    await userEvent.click(slots[0]);
    await userEvent.keyboard("12");
    await userEvent.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenLastCalledWith("1");
    await userEvent.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenLastCalledWith("");
    await userEvent.paste("98-76");
    expect(onValueChange).toHaveBeenLastCalledWith("9876");
    expect(slots.map((s) => (s as HTMLInputElement).value)).toEqual([
      "9",
      "8",
      "7",
      "6",
    ]);
  });
});

describe("PhoneField", () => {
  it("parses international numbers, preferring the given country on ties", () => {
    expect(parsePhoneNumber("+6281234").country?.code).toBe("ID");
    expect(parsePhoneNumber("+6281234").national).toBe("81234");
    expect(
      parsePhoneNumber("+14155550100", undefined, "US").country?.code,
    ).toBe("US");
    expect(
      parsePhoneNumber("+14155550100", undefined, "CA").country?.code,
    ).toBe("CA");
  });

  it("emits E.164 and drops the trunk zero", async () => {
    const onValueChange = vi.fn();
    render(<PhoneField label="Phone" onValueChange={onValueChange} />);
    const input = screen.getByLabelText(/Phone/);
    await userEvent.type(input, "0812");
    expect(input).toHaveValue("0812");
    expect(onValueChange).toHaveBeenLastCalledWith("+62812");
    await userEvent.clear(input);
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("switches country when a full number is pasted", async () => {
    const onValueChange = vi.fn();
    render(<PhoneField label="Phone" onValueChange={onValueChange} />);
    const input = screen.getByLabelText(/Phone/);
    await userEvent.click(input);
    await userEvent.paste("+44 20 7946 0958");
    expect(onValueChange).toHaveBeenLastCalledWith("+442079460958");
    expect(
      screen.getByRole("button", { name: /United Kingdom/ }),
    ).toBeInTheDocument();
  });

  it("auto-detects the country from a typed calling code", async () => {
    const onValueChange = vi.fn();
    render(
      <PhoneField
        label="Phone"
        defaultCountry="US"
        autoDetectCountry
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByLabelText(/Phone/);
    await userEvent.type(input, "62812");
    expect(screen.getByRole("button", { name: /Indonesia/ })).toBeVisible();
    expect(input).toHaveValue("812");
    expect(onValueChange).toHaveBeenLastCalledWith("+62812");
  });

  it("waits for the whole calling code and only detects once", async () => {
    render(<PhoneField label="Phone" defaultCountry="ID" autoDetectCountry />);
    const input = screen.getByLabelText(/Phone/);
    await userEvent.type(input, "35");
    expect(screen.getByRole("button", { name: /Indonesia/ })).toBeVisible();
    await userEvent.type(input, "1");
    expect(screen.getByRole("button", { name: /Portugal/ })).toBeVisible();
    // The local number "91…" must not switch to India now.
    await userEvent.type(input, "91234");
    expect(screen.getByRole("button", { name: /Portugal/ })).toBeVisible();
    expect(input).toHaveValue("91234");
  });

  it("switches country while a + code is typed, even without auto-detect", async () => {
    const onValueChange = vi.fn();
    render(<PhoneField label="Phone" onValueChange={onValueChange} />);
    const input = screen.getByLabelText(/Phone/);
    await userEvent.type(input, "+1");
    expect(screen.getByRole("button", { name: /United States/ })).toBeVisible();
    await userEvent.type(input, "4155550100");
    expect(onValueChange).toHaveBeenLastCalledWith("+14155550100");
  });

  it("does not auto-detect unless asked", async () => {
    render(<PhoneField label="Phone" defaultCountry="ID" />);
    const input = screen.getByLabelText(/Phone/);
    await userEvent.type(input, "81234");
    expect(screen.getByRole("button", { name: /Indonesia/ })).toBeVisible();
  });

  it("shows a controlled value", () => {
    render(<PhoneField label="Phone" value="+6591234567" />);
    expect(screen.getByLabelText(/Phone/)).toHaveValue("91234567");
    expect(screen.getByRole("button", { name: /Singapore/ })).toBeVisible();
  });
});

describe("TagsField", () => {
  it("adds on Enter and comma, dedupes, removes on Backspace", async () => {
    render(
      <Controlled<string[]> initial={[]}>
        {(value, set) => (
          <TagsField label="Tags" value={value} onValueChange={set} />
        )}
      </Controlled>,
    );
    const input = screen.getByLabelText(/Tags/);
    await userEvent.type(input, "react{Enter}vue,React,");
    expect(screen.getByRole("button", { name: "Remove react" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Remove vue" })).toBeVisible();
    expect(screen.queryAllByRole("button", { name: /Remove/ })).toHaveLength(2);
    await userEvent.type(input, "{Backspace}");
    expect(screen.queryAllByRole("button", { name: /Remove/ })).toHaveLength(1);
  });

  it("splits a pasted list and respects maxTags", async () => {
    const onValueChange = vi.fn();
    render(
      <TagsField label="Tags" maxTags={2} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByLabelText(/Tags/));
    await userEvent.paste("a, b, c");
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]);
  });
});

describe("CurrencyField", () => {
  it("groups thousands while typing and reports a number", async () => {
    const onValueChange = vi.fn();
    render(<CurrencyField label="Price" onValueChange={onValueChange} />);
    const input = screen.getByLabelText(/Price/);
    await userEvent.type(input, "1234567.891");
    expect(input).toHaveValue("1,234,567.89");
    expect(onValueChange).toHaveBeenLastCalledWith(1234567.89);
    fireEvent.blur(input);
    expect(input).toHaveValue("1,234,567.89");
  });

  it("uses the locale's separators and the currency's decimals", async () => {
    const onValueChange = vi.fn();
    render(
      <CurrencyField
        label="Harga"
        locale="id-ID"
        currency="IDR"
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByLabelText(/Harga/);
    await userEvent.type(input, "2500000,");
    expect(input).toHaveValue("2.500.000");
    expect(onValueChange).toHaveBeenLastCalledWith(2500000);
    expect(screen.getByText("Rp")).toBeInTheDocument();
  });

  it("pads decimals and clamps on blur, and shows controlled values", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <CurrencyField label="Price" max={100} onValueChange={onValueChange} />,
    );
    const input = screen.getByLabelText(/Price/);
    await userEvent.type(input, "250");
    fireEvent.blur(input);
    expect(input).toHaveValue("100.00");
    expect(onValueChange).toHaveBeenLastCalledWith(100);

    rerender(<CurrencyField label="Price" value={42.5} />);
    expect(screen.getByLabelText(/Price/)).toHaveValue("42.50");
  });
});
