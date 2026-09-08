import { kindMeta } from "./field-kinds";
import type { FieldConfig, StepConfig } from "./types";

function jsStringLiteral(value: string) {
  return JSON.stringify(value);
}

function zodSource(field: FieldConfig): string {
  const label = field.label || field.name;
  switch (field.kind) {
    case "number":
      return field.required
        ? `z.number({ error: ${jsStringLiteral(`${label} is required`)} })`
        : `z.number().optional()`;
    case "date-picker":
      return field.required
        ? `z.date({ error: ${jsStringLiteral(`${label} is required`)} })`
        : `z.date().optional()`;
    case "file":
      return field.required
        ? `z.array(z.instanceof(File)).min(1, ${jsStringLiteral(`${label} is required`)})`
        : `z.array(z.instanceof(File)).optional()`;
    default:
      return field.required
        ? `z.string().min(1, ${jsStringLiteral(`${label} is required`)})`
        : `z.string().optional()`;
  }
}

function defaultValueSource(field: FieldConfig): string {
  switch (field.kind) {
    case "number":
    case "date-picker":
      return "undefined";
    case "file":
      return "[]";
    default:
      return `""`;
  }
}

function optionsSource(field: FieldConfig): string {
  const options = field.options?.length
    ? field.options
    : [{ label: "Option 1", value: "option-1" }];
  return `[\n${options
    .map(
      (opt) =>
        `        { label: ${jsStringLiteral(opt.label)}, value: ${jsStringLiteral(opt.value)} },`,
    )
    .join("\n")}\n      ]`;
}

function fieldJsx(field: FieldConfig): string {
  const meta = kindMeta(field.kind);
  const common = [
    `label={${jsStringLiteral(field.label)}}`,
    field.description
      ? `description={${jsStringLiteral(field.description)}}`
      : null,
    field.placeholder
      ? `placeholder={${jsStringLiteral(field.placeholder)}}`
      : null,
    `error={field.state.meta.errors[0]?.message}`,
  ].filter(Boolean);

  let valueProps: string[];
  switch (field.kind) {
    case "select":
    case "combobox":
      valueProps = [
        `options={${optionsSource(field)}}`,
        `value={field.state.value}`,
        `onValueChange={field.handleChange}`,
      ];
      break;
    case "number":
      valueProps = [
        `value={field.state.value}`,
        `onValueChange={field.handleChange}`,
        `onBlur={field.handleBlur}`,
      ];
      break;
    case "date-picker":
      valueProps = [
        `value={field.state.value}`,
        `onValueChange={field.handleChange}`,
      ];
      break;
    case "time-picker":
      valueProps = [
        `value={field.state.value}`,
        `onValueChange={field.handleChange}`,
      ];
      break;
    case "file":
      valueProps = [
        `value={field.state.value}`,
        `onValueChange={field.handleChange}`,
      ];
      break;
    default:
      valueProps = [
        `value={field.state.value}`,
        `onChange={(event) => field.handleChange(event.currentTarget.value)}`,
        `onBlur={field.handleBlur}`,
      ];
  }

  const props = [...common, ...valueProps]
    .map((line) => `          ${line}`)
    .join("\n");

  return `      <form.Field name={${jsStringLiteral(field.name)}}>
        {(field) => (
          <${meta.component}
${props}
          />
        )}
      </form.Field>`;
}

export function generateFormCode(
  steps: StepConfig[],
  componentName = "GeneratedForm",
) {
  const fields = steps.flatMap((step) => step.fields);
  const isMultiStep = steps.length > 1;

  const usedKinds = Array.from(new Set(fields.map((f) => f.kind)));
  const imports = usedKinds
    .map((kind) => {
      const meta = kindMeta(kind);
      return `import { ${meta.component} } from "${meta.importPath}";`;
    })
    .join("\n");

  const schemaLines = fields
    .map((field) => `  ${jsStringLiteral(field.name)}: ${zodSource(field)},`)
    .join("\n");

  const defaultValueLines = fields
    .map(
      (field) =>
        `    ${jsStringLiteral(field.name)}: ${defaultValueSource(field)},`,
    )
    .join("\n");

  const stepBody = isMultiStep
    ? steps
        .map(
          (step, i) => `      {step === ${i} && (
        <div className="grid gap-4">
${step.fields.map(fieldJsx).join("\n")}
        </div>
      )}`,
        )
        .join("\n")
    : `      <div className="grid gap-4">
${fields.map(fieldJsx).join("\n")}
      </div>`;

  const navigation = isMultiStep
    ? `
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Back
        </button>
        {step < ${steps.length - 1} ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(${steps.length - 1}, s + 1))}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Next
          </button>
        ) : (
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </form.Subscribe>
        )}
      </div>`
    : `
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </form.Subscribe>`;

  return `"use client";

import { useForm } from "@tanstack/react-form";
${isMultiStep ? 'import { useState } from "react";\n' : ""}import { z } from "zod";
${imports}

const formSchema = z.object({
${schemaLines}
});

type FormValues = z.infer<typeof formSchema>;

export function ${componentName}() {
${isMultiStep ? "  const [step, setStep] = useState(0);\n" : ""}  const form = useForm({
    defaultValues: {
${defaultValueLines}
    } as FormValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="grid gap-6"
    >
${stepBody}
${navigation}
    </form>
  );
}
`;
}
