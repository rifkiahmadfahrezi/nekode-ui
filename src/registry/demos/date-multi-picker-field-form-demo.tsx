"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { DateMultiPickerField } from "@/components/ui/date-multi-picker-field";

const formSchema = z.object({
  availability: z
    .array(z.date())
    .min(1, { message: "Select at least one date" }),
});

type FormValues = z.infer<typeof formSchema>;

export function DateMultiPickerFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      availability: [],
    } as FormValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast("Form submitted!", {
        description: (
          <pre className="font-mono p-1 border m-2">
            {JSON.stringify(
              value.availability.map((d) => d.toISOString().split("T")[0]),
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
      <form.Field name="availability">
        {(field) => (
          <DateMultiPickerField
            label="Availability"
            description="Select every date you're available."
            value={field.state.value}
            onValueChange={(dates) => field.handleChange(dates ?? [])}
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
