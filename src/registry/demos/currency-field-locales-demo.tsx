"use client";

import { CurrencyField } from "@/components/ui/currency-field";

export function CurrencyFieldLocalesDemo() {
  return (
    <div className="grid w-full max-w-[400px] gap-4">
      <CurrencyField
        label="Indonesian rupiah"
        locale="id-ID"
        currency="IDR"
        defaultValue={2500000}
      />
      <CurrencyField
        label="Euro (German format)"
        locale="de-DE"
        currency="EUR"
        defaultValue={1234.5}
      />
      <CurrencyField
        label="Japanese yen, as a code"
        locale="ja-JP"
        currency="JPY"
        currencyDisplay="code"
        defaultValue={98000}
      />
    </div>
  );
}
