"use client";

import * as React from "react";
import {
  ComboboxField,
  type ComboboxFieldMultipleProps,
  type ComboboxFieldOption,
} from "@/components/ui/combobox-field";

export type ComboboxMultiFieldOption = ComboboxFieldOption;

export type ComboboxMultiFieldProps = Omit<
  ComboboxFieldMultipleProps,
  "multiple"
>;

/**
 * @deprecated Use `<ComboboxField multiple />` instead. Kept as a thin alias
 * so existing imports keep working; it renders exactly the same component.
 */
export const ComboboxMultiField = React.forwardRef<
  HTMLInputElement,
  ComboboxMultiFieldProps
>((props, ref) => <ComboboxField ref={ref} {...props} multiple />);

ComboboxMultiField.displayName = "ComboboxMultiField";
