"use client";

import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Stand-in for a real upload (S3 presigned URL, R2, Cloudinary...).
// Resolve with the public URL of the stored file.
async function uploadImage(file: File) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return URL.createObjectURL(file);
}

export function RichTextEditorUploadDemo() {
  return (
    <RichTextEditor
      tools={["bold", "italic", "|", "bulletList", "orderedList", "|", "image"]}
      onUpload={uploadImage}
      maxFileSize={2 * 1024 * 1024}
      onUploadError={(error) => toast.error(error.message)}
      defaultValue={`<p>Paste, drop, or pick an image with the toolbar button. Click an image and drag its corners to resize it.</p><img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=640" alt="A cat" width="320">`}
      aria-label="Post body"
      className="w-full max-w-2xl"
    />
  );
}
