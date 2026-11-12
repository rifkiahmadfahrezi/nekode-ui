export type FieldKind =
  | "text"
  | "textarea"
  | "password"
  | "number"
  | "select"
  | "combobox"
  | "combobox-multi"
  | "checkbox"
  | "checkbox-group"
  | "radio"
  | "switch"
  | "date-picker"
  | "date-range-picker"
  | "date-multi-picker"
  | "time-picker"
  | "file";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  id: string;
  kind: FieldKind;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[];
  /** Columns this field spans when the form uses more than one column. */
  span?: FieldSpan;
  /** Label beside the control instead of above it (only for kinds that support it). */
  orientation?: FieldOrientation;
  /** Extra Tailwind classes for the field's wrapper. */
  className?: string;
}

export type FieldSpan = 1 | 2 | "full";
export type FieldOrientation = "vertical" | "horizontal";

export type FormColumns = 1 | 2 | 3;
export type FormSpacing = "compact" | "normal" | "relaxed";
export type FormMaxWidth = "none" | "sm" | "md" | "lg" | "xl" | "2xl";
export type ButtonVariant = "default" | "secondary" | "outline";
export type ButtonAlign = "start" | "end" | "full";

/** Form-wide layout and button options that feed both the preview and the generated code. */
export interface FormStyle {
  columns: FormColumns;
  spacing: FormSpacing;
  maxWidth: FormMaxWidth;
  submitLabel: string;
  submitVariant: ButtonVariant;
  buttonAlign: ButtonAlign;
}

export interface StepConfig {
  id: string;
  title: string;
  fields: FieldConfig[];
}
