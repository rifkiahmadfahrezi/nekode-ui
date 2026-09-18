"use client";

import { useForm } from "@tanstack/react-form";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { z } from "zod";
import { DateRangePickerField } from "@/components/ui/date-range-picker-field";

const formSchema = z.object({
  tripDates: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((range) => range.from <= range.to, {
      message: "Please select a start and end date",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function DateRangePickerFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      tripDates: undefined,
    } as unknown as FormValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast("Form submitted!", {
        description: (
          <pre className="font-mono p-1 border m-2">
            {JSON.stringify(
              {
                from: value.tripDates.from?.toISOString().split("T")[0],
                to: value.tripDates.to?.toISOString().split("T")[0],
              },
              null,
              2,
            )}
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
      <form.Field name="tripDates">
        {(field) => (
          <DateRangePickerField
            label="Trip dates"
            description="Select the start and end of your trip."
            value={field.state.value as DateRange | undefined}
            onValueChange={(range) =>
              field.handleChange(range as FormValues["tripDates"])
            }
            error={field.state.meta.errors[0]?.message}
            minDate={new Date()}
            triggerClassName="w-full"
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
