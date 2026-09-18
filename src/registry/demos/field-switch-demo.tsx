"use client";

import { FieldSwitch } from "@/components/ui/field-switch";

export function FieldSwitchDemo() {
  return (
    <FieldSwitch
      label="Marketing emails"
      description="Receive emails about new products and features."
      fieldClassName="w-72"
    />
  );
}
