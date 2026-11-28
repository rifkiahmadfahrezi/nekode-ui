"use client";

import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type OtpFieldPattern = "numeric" | "alphanumeric";

export interface OtpFieldProps {
  label?: string;
  description?: string;
  error?: string;
  /** Number of slots. Defaults to `6`. */
  length?: number;
  /** Which characters a slot accepts. Defaults to `"numeric"`. */
  pattern?: OtpFieldPattern;
  /** Hide typed characters (e.g. for a PIN). Defaults to `false`. */
  mask?: boolean;
  /**
   * Split the slots into groups of this size with a separator in between,
   * e.g. `3` renders `000-000` for a 6-digit code.
   */
  groupSize?: number;
  value?: string;
  defaultValue?: string;
  /** Called with the full code (only the slots filled so far, no gaps). */
  onValueChange?: (value: string) => void;
  /** Called once every slot is filled. */
  onComplete?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  /** Base for each slot's id; the first slot uses `id` itself so a label can target it. */
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  /** Passed to the underlying `Field` wrapper. */
  fieldClassName?: string;
  labelClassName?: string;
  /** Applied to every slot `<input>`. */
  slotClassName?: string;
  className?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

const PATTERNS: Record<OtpFieldPattern, RegExp> = {
  numeric: /[^0-9]/g,
  alphanumeric: /[^0-9a-zA-Z]/g,
};

function sanitize(raw: string, pattern: OtpFieldPattern, length: number) {
  const clean = raw.replace(PATTERNS[pattern], "");
  return (pattern === "alphanumeric" ? clean.toUpperCase() : clean).slice(
    0,
    length,
  );
}

export const OtpField = React.forwardRef<HTMLInputElement, OtpFieldProps>(
  (
    {
      label,
      description,
      error,
      length = 6,
      pattern = "numeric",
      mask = false,
      groupSize,
      value,
      defaultValue,
      onValueChange,
      onComplete,
      onBlur,
      id,
      name,
      disabled,
      required,
      autoFocus,
      fieldClassName,
      labelClassName,
      slotClassName,
      className,
      orientation = "vertical",
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const labelId = `${inputId}-label`;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = description ? descriptionId : undefined;

    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(() =>
      sanitize(defaultValue ?? "", pattern, length),
    );
    const code = isControlled ? sanitize(value, pattern, length) : internal;

    const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

    const focusSlot = (index: number) => {
      const clamped = Math.max(0, Math.min(length - 1, index));
      const el = inputsRef.current[clamped];
      el?.focus();
      el?.select();
    };

    const update = (next: string) => {
      const clean = sanitize(next, pattern, length);
      if (!isControlled) setInternal(clean);
      onValueChange?.(clean);
      if (clean.length === length && clean !== code) onComplete?.(clean);
      return clean;
    };

    /** Write `chars` starting at `index`, keeping the code gap-free. */
    const writeAt = (index: number, chars: string) => {
      // Never leave a hole: typing into slot 4 of an empty code fills slot 1.
      const start = Math.min(index, code.length);
      const next =
        code.slice(0, start) + chars + code.slice(start + chars.length);
      const clean = update(next);
      focusSlot(Math.min(start + chars.length, clean.length, length - 1));
    };

    const handleChange =
      (index: number): React.ChangeEventHandler<HTMLInputElement> =>
      (event) => {
        const typed = sanitize(event.target.value, pattern, length);
        if (!typed) return;
        // A filled slot receives its old char plus the new one; keep the new
        // one. Anything longer is an autofill/IME dump of the whole code.
        let chars = typed;
        if (code[index] && typed.length === 2) {
          chars = typed[0] === code[index] ? typed[1] : typed[0];
        }
        writeAt(index, chars);
      };

    const handleKeyDown =
      (index: number): React.KeyboardEventHandler<HTMLInputElement> =>
      (event) => {
        switch (event.key) {
          case "Backspace": {
            event.preventDefault();
            if (code[index]) {
              update(code.slice(0, index) + code.slice(index + 1));
              focusSlot(index);
            } else if (index > 0) {
              update(code.slice(0, index - 1) + code.slice(index));
              focusSlot(index - 1);
            }
            break;
          }
          case "Delete": {
            event.preventDefault();
            update(code.slice(0, index) + code.slice(index + 1));
            break;
          }
          case "ArrowLeft":
            event.preventDefault();
            focusSlot(index - 1);
            break;
          case "ArrowRight":
            event.preventDefault();
            focusSlot(Math.min(index + 1, code.length));
            break;
          case "Home":
            event.preventDefault();
            focusSlot(0);
            break;
          case "End":
            event.preventDefault();
            focusSlot(Math.min(code.length, length - 1));
            break;
        }
      };

    const handlePaste =
      (index: number): React.ClipboardEventHandler<HTMLInputElement> =>
      (event) => {
        event.preventDefault();
        const pasted = sanitize(
          event.clipboardData.getData("text"),
          pattern,
          length,
        );
        if (!pasted) return;
        // A full-length paste replaces the whole code, wherever the caret is.
        writeAt(pasted.length === length ? 0 : index, pasted);
      };

    const handleBlur: React.FocusEventHandler<HTMLDivElement> = (event) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null))
        return;
      onBlur?.(event);
    };

