"use client"

import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { NumberField } from "@/components/ui/number-field"
import { toast } from "sonner"

const productSchema = z.object({
  price: z
    .number({ error: "Enter a price" })
    .min(0, "Price can't be negative")
    .max(100000, "Price is too high"),
  quantity: z
    .number({ error: "Enter a quantity" })
    .int("Quantity must be a whole number")
    .min(1, "At least 1 unit is required"),
})

type ProductFormValues = z.infer<typeof productSchema>

export function NumberFieldFormDemo() {
  const form = useForm({
    defaultValues: {
      price: 0,
      quantity: 1,
    } as ProductFormValues,
    validators: {
      onSubmit: productSchema,
    },
    onSubmit: async ({ value }) => {
      toast("Form submitted!`", {
        description: <pre className="font-mono p-1 border m-2">{JSON.stringify(value, null, 2)}</pre>,
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
      className="grid gap-4"
    >
      <form.Field name="price">
        {(field) => (
          <NumberField
            label="Price"
            leftSection={<span className="text-sm">$</span>}
            decimal
            decimalPlaces={2}
            min={0}
            value={field.state.value}
            onValueChange={(value) => field.handleChange(value ?? 0)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <form.Field name="quantity">
        {(field) => (
          <NumberField
            label="Quantity"
            decimal={false}
            min={1}
            step={1}
            value={field.state.value}
            onValueChange={(value) => field.handleChange(value ?? 1)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-fd-primary px-3 py-1.5 text-sm text-fd-primary-foreground disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save product"}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}