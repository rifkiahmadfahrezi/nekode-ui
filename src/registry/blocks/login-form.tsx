"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  /** Called with valid values. Throw to show an error message above the button. */
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
  /** Shows a "Forgot password?" link when set. */
  forgotPasswordHref?: string;
  /** Shows a "Sign up" link in the footer when set. */
  registerHref?: string;
}

export function LoginForm({
  onSubmit,
  forgotPasswordHref,
  registerHref,
}: LoginFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitError, setSubmitError] = useState<string>();

  const form = useForm({
    defaultValues: { email: "", password: "" } as LoginFormValues,
    // validate on blur first, then live once the user has tried to submit
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: loginSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(undefined);
      try {
        await onSubmit?.(value);
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

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="mx-auto flex w-full max-w-sm flex-col gap-5 rounded-xl border bg-card p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue.
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

      <div className="flex flex-col gap-2">
        <form.Field name="password">
          {(field) => (
            <PasswordField
              label="Password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
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
        {forgotPasswordHref && (
          <a
            href={forgotPasswordHref}
            className="self-end text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </a>
        )}
      </div>

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
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        )}
      </form.Subscribe>

      {registerHref && (
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a
            href={registerHref}
            className="whitespace-nowrap font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </a>
        </p>
      )}
    </form>
  );
}
