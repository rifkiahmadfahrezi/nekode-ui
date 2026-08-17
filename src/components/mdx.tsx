import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { InstallationTabs } from './installation-tabs';
import { PreviewComponent } from './preview-component';
import { ButtonDemo } from '../../registry/demos/button-demo';
import { Button } from '../../registry/ui/button';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...components,
    InstallationTabs,
    PreviewComponent,
    ComponentPreview: PreviewComponent,
    ButtonDemo,
    Button,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
