"use client";

// Scaffolded with the nekode/ui Form Generator (3 steps), then extended with
// per-step validation, a step rail, and success/error states.

import { revalidateLogic, useForm } from "@tanstack/react-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { FieldRadio } from "@/components/ui/field-radio";
import { FieldSwitch } from "@/components/ui/field-switch";
import { PasswordField } from "@/components/ui/password-field";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { cn } from "@/lib/utils";

const formSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    fullName: z.string().trim().min(1, "Enter your full name"),
    birthDate: z.date({ error: "Pick your date of birth" }),
    country: z.string().min(1, "Select your country"),
    plan: z.string().min(1, "Choose a plan"),
    newsletter: z.boolean(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
    // run even while other steps are still empty
    when: ({ value }) =>
      typeof value === "object" &&
      value !== null &&
      "confirmPassword" in value &&
      Boolean(value.confirmPassword),
  });

export type MultiStepRegisterFormValues = z.infer<typeof formSchema>;
type FieldName = keyof MultiStepRegisterFormValues;

const steps: {
  title: string;
  description: string;
  fields: FieldName[];
}[] = [
  {
    title: "Account",
    description: "Your sign-in details.",
    fields: ["email", "password", "confirmPassword"],
  },
  {
    title: "Profile",
    description: "Tell us a little about you.",
    fields: ["fullName", "birthDate", "country"],
  },
  {
    title: "Plan",
    description: "Pick what fits. Change it anytime.",
    fields: ["plan", "newsletter"],
  },
];

const defaultCountries = [
  { label: "Indonesia", value: "id" },
  { label: "Malaysia", value: "my" },
  { label: "Singapore", value: "sg" },
  { label: "United States", value: "us" },
  { label: "United Kingdom", value: "gb" },
];

const defaultPlans = [
  {
    label: "Starter",
    value: "starter",
    description: "Free for side projects.",
  },
  { label: "Pro", value: "pro", description: "$12/mo. For growing teams." },
  {
    label: "Enterprise",
    value: "enterprise",
    description: "Custom pricing and SSO.",
  },
];

export interface MultiStepRegisterFormProps {
  /** Called with valid values on the last step. Throw to show an error message. */
  onSubmit?: (values: MultiStepRegisterFormValues) => void | Promise<void>;
  /** Options for the country select. */
  countries?: { label: string; value: string }[];
  /** Options for the plan picker. */
  plans?: { label: string; value: string; description?: string }[];
  /** Shows a "Sign in" link when set. */
  loginHref?: string;
  className?: string;
}

