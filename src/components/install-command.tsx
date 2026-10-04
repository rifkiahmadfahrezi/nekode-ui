"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useCopy } from "@/hooks/use-copy";
import { getRegistryRef, useOrigin } from "@/hooks/use-origin";

const items = [
  "date-picker-field",
  "text-field",
  "select-field",
  "combobox-field",
  "password-field",
  "login-form",
];

export function InstallCommand() {
  const origin = useOrigin();
  const [copied, copy] = useCopy();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();

  // Hidden copy of the name reports its width (also after font load / text
  // size change), so the slot can tween to it instead of snapping.
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.offsetWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 2500);
    return () => clearInterval(id);
  }, [paused, reduceMotion]);

  const name = items[index];
  const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(origin);
  const prefix = isLocalDev ? `${origin}/r/` : "@nekode/";
  const suffix = isLocalDev ? ".json" : "";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover cuma pause animasi
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pill max-sm:h-[52px] max-sm:gap-2.5 max-sm:pl-4 max-sm:text-[13px]"
    >
      <span className="font-bold text-brand">$</span>
      <code className="flex items-center">
        <span className="truncate">npx shadcn@latest add {prefix}</span>
        <motion.span
          className="relative inline-flex h-5 shrink-0 items-center overflow-hidden"
          initial={false}
          animate={{ width: width ?? "auto" }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.45, ease: [0.4, 0, 0.2, 1] }
          }
        >
          <span
            ref={measureRef}
            aria-hidden="true"
            className="invisible absolute left-0 font-bold whitespace-nowrap"
          >
            {name}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={name}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="font-bold whitespace-nowrap text-brand"
            >
              {name}
            </motion.span>
          </AnimatePresence>
        </motion.span>
        <span className="shrink-0">{suffix}</span>
      </code>
      <button
        type="button"
        className={copied ? "copy done" : "copy"}
        onClick={() =>
          copy(`npx shadcn@latest add ${getRegistryRef(origin, name)}`)
        }
        aria-label={`Copy install command for ${name}`}
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}
