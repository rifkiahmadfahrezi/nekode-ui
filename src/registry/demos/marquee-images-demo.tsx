"use client";

import { Marquee } from "@/components/ui/marquee";

const PHOTOS = ["coast", "forest", "city", "desert", "mountain", "lake"];

export function MarqueeImagesDemo() {
  return (
    <Marquee reverse duration={30} className="w-full max-w-xl [--gap:0.75rem]">
      {PHOTOS.map((seed) => (
        <img
          key={seed}
          src={`https://picsum.photos/seed/${seed}/320/200`}
          alt={seed}
          width={160}
          height={100}
          className="h-25 w-40 rounded-lg object-cover"
        />
      ))}
    </Marquee>
  );
}
