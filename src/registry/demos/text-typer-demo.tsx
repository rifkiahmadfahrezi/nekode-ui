"use client";

import { TextTyper } from "@/components/ui/text-typer";

export function TextTyperDemo() {
  return (
    <p className="text-2xl font-semibold">
      <TextTyper text="Ship components, not boilerplate." />
    </p>
  );
}
