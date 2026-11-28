"use client";

import { OtpField } from "@/components/ui/otp-field";

export function OtpFieldVariantsDemo() {
  return (
    <div className="grid gap-6">
      <OtpField label="PIN" length={4} mask />
      <OtpField
        label="Invite code"
        length={8}
        pattern="alphanumeric"
        groupSize={4}
      />
    </div>
  );
}
