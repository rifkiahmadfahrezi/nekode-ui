"use client";

import { RichTextField } from "@/components/ui/rich-text-field";

export function RichTextFieldDemo() {
  return (
    <RichTextField
      label="Description"
      description="Shown on the product page."
      placeholder="What makes this product great?"
      tools={["bold", "italic", "|", "bulletList", "orderedList", "|", "link"]}
      showCount
      maxLength={500}
      required
      fieldClassName="w-full max-w-xl"
    />
  );
}
