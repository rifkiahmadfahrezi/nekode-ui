"use client";

import { useState } from "react";
import { ResponsiveCombobox } from "@/components/ui/responsive-combobox";

const countries = [
  { label: "Indonesia", value: "id" },
  { label: "Malaysia", value: "my" },
  { label: "Singapore", value: "sg" },
  { label: "Thailand", value: "th" },
  { label: "Vietnam", value: "vn" },
  { label: "Philippines", value: "ph" },
  { label: "Japan", value: "jp" },
  { label: "South Korea", value: "kr" },
];

export function ResponsiveComboboxDemo() {
  const [value, setValue] = useState<string>();

  return (
    <ResponsiveCombobox
      label="Country"
      description="A popover on desktop, a bottom drawer on mobile."
      placeholder="Select a country"
      searchPlaceholder="Search country..."
      options={countries}
      value={value as string}
      onValueChange={setValue}
      fieldClassName="w-72"
    />
  );
}