export function MultiStepRegisterForm({
  onSubmit,
  countries = defaultCountries,
  plans = defaultPlans,
  loginHref,
  className,
}: MultiStepRegisterFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string>();
  const [done, setDone] = useState(false);
  const isLast = step === steps.length - 1;

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      birthDate: undefined,
      country: "",
      plan: "",
      newsletter: false,
    } as unknown as MultiStepRegisterFormValues,
    // validate on blur first, then live once the user has tried to submit
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: formSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(undefined);
      try {
        await onSubmit?.(value);
        setDone(true);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        );
      }
    },
    onSubmitInvalid: focusFirstInvalid,
  });

  function focusFirstInvalid() {
    requestAnimationFrame(() =>
      formRef.current
        ?.querySelector<HTMLElement>("[aria-invalid='true']")
        ?.focus(),
    );
  }

  // Move focus to the new step heading so screen readers announce it.
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) headingRef.current?.focus();
    mounted.current = true;
  }, [step]);

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  async function next() {
    const fields = steps[step].fields;
    for (const name of fields)
      form.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }));
    await form.validate("blur");
    const issues = formSchema.safeParse(form.state.values).error?.issues ?? [];
    if (issues.some((issue) => fields.includes(issue.path[0] as FieldName))) {
      focusFirstInvalid();
      return;
    }
    setStep((s) => s + 1);
  }

  // Picking from a popup is a finished choice, so validate right away like a
  // blur. Otherwise the error Continue stored for this untouched field shows up
  // stale the moment it becomes touched.
  function commit<T>(
    field: { handleChange: (value: T) => void; handleBlur: () => void },
    value: T,
  ) {
    field.handleChange(value);
    field.handleBlur();
  }

  function errorOf(meta: { isTouched: boolean; errors: unknown[] }) {
    if (!meta.isTouched) return undefined;
    return (meta.errors[0] as { message?: string } | undefined)?.message;
  }

  if (done) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className={cn(
          "mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-xs outline-none",
          className,
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CircleCheck className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            You're all set
          </h2>
          <p className="text-sm text-muted-foreground">
            Welcome, {form.state.values.fullName.split(" ")[0]}. Check{" "}
            <span className="break-all font-medium text-foreground">
              {form.state.values.email}
            </span>{" "}
            to verify your account.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            form.reset();
            setStep(0);
            setDone(false);
          }}
        >
          Register another account
        </Button>
      </div>
    );
  }

  const current = steps[step];

  return (
    <div
      className={cn(
        "@container mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-xs",
        className,
      )}
    >
      <div className="grid @2xl:grid-cols-[15rem_1fr]">
        {/* Step rail: compact progress on narrow, vertical list on wide */}
        <aside className="relative flex flex-col gap-6 border-b bg-muted/40 p-6 @2xl:border-r @2xl:border-b-0 @2xl:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
          />
          <div className="relative flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sign up
            </p>
            <p className="text-lg font-semibold tracking-tight">
              Create your account
            </p>
          </div>

          <div className="relative flex gap-1.5 @2xl:hidden" aria-hidden="true">
            {steps.map((s, i) => (
              <span
                key={s.title}
                className={cn(
                  "h-1.5 flex-1 rounded-full bg-border transition-colors",
                  i <= step && "bg-primary",
                )}
              />
            ))}
          </div>

          <nav aria-label="Registration progress" className="relative">
            <ol className="hidden flex-col @2xl:flex">
              {steps.map((s, i) => {
                const state =
                  i < step ? "complete" : i === step ? "current" : "upcoming";
                return (
                  <li
                    key={s.title}
                    aria-current={state === "current" ? "step" : undefined}
                    className="relative flex gap-3 pb-7 last:pb-0"
                  >
                    {i < steps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute top-8 bottom-1 left-[0.9375rem] w-px bg-border",
                          state === "complete" && "bg-primary",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "relative flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-medium text-muted-foreground transition-colors",
                        state === "current" &&
                          "border-primary text-primary ring-4 ring-primary/15",
                        state === "complete" &&
                          "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {state === "complete" ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col pt-1">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          state === "upcoming" && "text-muted-foreground",
                        )}
                      >
                        {s.title}
                        <span className="sr-only">
                          {state === "complete" ? " (completed)" : ""}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {s.description}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>

          {loginHref && (
            <p className="relative mt-auto hidden text-sm text-muted-foreground @2xl:block">
              Already have an account?{" "}
              <a
                href={loginHref}
                className="whitespace-nowrap font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </a>
            </p>
          )}
        </aside>

        <form
          ref={formRef}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (isLast) form.handleSubmit();
            else next();
          }}
          className="flex min-w-0 flex-col gap-6 p-6 @2xl:p-10"
        >
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">
              Step {step + 1} of {steps.length}
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-semibold tracking-tight outline-none"
            >
              {current.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {current.description}
            </p>
          </div>

          <div
            key={step}
            className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-2 duration-300 motion-reduce:animate-none"
          >
            {step === 0 && (
              <>
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
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      error={errorOf(field.state.meta)}
                    />
                  )}
                </form.Field>
                <form.Field name="password">
                  {(field) => (
                    <PasswordField
                      label="Password"
                      name="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      error={errorOf(field.state.meta)}
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
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      error={errorOf(field.state.meta)}
                    />
                  )}
                </form.Field>
              </>
            )}

            {step === 1 && (
              <>
                <form.Field name="fullName">
                  {(field) => (
                    <TextField
                      label="Full name"
                      name="fullName"
                      placeholder="Jane Doe"
                      autoComplete="name"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      error={errorOf(field.state.meta)}
                    />
                  )}
                </form.Field>
                <form.Field name="birthDate">
                  {(field) => (
                    <DatePickerField
                      label="Date of birth"
                      name="birthDate"
                      placeholder="Pick a date"
                      maxDate={new Date()}
                      value={field.state.value}
                      onValueChange={(date) => commit(field, date as Date)}
                      error={errorOf(field.state.meta)}
                    />
                  )}
                </form.Field>
                <form.Field name="country">
                  {(field) => (
                    <SelectField
                      label="Country"
                      name="country"
                      placeholder="Select a country"
                      options={countries}
                      value={field.state.value}
                      onValueChange={(value) => commit(field, value)}
                      error={errorOf(field.state.meta)}
                    />
                  )}
                </form.Field>
              </>
            )}

            {step === 2 && (
              <>
                <form.Field name="plan">
                  {(field) => (
                    <FieldRadio
                      label="Plan"
                      name="plan"
                      asCard
                      options={plans}
                      value={field.state.value}
                      onValueChange={(value) => commit(field, value)}
                      onBlur={field.handleBlur}
                      error={errorOf(field.state.meta)}
                    />
                  )}
                </form.Field>
                <form.Field name="newsletter">
                  {(field) => (
                    <FieldSwitch
                      label="Product updates"
                      description="A short email when we ship something new."
                      name="newsletter"
                      asCard
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  )}
                </form.Field>
              </>
            )}
          </div>

          {submitError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <CircleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              {submitError}
            </p>
          )}

          <div className="mt-auto flex flex-col-reverse gap-3 border-t pt-6 @md:flex-row @md:items-center @md:justify-between">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => setStep((s) => s - 1)}
              >
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>
            ) : (
              loginHref && (
                <p className="text-center text-sm text-muted-foreground @2xl:hidden">
                  Already have an account?{" "}
                  <a
                    href={loginHref}
                    className="whitespace-nowrap font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Sign in
                  </a>
                </p>
              )
            )}
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  size="lg"
                  className="@md:ml-auto"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting && (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  )}
                  {isLast
                    ? isSubmitting
                      ? "Creating account..."
                      : "Create account"
                    : "Continue"}
                  {!isLast && <ArrowRight aria-hidden="true" />}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
}
