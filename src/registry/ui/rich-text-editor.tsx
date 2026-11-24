"use client";

import Image from "@tiptap/extension-image";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import {
  type Editor,
  EditorContent,
  type Extensions,
  type JSONContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Loader2Icon,
  MinusIcon,
  QuoteIcon,
  Redo2Icon,
  SquareCodeIcon,
  StrikethroughIcon,
  Trash2Icon,
  UnderlineIcon,
  Undo2Icon,
  UnlinkIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { richTextClassName } from "@/components/ui/rich-text-content";
import { cn } from "@/lib/utils";

export type RichTextTool =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock"
  | "horizontalRule"
  | "link"
  | "image"
  | "undo"
  | "redo"
  /** Visual separator between groups. */
  | "|";

type ToolName = Exclude<RichTextTool, "|">;

export const defaultToolbarTools: RichTextTool[] = [
  "undo",
  "redo",
  "|",
  "heading1",
  "heading2",
  "heading3",
  "|",
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "|",
  "bulletList",
  "orderedList",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "|",
  "link",
  "image",
];

export const defaultBubbleTools: RichTextTool[] = [
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "|",
  "link",
];

interface ToolDef {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  run: (editor: Editor) => void;
  active?: (editor: Editor) => boolean;
  can?: (editor: Editor) => boolean;
}

const TOOLS: Record<Exclude<ToolName, "link" | "image">, ToolDef> = {
  bold: {
    label: "Bold",
    icon: BoldIcon,
    shortcut: "Mod+B",
    run: (e) => e.chain().focus().toggleBold().run(),
    active: (e) => e.isActive("bold"),
  },
  italic: {
    label: "Italic",
    icon: ItalicIcon,
    shortcut: "Mod+I",
    run: (e) => e.chain().focus().toggleItalic().run(),
    active: (e) => e.isActive("italic"),
  },
  underline: {
    label: "Underline",
    icon: UnderlineIcon,
    shortcut: "Mod+U",
    run: (e) => e.chain().focus().toggleUnderline().run(),
    active: (e) => e.isActive("underline"),
  },
  strike: {
    label: "Strikethrough",
    icon: StrikethroughIcon,
    shortcut: "Mod+Shift+S",
    run: (e) => e.chain().focus().toggleStrike().run(),
    active: (e) => e.isActive("strike"),
  },
  code: {
    label: "Inline code",
    icon: CodeIcon,
    shortcut: "Mod+E",
    run: (e) => e.chain().focus().toggleCode().run(),
    active: (e) => e.isActive("code"),
  },
  heading1: {
    label: "Heading 1",
    icon: Heading1Icon,
    run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    active: (e) => e.isActive("heading", { level: 1 }),
  },
  heading2: {
    label: "Heading 2",
    icon: Heading2Icon,
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    active: (e) => e.isActive("heading", { level: 2 }),
  },
  heading3: {
    label: "Heading 3",
    icon: Heading3Icon,
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    active: (e) => e.isActive("heading", { level: 3 }),
  },
  bulletList: {
    label: "Bullet list",
    icon: ListIcon,
    run: (e) => e.chain().focus().toggleBulletList().run(),
    active: (e) => e.isActive("bulletList"),
  },
  orderedList: {
    label: "Numbered list",
    icon: ListOrderedIcon,
    run: (e) => e.chain().focus().toggleOrderedList().run(),
    active: (e) => e.isActive("orderedList"),
  },
  blockquote: {
    label: "Quote",
    icon: QuoteIcon,
    run: (e) => e.chain().focus().toggleBlockquote().run(),
    active: (e) => e.isActive("blockquote"),
  },
  codeBlock: {
    label: "Code block",
    icon: SquareCodeIcon,
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
    active: (e) => e.isActive("codeBlock"),
  },
  horizontalRule: {
    label: "Divider",
    icon: MinusIcon,
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  undo: {
    label: "Undo",
    icon: Undo2Icon,
    shortcut: "Mod+Z",
    run: (e) => e.chain().focus().undo().run(),
    can: (e) => e.can().undo(),
  },
  redo: {
    label: "Redo",
    icon: Redo2Icon,
    shortcut: "Mod+Shift+Z",
    run: (e) => e.chain().focus().redo().run(),
    can: (e) => e.can().redo(),
  },
};

/** Upload a file and resolve to its public URL. */
export type RichTextUploadHandler = (file: File) => Promise<string>;

type ValueProps =
  | {
      /** Format passed to `onValueChange` and expected in `value`. */
      output?: "html";
      value?: string;
      defaultValue?: string;
      onValueChange?: (value: string) => void;
    }
  | {
      output: "json";
      value?: JSONContent;
      defaultValue?: JSONContent;
      onValueChange?: (value: JSONContent) => void;
    };

export type RichTextEditorProps = ValueProps & {
  /** Where formatting controls appear. */
  variant?: "toolbar" | "bubble" | "both" | "none";
  /** Tools in the fixed toolbar. Only picks buttons: content with other formatting is kept, and keyboard/Markdown shortcuts always work. */
  tools?: RichTextTool[];
  /** Tools in the selection bubble menu. */
  bubbleTools?: RichTextTool[];
  placeholder?: string;
  disabled?: boolean;
  /** Uploads pasted, dropped, and picked images. Passing it enables image paste/drop even without an `"image"` tool. Without it images are embedded as base64 data URLs. */
  onUpload?: RichTextUploadHandler;
  /** Called when a file is rejected or `onUpload` throws. */
  onUploadError?: (error: Error, file: File) => void;
  /**
   * `"immediate"`: images upload with `onUpload` as soon as they're pasted,
   * dropped, or picked. `"deferred"`: images stay local (blob URLs) until you
   * call `ref.current.uploadPendingImages()`, e.g. on submit, so images the
   * user removes before submitting are never uploaded.
   */
  uploadMode?: "immediate" | "deferred";
  /** Max image size in bytes. */
  maxFileSize?: number;
  /** Max number of characters. Typing and pasting stop at the limit. */
  maxLength?: number;
  /** Show a character counter below the editor (`count / maxLength` when `maxLength` is set). */
  showCount?: boolean;
  /** Let users resize images by dragging their corners. */
  imageResize?: boolean;
  /** Extra Tiptap extensions, appended after the built-in ones. */
  extensions?: Extensions;
  /** Called when the editable area loses focus (e.g. a form's `handleBlur`). */
  onBlur?: () => void;
  /** Called once the Tiptap editor instance is ready. */
  onEditorReady?: (editor: Editor) => void;
  className?: string;
  toolbarClassName?: string;
  contentClassName?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-errormessage"?: string;
};

export interface RichTextEditorHandle {
  /** The Tiptap editor instance, or `null` before it mounts. */
  editor: Editor | null;
  /** Number of local images not uploaded yet (waiting in deferred mode, or still uploading). */
  pendingImageCount: () => number;
  /**
   * Uploads every local image still in the document with `onUpload`, swaps in
   * the returned URLs, and resolves to the final value in `output` format.
   * Successful uploads are applied even if some fail; then it throws an
   * `AggregateError` with the failures, so a retry only uploads what's left.
   */
  uploadPendingImages: () => Promise<string | JSONContent>;
}

/** An empty editor emits `""` (not `<p></p>`) so `required` validation works. */
function editorValue(editor: Editor, output: "html" | "json" | undefined) {
  if (output === "json") return editor.getJSON();
  return editor.isEmpty ? "" : editor.getHTML();
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export const RichTextEditor = React.forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(function RichTextEditor(props, ref) {
  const {
    value,
    defaultValue,
    variant = "toolbar",
    tools = defaultToolbarTools,
    bubbleTools = defaultBubbleTools,
    placeholder,
    disabled = false,
    onUpload,
    imageResize = true,
    maxLength,
    showCount,
    extensions: extraExtensions,
    className,
    toolbarClassName,
    contentClassName,
  } = props;

  // Bubble menus fight the native selection menu on touch screens, so touch
  // devices get a fixed toolbar instead.
  const coarsePointer = useCoarsePointer();
  const showToolbar =
    variant === "toolbar" ||
    variant === "both" ||
    (variant === "bubble" && coarsePointer);
  const showBubble =
    (variant === "bubble" || variant === "both") && !coarsePointer;
  const toolbarTools = variant === "bubble" ? bubbleTools : tools;

  // Tools only pick buttons. The schema always supports every format, so
  // saved content is never dropped when it's loaded into a smaller toolbar.
  const reachable = new Set<RichTextTool>([
    ...(variant === "toolbar" || variant === "both" ? tools : []),
    ...(variant === "bubble" || variant === "both" ? bubbleTools : []),
  ]);
  // Passing `onUpload` enables image paste/drop in any variant, even
  // without an image button.
  const imagesEnabled = reachable.has("image") || !!onUpload;
  const linkEnabled = reachable.has("link");

  // Latest props for callbacks Tiptap captured at creation time.
  const latest = React.useRef(props);
  latest.current = props;
  const lastEmitted = React.useRef<unknown>(value ?? defaultValue);
  const [uploading, setUploading] = React.useState(0);
  const [linkIn, setLinkIn] = React.useState<"toolbar" | "bubble" | null>(null);
  const ui = React.useRef({
    showToolbar,
    showBubble,
    imagesEnabled,
    linkEnabled,
  });
  ui.current = { showToolbar, showBubble, imagesEnabled, linkEnabled };
  const countId = `${React.useId()}-count`;
  // Paste/drop handlers are created with the editor, before `useEditor` returns it.
  const editorRef = React.useRef<Editor | null>(null);
  // blob: URL -> File for every image not uploaded yet.
  const pending = React.useRef(new Map<string, File>());
  // blob: URL -> upload in progress, so an upload never runs twice.
  const inflight = React.useRef(new Map<string, Promise<string>>());

  const uploadOne = React.useCallback((src: string) => {
    let promise = inflight.current.get(src);
    if (!promise) {
      const upload = latest.current.onUpload ?? readAsDataUrl;
      setUploading((n) => n + 1);
      promise = upload(pending.current.get(src) as File).finally(() => {
        inflight.current.delete(src);
        setUploading((n) => n - 1);
      });
      inflight.current.set(src, promise);
    }
    return promise;
  }, []);

  /** Swap uploaded blob: URLs for their real URL; `null` removes the image. */
  const settleImages = React.useCallback(
    (editor: Editor, results: Map<string, string | null>) => {
      for (const src of results.keys()) {
        URL.revokeObjectURL(src);
        pending.current.delete(src);
      }
      if (editor.isDestroyed) return;
      const { tr } = editor.state;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name !== "image" || !results.has(node.attrs.src)) return;
        const url = results.get(node.attrs.src);
        if (url) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            src: url,
            uploading: false,
          });
        } else {
          tr.delete(tr.mapping.map(pos), tr.mapping.map(pos + node.nodeSize));
        }
      });
      // ponytail: not in undo history, but undo→redo of the original insert
      // still replays the (revoked) blob: URL. Fix with a custom history-aware
      // image node if that matters.
      if (tr.docChanged)
        editor.view.dispatch(tr.setMeta("addToHistory", false));
    },
    [],
  );

  const insertFiles = React.useCallback(
    (editor: Editor, files: File[], pos?: number) => {
      const { onUploadError, maxFileSize, uploadMode } = latest.current;
      const deferred = uploadMode === "deferred";
      const images: JSONContent[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        if (maxFileSize && file.size > maxFileSize) {
          onUploadError?.(
            new Error(`"${file.name}" exceeds the ${maxFileSize} byte limit`),
            file,
          );
          continue;
        }
        // Show a local preview right away; upload in the background.
        const src = URL.createObjectURL(file);
        pending.current.set(src, file);
        images.push({
          type: "image",
          attrs: { src, alt: "", uploading: !deferred },
        });
      }
      if (!images.length) return;

      if (pos === undefined) {
        // Insert after the selection instead of replacing it (the bubble
        // menu's image button is only visible while text is selected).
        const { to } = editor.state.selection;
        editor.chain().focus().setTextSelection(to).insertContent(images).run();
      } else {
        editor.chain().insertContentAt(pos, images).run();
      }

      if (deferred) return;
      for (const image of images) {
        const src = image.attrs?.src as string;
        const file = pending.current.get(src) as File;
        uploadOne(src).then(
          (url) => settleImages(editor, new Map([[src, url]])),
          (error) => {
            settleImages(editor, new Map([[src, null]]));
            latest.current.onUploadError?.(
              error instanceof Error ? error : new Error(String(error)),
              file,
            );
          },
        );
      }
    },
    [uploadOne, settleImages],
  );

  /** Mod+K: open the link editor where the user can see it. */
  const openLinkEditor = React.useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return false;
    const { showToolbar, showBubble } = ui.current;
    const hasSelection = !editor.state.selection.empty;
    const target =
      showBubble && hasSelection ? "bubble" : showToolbar ? "toolbar" : null;
    if (!target) return false;
    setLinkIn(target);
    return true;
  }, []);

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editable: !disabled,
      content: value ?? defaultValue,
      extensions: buildExtensions({
        placeholder,
        imageResize,
        maxLength,
        countCharacters: !!(maxLength || showCount),
        extra: extraExtensions,
      }),
      editorProps: {
        // A function so aria props changed after mount (e.g. a form error)
        // still reach the editable element.
        attributes: () => {
          const p = latest.current;
          const describedBy = [
            p["aria-describedby"],
            p.showCount ? countId : undefined,
          ]
            .filter(Boolean)
            .join(" ");
          return {
            role: "textbox",
            "aria-multiline": "true",
            ...(p.id && { id: p.id }),
            ...(p["aria-label"] && { "aria-label": p["aria-label"] }),
            ...(p["aria-labelledby"] && {
              "aria-labelledby": p["aria-labelledby"],
            }),
            ...(describedBy && { "aria-describedby": describedBy }),
            ...(p["aria-invalid"] && { "aria-invalid": "true" }),
            ...(p["aria-invalid"] &&
              p["aria-errormessage"] && {
                "aria-errormessage": p["aria-errormessage"],
              }),
            class: cn(
              richTextClassName,
              "min-h-32 px-3 py-2 outline-none",
              // Placeholder
              "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
              // Images & resize handles
              "[&_[data-resize-container]]:my-3 [&_[data-resize-container]]:w-fit [&_[data-resize-container]]:max-w-full [&_[data-resize-wrapper]_img]:my-0",
              "[&_img[data-uploading]]:animate-pulse [&_img[data-uploading]]:opacity-60",
              "[&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-offset-2 [&_.ProseMirror-selectednode]:outline-ring",
              "[&_[data-resize-handle]]:z-10 [&_[data-resize-handle]]:size-3 [&_[data-resize-handle]]:rounded-full [&_[data-resize-handle]]:border-2 [&_[data-resize-handle]]:border-background [&_[data-resize-handle]]:bg-primary [&_[data-resize-handle]]:opacity-0 [&_[data-resize-handle]]:transition-opacity",
              "[&_[data-resize-container]:hover_[data-resize-handle]]:opacity-100 [&_.ProseMirror-selectednode_[data-resize-handle]]:opacity-100",
              "[&_[data-resize-handle=top-left]]:-translate-1/2 [&_[data-resize-handle=top-left]]:cursor-nwse-resize",
              "[&_[data-resize-handle=bottom-right]]:translate-1/2 [&_[data-resize-handle=bottom-right]]:cursor-nwse-resize",
              "[&_[data-resize-handle=top-right]]:translate-x-1/2 [&_[data-resize-handle=top-right]]:-translate-y-1/2 [&_[data-resize-handle=top-right]]:cursor-nesw-resize",
              "[&_[data-resize-handle=bottom-left]]:-translate-x-1/2 [&_[data-resize-handle=bottom-left]]:translate-y-1/2 [&_[data-resize-handle=bottom-left]]:cursor-nesw-resize",
              p.contentClassName,
            ),
          };
        },
        handleKeyDown: (_view, event) => {
          const modK =
            (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
          if (!modK || !ui.current.linkEnabled || !openLinkEditor())
            return false;
          // Keep app-level Mod+K handlers (command palettes, search) from
          // firing while the user is writing.
          event.preventDefault();
          event.stopPropagation();
          return true;
        },
        handlePaste: (_view, event) => {
          const files = Array.from(event.clipboardData?.files ?? []);
          if (!ui.current.imagesEnabled || !files.length) return false;
          if (editorRef.current) insertFiles(editorRef.current, files);
          return true;
        },
        handleDrop: (view, event, _slice, moved) => {
          const files = Array.from(event.dataTransfer?.files ?? []);
          if (moved || !ui.current.imagesEnabled || !files.length) return false;
          const pos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          })?.pos;
          if (editorRef.current) insertFiles(editorRef.current, files, pos);
          return true;
        },
      },
      onCreate: ({ editor }) => {
        editorRef.current = editor;
        latest.current.onEditorReady?.(editor);
      },
      onBlur: () => latest.current.onBlur?.(),
      onUpdate: ({ editor }) => {
        const next = editorValue(editor, latest.current.output);
        lastEmitted.current = next;
        (latest.current.onValueChange as ((v: unknown) => void) | undefined)?.(
          next,
        );
      },
    },
    [placeholder, imageResize, maxLength, showCount],
  );

  // Controlled value: only push into the editor when it changed from outside.
  React.useEffect(() => {
    if (!editor || value === undefined || value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  React.useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  // Re-run the `attributes` function when aria props or classes change.
  const attrKey = [
    props.id,
    props["aria-label"],
    props["aria-labelledby"],
    props["aria-describedby"],
    props["aria-invalid"],
    props["aria-errormessage"],
    contentClassName,
  ].join("|");
  React.useEffect(() => {
    if (editor && !editor.isDestroyed) editor.view.setProps({});
  }, [editor, attrKey]);

  // Free local previews that were never uploaded.
  React.useEffect(() => {
    const map = pending.current;
    return () => {
      for (const src of map.keys()) URL.revokeObjectURL(src);
      map.clear();
    };
  }, []);

  React.useImperativeHandle(ref, () => {
    const pendingSrcs = (editor: Editor) => {
      const srcs = new Set<string>();
      editor.state.doc.descendants((node) => {
        if (node.type.name === "image" && pending.current.has(node.attrs.src))
          srcs.add(node.attrs.src);
      });
      return srcs;
    };

    return {
      editor,
      pendingImageCount: () => (editor ? pendingSrcs(editor).size : 0),
      uploadPendingImages: async () => {
        if (!editor) throw new Error("Editor is not ready");
        const srcs = [...pendingSrcs(editor)];
        const results = await Promise.allSettled(srcs.map(uploadOne));
        const uploaded = new Map<string, string>();
        const errors: unknown[] = [];
        results.forEach((result, i) => {
          if (result.status === "fulfilled")
            uploaded.set(srcs[i], result.value);
          else errors.push(result.reason);
        });
        // Re-reads the doc: the user may have edited it while uploads ran.
        if (uploaded.size) settleImages(editor, uploaded);
        if (errors.length)
          throw new AggregateError(
            errors,
            `${errors.length} image upload(s) failed`,
          );
        return editorValue(editor, latest.current.output);
      },
    };
  }, [editor, uploadOne, settleImages]);

  const toolbarProps = { insertFiles, uploading, disabled };

  return (
    <div
      data-slot="rich-text-editor"
      data-disabled={disabled || undefined}
      className={cn(
        "rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:bg-input/30",
        props["aria-invalid"] &&
          "border-destructive ring-destructive/20 dark:ring-destructive/40",
        className,
      )}
    >
      {showToolbar && editor && (
        <Toolbar
          {...toolbarProps}
          editor={editor}
          tools={toolbarTools}
          linkOpen={linkIn === "toolbar"}
          onLinkOpenChange={(open) => setLinkIn(open ? "toolbar" : null)}
          label="Formatting"
          className={cn("border-b border-input", toolbarClassName)}
        />
      )}
      {showBubble && editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, view, element, from, to }) =>
            editor.isEditable &&
            from !== to &&
            !editor.isActive("image") &&
            !editor.isActive("codeBlock") &&
            (view.hasFocus() || element.contains(document.activeElement))
          }
          className="z-50 rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          <Toolbar
            {...toolbarProps}
            editor={editor}
            tools={bubbleTools}
            linkOpen={linkIn === "bubble"}
            onLinkOpenChange={(open) => setLinkIn(open ? "bubble" : null)}
            label="Selection formatting"
          />
        </BubbleMenu>
      )}
      {editor && variant !== "none" && (
        <BubbleMenu
          editor={editor}
          pluginKey="richTextImageMenu"
          shouldShow={({ editor, view, element }) =>
            editor.isEditable &&
            editor.isActive("image") &&
            (view.hasFocus() || element.contains(document.activeElement))
          }
          className="z-50 rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          <ImageMenu editor={editor} />
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
      {showCount && editor && (
        <CharacterCounter id={countId} editor={editor} maxLength={maxLength} />
      )}
    </div>
  );
});

