import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { RichTextEditor, type RichTextEditorHandle } from "./rich-text-editor";

describe("RichTextEditor", () => {
  it("renders only the configured tools but keeps all saved formatting", async () => {
    render(
      <RichTextEditor
        tools={["bold", "|", "bulletList"]}
        defaultValue='<h1>Title</h1><p><strong>b</strong> <em>i</em></p><img src="https://x.dev/a.png">'
        aria-label="Body"
      />,
    );
    const toolbar = await screen.findByRole("toolbar", { name: "Formatting" });
    expect(
      Array.from(toolbar.querySelectorAll("button")).map((b) =>
        b.getAttribute("aria-label"),
      ),
    ).toEqual(["Bold", "Bullet list"]);

    // Tools only pick buttons: content they don't cover must survive.
    const textbox = screen.getByRole("textbox", { name: "Body" });
    expect(textbox.querySelector("strong")).not.toBeNull();
    expect(textbox.querySelector("h1")).not.toBeNull();
    expect(textbox.querySelector("em")).not.toBeNull();
    expect(textbox.querySelector("img")).not.toBeNull();
  });

  it("does not wipe JSON content whose nodes have no button", async () => {
    const onValueChange = vi.fn();
    const doc = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Kept" }],
        },
      ],
    };
    render(
      <RichTextEditor
        output="json"
        variant="bubble"
        value={doc}
        onValueChange={onValueChange}
        aria-label="Doc"
      />,
    );
    const textbox = await screen.findByRole("textbox", { name: "Doc" });
    await waitFor(() =>
      expect(textbox.querySelector("h2")?.textContent).toBe("Kept"),
    );
    // StarterKit may normalise the doc (e.g. a trailing paragraph); every
    // emitted value must still hold the heading.
    for (const [emitted] of onValueChange.mock.calls) {
      expect(JSON.stringify(emitted)).toContain('"text":"Kept"');
    }
  });

  it("toggles formatting and emits html", async () => {
    const onValueChange = vi.fn();
    render(
      <RichTextEditor
        defaultValue="<p>hello</p>"
        onValueChange={onValueChange}
        onEditorReady={(editor) => editor.commands.selectAll()}
      />,
    );
    const bold = await screen.findByRole("button", { name: "Bold" });
    expect(bold.getAttribute("aria-pressed")).toBe("false");
    bold.click();
    await waitFor(() =>
      expect(onValueChange).toHaveBeenLastCalledWith(
        "<p><strong>hello</strong></p>",
      ),
    );
    await waitFor(() => expect(bold.getAttribute("aria-pressed")).toBe("true"));
  });

  it("emits an empty string for an empty editor", async () => {
    const onValueChange = vi.fn();
    render(
      <RichTextEditor
        defaultValue="<p>x</p>"
        onValueChange={onValueChange}
        onEditorReady={(editor) => editor.commands.clearContent(true)}
      />,
    );
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(""));
  });

  it("defers uploads until uploadPendingImages, skipping removed images", async () => {
    let n = 0;
    URL.createObjectURL = vi.fn(() => `blob:local/${++n}`);
    URL.revokeObjectURL = vi.fn();
    const onUpload = vi.fn(
      async (file: File) => `https://cdn.test/${file.name}`,
    );
    const ref = createRef<RichTextEditorHandle>();
    const { container } = render(
      <RichTextEditor
        ref={ref}
        tools={["image"]}
        uploadMode="deferred"
        onUpload={onUpload}
        aria-label="Body"
      />,
    );
    await screen.findByRole("button", { name: "Image" });
    const input = container.querySelector<HTMLInputElement>("input[type=file]");
    const files = ["a.png", "b.png"].map(
      (name) => new File(["x"], name, { type: "image/png" }),
    );
    fireEvent.change(input as HTMLInputElement, { target: { files } });

    const textbox = screen.getByRole("textbox", { name: "Body" });
    await waitFor(() =>
      expect(textbox.querySelectorAll("img")).toHaveLength(2),
    );
    expect(onUpload).not.toHaveBeenCalled();
    expect(ref.current?.pendingImageCount()).toBe(2);

    // Remove the first image before "submitting"; it must not be uploaded.
    act(() => {
      const editor = ref.current?.editor;
      let pos = -1;
      editor?.state.doc.descendants((node, p) => {
        if (node.attrs.src === "blob:local/1") pos = p;
      });
      editor?.chain().setNodeSelection(pos).deleteSelection().run();
    });
    await waitFor(() => expect(ref.current?.pendingImageCount()).toBe(1));

    let html: unknown;
    await act(async () => {
      html = await ref.current?.uploadPendingImages();
    });
    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(onUpload.mock.calls[0][0].name).toBe("b.png");
    expect(html).toContain('src="https://cdn.test/b.png"');
    expect(html).not.toContain("blob:");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:local/2");
    expect(ref.current?.pendingImageCount()).toBe(0);
  });
});
