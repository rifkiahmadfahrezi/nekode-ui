"use client";

import { DateRangePickerField } from "@/components/ui/date-range-picker-field";

export function DateRangePickerFieldDemo() {
  return (
    <DateRangePickerField
      label="Trip dates"
      description="Select the start and end of your trip."
      triggerClassName="w-72"
    />
  );
}
