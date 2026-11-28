"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { ColorPickerField } from "@/components/ui/color-picker-field";

const hex = z.string().regex(/^#[0-9a-f]{6}$/i, "Pick a color");

const themeSchema = z.object({
  primary: hex,
  accent: hex,
});

type ThemeFormValues = z.infer<typeof themeSchema>;

export function ColorPickerFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      primary: "#0f172a",
      accent: "",
    } as ThemeFormValues,
    validators: {
      onSubmit: themeSchema,
    },
    onSubmit: async ({ value }) => {
      toast("Theme saved!", {
        description: (
          <pre className="font-mono p-1 border m-2">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
        closeButton: true,
      });
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="grid w-full max-w-xs gap-4"
    >
      <form.Field name="primary">
        {(field) => (
          <ColorPickerField
            label="Primary"
            required
            value={field.state.value}
            onValueChange={field.handleChange}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <form.Field name="accent">
        {(field) => (
          <ColorPickerField
            label="Accent"
            required
            presets={[
              "#f43f5e",
              "#f59e0b",
              "#10b981",
              "#0ea5e9",
              "#8b5cf6",
              "#d946ef",
            ]}
            value={field.state.value}
            onValueChange={field.handleChange}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting] as const}
      >
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-fd-primary px-3 py-1.5 text-sm text-fd-primary-foreground disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save theme"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
