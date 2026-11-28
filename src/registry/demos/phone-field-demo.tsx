"use client";

import * as React from "react";
import { PhoneField } from "@/components/ui/phone-field";

export function PhoneFieldDemo() {
  const [value, setValue] = React.useState("");
  return (
    <div className="grid w-full max-w-[400px] gap-2">
      <PhoneField
        label="Phone number"
        description="Pick a country, then type the local number."
        value={value}
        onValueChange={setValue}
      />
      <p className="text-sm text-muted-foreground">
        Value: <code>{value || '""'}</code>
      </p>
    </div>
  );
}
