export type FieldKind =
  | "text"
  | "textarea"
  | "rich-text"
  | "password"
  | "number"
  | "select"
  | "combobox"
  | "combobox-multi"
  | "responsive-combobox"
  | "responsive-multi-select"
  | "checkbox"
  | "checkbox-group"
  | "radio"
  | "switch"
  | "date-picker"
  | "date-range-picker"
  | "date-multi-picker"
  | "time-picker"
  | "file"
  | "image-dropzone"
  | "slider"
  | "range-slider"
  | "rating"
  | "color-picker";

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
