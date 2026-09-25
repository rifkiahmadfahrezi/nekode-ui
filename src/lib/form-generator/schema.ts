import { z } from "zod";
import type { FieldConfig, StepConfig } from "./types";

function zodTypeFor(field: FieldConfig): z.ZodTypeAny {
  switch (field.kind) {
    case "number": {
      const base = z.number({
        error: `${field.label || field.name} is required`,
      });
      return field.required ? base : base.optional();
    }
    case "date-picker": {
      const base = z.date({
        error: `${field.label || field.name} is required`,
      });
      return field.required ? base : base.optional();
    }
    case "date-range-picker": {
      const base = z.object({ from: z.date(), to: z.date() });
      return field.required ? base : base.optional();
    }
    case "combobox-multi": {
      const base = z.array(z.string());
      return field.required
        ? base.min(1, `${field.label || field.name} is required`)
        : base.optional();
    }
    case "date-multi-picker": {
      const base = z.array(z.date());
      return field.required
        ? base.min(1, `${field.label || field.name} is required`)
        : base.optional();
    }
    case "switch": {
      const base = z.boolean();
      return field.required ? base : base.optional();
    }
    case "file": {
      const base = z.array(z.instanceof(File));
      return field.required
        ? base.min(1, `${field.label || field.name} is required`)
        : base.optional();
    }
    default: {
      const base = z.string();
      return field.required
        ? base.min(1, `${field.label || field.name} is required`)
        : base.optional();
    }
  }
}

export function defaultValueFor(field: FieldConfig): unknown {
  switch (field.kind) {
    case "number":
    case "date-picker":
    case "date-range-picker":
      return undefined;
    case "date-multi-picker":
    case "combobox-multi":
      return [];
    case "file":
      return [];
    case "switch":
      return false;
    default:
      return "";
  }
}

export function buildFormSchema(steps: StepConfig[]) {
  const fields = steps.flatMap((step) => step.fields);
  const shape: Record<string, z.ZodTypeAny> = {};
  const defaultValues: Record<string, unknown> = {};
  for (const field of fields) {
    shape[field.name] = zodTypeFor(field);
    defaultValues[field.name] = defaultValueFor(field);
  }
  return { schema: z.object(shape), defaultValues };
}
