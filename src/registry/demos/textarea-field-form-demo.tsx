"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { TextareaField } from "@/components/ui/textarea-field";

const feedbackSchema = z.object({
  feedback: z
    .string()
    .min(10, "Give us at least 10 characters")
    .max(280, "Keep it under 280 characters"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export function TextareaFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      feedback: "",
    } as FeedbackFormValues,
    validators: {
      onChange: feedbackSchema,
    },
    onSubmit: async ({ value }) => {
      toast("Form submitted!`", {
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
      className="flex w-80 flex-col gap-4"
    >
      <form.Field name="feedback">
        {(field) => (
          <TextareaField
            label="Feedback"
            description="What could we improve?"
            showCount
            maxLength={280}
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
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
            {isSubmitting ? "Sending..." : "Send feedback"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
