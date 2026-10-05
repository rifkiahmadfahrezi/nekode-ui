"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  FieldCheckbox,
  FieldCheckboxGroup,
} from "@/components/ui/field-checkbox";

const formSchema = z.object({
  interests: z.array(z.string()).min(1, "Pick at least one topic"),
  terms: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function FieldCheckboxFormDemo() {
  const form = useForm({
    defaultValues: {
      interests: [],
      terms: false,
    } as FormValues,
    validators: {
      onSubmit: formSchema,
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
      className="grid gap-6 min-w-sm"
    >
      <form.Field name="interests">
        {(field) => (
          <FieldCheckboxGroup
            asCard
            required
            label="Topics you're interested in"
            value={field.state.value}
            onValueChange={field.handleChange}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
            options={[
              {
                value: "frontend",
                label: "Frontend",
                description: "React, CSS and design systems.",
              },
              {
                value: "backend",
                label: "Backend",
                description: "APIs, databases and queues.",
              },
              {
                value: "devops",
                label: "DevOps",
                description: "CI/CD, containers and cloud.",
              },
            ]}
          />
        )}
      </form.Field>

      <form.Field name="terms">
        {(field) => (
          <FieldCheckbox
            label="I agree to the terms and conditions"
            checked={field.state.value}
            onCheckedChange={field.handleChange}
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
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
