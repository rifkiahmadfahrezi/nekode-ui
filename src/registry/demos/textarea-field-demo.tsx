"use client";

import { TextareaField } from "@/components/ui/textarea-field";

export function TextareaFieldDemo() {
  return (
    <TextareaField
      label="Bio"
      description="Tell us a little about yourself."
      placeholder="I'm a frontend developer based in..."
      showCount
      maxLength={200}
      className="w-80"
    />
  );
}
