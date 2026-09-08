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
      return undefined;
    case "file":
      return [];
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
