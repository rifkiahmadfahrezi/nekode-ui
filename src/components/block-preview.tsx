"use client";

import {
  ChevronDown,
  FileCode2,
  Folder,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Tablet,
  Terminal,
} from "lucide-react";
import { type ReactNode, Suspense, useEffect, useId, useState } from "react";
import { InstallationTabs } from "@/components/installation-tabs";
import { CodeTabContent } from "@/components/preview-component";
import { cn } from "@/lib/utils";

export interface BlockFile {
  /** Source path read by readComponentSource, e.g. "src/registry/blocks/login-form.tsx" */
  path: string;
  /** Path shown in the file tree (registry `target`). Defaults to `path`. */
  target?: string;
}

export interface BlockPreviewProps {
  /** Registry item name, used for the install command: /r/<name>.json */
  name: string;
  title: string;
  description?: string;
  files: BlockFile[];
  /** The live block. */
  children: ReactNode;
}

// ponytail: viewports are a width-constrained div, so `md:` breakpoints inside a
// block still follow the real window. Swap for an iframe route if a block needs that.
const viewports = {
  mobile: { label: "Mobile", icon: Smartphone, width: 375 },
  tablet: { label: "Tablet", icon: Tablet, width: 768 },
  desktop: { label: "Desktop", icon: Monitor, width: undefined },
} as const;
type Viewport = keyof typeof viewports;

interface TreeNode {
  name: string;
  file?: BlockFile;
  children: Map<string, TreeNode>;
}

function buildTree(files: BlockFile[]) {
  const root: TreeNode = { name: "", children: new Map() };
  for (const file of files) {
    let node = root;
    for (const part of (file.target ?? file.path).split("/")) {
      let child = node.children.get(part);
      if (!child) {
        child = { name: part, children: new Map() };
        node.children.set(part, child);
      }
      node = child;
    }
    node.file = file;
  }
  return root;
}

function FileTree({
  node,
  selected,
  onSelect,
}: {
  node: TreeNode;
  selected: BlockFile;
  onSelect: (file: BlockFile) => void;
}) {
  // folders first, then files, each alphabetical
  const entries = [...node.children.values()].sort(
    (a, b) =>
      Number(!!a.file) - Number(!!b.file) || a.name.localeCompare(b.name),
  );

  return (
    <ul className="flex flex-col gap-0.5">
      {entries.map((child) =>
        child.file ? (
          <li key={child.name}>
            <button
              type="button"
              aria-current={child.file === selected ? "true" : undefined}
              onClick={() => child.file && onSelect(child.file)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=true]:bg-muted aria-[current=true]:text-foreground"
            >
              <FileCode2 className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{child.name}</span>
            </button>
          </li>
        ) : (
          <li key={child.name}>
            <details open>
              <summary className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground">
                <Folder className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{child.name}</span>
              </summary>
              <div className="ml-3 border-l pl-1.5">
                <FileTree
                  node={child}
                  selected={selected}
                  onSelect={onSelect}
                />
              </div>
            </details>
          </li>
        ),
      )}
    </ul>
  );
}

const toggleClass =
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground";

export function BlockPreview({
  name,
  title,
  description,
  files,
  children,
}: BlockPreviewProps) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [selected, setSelected] = useState(files[0]);
  const [installOpen, setInstallOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const installId = useId();

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setFullscreen(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  return (
    <section
      className={cn(
        "not-prose flex min-w-0 flex-col overflow-hidden border bg-card",
        fullscreen ? "fixed inset-0 z-50 rounded-none" : "rounded-lg",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {view === "preview" && (
            // hidden on small screens: the viewer is already narrower than "tablet"
            <div className="hidden items-center gap-0.5 sm:flex">
              {(Object.keys(viewports) as Viewport[]).map((key) => {
                const { label, icon: Icon } = viewports[key];
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={viewport === key}
                    aria-label={`${label} viewport`}
                    onClick={() => setViewport(key)}
                    className={toggleClass}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    <span className="hidden md:inline">{label}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-0.5 rounded-lg border p-0.5">
            {(["preview", "code"] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={cn(toggleClass, "capitalize")}
              >
                {key}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-expanded={installOpen}
            aria-controls={installId}
            onClick={() => setInstallOpen((open) => !open)}
            className={cn(toggleClass, "rounded-lg border py-1.5")}
          >
            <Terminal className="size-3.5" aria-hidden="true" />
            Install
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                installOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            aria-pressed={fullscreen}
            aria-label={fullscreen ? "Exit full screen" : "Full screen"}
            onClick={() => setFullscreen((f) => !f)}
            className={cn(toggleClass, "rounded-lg border py-1.5")}
          >
            {fullscreen ? (
              <Minimize2 className="size-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="size-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {installOpen && (
        <div id={installId} className="border-b p-4 text-sm">
          <InstallationTabs componentName={name} />
        </div>
      )}

      {view === "preview" ? (
        <div
          className={cn(
            "bg-muted/30 p-2 sm:p-6",
            fullscreen && "min-h-0 flex-1 overflow-auto",
          )}
        >
          <div
            className="mx-auto max-w-full overflow-x-auto rounded-md border bg-background p-3 transition-[width] duration-300 sm:p-10"
            style={{ width: viewports[viewport].width }}
          >
            {children}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "grid min-w-0 sm:grid-cols-[13rem_minmax(0,1fr)]",
            fullscreen && "min-h-0 flex-1",
          )}
        >
          {files.length > 1 && (
            <nav
              aria-label="Block files"
              className="border-b p-2 sm:border-r sm:border-b-0"
            >
              <FileTree
                node={buildTree(files)}
                selected={selected}
                onSelect={setSelected}
              />
            </nav>
          )}
          <div
            className={cn(
              "min-w-0 overflow-auto [&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0",
              fullscreen ? "min-h-0" : "max-h-[32rem]",
              files.length === 1 && "sm:col-span-2",
            )}
          >
            <Suspense
              fallback={
                <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">
                  Loading source code...
                </div>
              }
            >
              <CodeTabContent path={selected.path} />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  );
}
