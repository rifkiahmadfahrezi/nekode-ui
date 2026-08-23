"use client";

import { PasswordField } from "@/components/ui/password-field";

export function PasswordFieldDemo() {
  return (
    <PasswordField
      label="Password"
      description="Must be at least 8 characters."
      placeholder="Enter your password"
      fieldClassName="w-72"
    />
  );
}
