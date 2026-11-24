"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/ui/rich-text-editor";

// Stand-in for a real upload. Resolve with the stored file's public URL.
async function uploadImage(file: File) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return URL.createObjectURL(file);
}

export function RichTextEditorDeferredUploadDemo() {
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!editorRef.current) return;
    setSaving(true);
    try {
      const count = editorRef.current.pendingImageCount();
      const html = await editorRef.current.uploadPendingImages();
      // Save `html` here: every image now points at its uploaded URL.
      toast.success(`Saved, ${count} image(s) uploaded`, {
        description: `${String(html).length} characters of HTML`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl flex-col gap-3"
    >
      <RichTextEditor
        ref={editorRef}
        uploadMode="deferred"
        onUpload={uploadImage}
        tools={["bold", "italic", "|", "image"]}
        defaultValue="<p>Add a few images, delete one, then save. Only the images still in the post are uploaded.</p>"
        aria-label="Post body"
      />
      <Button type="submit" disabled={saving} className="self-end">
        {saving ? "Uploading…" : "Save post"}
      </Button>
    </form>
  );
}
