"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { RatingField } from "@/components/ui/rating-field";
import { TextareaField } from "@/components/ui/textarea-field";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please pick a rating"),
  comment: z.string().max(200, "Keep it under 200 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export function RatingFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      rating: 0,
      comment: "",
    } as ReviewFormValues,
    validators: {
      onSubmit: reviewSchema,
    },
    onSubmit: async ({ value }) => {
      toast("Review submitted!", {
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
      className="grid w-full max-w-sm gap-4"
    >
      <form.Field name="rating">
        {(field) => (
          <RatingField
            label="Rating"
            required
            value={field.state.value}
            onValueChange={field.handleChange}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <form.Field name="comment">
        {(field) => (
          <TextareaField
            label="Comment"
            placeholder="What did you like?"
            value={field.state.value}
            onChange={(event) => field.handleChange(event.currentTarget.value)}
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
            {isSubmitting ? "Sending..." : "Send review"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
