"use client";

import { FileIcon, UploadCloud, X } from "lucide-react";
import * as React from "react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface FileRejection {
  file: File;
  reason: "size" | "count" | "accept";
}

export interface FileFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  label?: string;
  description?: string;
  error?: string;
  /** Controlled selected files. Omit to let the component manage its own state. */
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  /** Allow selecting/dropping more than one file. */
  multiple?: boolean;
  /** Max number of files allowed (only relevant when `multiple`). */
  maxFiles?: number;
  /** Max size per file, in bytes. */
  maxSize?: number;
  /** Files that failed `accept`/`maxSize`/`maxFiles` checks on the last add. */
  onFilesRejected?: (rejections: FileRejection[]) => void;
  /** Passed to the underlying `Field` wrapper (e.g. orientation, data-invalid overrides). */
  fieldClassName?: string;
  labelClassName?: string;
  dropzoneClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(",").some((pattern) => {
    const trimmed = pattern.trim();
    if (!trimmed) return true;
    if (trimmed.startsWith(".")) {
      return file.name.toLowerCase().endsWith(trimmed.toLowerCase());
    }
    if (trimmed.endsWith("/*")) {
      return file.type.startsWith(trimmed.slice(0, -1));
    }
    return file.type === trimmed;
  });
}

function FileAttachment({
  file,
  disabled,
  onRemove,
}: {
  file: File;
  disabled?: boolean;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const isImage = file.type.startsWith("image/");

  React.useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  return (
    <Attachment size="sm">
      <AttachmentMedia variant={isImage ? "image" : "icon"}>
        {isImage && previewUrl ? (
          <img src={previewUrl} alt="" />
        ) : (
          <FileIcon aria-hidden="true" />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{file.name}</AttachmentTitle>
        <AttachmentDescription>{formatBytes(file.size)}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction
          disabled={disabled}
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
        >
          <X aria-hidden="true" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
}

export const FileField = React.forwardRef<HTMLInputElement, FileFieldProps>(
  (
    {
      label,
      description,
      error,
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      maxFiles,
      maxSize,
      onFilesRejected,
      fieldClassName,
      labelClassName,
      dropzoneClassName,
      orientation = "vertical",
      className,
      id,
      disabled,
      required,
      accept,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = description ? descriptionId : undefined;

    const [internalFiles, setInternalFiles] = React.useState<File[]>(
      defaultValue ?? [],
    );
    const files = value ?? internalFiles;
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const setFiles = (next: File[]) => {
      onValueChange?.(next);
      if (value === undefined) setInternalFiles(next);
    };

    const addFiles = (incoming: FileList | File[]) => {
      const rejections: FileRejection[] = [];
      const accepted: File[] = [];

      for (const file of Array.from(incoming)) {
        if (!matchesAccept(file, accept)) {
          rejections.push({ file, reason: "accept" });
          continue;
        }
        if (maxSize && file.size > maxSize) {
          rejections.push({ file, reason: "size" });
          continue;
        }
        accepted.push(file);
      }

      const base = multiple ? files : [];
      let next = [...base, ...accepted];

      if (!multiple) {
        next = next.slice(-1);
      } else if (maxFiles) {
        const overflow = next.length - maxFiles;
        if (overflow > 0) {
          const dropped = next.splice(maxFiles, overflow);
          for (const file of dropped) {
            rejections.push({ file, reason: "count" });
          }
        }
      }

      if (rejections.length) onFilesRejected?.(rejections);
      setFiles(next);
    };

    const removeFile = (index: number) => {
      setFiles(files.filter((_, i) => i !== index));
    };

    const openPicker = () => {
      if (disabled) return;
      inputRef.current?.click();
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

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          required={required && files.length === 0}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-errormessage={errorId}
          onChange={(event) => {
            if (event.target.files?.length) addFiles(event.target.files);
            event.target.value = "";
          }}
          {...props}
        />

        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          aria-label={label ? `${label} dropzone` : "File dropzone"}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(event) => {
            if (disabled) return;
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            if (disabled) return;
            event.preventDefault();
            setIsDragging(false);
            if (event.dataTransfer.files.length) {
              addFiles(event.dataTransfer.files);
            }
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-4 py-6 text-center transition-colors cursor-pointer",
            "text-muted-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            isDragging && "border-primary bg-primary/5 text-foreground",
            error && "border-destructive/50",
            disabled && "opacity-50 pointer-events-none",
            className,
            dropzoneClassName,
          )}
        >
          <UploadCloud aria-hidden="true" className="size-5" />
          <p className="text-sm">
            <span className="font-medium text-foreground">Click to upload</span>{" "}
            or drag and drop
          </p>
          {accept && <p className="text-xs">{accept}</p>}
        </div>

        {files.length > 0 && (
          <AttachmentGroup>
            {files.map((file, index) => (
              <FileAttachment
                key={`${file.name}-${file.size}-${file.lastModified}`}
                file={file}
                disabled={disabled}
                onRemove={() => removeFile(index)}
              />
            ))}
          </AttachmentGroup>
        )}

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

FileField.displayName = "FileField";
