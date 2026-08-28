"use client";

import { DatePickerField } from "@/components/ui/date-picker-field";

export function DatePickerFieldDemo() {
  return (
    <DatePickerField
      label="Date of birth"
      description="Select your date of birth."
      triggerClassName="w-72"
    />
  );
}
