"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { MultiComboboxField } from "@/components/ui/multi-combobox-field";

const skills = [
  { label: "React", value: "react" },
  { label: "TypeScript", value: "typescript" },
  { label: "Node.js", value: "node" },
  { label: "PostgreSQL", value: "postgres" },
  { label: "Docker", value: "docker" },
];

const profileSchema = z.object({
  skills: z.array(z.string()).min(2, "Pick at least 2 skills"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function MultiComboboxFieldFormDemo() {
  const form = useForm({
    defaultValues: { skills: [] } as ProfileFormValues,
    validators: {
      onChange: profileSchema,
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
      <form.Field name="skills">
        {(field) => (
          <MultiComboboxField
            label="Skills"
            placeholder="Search skills"
            options={skills}
            value={field.state.value}
            onValueChange={field.handleChange}
            error={field.state.meta.errors[0]?.message}
            overflow="hide"
            required
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
            {isSubmitting ? "Saving..." : "Save profile"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
