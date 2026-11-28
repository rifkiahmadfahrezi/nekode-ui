"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { RangeSliderField, SliderField } from "@/components/ui/slider-field";

const filterSchema = z.object({
  budget: z
    .tuple([z.number(), z.number()])
    .refine(([from, to]) => to - from >= 100, "Keep at least $100 between"),
  rooms: z.number().min(1, "Pick at least 1 room"),
});

type FilterFormValues = z.infer<typeof filterSchema>;

export function SliderFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      budget: [300, 900],
      rooms: 0,
    } as FilterFormValues,
    validators: {
      onSubmit: filterSchema,
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
      className="grid w-full max-w-sm gap-6"
    >
      <form.Field name="budget">
        {(field) => (
          <RangeSliderField
            label="Budget per night"
            min={0}
            max={2000}
            step={50}
            formatValue={(value) => `$${value}`}
            value={field.state.value}
            onValueChange={field.handleChange}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <form.Field name="rooms">
        {(field) => (
          <SliderField
            label="Rooms"
            required
            min={0}
            max={6}
            showMinMax
            value={field.state.value}
            onValueChange={field.handleChange}
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
            {isSubmitting ? "Searching..." : "Search stays"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
