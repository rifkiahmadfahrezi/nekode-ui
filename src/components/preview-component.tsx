import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { lazy, Suspense, use, useMemo } from "react";
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
}: ComponentPreviewProps) {
  return (
    <Tabs items={["Preview", "Code"]} className="my-6">
      <Tab value="Preview">
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border p-10 bg-fd-background">
          {children}
        </div>
      </Tab>
      <Tab value="Code">
        <Suspense
          fallback={
            <div className="flex h-[200px] items-center justify-center rounded-lg border bg-fd-muted/30 text-xs text-fd-muted-foreground animate-pulse">
              Loading source code...
            </div>
          }
        >
          <CodeTabContent path={path} lang={lang} />
        </Suspense>
      </Tab>
    </Tabs>
  );
}

export const ComponentPreview = PreviewComponent;
export default PreviewComponent;
