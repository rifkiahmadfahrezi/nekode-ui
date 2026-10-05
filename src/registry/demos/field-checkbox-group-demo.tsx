"use client";

import { FieldCheckboxGroup } from "@/components/ui/field-checkbox";

export function FieldCheckboxGroupDemo() {
  return (
    <FieldCheckboxGroup
      label="Notifications"
      description="Choose where you want to be notified."
      defaultValue={["email"]}
      options={[
        { value: "email", label: "Email" },
        { value: "sms", label: "SMS" },
        { value: "push", label: "Push notification" },
      ]}
      className="w-72"
    />
  );
}
