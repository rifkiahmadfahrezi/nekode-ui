"use client";

import { FieldRadio } from "@/components/ui/field-radio";

export function FieldRadioDemo() {
  return (
    <FieldRadio
      label="Notification method"
      description="Choose how you'd like to be notified."
      defaultValue="email"
      options={[
        { value: "email", label: "Email" },
        { value: "sms", label: "SMS" },
        { value: "push", label: "Push notification" },
      ]}
      className="w-72"
    />
  );
}
