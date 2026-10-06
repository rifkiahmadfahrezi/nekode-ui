"use client";

import { Marquee } from "@/components/ui/marquee";

const QUOTES = [
  { name: "Alya", text: "Dropped it in and it just worked." },
  { name: "Bima", text: "The form fields saved us a week." },
  { name: "Citra", text: "Finally, a DataTable that doesn't fight me." },
  { name: "Dimas", text: "Docs are short and actually useful." },
];

export function MarqueeVerticalDemo() {
  return (
    <Marquee
      vertical
      pauseOnHover
      duration={15}
      className="h-64 w-full max-w-xs"
    >
      {QUOTES.map((q) => (
        <figure key={q.name} className="rounded-lg border p-4 text-sm">
          <blockquote>“{q.text}”</blockquote>
          <figcaption className="mt-2 text-muted-foreground">
            — {q.name}
          </figcaption>
        </figure>
      ))}
    </Marquee>
  );
}
