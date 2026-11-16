import { describe, expect, it } from "vitest";
import { generateFormCode, generateInstallCommand } from "./codegen";
import { DEFAULT_FORM_STYLE } from "./style";
import type { FormStyle, StepConfig } from "./types";

const steps: StepConfig[] = [
  {
    id: "a",
    title: "Step 1",
    fields: [
      { id: "1", kind: "text", name: "first", label: "First", required: true },
      {
        id: "2",
        kind: "text",
        name: "last",
        label: "Last",
        required: true,
        orientation: "horizontal",
      },
      {
        id: "3",
        kind: "switch",
        name: "news",
        label: "News",
        required: false,
        orientation: "horizontal",
      },
      {
        id: "4",
        kind: "textarea",
        name: "bio",
        label: "Bio",
        required: false,
        span: "full",
        className: "mt-2",
      },
    ],
  },
];

const style: FormStyle = {
  columns: 2,
  spacing: "compact",
  maxWidth: "lg",
  submitLabel: "Save profile",
  submitVariant: "secondary",
  buttonAlign: "end",
};

describe("generateFormCode styling", () => {
  it("keeps the single-column defaults", () => {
    const code = generateFormCode(steps);
    expect(code).toContain('className="grid w-full gap-6"');
    expect(code).toContain('<div className="grid grid-cols-1 gap-4">');
    // span is ignored in a single-column form, custom class still applies
    expect(code).toContain('<div className="mt-2">');
    expect(code).not.toContain("col-span");
  });

  it("applies form layout, field width and button options", () => {
    const code = generateFormCode(steps, style);
    expect(code).toContain('className="grid w-full gap-4 max-w-lg"');
    expect(code).toContain("grid-cols-1 md:grid-cols-2 gap-3");
    expect(code).toContain('<div className="md:col-span-full mt-2">');
    expect(code).toContain('<div className="flex gap-2 justify-end">');
    expect(code).toContain('variant="secondary"');
    expect(code).toContain('"Save profile"');
    expect(code).toContain('import { Button } from "@/components/ui/button";');
    expect(code).not.toContain("<button");
  });

  it("only passes orientation to kinds that support it", () => {
    const code = generateFormCode(steps, style);
    expect(code.match(/orientation="horizontal"/g)).toHaveLength(1);
  });

  it("stretches multi-step buttons for full width", () => {
    const code = generateFormCode(
      [...steps, { id: "b", title: "Step 2", fields: [] }],
      { ...DEFAULT_FORM_STYLE, buttonAlign: "full" },
    );
    expect(code).toContain('<div className="grid grid-cols-2 gap-2">');
    expect(code.match(/className="w-full"/g)).toHaveLength(3);
  });

  it("adds button to the install command", () => {
    expect(generateInstallCommand(steps, "https://example.com")).toMatch(
      /^npx shadcn@latest add button /,
    );
  });
});
