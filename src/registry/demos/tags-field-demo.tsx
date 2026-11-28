"use client";

import * as React from "react";
import { TagsField } from "@/components/ui/tags-field";

export function TagsFieldDemo() {
  const [tags, setTags] = React.useState(["react", "tailwind"]);
  return (
    <TagsField
      label="Skills"
      description="Press Enter or comma to add. Backspace removes the last one."
      value={tags}
      onValueChange={setTags}
      fieldClassName="max-w-[400px]"
    />
  );
}
