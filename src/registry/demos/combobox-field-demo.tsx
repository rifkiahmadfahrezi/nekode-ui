"use client";

import { useState } from "react";
import { ComboboxField } from "@/components/ui/combobox-field";

const frameworks = [
  { label: "Next.js", value: "nextjs" },
  { label: "Remix", value: "remix" },
  { label: "Astro", value: "astro" },
  { label: "SvelteKit", value: "sveltekit" },
  { label: "Nuxt", value: "nuxt" },
];

export function ComboboxFieldDemo() {
  const [value, setValue] = useState<string>();

  return (
    <ComboboxField
      label="Framework"
      description="Search or pick from the list."
      placeholder="Select a framework"
      items={frameworks}
      value={value as string}
      onValueChange={setValue}
      inputClassName="w-72"
    />
  );
}
