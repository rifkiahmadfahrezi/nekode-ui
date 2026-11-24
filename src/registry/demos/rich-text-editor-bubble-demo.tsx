"use client";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

export function RichTextEditorBubbleDemo() {
  return (
    <RichTextEditor
      variant="bubble"
      bubbleTools={["bold", "italic", "strike", "|", "heading2", "|", "link"]}
      defaultValue="<p>Select any word in this sentence and a formatting menu appears right above it. On touch screens the tools show in a toolbar instead.</p>"
      placeholder="Select text to format it…"
      aria-label="Comment"
      className="w-full max-w-2xl"
    />
  );
}
