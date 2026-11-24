import path from "node:path";
import { expect, type Locator, type Page, test } from "@playwright/test";

// Covers rich-text-editor, rich-text-content and rich-text-field through the
// demos on their docs pages.

const IMAGE = path.join(import.meta.dirname, "fixtures/image.png");

/** Select `text` inside `root` with a real DOM range. */
async function selectText(root: Locator, text: string) {
  await root.evaluate((el, text) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const i = node.textContent?.indexOf(text) ?? -1;
      if (i >= 0) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + text.length);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        return;
      }
    }
    throw new Error(`Text not found: ${text}`);
  }, text);
}

/** Dispatch a paste or drop event that carries an image file. */
async function sendImage(root: Locator, type: "paste" | "drop") {
  await root.evaluate((el, type) => {
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 80;
    const bytes = Uint8Array.from(
      atob(canvas.toDataURL("image/png").split(",")[1]),
      (c) => c.charCodeAt(0),
    );
    const data = new DataTransfer();
    data.items.add(new File([bytes], `${type}.png`, { type: "image/png" }));
    const rect = el.getBoundingClientRect();
    el.dispatchEvent(
      type === "paste"
        ? new ClipboardEvent("paste", {
            clipboardData: data,
            bubbles: true,
            cancelable: true,
          })
        : new DragEvent("drop", {
            dataTransfer: data,
            bubbles: true,
            cancelable: true,
            clientX: rect.left + 20,
            clientY: rect.bottom - 10,
          }),
    );
  }, type);
}

const editorRoot = (textbox: Locator) =>
  textbox.locator("xpath=ancestor::*[@data-slot='rich-text-editor']");

async function openEditorDocs(page: Page) {
  await page.goto("/docs/ui-components/rich-text-editor");
}

