"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";

const START = 10;

export function NumberTickerCountdownDemo() {
  const [value, setValue] = useState(START);

  useEffect(() => {
    if (value <= 0) return;
    const id = setTimeout(() => setValue((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-4">
      <NumberTicker value={value} className="text-6xl font-bold" />
      <Button
        variant="outline"
        disabled={value > 0}
        onClick={() => setValue(START)}
      >
        Restart
      </Button>
    </div>
  );
}