function buildExtensions({
  placeholder,
  imageResize,
  maxLength,
  countCharacters,
  extra,
}: {
  placeholder: string | undefined;
  imageResize: boolean;
  maxLength: number | undefined;
  countCharacters: boolean;
  extra: Extensions | undefined;
}): Extensions {
  return [
    StarterKit.configure({
      link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
    }),
    ...(placeholder ? [Placeholder.configure({ placeholder })] : []),
    ...(countCharacters
      ? [CharacterCount.configure({ limit: maxLength ?? null })]
      : []),
    UploadableImage.configure({
      // Content saved without `onUpload` embeds images as data URLs.
      allowBase64: true,
      resize: imageResize && {
        enabled: true,
        directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
        minWidth: 48,
        minHeight: 48,
        alwaysPreserveAspectRatio: true,
      },
    }),
    ...(extra ?? []),
  ];
}

interface ToolbarProps {
  editor: Editor;
  tools: RichTextTool[];
  label: string;
  disabled: boolean;
  uploading: number;
  insertFiles: (editor: Editor, files: File[]) => void;
  linkOpen: boolean;
  onLinkOpenChange: (open: boolean) => void;
  className?: string;
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);
const formatShortcut = (s: string) =>
  s
    .replace("Mod", isMac ? "⌘" : "Ctrl")
    .replace("Shift", isMac ? "⇧" : "Shift");

