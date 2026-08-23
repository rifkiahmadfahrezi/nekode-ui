import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import * as demos from "@/registry/demos";
import { InstallationTabs } from "./installation-tabs";
import { PreviewComponent } from "./preview-component";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...components,
    InstallationTabs,
    PreviewComponent,
    ComponentPreview: PreviewComponent,
    ...demos,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
