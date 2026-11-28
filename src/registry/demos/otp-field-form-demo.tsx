"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { OtpField } from "@/components/ui/otp-field";

const verifySchema = z.object({
  code: z.string().length(6, "Enter all 6 digits"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export function OtpFieldFormDemo() {
  const form = useForm({
    defaultValues: { code: "" } as VerifyFormValues,
    validators: { onSubmit: verifySchema },
    onSubmit: async ({ value }) => {
      toast("Code submitted!", {
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
      <form.Field name="code">
        {(field) => (
          <OtpField
            label="Verification code"
            required
            groupSize={3}
            value={field.state.value}
            onValueChange={field.handleChange}
            // Submit as soon as the last digit lands.
            onComplete={() => form.handleSubmit()}
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
            className="w-fit rounded-md bg-fd-primary px-3 py-1.5 text-sm text-fd-primary-foreground disabled:opacity-50"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
