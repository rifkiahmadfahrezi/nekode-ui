import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MultiStepRegisterForm } from "./multi-step-register-form";

describe("MultiStepRegisterForm", () => {
  it("blocks Continue until the current step is valid", async () => {
    const user = userEvent.setup();
    render(<MultiStepRegisterForm />);
    const next = screen.getByRole("button", { name: /continue/i });

    await user.click(next);
    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Account" }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.type(screen.getByLabelText("Confirm password"), "secret124");
    await user.click(next);
    expect(
      await screen.findByText("Passwords don't match"),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Confirm password"));
    await user.type(screen.getByLabelText("Confirm password"), "secret123");
    await user.click(next);
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeInTheDocument();
    // next step's fields are not flagged before the user touches them
    expect(screen.queryByText("Enter your full name")).not.toBeInTheDocument();

    // picking a value must not surface the stale "required" error from Continue
    await user.click(screen.getByLabelText("Date of birth"));
    const day = screen
      .getAllByRole("button")
      .find((b) => b.textContent === "1" && !b.closest("[data-outside]"));
    await user.click(day as HTMLElement);
    expect(
      screen.queryByText("Pick your date of birth"),
    ).not.toBeInTheDocument();
  });
});
