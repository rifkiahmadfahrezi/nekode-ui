"use client";

import { Marquee } from "@/components/ui/marquee";

const STACK = [
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Base UI",
  "TanStack Form",
  "Zod",
  "Vite",
];

export function MarqueeDemo() {
  return (
    <Marquee pauseOnHover className="w-full max-w-xl">
      {STACK.map((name) => (
        <span
          key={name}
          className="rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap"
        >
          {name}
        </span>
      ))}
    </Marquee>
  );
}
