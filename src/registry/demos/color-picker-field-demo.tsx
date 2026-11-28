"use client";

import * as React from "react";
import { ColorPickerField } from "@/components/ui/color-picker-field";

export function ColorPickerFieldDemo() {
  const [color, setColor] = React.useState("#6366f1");

  return (
    <div className="grid w-full max-w-xs gap-4">
      <ColorPickerField
        label="Brand color"
        description="Pick from the panel, a preset, or type a hex code."
        value={color}
        onValueChange={setColor}
      />
      <div
        className="h-10 rounded-md border"
        style={{ backgroundColor: color || "transparent" }}
      />
    </div>
  );
}
