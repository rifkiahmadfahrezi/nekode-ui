"use client";

import { SelectField } from "@/components/ui/select-field";

export function SelectFieldDemo() {
  return (
    <SelectField
      label="Role"
      description="Controls what this teammate can access."
      placeholder="Select a role"
      options={[
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Viewer", value: "viewer" },
      ]}
      triggerClassName="w-72"
    />
  );
}
