"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  /** Called with valid values. Throw to show an error message above the button. */
  onSubmit?: (values: ForgotPasswordFormValues) => void | Promise<void>;
  /** Shows a "Back to sign in" link in the footer when set. */
  loginHref?: string;
}

const cardClass =
  "mx-auto flex w-full max-w-sm flex-col gap-5 rounded-xl border bg-card p-6 shadow-xs sm:p-8";

export function ForgotPasswordForm({
  onSubmit,
  loginHref,
}: ForgotPasswordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitError, setSubmitError] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();

  const form = useForm({
    defaultValues: { email: "" } as ForgotPasswordFormValues,
    // validate on blur first, then live once the user has tried to submit
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(undefined);
      try {
        await onSubmit?.(value);
        setSentTo(value.email);
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

  const backLink = loginHref && (
    <p className="text-center text-sm text-muted-foreground">
      <a
        href={loginHref}
        className="whitespace-nowrap font-medium text-foreground underline-offset-4 hover:underline"
      >
        Back to sign in
      </a>
    </p>
  );

  if (sentTo) {
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
            Check your email
          </h2>
          <p className="text-sm text-muted-foreground">
            We sent a password reset link to{" "}
            <span className="break-all font-medium text-foreground">
              {sentTo}
            </span>
            .
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            form.reset();
            setSentTo(undefined);
          }}
        >
          Use a different email
        </Button>
        {backLink}
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
        <h2 className="text-2xl font-semibold tracking-tight">
          Forgot your password?
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

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
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        )}
      </form.Subscribe>

      {backLink}
    </form>
  );
}
