import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { InstallationTabs } from './installation-tabs';
import { PreviewComponent } from './preview-component';

import { TextFieldDemo } from '../registry/demos/text-field-demo';
import { TextFieldPlaygroundDemo } from '../registry/demos/text-field-playground-demo';
import { TextFieldFormDemo } from '../registry/demos/text-field-form-demo';

import { NumberFieldDemo } from '../registry/demos/number-field-demo';
import { NumberFieldPlaygroundDemo } from '../registry/demos/number-field-playground';
import { NumberFieldFormDemo } from '../registry/demos/number-field-form-demo';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...components,
    InstallationTabs,
    PreviewComponent,
    ComponentPreview: PreviewComponent,
    TextFieldDemo,
    TextFieldPlaygroundDemo,
    NumberFieldDemo,
    NumberFieldPlaygroundDemo,
    NumberFieldFormDemo,
    TextFieldFormDemo,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
