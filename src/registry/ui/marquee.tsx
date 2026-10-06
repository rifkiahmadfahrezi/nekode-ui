"use client";

import React from "react";

import { cn } from "@/lib/utils";

export interface MarqueeProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
  /**
   * Scroll top-to-bottom instead of left-to-right.
   * @default false
   */
  vertical?: boolean;
  /**
   * Scroll the opposite way (right or down).
   * @default false
   */
  reverse?: boolean;
  /**
   * Seconds for one full loop of the content.
   * @default 20
   */
  duration?: number;
  /**
   * Pause while the pointer is over the marquee.
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * How many copies of `children` sit side by side. Raise it when the
   * content is narrower than the container and a gap shows at the end.
   * @default 2
   */
  repeat?: number;
}

export const Marquee = ({
  children,
  vertical = false,
  reverse = false,
  duration = 20,
  pauseOnHover = false,
  repeat = 2,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}: MarqueeProps) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const animationsRef = React.useRef<Animation[]>([]);

  // Web Animations API instead of CSS keyframes, so the component ships
  // without any global stylesheet.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const axis = vertical ? "Y" : "X";
    const end = `translate${axis}(calc(-100% - var(--gap)))`;
    const keyframes = [
      { transform: `translate${axis}(0)` },
      { transform: end },
    ];
    const tracks = root.querySelectorAll<HTMLElement>(
      "[data-slot=marquee-track]",
    );
    animationsRef.current = Array.from(tracks, (track) =>
      track.animate(keyframes, {
        duration: duration * 1000,
        iterations: Number.POSITIVE_INFINITY,
        direction: reverse ? "reverse" : "normal",
      }),
    );
    return () => {
      for (const a of animationsRef.current) a.cancel();
      animationsRef.current = [];
    };
  }, [vertical, reverse, duration, repeat]);

  function setPaused(paused: boolean) {
    if (!pauseOnHover) return;
    for (const a of animationsRef.current) paused ? a.pause() : a.play();
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover only pauses the animation
    <div
      ref={rootRef}
      data-slot="marquee"
      className={cn(
        "flex gap-(--gap) overflow-hidden [--gap:1rem]",
        vertical && "flex-col",
        className,
      )}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        setPaused(true);
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e);
        setPaused(false);
      }}
      {...props}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: copies are identical and never reorder
          key={i}
          data-slot="marquee-track"
          // Only the first copy is read by screen readers.
          aria-hidden={i > 0 || undefined}
          className={cn(
            "flex shrink-0 items-center justify-around gap-(--gap)",
            vertical && "flex-col",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
};
