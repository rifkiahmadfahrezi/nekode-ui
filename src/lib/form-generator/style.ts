import type {
  ButtonAlign,
  FieldConfig,
  FieldKind,
  FormColumns,
  FormMaxWidth,
  FormSpacing,
  FormStyle,
} from "./types";

export const DEFAULT_FORM_STYLE: FormStyle = {
  columns: 1,
  spacing: "normal",
  maxWidth: "none",
  submitLabel: "Submit",
  submitVariant: "default",
  buttonAlign: "start",
};

// Class strings are written out in full so Tailwind picks them up for the preview.
const COLUMN_CLASSES: Record<FormColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
};

const FIELD_GAP_CLASSES: Record<FormSpacing, string> = {
  compact: "gap-3",
  normal: "gap-4",
  relaxed: "gap-6",
};

const FORM_GAP_CLASSES: Record<FormSpacing, string> = {
  compact: "gap-4",
  normal: "gap-6",
  relaxed: "gap-8",
};

const MAX_WIDTH_CLASSES: Record<FormMaxWidth, string> = {
  none: "",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

function join(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Classes for the `<form>` element. */
export function formClassName(style: FormStyle) {
  return join(
    "grid w-full",
    FORM_GAP_CLASSES[style.spacing],
    MAX_WIDTH_CLASSES[style.maxWidth],
  );
}

/** Classes for the grid that holds the fields of one step. */
export function fieldsGridClassName(style: FormStyle) {
  return join(
    "grid",
    COLUMN_CLASSES[style.columns],
    FIELD_GAP_CLASSES[style.spacing],
  );
}

/** Wrapper classes for one field (column span + custom classes). Empty when none apply. */
export function fieldWrapperClassName(field: FieldConfig, style: FormStyle) {
  let span: string | undefined;
  if (style.columns > 1 && field.span && field.span !== 1) {
    span =
      field.span === "full" || field.span >= style.columns
        ? "md:col-span-full"
        : "md:col-span-2";
  }
  return join(span, field.className?.trim());
}

/** Classes for the row that holds the submit / navigation buttons. */
export function buttonRowClassName(align: ButtonAlign, multiStep: boolean) {
  if (align === "full") return multiStep ? "grid grid-cols-2 gap-2" : "grid";
  return join("flex gap-2", align === "end" && "justify-end");
}

/** Kinds whose components accept `orientation`. */
const ORIENTATION_KINDS = new Set<FieldKind>([
  "text",
  "textarea",
  "password",
  "number",
  "select",
  "combobox",
  "combobox-multi",
  "date-picker",
  "date-range-picker",
  "date-multi-picker",
  "time-picker",
  "file",
]);

export function supportsOrientation(kind: FieldKind) {
  return ORIENTATION_KINDS.has(kind);
}
