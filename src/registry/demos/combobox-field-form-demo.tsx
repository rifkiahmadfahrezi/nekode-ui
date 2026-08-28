"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { ComboboxField } from "@/components/ui/combobox-field";

const assignees = [
  { label: "Alex Chen", value: "alex" },
  { label: "Priya Patel", value: "priya" },
  { label: "Jordan Reyes", value: "jordan" },
];

const labels = [
  { label: "Bug", value: "bug" },
  { label: "Feature", value: "feature" },
  { label: "Chore", value: "chore" },
];

const issueSchema = z.object({
  assignee: z.string().min(1, "Pick an assignee"),
  // `ComboboxField` reports `undefined` once cleared, so this stays
  // optional rather than requiring a value up front.
  label: z.string().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

export function ComboboxFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      assignee: "",
      label: undefined,
    } as IssueFormValues,
    validators: {
      onChange: issueSchema,
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
      <form.Field name="assignee">
        {(field) => (
          <ComboboxField
            label="Assignee"
            placeholder="Search teammates"
            options={assignees}
            value={field.state.value}
            onValueChange={(value) => field.handleChange(value ?? "")}
            error={field.state.meta.errors[0]?.message}
            required
          />
        )}
      </form.Field>

      <form.Field name="label">
        {(field) => (
          <ComboboxField
            label="Label"
            description="Optional — leave blank or clear it at any time."
            placeholder="Search labels"
            options={labels}
            value={field.state.value as string}
            onValueChange={field.handleChange}
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
            {isSubmitting ? "Creating issue..." : "Create issue"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
