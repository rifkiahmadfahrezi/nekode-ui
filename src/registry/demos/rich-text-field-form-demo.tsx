"use client";

import { useForm } from "@tanstack/react-form";
import { useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { RichTextEditorHandle } from "@/components/ui/rich-text-editor";
import { RichTextField } from "@/components/ui/rich-text-field";

const postSchema = z.object({
  // An empty editor emits "", so min(1) works as "required".
  body: z.string().min(1, "Write something first"),
});

type PostFormValues = z.infer<typeof postSchema>;

// Stand-in for a real upload. Resolve with the stored file's public URL.
async function uploadImage(file: File) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return URL.createObjectURL(file);
}

export function RichTextFieldFormDemo() {
  const editorRef = useRef<RichTextEditorHandle>(null);
  const form = useForm({
    defaultValues: { body: "" } as PostFormValues,
    validators: { onChange: postSchema },
    onSubmit: async ({ value }) => {
      // Upload images added in deferred mode, then save the final HTML.
      const body =
        (await editorRef.current?.uploadPendingImages()) ?? value.body;
      toast("Form submitted!", {
        description: (
          <pre className="m-2 max-h-40 overflow-auto border p-1 font-mono whitespace-pre-wrap">
            {JSON.stringify({ body }, null, 2)}
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
      className="flex w-full max-w-xl flex-col gap-4"
    >
      <form.Field name="body">
        {(field) => (
          <RichTextField
            ref={editorRef}
            label="Post"
            required
            tools={["bold", "italic", "|", "bulletList", "|", "link", "image"]}
            uploadMode="deferred"
            onUpload={uploadImage}
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
