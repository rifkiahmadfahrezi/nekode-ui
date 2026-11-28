"use client";

import { FileField } from "@/components/ui/file-field";

export function FileFieldGridDemo() {
  return (
    <FileField
      label="Product photos"
      description="Up to 6 images, 5 MB each."
      accept="image/*"
      multiple
      maxFiles={6}
      maxSize={5 * 1024 * 1024}
      previewLayout="grid"
      className="w-full max-w-md"
      fieldClassName="w-full max-w-md"
    />
  );
}
