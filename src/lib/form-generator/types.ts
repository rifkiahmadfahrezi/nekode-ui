export type FieldKind =
  | "text"
  | "textarea"
  | "password"
  | "number"
  | "select"
  | "combobox"
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
}

export interface StepConfig {
  id: string;
  title: string;
  fields: FieldConfig[];
}