function Toolbar({
  editor,
  tools,
  label,
  disabled,
  uploading,
  insertFiles,
  linkOpen,
  onLinkOpenChange,
  className,
}: ToolbarProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Re-render only when a button's active/enabled state actually changes,
  // not on every keystroke.
  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      Object.fromEntries(
        tools
          .filter((t): t is ToolName => t !== "|")
          .map((t) => {
            if (t === "link")
              return [t, { active: editor.isActive("link"), can: true }];
            if (t === "image") return [t, { active: false, can: true }];
            const def = TOOLS[t];
            return [
              t,
              {
                active: def.active?.(editor) ?? false,
                can: def.can?.(editor) ?? true,
              },
            ];
          }),
      ) as Record<string, { active: boolean; can: boolean }>,
  });

  // Toolbar pattern: arrow keys move focus between buttons.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)",
      ),
    );
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i === -1) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (i + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
            buttons.length;
    buttons[next]?.focus();
  };

  if (linkOpen) {
    return (
      <LinkForm
        editor={editor}
        className={className}
        onClose={() => onLinkOpenChange(false)}
      />
    );
  }

  return (
    <div
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn("flex flex-wrap items-center gap-0.5 p-1", className)}
    >
      {tools.map((tool, i) => {
        if (tool === "|") {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: separators are positional
              key={`sep-${i}`}
              aria-hidden="true"
              className="mx-1 h-5 w-px bg-border"
            />
          );
        }
        if (tool === "link") {
          const active = state[tool]?.active;
          return (
            <ToolButton
              key={tool}
              label={active ? "Edit link" : "Link"}
              shortcut="Mod+K"
              icon={LinkIcon}
              active={active}
              disabled={disabled}
              onClick={() => onLinkOpenChange(true)}
            />
          );
        }
        if (tool === "image") {
          return (
            <React.Fragment key={tool}>
              <ToolButton
                label={uploading ? "Uploading image…" : "Image"}
                icon={uploading ? SpinnerIcon : ImageIcon}
                disabled={disabled}
                onClick={() => fileRef.current?.click()}
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  insertFiles(editor, files);
                }}
              />
            </React.Fragment>
          );
        }
        const def = TOOLS[tool];
        return (
          <ToolButton
            key={tool}
            label={def.label}
            shortcut={def.shortcut}
            icon={def.icon}
            active={def.active ? state[tool]?.active : undefined}
            disabled={disabled || !state[tool]?.can}
            onClick={() => def.run(editor)}
          />
        );
      })}
    </div>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return <Loader2Icon className={cn("animate-spin", className)} />;
}

