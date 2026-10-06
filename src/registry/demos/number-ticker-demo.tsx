"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";

export function NumberTickerDemo() {
  const [value, setValue] = useState(98);

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        aria-label="Decrement"
        onClick={() => setValue((v) => v - 1)}
      >
        <Minus aria-hidden="true" />
      </Button>
      <NumberTicker
        value={value}
        setValue={setValue}
        className="min-w-[3ch] justify-center text-4xl font-semibold"
      />
      <Button
        variant="outline"
        size="icon"
        aria-label="Increment"
        onClick={() => setValue((v) => v + 1)}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