    const slots = Array.from({ length }, (_, i) => i);

    return (
      <Field
        orientation={orientation}
        data-invalid={error ? true : undefined}
        className={fieldClassName}
      >
        {label && (
          <FieldLabel
            id={labelId}
            htmlFor={inputId}
            className={cn(
              error && "text-destructive",
              disabled && "opacity-70 cursor-not-allowed",
              labelClassName,
            )}
          >
            {label}
            {required && (
              <>
                <span aria-hidden="true" className="text-destructive ml-0.5">
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </FieldLabel>
        )}
        <div
          role="group"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          className={cn("flex items-center gap-2", className)}
          onBlur={handleBlur}
        >
          {slots.map((i) => {
            const char = code[i] ?? "";
            const isActive = i === Math.min(code.length, length - 1);
            return (
              <React.Fragment key={i}>
                {groupSize && i > 0 && i % groupSize === 0 && (
                  <span
                    aria-hidden="true"
                    className="h-px w-3 shrink-0 bg-muted-foreground/60"
                  />
                )}
                <input
                  ref={(el) => {
                    inputsRef.current[i] = el;
                    if (i === 0) {
                      if (typeof ref === "function") ref(el);
                      else if (ref) ref.current = el;
                    }
                  }}
                  id={i === 0 ? inputId : `${inputId}-${i}`}
                  type={mask ? "password" : "text"}
                  inputMode={pattern === "numeric" ? "numeric" : "text"}
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  autoCapitalize={
                    pattern === "alphanumeric" ? "characters" : "off"
                  }
                  autoCorrect="off"
                  spellCheck={false}
                  // biome-ignore lint/a11y/noAutofocus: opt-in via prop
                  autoFocus={autoFocus && i === 0}
                  value={char}
                  disabled={disabled}
                  aria-label={`Character ${i + 1} of ${length}`}
                  aria-required={required || undefined}
                  aria-invalid={!!error}
                  aria-errormessage={errorId}
                  // Only the next empty slot (or a filled one) is tabbable, so Tab
                  // leaves the group instead of walking through every slot.
                  tabIndex={isActive ? 0 : -1}
                  onChange={handleChange(i)}
                  onKeyDown={handleKeyDown(i)}
                  onPaste={handlePaste(i)}
                  onFocus={(event) => event.currentTarget.select()}
                  onMouseDown={(event) => {
                    // Clicking past the filled run jumps to the next empty slot.
                    if (i > code.length) {
                      event.preventDefault();
                      focusSlot(code.length);
                    }
                  }}
                  className={cn(
                    "size-10 shrink-0 rounded-md border border-input bg-transparent text-center font-mono text-base shadow-xs outline-none transition-[color,box-shadow] dark:bg-input/30",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
                    slotClassName,
                  )}
                />
              </React.Fragment>
            );
          })}
          {name && <input type="hidden" name={name} value={code} />}
        </div>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

OtpField.displayName = "OtpField";
