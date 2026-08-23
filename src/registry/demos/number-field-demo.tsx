"use client";

import { NumberField } from "@/components/ui/number-field";

export function NumberFieldDemo() {
  return (
    <NumberField
      label="Price"
      leftSection={<span className="text-sm">$</span>}
      decimal
      decimalPlaces={2}
      min={0}
      defaultValue={0}
      fieldClassName="max-w-[400px]"
    />
  );
}
