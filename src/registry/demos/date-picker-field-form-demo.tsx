"use client"

import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { toast } from "sonner"
import { DatePickerField } from "@/registry/ui/date-picker-field"

const formSchema = z.object({
  birthdate: z.date({ error: "Please select a date" }),
  appointmentDate: z.date({ error: "Please select an appointment date" }),
})

type FormValues = z.infer<typeof formSchema>

export function DatePickerFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      birthdate: undefined,
      appointmentDate: undefined,
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
                birthdate: value.birthdate?.toISOString().split("T")[0],
                appointmentDate: value.appointmentDate
                  ?.toISOString()
                  .split("T")[0],
              },
              null,
              2
            )}
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
      <form.Field name="birthdate">
        {(field) => (
          <DatePickerField
            label="Date of birth"
            description="Must be 18 years or older."
            value={field.state.value}
            onValueChange={(date) => field.handleChange(date as Date)}
            error={field.state.meta.errors[0]?.message}
            maxDate={new Date()}
            triggerClassName="w-full"
          />
        )}
      </form.Field>

      <form.Field name="appointmentDate">
        {(field) => (
          <DatePickerField
            label="Appointment date"
            value={field.state.value}
            onValueChange={(date) => field.handleChange(date as Date)}
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
  )
}
