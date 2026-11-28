import {
  AlignLeft,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  CheckSquare,
  ChevronsUpDown,
  CircleDot,
  Clock,
  Hash,
  KeyRound,
  LetterText,
  ListChecks,
  ListFilter,
  ListTodo,
  type LucideIcon,
  MonitorSmartphone,
  Paperclip,
  Search,
  TextCursorInput,
  ToggleLeft,
} from "lucide-react";

import type { FieldKind } from "./types";

export type FieldKindGroup = "text" | "selection" | "choice" | "date" | "file";

/** Sidebar sections, in display order. Fields are sorted A-Z inside each. */
export const FIELD_KIND_GROUPS: { id: FieldKindGroup; label: string }[] = [
  { id: "text", label: "Text input" },
  { id: "selection", label: "Selection" },
  { id: "choice", label: "Choice" },
  { id: "date", label: "Date & time" },
  { id: "file", label: "File" },
];

export interface FieldKindMeta {
  kind: FieldKind;
  group: FieldKindGroup;
  label: string;
  component: string;
  importPath: string;
  icon: LucideIcon;
  needsOptions?: boolean;
}

export const FIELD_KINDS: FieldKindMeta[] = [
  {
    kind: "text",
    group: "text",
    label: "Text",
    component: "TextField",
    importPath: "@/components/ui/text-field",
    icon: TextCursorInput,
  },
  {
    kind: "textarea",
    group: "text",
    label: "Textarea",
    component: "TextareaField",
    importPath: "@/components/ui/textarea-field",
    icon: AlignLeft,
  },
  {
    kind: "rich-text",
    group: "text",
    label: "Rich Text",
    component: "RichTextField",
    importPath: "@/components/ui/rich-text-field",
    icon: LetterText,
  },
  {
    kind: "password",
    group: "text",
    label: "Password",
    component: "PasswordField",
    importPath: "@/components/ui/password-field",
    icon: KeyRound,
  },
  {
    kind: "number",
    group: "text",
    label: "Number",
    component: "NumberField",
    importPath: "@/components/ui/number-field",
    icon: Hash,
  },
  {
    kind: "select",
    group: "selection",
    label: "Select",
    component: "SelectField",
    importPath: "@/components/ui/select-field",
    icon: ChevronsUpDown,
    needsOptions: true,
  },
  {
    kind: "combobox",
    group: "selection",
    label: "Combobox",
    component: "ComboboxField",
    importPath: "@/components/ui/combobox-field",
    icon: Search,
    needsOptions: true,
  },
  {
    kind: "combobox-multi",
    group: "selection",
    label: "Combobox Multi",
    // Same component as "combobox", rendered with `multiple`.
    component: "ComboboxField",
    importPath: "@/components/ui/combobox-field",
    icon: ListChecks,
    needsOptions: true,
  },
  {
    kind: "responsive-combobox",
    group: "selection",
    label: "Responsive Combobox",
    component: "ResponsiveCombobox",
    importPath: "@/components/ui/responsive-combobox",
    icon: MonitorSmartphone,
    needsOptions: true,
  },
  {
    kind: "responsive-multi-select",
    group: "selection",
    label: "Responsive Multi Select",
    component: "ResponsiveMultiSelect",
    importPath: "@/components/ui/responsive-multi-select",
    icon: ListFilter,
    needsOptions: true,
  },
  {
    kind: "checkbox",
    group: "choice",
    label: "Checkbox",
    component: "FieldCheckbox",
    importPath: "@/components/ui/field-checkbox",
    icon: CheckSquare,
  },
  {
    kind: "checkbox-group",
    group: "choice",
    label: "Checkbox Group",
    component: "FieldCheckboxGroup",
    importPath: "@/components/ui/field-checkbox",
    icon: ListTodo,
    needsOptions: true,
  },
  {
    kind: "radio",
    group: "choice",
    label: "Radio",
    component: "FieldRadio",
    importPath: "@/components/ui/field-radio",
    icon: CircleDot,
    needsOptions: true,
  },
  {
    kind: "switch",
    group: "choice",
    label: "Switch",
    component: "FieldSwitch",
    importPath: "@/components/ui/field-switch",
    icon: ToggleLeft,
  },
  {
    kind: "date-picker",
    group: "date",
    label: "Date Picker",
    component: "DatePickerField",
    importPath: "@/components/ui/date-picker-field",
    icon: CalendarDays,
  },
  {
    kind: "date-range-picker",
    group: "date",
    label: "Date Range Picker",
    component: "DateRangePickerField",
    importPath: "@/components/ui/date-range-picker-field",
    icon: CalendarRange,
  },
  {
    kind: "date-multi-picker",
    group: "date",
    label: "Date Multi Picker",
    component: "DateMultiPickerField",
    importPath: "@/components/ui/date-multi-picker-field",
    icon: CalendarPlus,
  },
  {
    kind: "time-picker",
    group: "date",
    label: "Time Picker",
    component: "TimePickerField",
    importPath: "@/components/ui/time-picker-field",
    icon: Clock,
  },
  {
    kind: "file",
    group: "file",
    label: "File",
    component: "FileField",
    importPath: "@/components/ui/file-field",
    icon: Paperclip,
  },
];

export function kindMeta(kind: FieldKind): FieldKindMeta {
  const meta = FIELD_KINDS.find((k) => k.kind === kind);
  if (!meta) throw new Error(`Unknown field kind: ${kind}`);
  return meta;
}
