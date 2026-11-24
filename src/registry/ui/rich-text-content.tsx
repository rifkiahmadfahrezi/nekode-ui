import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Typography for rich text, written as plain Tailwind arbitrary variants so
 * consumers don't need `@tailwindcss/typography`. Shared by `RichTextEditor`
 * and `RichTextContent`, so what you type is exactly what you render.
 */
export const richTextClassName = cn(
  "text-sm leading-relaxed text-foreground break-words",
  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
  "[&_p]:my-2",
  "[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight",
  "[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul_ul]:list-[circle]",
  "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:my-1 [&_li>p]:my-0 [&_li::marker]:text-muted-foreground",
  "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic",
  "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em]",
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[0.875em]",
  "[&_hr]:my-4 [&_hr]:border-border",
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
  "[&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md",
);

/** Tiptap / ProseMirror JSON document (structurally compatible with `JSONContent`). */
export interface RichTextNode {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

/**
 * Drops `javascript:` and other script-capable URL schemes. Relative URLs,
 * http(s), mailto and tel pass; `data:image/*` passes only for images.
 */
export function safeUrl(url: unknown, allowDataImage = false) {
  if (typeof url !== "string") return undefined;
  const s = url.trim();
  if (allowDataImage && /^data:image\//i.test(s)) return s;
  // Browsers ignore tabs/newlines inside schemes ("java\nscript:"), so strip
  // control chars before checking.
  const compact = Array.from(s)
    .filter((c) => c.charCodeAt(0) > 32)
    .join("");
  const scheme = compact.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme && !/^(https?|mailto|tel)$/i.test(scheme[1])) return undefined;
  return s;
}

const str = (v: unknown) => (typeof v === "string" ? v : undefined);
const num = (v: unknown) =>
  typeof v === "number" || (typeof v === "string" && v !== "")
    ? Number(v) || undefined
    : undefined;

function renderText(node: RichTextNode, key: React.Key) {
  let out: React.ReactNode = node.text;
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        out = <strong>{out}</strong>;
        break;
      case "italic":
        out = <em>{out}</em>;
        break;
      case "underline":
        out = <u>{out}</u>;
        break;
      case "strike":
        out = <s>{out}</s>;
        break;
      case "code":
        out = <code>{out}</code>;
        break;
      case "link": {
        const href = safeUrl(mark.attrs?.href);
        if (href) {
          const target = str(mark.attrs?.target);
          out = (
            <a
              href={href}
              target={target}
              rel={
                target === "_blank"
                  ? "noopener noreferrer nofollow"
                  : "nofollow"
              }
            >
              {out}
            </a>
          );
        }
        break;
      }
    }
  }
  return <React.Fragment key={key}>{out}</React.Fragment>;
}

function renderNode(node: RichTextNode, key: React.Key): React.ReactNode {
  if (node.type === "text") return renderText(node, key);
  const children = node.content?.map((child, i) => renderNode(child, i));
  const a = node.attrs ?? {};

  switch (node.type) {
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const level = Math.min(Math.max(num(a.level) ?? 1, 1), 6);
      return React.createElement(`h${level}`, { key }, children);
    }
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return (
        <ol key={key} start={num(a.start)}>
          {children}
        </ol>
      );
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock": {
      const lang = str(a.language);
      return (
        <pre key={key}>
          <code className={lang ? `language-${lang}` : undefined}>
            {children}
          </code>
        </pre>
      );
    }
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "image": {
      const src = safeUrl(a.src, true);
      if (!src) return null;
      return (
        <img
          key={key}
          src={src}
          alt={str(a.alt) ?? ""}
          title={str(a.title)}
          width={num(a.width)}
          height={num(a.height)}
          loading="lazy"
        />
      );
    }
    default:
      // doc, and any node type this renderer doesn't know: keep its children.
      return <React.Fragment key={key}>{children}</React.Fragment>;
  }
}

export interface RichTextContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Tiptap JSON (`output="json"` from `RichTextEditor`). Rendered as React
   * elements: safe for user-generated content and SSR, no sanitizer needed.
   */
  json?: RichTextNode | null;
  /**
   * HTML string, injected as-is. Only pass trusted or already-sanitized HTML
   * (e.g. DOMPurify on the server) — prefer `json` for user content.
   */
  html?: string | null;
}

export const RichTextContent = React.forwardRef<
  HTMLDivElement,
  RichTextContentProps
>(({ json, html, className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="rich-text-content"
    className={cn(richTextClassName, className)}
    {...(json
      ? { children: renderNode(json, "root") }
      : html
        ? { dangerouslySetInnerHTML: { __html: html } }
        : {})}
    {...props}
  />
));

RichTextContent.displayName = "RichTextContent";
