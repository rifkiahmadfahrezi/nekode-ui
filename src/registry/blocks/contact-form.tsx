"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { TextareaField } from "@/components/ui/textarea-field";

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  message: z
    .string()
    .min(10, "Write at least 10 characters")
    .max(500, "Keep it under 500 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export interface ContactFormProps {
  /** Called with valid values. Throw to show an error message above the button. */
  onSubmit?: (values: ContactFormValues) => void | Promise<void>;
}

const cardClass =
  "mx-auto flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-6 shadow-xs sm:p-8";

export function ContactForm({ onSubmit }: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitError, setSubmitError] = useState<string>();
  const [sent, setSent] = useState(false);

  const form = useForm({
    defaultValues: { name: "", email: "", message: "" } as ContactFormValues,
    // validate on blur first, then live once the user has tried to submit
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: contactSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(undefined);
      try {
        await onSubmit?.(value);
        setSent(true);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        );
      }
    },
    onSubmitInvalid: () => {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>("[aria-invalid='true']")
          ?.focus(),
      );
    },
  });

  if (sent) {
    return (
      // focus moves here so screen readers announce the confirmation
      <div
        tabIndex={-1}
        ref={(node) => node?.focus()}
        className={`${cardClass} items-center text-center outline-none`}
      >
        <CircleCheck className="size-10 text-emerald-500" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Message sent
          </h2>
          <p className="text-sm text-muted-foreground">
            Thanks for reaching out. We'll get back to you soon.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            form.reset();
            setSent(false);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className={cardClass}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Contact us</h2>
        <p className="text-sm text-muted-foreground">
          Send a message and we'll get back to you.
        </p>
      </div>

      <form.Field name="name">
        {(field) => (
          <TextField
            label="Name"
            name="name"
            placeholder="Jane Doe"
            autoComplete="name"
            autoCapitalize="words"
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]?.message
                : undefined
            }
          />
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <TextField
            label="Email"
            name="email"
            placeholder="you@example.com"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]?.message
                : undefined
            }
          />
        )}
      </form.Field>

      <form.Field name="message">
        {(field) => (
          <TextareaField
            label="Message"
            name="message"
            placeholder="How can we help?"
            showCount
            maxLength={500}
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]?.message
                : undefined
            }
          />
        )}
      </form.Field>

      {submitError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting && (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            )}
            {isSubmitting ? "Sending..." : "Send message"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
