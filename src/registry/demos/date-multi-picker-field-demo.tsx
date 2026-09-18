"use client";

import { DateMultiPickerField } from "@/components/ui/date-multi-picker-field";

export function DateMultiPickerFieldDemo() {
  return (
    <DateMultiPickerField
      label="Availability"
      description="Select every date you're available."
      triggerClassName="w-72"
    />
  );
}
