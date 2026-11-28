"use client";

import * as React from "react";
import { CurrencyField } from "@/components/ui/currency-field";

export function CurrencyFieldDemo() {
  const [amount, setAmount] = React.useState<number | undefined>(1250);
  return (
    <div className="grid w-full max-w-[400px] gap-2">
      <CurrencyField label="Amount" value={amount} onValueChange={setAmount} />
      <p className="text-sm text-muted-foreground">
        Value: <code>{amount === undefined ? "undefined" : amount}</code>
      </p>
    </div>
  );
}
