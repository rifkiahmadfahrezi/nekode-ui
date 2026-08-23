"use client"

import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { toast } from "sonner"
import { TimePickerField } from "@/registry/ui/time-picker-field"

/** Validate "HH:mm" strings with an optional min/max range. */
const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Please enter a valid time")

const formSchema = z.object({
  startTime: timeString,
  endTime: timeString,
})

type FormValues = z.infer<typeof formSchema>

export function TimePickerFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      startTime: "09:00",
      endTime: "17:00",
    } as FormValues,
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
      })
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      className="flex w-72 flex-col gap-4"
    >
      <form.Field name="startTime">
        {(field) => (
          <TimePickerField
            label="Start time"
            description="When the event begins."
            timeFormat="12h"
            value={field.state.value}
            onValueChange={(v) => field.handleChange(v)}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <form.Field name="endTime">
        {(field) => (
          <TimePickerField
            label="End time"
            description="When the event ends."
            timeFormat="24h"
            value={field.state.value}
            onValueChange={(v) => field.handleChange(v)}
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
  )
}
