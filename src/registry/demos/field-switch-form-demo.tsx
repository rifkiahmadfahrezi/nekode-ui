"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { FieldSwitch } from "@/components/ui/field-switch";

const formSchema = z.object({
  terms: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function FieldSwitchFormDemo() {
  const form = useForm({
    defaultValues: {
      terms: false,
    } as FormValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      form.setFieldValue("terms", false);
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
      <form.Field name="terms">
        {(field) => (
          <FieldSwitch
            asCard
            label="Accept terms and conditions"
            description="You agree to our Terms of Service and Privacy Policy."
            checked={field.state.value}
            onCheckedChange={(checked) => field.handleChange(checked)}
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
