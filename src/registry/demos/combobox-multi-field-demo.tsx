"use client";

import { useState } from "react";
import { ComboboxMultiField } from "@/components/ui/combobox-multi-field";

const frameworks = [
  { label: "Next.js", value: "nextjs" },
  { label: "Remix", value: "remix" },
  { label: "Astro", value: "astro" },
  { label: "SvelteKit", value: "sveltekit" },
  { label: "Nuxt", value: "nuxt" },
  { label: "TanStack Start", value: "tanstack-start" },
];

export function ComboboxMultiFieldDemo() {
  const [stacked, setStacked] = useState(["nextjs", "remix", "astro"]);
  const [hidden, setHidden] = useState(["nextjs", "remix", "astro", "nuxt"]);

  return (
    <div className="flex w-72 flex-col gap-6">
      <ComboboxMultiField
        label="Frameworks (stack)"
        description="Selected items wrap onto new lines."
        options={frameworks}
        value={stacked}
        onValueChange={setStacked}
      />
      <ComboboxMultiField
        label="Frameworks (hide)"
        description="Overflowing items collapse into a count."
        options={frameworks}
        value={hidden}
        onValueChange={setHidden}
        overflow="hide"
      />
    </div>
  );
}
