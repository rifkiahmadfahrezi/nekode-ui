"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { SelectField } from "@/registry/ui/select-field";

const settingsSchema = z.object({
  role: z.string().min(1, "Select a role"),
  teamSize: z
    .number({ error: "Select a team size" })
    .min(1, "Select a team size"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SelectFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      role: "",
      teamSize: 0,
    } as SettingsFormValues,
    validators: {
      onSubmit: settingsSchema,
    },
    onSubmit: async ({ value }) => {
      toast("Form submitted!", {
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
      className="flex w-72 flex-col gap-4"
    >
      {/* String value: the field's value and the schema's type match, so
          field.state.value passes straight through. */}
      <form.Field name="role">
        {(field) => (
          <SelectField
            label="Role"
            placeholder="Select a role"
            options={[
              { label: "Admin", value: "admin" },
              { label: "Editor", value: "editor" },
              { label: "Viewer", value: "viewer" },
            ]}
            value={field.state.value}
            onValueChange={field.handleChange}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      {/* Number value: cast the field's number to a string going in, and
          parse the selected string back into a number going out. */}
      <form.Field name="teamSize">
        {(field) => (
          <SelectField
            label="Team size"
            placeholder="Select a team size"
            options={[
              { label: "1–5 people", value: "5" },
              { label: "6–20 people", value: "20" },
              { label: "21–50 people", value: "50" },
              { label: "50+ people", value: "100" },
            ]}
            value={field.state.value ? String(field.state.value) : undefined}
            onValueChange={(value) => field.handleChange(Number(value))}
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
            {isSubmitting ? "Saving..." : "Save settings"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
