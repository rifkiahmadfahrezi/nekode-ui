"use client";

import React from "react";

import { cn } from "@/lib/utils";

export interface TextTyperProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  text: string;
  /**
   * Milliseconds between characters.
   * @default 50
   */
  speed?: number;
  /**
   * Show a blinking caret after the typed text.
   * @default true
   */
  cursor?: boolean;
  onComplete?: () => void;
}

export const TextTyper = ({
  text,
  speed = 50,
  cursor = true,
  onComplete,
  className,
  ...props
}: TextTyperProps) => {
  // Array.from splits by code point, so emoji and accented letters type as one.
  const chars = React.useMemo(() => Array.from(text), [text]);
  const [count, setCount] = React.useState(0);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(chars.length);
      onCompleteRef.current?.();
      return;
    }
    setCount(0);
    let typed = 0;
    const id = setInterval(() => {
      typed += 1;
      setCount(typed);
      if (typed >= chars.length) {
        clearInterval(id);
        onCompleteRef.current?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [chars, speed]);

  return (
    <span
      data-slot="text-typer"
      className={cn("whitespace-pre-wrap", className)}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.slice(0, count).join("")}
        {cursor && (
          <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-pulse bg-current" />
        )}
      </span>
    </span>
  );
};
