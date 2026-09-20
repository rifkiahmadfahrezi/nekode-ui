"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";

const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your name"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  /** Called with valid values. Throw to show an error message above the button. */
  onSubmit?: (values: RegisterFormValues) => void | Promise<void>;
  /** Shows a "Sign in" link in the footer when set. */
  loginHref?: string;
}

export function RegisterForm({ onSubmit, loginHref }: RegisterFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitError, setSubmitError] = useState<string>();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    } as RegisterFormValues,
    // validate on blur first, then live once the user has tried to submit
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: registerSchema },
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
        <h2 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h2>
        <p className="text-sm text-muted-foreground">
          Fill in your details to get started.
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

      <form.Field name="password">
        {(field) => (
          <PasswordField
            label="Password"
            name="password"
            placeholder="Create a password"
            description="At least 8 characters, including a number."
            autoComplete="new-password"
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

      <form.Field name="confirmPassword">
        {(field) => (
          <PasswordField
            label="Confirm password"
            name="confirmPassword"
            placeholder="Repeat your password"
            autoComplete="new-password"
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
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        )}
      </form.Subscribe>

      {loginHref && (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a
            href={loginHref}
            className="whitespace-nowrap font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </a>
        </p>
      )}
    </form>
  );
}
