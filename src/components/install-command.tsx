"use client";

import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
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
    <button
      type="button"
      onClick={() =>
        copy(`npx shadcn@latest add ${getRegistryRef(origin, name)}`)
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group flex w-full max-w-lg items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 font-mono text-sm transition-colors hover:border-foreground/30"
    >
      <span className="flex min-w-0 items-center truncate text-left text-foreground">
        <span className="select-none text-muted-foreground">$&nbsp;</span>
        <span className="truncate">npx shadcn@latest add {prefix}</span>
        <span className="relative inline-flex h-5 shrink-0 items-center overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={name}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-primary"
            >
              {name}
            </motion.span>
          </AnimatePresence>
        </span>
        <span>{suffix}</span>
      </span>
      {copied ? (
        <Check className="size-4 shrink-0" />
      ) : (
        <Copy className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      )}
    </button>
  );
}
