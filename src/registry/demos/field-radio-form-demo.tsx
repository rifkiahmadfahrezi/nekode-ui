"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { FieldRadio } from "@/components/ui/field-radio";

const formSchema = z.object({
  plan: z.enum(["free", "pro", "enterprise"], {
    message: "Please select a plan",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function FieldRadioFormDemo() {
  const form = useForm({
    defaultValues: {
      plan: undefined,
    } as unknown as FormValues,
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
      className="grid gap-4 min-w-sm"
    >
      <form.Field name="plan">
        {(field) => (
          <FieldRadio
            asCard
            label="Subscription plan"
            value={field.state.value}
            onValueChange={(value) =>
              field.handleChange(value as FormValues["plan"])
            }
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
            options={[
              { value: "free", label: "Free", description: "$0 / month" },
              { value: "pro", label: "Pro", description: "$20 / month" },
              {
                value: "enterprise",
                label: "Enterprise",
                description: "Contact us",
              },
            ]}
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
