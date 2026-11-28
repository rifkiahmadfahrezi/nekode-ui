"use client";

import * as React from "react";
import { PhoneField } from "@/components/ui/phone-field";

export function PhoneFieldAutoDetectDemo() {
  const [value, setValue] = React.useState("");
  return (
    <div className="grid w-full max-w-[400px] gap-2">
      <PhoneField
        label="Phone number"
        description="Start with a calling code, e.g. 62 for Indonesia or 44 for the UK."
        defaultCountry="US"
        autoDetectCountry
        placeholder="62 812 3456 7890"
        value={value}
        onValueChange={setValue}
      />
      <p className="text-sm text-muted-foreground">
        Value: <code>{value || '""'}</code>
      </p>
    </div>
  );
}
