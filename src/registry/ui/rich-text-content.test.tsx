import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichTextContent, safeUrl } from "./rich-text-content";

describe("safeUrl", () => {
  it("blocks script-capable schemes, including obfuscated ones", () => {
    expect(safeUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeUrl(" JaVaScRiPt:alert(1)")).toBeUndefined();
    expect(safeUrl("java\nscript:alert(1)")).toBeUndefined();
    expect(safeUrl("data:text/html,<script>")).toBeUndefined();
    expect(safeUrl("data:image/png;base64,AAA")).toBeUndefined();
  });

  it("allows web links, relative urls and data images for images", () => {
    expect(safeUrl("https://a.com")).toBe("https://a.com");
    expect(safeUrl("mailto:a@b.c")).toBe("mailto:a@b.c");
    expect(safeUrl("/path?x=1:2")).toBe("/path?x=1:2");
    expect(safeUrl("data:image/png;base64,AAA", true)).toBe(
      "data:image/png;base64,AAA",
    );
  });
});

describe("RichTextContent", () => {
  it("renders Tiptap JSON with marks, and drops unsafe links", () => {
    const { container } = render(
      <RichTextContent
        json={{
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Title" }],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "bold", marks: [{ type: "bold" }] },
                {
                  type: "text",
                  text: "safe",
                  marks: [
                    {
                      type: "link",
                      attrs: { href: "https://x.dev", target: "_blank" },
                    },
                  ],
                },
                {
                  type: "text",
                  text: "evil",
                  marks: [
                    { type: "link", attrs: { href: "javascript:alert(1)" } },
                  ],
                },
                { type: "text", text: "<script>alert(1)</script>" },
              ],
            },
            {
              type: "image",
              attrs: { src: "https://x.dev/a.png", width: 320 },
            },
          ],
        }}
      />,
    );
    expect(container.querySelector("h2")?.textContent).toBe("Title");
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("rel")).toContain("noopener");
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("evil");
    expect(container.querySelector("img")?.getAttribute("width")).toBe("320");
  });
});
