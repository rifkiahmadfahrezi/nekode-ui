"use client";

import { XIcon } from "lucide-react";
import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface TagsFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange"
  > {
  label?: string;
  description?: string;
  error?: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Maximum number of tags. The input is hidden once it's reached. */
  maxTags?: number;
  /** Allow the same tag more than once (compared case-insensitively). Defaults to `false`. */
  allowDuplicates?: boolean;
  /** Characters that commit the typed text as a tag, besides Enter. Defaults to `[","]`. */
  delimiters?: string[];
  /** Commit the pending text when the input loses focus. Defaults to `true`. */
  addOnBlur?: boolean;
  /** Runs on each new tag. Return the cleaned tag, or `null` to reject it. */
  transform?: (tag: string) => string | null;
  /** Passed to the underlying `Field` wrapper. */
  fieldClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  /** Applied to each tag chip. */
  tagClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const TagsField = React.forwardRef<HTMLInputElement, TagsFieldProps>(
  (
    {
      label,
      description,
      error,
      value,
      defaultValue,
      onValueChange,
      maxTags,
      allowDuplicates = false,
      delimiters = [","],
      addOnBlur = true,
      transform,
      placeholder = "Add a tag...",
      fieldClassName,
      labelClassName,
      inputClassName,
      tagClassName,
      className,
      orientation = "vertical",
      id,
      name,
      disabled,
      required,
      onBlur,
      onKeyDown,
      onPaste,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const statusId = `${inputId}-status`;
    const describedBy = description ? descriptionId : undefined;

    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<string[]>(
      defaultValue ?? [],
    );
    const tags = isControlled ? value : internal;
    const [draft, setDraft] = React.useState("");
    const [announcement, setAnnouncement] = React.useState("");

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const isFull = maxTags !== undefined && tags.length >= maxTags;

    const setTags = (next: string[]) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    /** Adds every candidate that survives transform/dedupe/maxTags. */
    const addTags = (candidates: string[]) => {
      const next = [...tags];
      for (const raw of candidates) {
        if (maxTags !== undefined && next.length >= maxTags) break;
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const tag = transform ? transform(trimmed) : trimmed;
        if (!tag) continue;
        if (
          !allowDuplicates &&
          next.some((t) => t.toLowerCase() === tag.toLowerCase())
        )
          continue;
        next.push(tag);
      }
      if (next.length !== tags.length) {
        setTags(next);
        setAnnouncement(`Added ${next.slice(tags.length).join(", ")}`);
      }
    };

    const removeTag = (index: number) => {
      const removed = tags[index];
      setTags(tags.filter((_, i) => i !== index));
      setAnnouncement(`Removed ${removed}`);
      inputRef.current?.focus();
    };

    const splitter = React.useMemo(
      () =>
        delimiters.length
          ? new RegExp(`[${delimiters.map(escapeRegExp).join("")}\\n]`)
          : /\n/,
      [delimiters],
    );

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
      event,
    ) => {
      const parts = event.target.value.split(splitter);
      if (parts.length > 1) {
        // Everything before the last delimiter is committed; the rest stays.
        addTags(parts.slice(0, -1));
        setDraft(parts[parts.length - 1]);
      } else {
        setDraft(event.target.value);
      }
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
      event,
    ) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.nativeEvent.isComposing) return;
      if (event.key === "Enter") {
        if (!draft.trim()) return;
        event.preventDefault();
        addTags([draft]);
        setDraft("");
      } else if (event.key === "Backspace" && draft === "" && tags.length) {
        event.preventDefault();
        removeTag(tags.length - 1);
      }
    };

    const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (
      event,
    ) => {
      onPaste?.(event);
      if (event.defaultPrevented) return;
      const text = event.clipboardData.getData("text");
      if (!splitter.test(text)) return;
      event.preventDefault();
      addTags([draft, ...text.split(splitter)]);
      setDraft("");
    };

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
      if (addOnBlur && draft.trim()) {
        addTags([draft]);
        setDraft("");
      }
      onBlur?.(event);
    };

    return (
      <Field
        orientation={orientation}
        data-invalid={error ? true : undefined}
        className={fieldClassName}
      >
        {label && (
          <FieldLabel
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

        {/* biome-ignore lint/a11y/noStaticElementInteractions: clicking the padding focuses the input, like a native text box */}
        <div
          data-disabled={disabled || undefined}
          aria-invalid={!!error || undefined}
          onClick={(event) => {
            if (event.target === event.currentTarget) inputRef.current?.focus();
          }}
          className={cn(
            "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs transition-[color,box-shadow] dark:bg-input/30",
            "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            "data-disabled:cursor-not-allowed data-disabled:opacity-50",
            className,
          )}
        >
          {tags.map((tag, index) => (
            <span
              // Tags can repeat when allowDuplicates is on, so index is part of the key.
              // biome-ignore lint/suspicious/noArrayIndexKey: see above
              key={`${tag}-${index}`}
              className={cn(
                "inline-flex h-6 max-w-full items-center gap-1 rounded-sm bg-secondary pr-0.5 pl-2 text-xs font-medium text-secondary-foreground",
                tagClassName,
              )}
            >
              <span className="truncate">{tag}</span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(index)}
                className="flex size-5 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none"
              >
                <XIcon aria-hidden="true" className="size-3" />
              </button>
            </span>
          ))}

          <input
            id={inputId}
            ref={(el) => {
              inputRef.current = el;
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
            }}
            type="text"
            value={draft}
            placeholder={tags.length ? undefined : placeholder}
            disabled={disabled}
            // A full field hides the input from view but keeps it focusable for Backspace.
            readOnly={isFull}
            aria-required={required || undefined}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            aria-errormessage={errorId}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={handleBlur}
            className={cn(
              "h-6 min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
              isFull && "min-w-0 w-0",
              inputClassName,
            )}
            {...props}
          />

          {name &&
            tags.map((tag, index) => (
              <input
                // biome-ignore lint/suspicious/noArrayIndexKey: hidden mirrors of the tags above
                key={`${tag}-${index}`}
                type="hidden"
                name={name}
                value={tag}
              />
            ))}
        </div>

        <span id={statusId} className="sr-only" aria-live="polite">
          {tags.length} {tags.length === 1 ? "tag" : "tags"}
          {maxTags !== undefined ? ` of ${maxTags}` : ""}. {announcement}
        </span>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

TagsField.displayName = "TagsField";
