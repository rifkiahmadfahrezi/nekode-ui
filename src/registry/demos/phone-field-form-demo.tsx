"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { PhoneField } from "@/components/ui/phone-field";

const contactSchema = z.object({
  // E.164: a "+", then 8 to 15 digits in total.
  phone: z
    .string()
    .min(1, "Enter a phone number")
    .regex(/^\+\d{8,15}$/, "Enter a valid phone number"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function PhoneFieldFormDemo() {
  const form = useForm({
    defaultValues: { phone: "" } as ContactFormValues,
    validators: { onSubmit: contactSchema },
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
      <form.Field name="phone">
        {(field) => (
          <PhoneField
            label="WhatsApp number"
            required
            defaultCountry="ID"
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
            {isSubmitting ? "Saving..." : "Save contact"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
