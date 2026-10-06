"use client";

import { useState } from "react";

import { TextTyper } from "@/components/ui/text-typer";

const WORDS = ["forms.", "tables.", "dashboards.", "anything."];

export function TextTyperRotateDemo() {
  const [index, setIndex] = useState(0);

  return (
    <p className="text-2xl font-semibold">
      Build{" "}
      <TextTyper
        text={WORDS[index]}
        speed={80}
        className="text-primary"
        onComplete={() =>
          setTimeout(() => setIndex((i) => (i + 1) % WORDS.length), 1500)
        }
      />
    </p>
  );
}
