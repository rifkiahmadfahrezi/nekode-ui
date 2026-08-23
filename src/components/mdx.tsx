import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { InstallationTabs } from './installation-tabs';
import { PreviewComponent } from './preview-component';

import * as demos from "@/registry/demos"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...components,
    InstallationTabs,
    PreviewComponent,
    ComponentPreview: PreviewComponent,
    ...demos
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
