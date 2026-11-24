"use client";

import type { JSONContent } from "@tiptap/react";
import { useState } from "react";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const initial: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Rendered without plugins" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Edit on the left; this preview uses " },
        { type: "text", text: "RichTextContent", marks: [{ type: "code" }] },
        { type: "text", text: " with the same styles as the editor." },
      ],
    },
    {
      type: "bulletList",
      content: [
        "No typography plugin",
        "Safe JSON rendering",
        "Works in SSR",
      ].map((text) => ({
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text }] }],
      })),
    },
  ],
};

export function RichTextContentDemo() {
  const [doc, setDoc] = useState<JSONContent>(initial);

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <RichTextEditor
        output="json"
        value={doc}
        onValueChange={setDoc}
        variant="bubble"
        aria-label="Content"
      />
      <RichTextContent json={doc} className="rounded-md border p-3" />
    </div>
  );
}
