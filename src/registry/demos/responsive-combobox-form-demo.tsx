"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { ResponsiveCombobox } from "@/components/ui/responsive-combobox";

const cities = [
  { label: "Jakarta", value: "jakarta" },
  { label: "Bandung", value: "bandung" },
  { label: "Surabaya", value: "surabaya" },
  { label: "Yogyakarta", value: "yogyakarta" },
  { label: "Medan", value: "medan" },
  { label: "Makassar", value: "makassar" },
];

const shippingSchema = z.object({
  city: z.string().min(1, "Pick a city"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export function ResponsiveComboboxFormDemo() {
  const form = useForm({
    defaultValues: { city: "" } as ShippingFormValues,
    validators: {
      onChange: shippingSchema,
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
      className="flex w-72 flex-col gap-4"
    >
      <form.Field name="city">
        {(field) => (
          <ResponsiveCombobox
            label="Shipping city"
            placeholder="Select a city"
            searchPlaceholder="Search city..."
            options={cities}
            value={field.state.value}
            onValueChange={(value) => field.handleChange(value ?? "")}
            error={field.state.meta.errors[0]?.message}
            required
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
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
