"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type React from "react";

import { cn } from "@/lib/utils";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;

// Columns added or removed when the digit count changes grow or shrink in
// width instead of popping, so the remaining digits slide over smoothly.
const COLUMN_PRESENCE = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
  transition: SPRING,
};

export interface NumberTickerProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  value: number;
  /**
   * When passed, the ticker becomes a focusable spinbutton:
   * ArrowUp / ArrowDown call it with `value + 1` / `value - 1`.
   */
  setValue?: (value: number) => void;
}

function DigitColumn({ digit }: { digit: number }) {
  return (
    <motion.span
      {...COLUMN_PRESENCE}
      className="relative inline-block h-[1em] overflow-hidden"
    >
      <motion.span
        className="flex flex-col"
        // A newly added column starts at 0 and rolls to its digit.
        initial={{ y: "0%" }}
        animate={{ y: `${-digit * 10}%` }}
        transition={SPRING}
      >
        {DIGITS.map((d) => (
          <span key={d} className="h-[1em]">
            {d}
          </span>
        ))}
      </motion.span>
    </motion.span>
  );
}

export const NumberTicker = ({
  value,
  setValue,
  className,
  onKeyDown,
  ...props
}: NumberTickerProps) => {
  const chars = String(value).split("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    onKeyDown?.(e);
    if (!setValue || e.defaultPrevented) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setValue(value + 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setValue(value - 1);
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useAriaPropsSupportedByRole: role is spinbutton whenever setValue makes it interactive
    <span
      data-slot="number-ticker"
      className={cn(
        "inline-flex leading-none tabular-nums",
        setValue &&
          "rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      role={setValue ? "spinbutton" : undefined}
      tabIndex={setValue ? 0 : undefined}
      aria-valuenow={setValue ? value : undefined}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <span className="sr-only">{value}</span>
      <MotionConfig reducedMotion="user">
        <span aria-hidden="true" className="inline-flex">
          <AnimatePresence initial={false}>
            {chars.map((char, i) => {
              // Key by place from the right so the ones digit keeps its
              // column (and its roll) when the number gains or loses digits.
              const place = chars.length - i;
              return /\d/.test(char) ? (
                <DigitColumn key={`d${place}`} digit={Number(char)} />
              ) : (
                <motion.span
                  key={`s${place}`}
                  {...COLUMN_PRESENCE}
                  className="inline-block overflow-hidden"
                >
                  {char}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </span>
      </MotionConfig>
    </span>
  );
};
