import {
  AlignLeft,
  CalendarDays,
  ChevronsUpDown,
  Clock,
  Hash,
  KeyRound,
  type LucideIcon,
  Paperclip,
  Search,
  TextCursorInput,
} from "lucide-react";

import type { FieldKind } from "./types";

export interface FieldKindMeta {
  kind: FieldKind;
  label: string;
  component: string;
  importPath: string;
  icon: LucideIcon;
  needsOptions?: boolean;
}

export const FIELD_KINDS: FieldKindMeta[] = [
  {
    kind: "text",
    label: "Text",
    component: "TextField",
    importPath: "@/components/ui/text-field",
    icon: TextCursorInput,
  },
  {
    kind: "textarea",
    label: "Textarea",
    component: "TextareaField",
    importPath: "@/components/ui/textarea-field",
    icon: AlignLeft,
  },
  {
    kind: "password",
    label: "Password",
    component: "PasswordField",
    importPath: "@/components/ui/password-field",
    icon: KeyRound,
  },
  {
    kind: "number",
    label: "Number",
    component: "NumberField",
    importPath: "@/components/ui/number-field",
    icon: Hash,
  },
  {
    kind: "select",
    label: "Select",
    component: "SelectField",
    importPath: "@/components/ui/select-field",
    icon: ChevronsUpDown,
    needsOptions: true,
  },
  {
    kind: "combobox",
    label: "Combobox",
    component: "ComboboxField",
    importPath: "@/components/ui/combobox-field",
    icon: Search,
    needsOptions: true,
  },
  {
    kind: "date-picker",
    label: "Date Picker",
    component: "DatePickerField",
    importPath: "@/components/ui/date-picker-field",
    icon: CalendarDays,
  },
  {
    kind: "time-picker",
    label: "Time Picker",
    component: "TimePickerField",
    importPath: "@/components/ui/time-picker-field",
    icon: Clock,
  },
  {
    kind: "file",
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
