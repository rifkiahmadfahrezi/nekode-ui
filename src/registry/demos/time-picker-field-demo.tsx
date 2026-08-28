"use client";

import { TimePickerField } from "@/components/ui/time-picker-field";

export function TimePickerFieldDemo() {
  return (
    <div className="flex flex-col gap-4 w-72">
      <TimePickerField
        label="Meeting time (24h)"
        description="Pick a time in 24-hour format."
        timeFormat="24h"
      />
      <TimePickerField
        label="Meeting time (12h)"
        description="Pick a time with AM/PM."
        timeFormat="12h"
      />
    </div>
  );
}
