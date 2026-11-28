"use client";

import { OtpField } from "@/components/ui/otp-field";

export function OtpFieldDemo() {
  return (
    <OtpField
      label="Verification code"
      description="Enter the 6-digit code we sent to your email."
      groupSize={3}
    />
  );
}
