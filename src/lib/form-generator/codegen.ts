import { getRegistryRef } from "@/hooks/use-origin";
import { kindMeta } from "./field-kinds";
import {
  buttonRowClassName,
  DEFAULT_FORM_STYLE,
  fieldsGridClassName,
  fieldWrapperClassName,
  formClassName,
  supportsOrientation,
} from "./style";
import type { FieldConfig, FormStyle, StepConfig } from "./types";

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
    case "date-range-picker":
      return field.required
        ? `z.object({ from: z.date(), to: z.date() })`
        : `z.object({ from: z.date(), to: z.date() }).optional()`;
    case "date-multi-picker":
      return field.required
        ? `z.array(z.date()).min(1, ${jsStringLiteral(`${label} is required`)})`
        : `z.array(z.date()).optional()`;
    case "checkbox":
    case "switch":
      return field.required ? `z.boolean()` : `z.boolean().optional()`;
    case "checkbox-group":
    case "combobox-multi":
      return field.required
        ? `z.array(z.string()).min(1, ${jsStringLiteral(`${label} is required`)})`
        : `z.array(z.string()).optional()`;
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
    case "date-range-picker":
      return "undefined";
    case "date-multi-picker":
    case "combobox-multi":
    case "checkbox-group":
    case "file":
      return "[]";
    case "checkbox":
    case "switch":
      return "false";
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

const KINDS_WITHOUT_PLACEHOLDER = new Set<FieldConfig["kind"]>([
  "checkbox",
  "checkbox-group",
  "radio",
  "switch",
  "time-picker",
  "file",
]);

