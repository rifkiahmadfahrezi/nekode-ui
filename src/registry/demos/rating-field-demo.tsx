"use client";

import { Heart } from "lucide-react";
import { RatingField } from "@/components/ui/rating-field";

export function RatingFieldDemo() {
  return (
    <div className="grid gap-6">
      <RatingField
        label="Rate your stay"
        description="Click a star again to clear it."
        defaultValue={4}
      />
      <RatingField
        label="How much do you love it?"
        size="lg"
        max={5}
        defaultValue={3}
        icon={<Heart aria-hidden="true" />}
        getItemLabel={(n, max) => `${n} of ${max} hearts`}
        className="[&_[data-filled]]:text-rose-500"
      />
      <RatingField label="Average rating" value={3} readOnly size="sm" />
    </div>
  );
}
