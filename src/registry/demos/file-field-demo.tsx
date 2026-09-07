"use client";

import { FileField } from "@/components/ui/file-field";

export function FileFieldDemo() {
  return (
    <FileField
      label="Attachments"
      description="Drag and drop files here, or click to browse."
      multiple
      className="w-full max-w-md"
    />
  );
}