function fieldJsx(field: FieldConfig, style: FormStyle): string {
  const meta = kindMeta(field.kind);
  const common = [
    `label={${jsStringLiteral(field.label)}}`,
    field.description
      ? `description={${jsStringLiteral(field.description)}}`
      : null,
    field.placeholder && !KINDS_WITHOUT_PLACEHOLDER.has(field.kind)
      ? `placeholder={${jsStringLiteral(field.placeholder)}}`
      : null,
    field.orientation === "horizontal" && supportsOrientation(field.kind)
      ? `orientation="horizontal"`
      : null,
    `error={field.state.meta.errors[0]?.message}`,
  ].filter(Boolean);

  let valueProps: string[];
  switch (field.kind) {
    case "select":
    case "combobox":
    case "combobox-multi":
    case "checkbox-group":
    case "radio":
      valueProps = [
        `options={${optionsSource(field)}}`,
        `value={field.state.value}`,
        `onValueChange={field.handleChange}`,
      ];
      break;
    case "checkbox":
    case "switch":
      valueProps = [
        `checked={field.state.value}`,
        `onCheckedChange={field.handleChange}`,
      ];
      break;
    case "date-range-picker":
    case "date-multi-picker":
      valueProps = [
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

  const wrapper = fieldWrapperClassName(field, style);
  const pad = wrapper ? "  " : "";
  const props = [...common, ...valueProps]
    .map((line) => `${pad}            ${line}`)
    .join("\n");

  const jsx = `${pad}      <form.Field name={${jsStringLiteral(field.name)}}>
${pad}        {(field) => (
${pad}          <${meta.component}
${props}
${pad}          />
${pad}        )}
${pad}      </form.Field>`;

  if (!wrapper) return jsx;
  return `      <div className=${jsStringLiteral(wrapper)}>
${jsx}
      </div>`;
}

/** Re-indents a generated block by `extra` spaces. */
function indent(block: string, extra: number) {
  const space = " ".repeat(extra);
  return block
    .split("\n")
    .map((line) => (line ? space + line : line))
    .join("\n");
}

/** Extra Button attributes, each on its own line at `pad` indentation. */
function buttonAttrs(
  pad: string,
  variant: FormStyle["submitVariant"],
  full: boolean,
) {
  return [
    variant === "default" ? null : `variant="${variant}"`,
    full ? `className="w-full"` : null,
  ]
    .filter(Boolean)
    .map((attr) => `\n${pad}${attr}`)
    .join("");
}

export function generateFormCode(
  steps: StepConfig[],
  style: FormStyle = DEFAULT_FORM_STYLE,
  componentName = "GeneratedForm",
) {
  const fields = steps.flatMap((step) => step.fields);
  const isMultiStep = steps.length > 1;

  const usedKinds = Array.from(new Set(fields.map((f) => f.kind)));
  // Several kinds can share one module (e.g. FieldCheckbox and
  // FieldCheckboxGroup), so group components by import path.
  const componentsByPath = new Map<string, string[]>();
  for (const kind of usedKinds) {
    const meta = kindMeta(kind);
    const components = componentsByPath.get(meta.importPath) ?? [];
    components.push(meta.component);
    componentsByPath.set(meta.importPath, components);
  }
  componentsByPath.set("@/components/ui/button", ["Button"]);
  const imports = Array.from(componentsByPath)
    .map(
      ([importPath, components]) =>
        `import { ${components.join(", ")} } from "${importPath}";`,
    )
    .join("\n");

  const schemaLines = fields
    .map((field) => `  ${jsStringLiteral(field.name)}: ${zodSource(field)},`)
    .join("\n");

  const defaultValueLines = fields
    .map(
      (field) =>
        `      ${jsStringLiteral(field.name)}: ${defaultValueSource(field)},`,
    )
    .join("\n");

  const gridClass = jsStringLiteral(fieldsGridClassName(style));
  const stepBody = isMultiStep
    ? steps
        .map(
          (step, i) => `      {step === ${i} && (
        <div className=${gridClass}>
${step.fields.map((f) => indent(fieldJsx(f, style), 4)).join("\n")}
        </div>
      )}`,
        )
        .join("\n")
    : `      <div className=${gridClass}>
${fields.map((f) => indent(fieldJsx(f, style), 2)).join("\n")}
      </div>`;

  const full = style.buttonAlign === "full";
  const rowClass = jsStringLiteral(
    buttonRowClassName(style.buttonAlign, isMultiStep),
  );
  const submitLabel = style.submitLabel.trim() || "Submit";
  const submitButton = (
    pad: string,
  ) => `${pad}<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
${pad}  {([canSubmit, isSubmitting]) => (
${pad}    <Button
${pad}      type="submit"${buttonAttrs(`${pad}      `, style.submitVariant, full)}
${pad}      disabled={!canSubmit}
${pad}    >
${pad}      {isSubmitting ? "Submitting..." : ${jsStringLiteral(submitLabel)}}
${pad}    </Button>
${pad}  )}
${pad}</form.Subscribe>`;

  const navigation = isMultiStep
    ? `
      <div className=${rowClass}>
        <Button
          type="button"
          variant="outline"${full ? `\n          className="w-full"` : ""}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < ${steps.length - 1} ? (
          <Button
            type="button"${buttonAttrs("            ", style.submitVariant, full)}
            onClick={() => setStep((s) => Math.min(${steps.length - 1}, s + 1))}
          >
            Next
          </Button>
        ) : (
${submitButton("          ")}
        )}
      </div>`
    : `
      <div className=${rowClass}>
${submitButton("        ")}
      </div>`;

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
      className=${jsStringLiteral(formClassName(style))}
    >
${stepBody}
${navigation}
    </form>
  );
}
`;
}

/** One `shadcn add` command for every field component used. Empty string if no fields. */
export function generateInstallCommand(steps: StepConfig[], origin: string) {
  const names = Array.from(
    new Set(
      steps.flatMap((s) =>
        s.fields.map((f) => kindMeta(f.kind).importPath.split("/").pop()!),
      ),
    ),
  );
  if (!names.length) return "";
  // Plain name resolves from the default shadcn registry.
  names.unshift("button");
  return `npx shadcn@latest add ${names
    .map((n) => (n === "button" ? n : getRegistryRef(origin, n)))
    .join(" ")}`;
}
