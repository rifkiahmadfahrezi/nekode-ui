"use client";

import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  RichTextEditor,
  type RichTextEditorHandle,
  type RichTextEditorProps,
} from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";

export type RichTextFieldProps = RichTextEditorProps & {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  fieldClassName?: string;
  labelClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
};

export const RichTextField = React.forwardRef<
  RichTextEditorHandle,
  RichTextFieldProps
>(
  (
    {
      label,
      description,
      error,
      required,
      fieldClassName,
      labelClassName,
      orientation = "vertical",
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const editorId = id ?? generatedId;
    const labelId = `${editorId}-label`;
    const descriptionId = description ? `${editorId}-description` : undefined;
    const errorId = error ? `${editorId}-error` : undefined;
    const editorRef = React.useRef<RichTextEditorHandle>(null);
    React.useImperativeHandle(
      ref,
      () => editorRef.current as RichTextEditorHandle,
    );

    return (
      <Field
        orientation={orientation}
        data-invalid={error ? true : undefined}
        className={fieldClassName}
      >
        {label && (
          // A contenteditable isn't labelable, so the label is wired with
          // aria-labelledby and focuses the editor on click.
          <FieldLabel
            id={labelId}
            onClick={() => editorRef.current?.editor?.commands.focus()}
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

        <RichTextEditor
          {...(props as RichTextEditorProps)}
          ref={editorRef}
          id={editorId}
          disabled={disabled}
          aria-labelledby={label ? labelId : props["aria-labelledby"]}
          aria-describedby={descriptionId ?? props["aria-describedby"]}
          aria-invalid={!!error}
          aria-errormessage={errorId}
        />

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

RichTextField.displayName = "RichTextField";