function ToolButton({
  label,
  shortcut,
  icon: Icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  /** `undefined` for action buttons (undo, divider) that have no on/off state. */
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      title={shortcut ? `${label} (${formatShortcut(shortcut)})` : label}
      disabled={disabled}
      // Keep the editor selection while clicking.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="text-muted-foreground aria-pressed:bg-accent aria-pressed:text-accent-foreground"
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}

function LinkForm({
  editor,
  className,
  onClose,
}: {
  editor: Editor;
  className?: string;
  onClose: () => void;
}) {
  const current = editor.getAttributes("link").href as string | undefined;
  const close = () => {
    onClose();
    editor.commands.focus();
  };
  return (
    <form
      className={cn("flex items-center gap-1 p-1", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const href = String(
          new FormData(event.currentTarget).get("href") ?? "",
        ).trim();
        const chain = editor.chain().focus().extendMarkRange("link");
        if (href) chain.setLink({ href }).run();
        else chain.unsetLink().run();
        onClose();
      }}
    >
      <input
        name="href"
        type="text"
        inputMode="url"
        aria-label="Link URL"
        placeholder="https://example.com"
        defaultValue={current}
        // biome-ignore lint/a11y/noAutofocus: user just asked to edit the link
        autoFocus
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
        className="h-7 min-w-0 flex-1 rounded-sm bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
      />
      <Button type="submit" size="sm" variant="ghost" className="h-7">
        Apply
      </Button>
      {current && (
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Remove link"
          title="Remove link"
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            onClose();
          }}
        >
          <UnlinkIcon aria-hidden="true" />
        </Button>
      )}
    </form>
  );
}

