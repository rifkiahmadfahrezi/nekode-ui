"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export function RichTextEditorDemo() {
  const [html, setHtml] = useState(
    "<h2>Release notes</h2><p>Select text to see <strong>formatting</strong> in action, or use the toolbar above.</p>",
  );

  return (
    <RichTextEditor
      value={html}
      onValueChange={setHtml}
      placeholder="Write something…"
      aria-label="Release notes"
      className="w-full max-w-2xl"
    />
  );
}
