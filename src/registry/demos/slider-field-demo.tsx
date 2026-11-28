"use client";

import { RangeSliderField, SliderField } from "@/components/ui/slider-field";

export function SliderFieldDemo() {
  return (
    <div className="grid w-full max-w-sm gap-8">
      <SliderField
        label="Volume"
        description="Drag the thumb or use the arrow keys."
        defaultValue={40}
        formatValue={(value) => `${value}%`}
      />
      <RangeSliderField
        label="Price range"
        min={0}
        max={1000}
        step={10}
        defaultValue={[200, 750]}
        formatValue={(value) => `$${value}`}
        showMinMax
      />
    </div>
  );
}
