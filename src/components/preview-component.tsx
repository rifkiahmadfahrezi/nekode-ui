"use client";

import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Maximize2, X } from "lucide-react";
import { lazy, Suspense, use, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { readComponentSource } from "@/lib/read-source";

// Lazy load DynamicCodeBlock so syntax highlighter dependencies (shiki / fumadocs) are loaded on-demand
const DynamicCodeBlock = lazy(() =>
  import("fumadocs-ui/components/dynamic-codeblock").then((mod) => ({
    default: mod.DynamicCodeBlock,
  })),
);

export interface ComponentPreviewProps {
  /** Relative file path passed to readComponentSource, e.g. "src/components/ui/button.tsx" */
  path: string;
  /** Rendered React component instance or component element */
  children: React.ReactNode;
  /** Code language for syntax highlighting (default: "tsx") */
  lang?: string;
  /** Show a control to open the preview outside the documentation column. */
  allowFullscreen?: boolean;
}

// Simple in-memory cache to prevent duplicate source fetches
const sourcePromiseCache = new Map<string, Promise<string>>();

function getComponentSourcePromise(path: string): Promise<string> {
  let promise = sourcePromiseCache.get(path);
  if (!promise) {
    promise = readComponentSource({ data: path });
    sourcePromiseCache.set(path, promise);
  }
  return promise;
}

function CodeTabContent({
  path,
  lang = "tsx",
}: {
  path: string;
  lang?: string;
}) {
  const promise = useMemo(() => getComponentSourcePromise(path), [path]);
  const source = use(promise);

  return <DynamicCodeBlock lang={lang} code={source} />;
}

export function PreviewComponent({
  path,
  children,
  lang = "tsx",
  allowFullscreen = false,
}: ComponentPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <Tabs items={["Preview", "Code"]} className="not-prose my-6">
        <Tab value="Preview">
          <div className="relative flex min-h-[200px] items-center justify-center rounded-lg bg-fd-background p-10">
            {allowFullscreen && (
              <Button
                aria-label="Open preview in fullscreen"
                className="absolute top-3 right-3"
                size="icon-sm"
                variant="ghost"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 />
              </Button>
            )}
            {children}
          </div>
        </Tab>
        <Tab value="Code">
          <Suspense
            fallback={
              <div className="flex h-[200px] items-center justify-center rounded-lg border bg-fd-muted/30 text-xs text-fd-muted-foreground shimmer">
                Loading source code...
              </div>
            }
          >
            <CodeTabContent path={path} lang={lang} />
          </Suspense>
        </Tab>
      </Tabs>

      {allowFullscreen && (
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent
            className="!inset-4 !grid !h-auto !w-auto !max-w-none !translate-x-0 !translate-y-0 !gap-0 !overflow-hidden !p-0"
            showCloseButton={false}
          >
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <p className="font-medium">Component preview</p>
                <Button
                  aria-label="Close fullscreen preview"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setIsFullscreen(false)}
                >
                  <X />
                </Button>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-fd-background p-8">
                {children}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export const ComponentPreview = PreviewComponent;
export default PreviewComponent;
