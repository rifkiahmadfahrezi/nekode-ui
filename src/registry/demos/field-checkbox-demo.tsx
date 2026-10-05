"use client";

import { FieldCheckbox } from "@/components/ui/field-checkbox";

export function FieldCheckboxDemo() {
  return (
    <FieldCheckbox
      label="Accept terms and conditions"
      description="By checking this box, you agree to our terms of service."
      fieldClassName="w-72"
    />
  );
}
