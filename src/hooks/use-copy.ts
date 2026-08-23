"use client";

import { useState } from "react";

export function useCopy() {
  const [copied, setCopied] = useState(false);

  const copy = (value: string) => {
    if (typeof navigator === "undefined")
      return alert("Clipboard not supported");
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return [copied, copy] as const;
}