test.describe("RichTextEditor: toolbar", () => {
  test.beforeEach(({ page }) => openEditorDocs(page));

  test("formats a selection and reflects state with aria-pressed", async ({
    page,
  }) => {
    const editor = page.getByRole("textbox", { name: "Release notes" });
    const toolbar = editorRoot(editor).getByRole("toolbar", {
      name: "Formatting",
    });
    await expect(toolbar.getByRole("button")).toHaveCount(17);

    await editor.click();
    await selectText(editor, "Select text");
    const bold = toolbar.getByRole("button", { name: "Bold" });
    await bold.click();
    await expect(
      editor.locator("strong", { hasText: "Select text" }),
    ).toHaveCount(1);
    await expect(bold).toHaveAttribute("aria-pressed", "true");
  });

  test("Mod+K edits links without triggering the site's search", async ({
    page,
  }) => {
    const editor = page.getByRole("textbox", { name: "Release notes" });
    await editor.click();
    await selectText(editor, "toolbar above");
    await page.keyboard.press("ControlOrMeta+k");

    const url = page.getByRole("textbox", { name: "Link URL" });
    await url.fill("example.com");
    await url.press("Enter");
    await expect(
      editor.locator("a", { hasText: "toolbar above" }),
    ).toHaveAttribute("href", /example\.com/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("arrow keys move focus between toolbar buttons", async ({ page }) => {
    const editor = page.getByRole("textbox", { name: "Release notes" });
    const toolbar = editorRoot(editor).getByRole("toolbar", {
      name: "Formatting",
    });
    await toolbar.getByRole("button", { name: "Bold" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(toolbar.getByRole("button", { name: "Italic" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(toolbar.getByRole("button", { name: "Image" })).toBeFocused();
    // Wraps around, skipping Undo/Redo: they're disabled with no history.
    await page.keyboard.press("ArrowRight");
    await expect(
      toolbar.getByRole("button", { name: "Heading 1" }),
    ).toBeFocused();
  });

  test("markdown shortcuts create blocks", async ({ page }) => {
    const editor = page.getByRole("textbox", { name: "Release notes" });
    await editor.click();
    await page.keyboard.press("ControlOrMeta+End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("## Typed heading");
    await expect(
      editor.locator("h2", { hasText: "Typed heading" }),
    ).toHaveCount(1);
  });
});

test.describe("RichTextEditor: bubble menu", () => {
  test.beforeEach(({ page }) => openEditorDocs(page));

  test("appears only for a selection and formats it", async ({ page }) => {
    const editor = page.getByRole("textbox", { name: "Comment" });
    const bubble = page.getByRole("toolbar", { name: "Selection formatting" });
    await editor.click();
    await expect(bubble).toBeHidden();
    await expect(
      editorRoot(editor).getByRole("toolbar", { name: "Formatting" }),
    ).toHaveCount(0);

    await selectText(editor, "Select any word");
    await expect(bubble).toBeVisible();
    await bubble.getByRole("button", { name: "Italic" }).click();
    await expect(
      editor.locator("em", { hasText: "Select any word" }),
    ).toHaveCount(1);
  });

  test("Mod+K opens the link editor inside the bubble", async ({ page }) => {
    const editor = page.getByRole("textbox", { name: "Comment" });
    await editor.click();
    await selectText(editor, "sentence");
    await page.keyboard.press("ControlOrMeta+k");
    const url = page.getByRole("textbox", { name: "Link URL" });
    await url.fill("https://nekode.id");
    await url.press("Enter");
    await expect(editor.locator('a[href="https://nekode.id"]')).toHaveCount(1);
  });

  test("keeps formats that have no button", async ({ page }) => {
    const editor = page.getByRole("textbox", { name: "Comment" });
    await editor.click();
    await page.keyboard.press("ControlOrMeta+End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("# Heading without a button");
    await expect(editor.locator("h1")).toHaveText("Heading without a button");
  });
});

test.describe("RichTextEditor: images", () => {
  test.beforeEach(({ page }) => openEditorDocs(page));

  const uploadEditor = (page: Page) =>
    page.getByRole("textbox", { name: "Post body" }).first();

  test("shows previews instantly and uploads in parallel", async ({ page }) => {
    const editor = uploadEditor(page);
    await editor.click();
    await page.keyboard.press("ControlOrMeta+End");
    await editorRoot(editor)
      .locator("input[type=file]")
      .setInputFiles([IMAGE, IMAGE]);

    await expect(editor.locator("img[data-uploading]")).toHaveCount(2);
    const started = Date.now();
    await expect(editor.locator("img[data-uploading]")).toHaveCount(0);
    // The demo upload takes 800ms per file: parallel ≈ 800ms, serial ≈ 1600ms.
    expect(Date.now() - started).toBeLessThan(1400);
    await expect(editor.locator("img")).toHaveCount(3);
  });

  test("accepts pasted and dropped images", async ({ page }) => {
    const editor = uploadEditor(page);
    await editor.click();
    await sendImage(editor, "paste");
    await expect(editor.locator("img")).toHaveCount(2);
    await sendImage(editor, "drop");
    await expect(editor.locator("img")).toHaveCount(3);
  });

  test("image menu sets alt text and removes the image", async ({ page }) => {
    const editor = uploadEditor(page);
    await editor.locator("img").first().click();
    const alt = page.getByRole("textbox", {
      name: "Image description (alt text)",
    });
    await expect(alt).toHaveValue("A cat");
    await alt.fill("A cat on a bamboo fence");
    await expect(editor.locator("img")).toHaveAttribute(
      "alt",
      "A cat on a bamboo fence",
    );
    await page.getByRole("button", { name: "Remove image" }).click();
    await expect(editor.locator("img")).toHaveCount(0);
  });

  test("resizes an image by dragging a corner and saves the size", async ({
    page,
  }) => {
    const editor = uploadEditor(page);
    const image = editor.locator("img").first();
    await image.click();
    const before = (await image.boundingBox())?.width ?? 0;
    const handle = editor
      .locator('[data-resize-handle="bottom-right"]')
      .first();
    const box = await handle.boundingBox();
    if (!box) throw new Error("resize handle not rendered");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 60, box.y - 30, { steps: 8 });
    await page.mouse.up();

    await expect
      .poll(async () => (await image.boundingBox())?.width ?? 0)
      .toBeLessThan(before - 40);
    const html = await editor.evaluate((el) =>
      (el as HTMLElement & { editor: { getHTML(): string } }).editor.getHTML(),
    );
    expect(html).toMatch(/<img[^>]+width="\d+"/);
  });

  test("deferred mode uploads on save and skips removed images", async ({
    page,
  }) => {
    const form = page.locator("form", {
      has: page.getByRole("button", { name: "Save post" }),
    });
    const editor = form.getByRole("textbox", { name: "Post body" });
    await editor.click();
    await page.keyboard.press("ControlOrMeta+End");
    await form.locator("input[type=file]").setInputFiles([IMAGE, IMAGE]);

    await expect(editor.locator("img")).toHaveCount(2);
    await expect(editor.locator("img[data-uploading]")).toHaveCount(0);
    await expect(editor.locator('img[src^="blob:"]')).toHaveCount(2);

    await editor.locator("img").first().click();
    await form.getByRole("button", { name: "Remove image" }).click();
    await form.getByRole("button", { name: "Save post" }).click();
    await expect(page.getByText("Saved, 1 image(s) uploaded")).toBeVisible();
  });
});

test.describe("RichTextEditor: touch screens", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("bubble variant falls back to a fixed toolbar", async ({ page }) => {
    await openEditorDocs(page);
    const editor = page.getByRole("textbox", { name: "Comment" });
    const toolbar = editorRoot(editor).getByRole("toolbar", {
      name: "Formatting",
    });
    await expect(toolbar.getByRole("button")).toHaveCount(5);
  });
});

test.describe("RichTextContent", () => {
  test("mirrors editor JSON with built-in typography", async ({ page }) => {
    await page.goto("/docs/ui-components/rich-text-content");
    const preview = page.locator('[data-slot="rich-text-content"]').first();
    await expect(preview.locator("h2")).toHaveText("Rendered without plugins");
    await expect(preview.locator("h2")).toHaveCSS("font-size", "20px");
    await expect(preview.locator("ul")).toHaveCSS("list-style-type", "disc");

    const editor = page.getByRole("textbox", { name: "Content" });
    await editor.click();
    await page.keyboard.press("ControlOrMeta+End");
    await page.keyboard.type(" Live!");
    await expect(preview).toContainText("Live!");
  });
});

test.describe("RichTextField", () => {
  test.beforeEach(({ page }) => page.goto("/docs/form-fields/rich-text-field"));

  test("wires label, description and counter, and enforces maxLength", async ({
    page,
  }) => {
    const editor = page.getByRole("textbox", { name: "Description" });
    const describedBy = (await editor.getAttribute("aria-describedby")) ?? "";
    const [descriptionId, countId] = describedBy.split(" ");
    await expect(page.locator(`[id="${descriptionId}"]`)).toHaveText(
      "Shown on the product page.",
    );

    await page.locator("label", { hasText: "Description" }).first().click();
    await expect(editor).toBeFocused();
    await page.keyboard.type("x".repeat(520));
    await expect(editor).toHaveText("x".repeat(500));
    await expect(page.locator(`[id="${countId}"]`)).toHaveText("500 / 500");
  });

  test("shows the required error and submits with TanStack Form", async ({
    page,
  }) => {
    const editor = page.getByRole("textbox", { name: "Post" });
    await editor.click();
    await page.keyboard.type("a");
    await page.keyboard.press("Backspace");

    const error = page.getByText("Write something first");
    await expect(error).toBeVisible();
    await expect(editor).toHaveAttribute("aria-invalid", "true");
    const errorId = await editor.getAttribute("aria-errormessage");
    await expect(page.locator(`[id="${errorId}"]`)).toHaveText(
      "Write something first",
    );

    await page.keyboard.type("Hello world");
    await expect(editor).not.toHaveAttribute("aria-invalid");
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Form submitted!")).toBeVisible();
  });

  test("is available in the Form Generator", async ({ page }) => {
    await page.goto("/form-generator");
    await expect(
      page.getByText("Rich Text", { exact: true }).first(),
    ).toBeVisible();
  });
});
