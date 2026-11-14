"use client";

import { useState } from "react";
import { ResponsiveMultiSelect } from "@/components/ui/responsive-multi-select";

const toppings = [
  { label: "Cheese", value: "cheese" },
  { label: "Mushroom", value: "mushroom" },
  { label: "Pepperoni", value: "pepperoni" },
  { label: "Onion", value: "onion" },
  { label: "Olive", value: "olive" },
  { label: "Jalapeño", value: "jalapeno" },
  { label: "Pineapple", value: "pineapple" },
  { label: "Chicken", value: "chicken" },
];

export function ResponsiveMultiSelectDemo() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <ResponsiveMultiSelect
      label="Toppings"
      description="Chips + popover on desktop, a bottom drawer on mobile."
      placeholder="Pick your toppings"
      searchPlaceholder="Search toppings..."
      options={toppings}
      value={value}
      onValueChange={setValue}
      fieldClassName="w-72"
    />
  );
}