/** Image node with a transient `uploading` flag for the loading state. */
const UploadableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      uploading: {
        default: false,
        // Never restored from saved HTML.
        parseHTML: () => false,
        renderHTML: (attributes) =>
          attributes.uploading ? { "data-uploading": "" } : {},
      },
    };
  },
});

function useCoarsePointer() {
  return React.useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia?.("(pointer: coarse)");
      query?.addEventListener("change", onChange);
      return () => query?.removeEventListener("change", onChange);
    },
    () => window.matchMedia?.("(pointer: coarse)").matches ?? false,
    () => false,
  );
}

function CharacterCounter({
  id,
  editor,
  maxLength,
}: {
  id: string;
  editor: Editor;
  maxLength?: number;
}) {
  const count = useEditorState({
    editor,
    selector: ({ editor }) =>
      (
        editor.storage as { characterCount?: { characters: () => number } }
      ).characterCount?.characters() ?? 0,
  });
  return (
    <p
      id={id}
      className={cn(
        "px-3 pb-2 text-right text-xs text-muted-foreground tabular-nums",
        maxLength && count >= maxLength && "text-destructive",
      )}
    >
      {count}
      {maxLength ? ` / ${maxLength}` : ""}
    </p>
  );
}

/** Shown while an image is selected: edit its alt text or remove it. */
function ImageMenu({ editor }: { editor: Editor }) {
  const image = useEditorState({
    editor,
    selector: ({ editor }) => {
      const attrs = editor.getAttributes("image");
      return { src: attrs.src as string, alt: (attrs.alt as string) ?? "" };
    },
  });
  return (
    <form
      // Remount per image so the input starts from that image's alt.
      key={image.src}
      className="flex items-center gap-1 p-1"
      onSubmit={(event) => {
        event.preventDefault();
        editor.commands.focus();
      }}
    >
      <input
        aria-label="Image description (alt text)"
        placeholder="Describe this image…"
        defaultValue={image.alt}
        onChange={(event) =>
          editor.commands.updateAttributes("image", {
            alt: event.target.value,
          })
        }
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            editor.commands.focus();
          }
        }}
        className="h-7 w-56 min-w-0 rounded-sm bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
      />
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Remove image"
        title="Remove image"
        onClick={() => editor.chain().focus().deleteSelection().run()}
      >
        <Trash2Icon aria-hidden="true" />
      </Button>
    </form>
  );
}
