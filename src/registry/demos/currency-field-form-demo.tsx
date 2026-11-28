"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { CurrencyField } from "@/components/ui/currency-field";

const budgetSchema = z.object({
  budget: z
    .number({ error: "Enter a budget" })
    .min(100000, "The minimum budget is Rp 100.000"),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export function CurrencyFieldFormDemo() {
  const form = useForm({
    defaultValues: { budget: undefined } as unknown as BudgetFormValues,
    validators: { onSubmit: budgetSchema },
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
      <form.Field name="budget">
        {(field) => (
          <CurrencyField
            label="Project budget"
            required
            locale="id-ID"
            currency="IDR"
            value={field.state.value}
            onValueChange={(value) => field.handleChange(value as number)}
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
            {isSubmitting ? "Saving..." : "Save budget"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
