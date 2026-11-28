"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { TagsField } from "@/components/ui/tags-field";

const postSchema = z.object({
  tags: z
    .array(z.string().max(20, "Keep each tag under 20 characters"))
    .min(1, "Add at least one tag")
    .max(5, "Use 5 tags or fewer"),
});

type PostFormValues = z.infer<typeof postSchema>;

export function TagsFieldFormDemo() {
  const form = useForm({
    defaultValues: { tags: [] } as PostFormValues,
    validators: { onSubmit: postSchema },
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
      className="grid gap-4"
    >
      <form.Field name="tags">
        {(field) => (
          <TagsField
            label="Post tags"
            required
            maxTags={5}
            // Lowercase, and turn spaces into dashes: "Next JS" -> "next-js".
            transform={(tag) => tag.toLowerCase().replace(/\s+/g, "-")}
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
            {isSubmitting ? "Publishing..." : "Publish"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
