# Custom Component Registry Guide & Folder Structure

This document outlines how the **shadcn registry** is configured and structured in `super-shadcn`.

---

## 📁 Folder Structure Overview

```text
super-shadcn/
├── registry/                 # Root registry directory for custom items
│   ├── ui/                   # Reusable UI component library primitives (e.g. button.tsx)
│   └── demos/                # Interactive demo components for documentation previews (e.g. button-demo.tsx)
├── registry.json             # Manifest defining distributed items & metadata
├── public/
│   └── r/                    # Generated JSON distributions (output of `shadcn build`)
│       ├── registry.json     # Built registry index available at /r/registry.json
│       ├── button.json       # Component payload for `npx shadcn add .../r/button.json`
│       └── <component>.json  # Distributable JSON payload per item
├── src/
│   ├── components/
│   │   ├── preview-component.tsx  # Dynamic component preview with code-splitting & Fumadocs syntax highlighting
│   │   ├── installation-tabs.tsx # Copyable CLI installation commands for npm/yarn/pnpm/bun
│   │   └── mdx.tsx           # Global MDX component registrations
│   └── lib/
│       ├── read-source.ts    # Server function reading raw file source code from disk
│       └── constants.ts      # Package defaults and base URL definitions
└── content/
    └── docs/                 # MDX Documentation pages (e.g., button.mdx, datatable.mdx)
```

---

## ⚙️ How the Registry Works

1. **Item Definition (`registry.json`)**:
   Add new registry items in `registry.json` at the root of the repository:

   ```json
   {
     "$schema": "https://ui.shadcn.com/schema/registry.json",
     "name": "super-shadcn",
     "homepage": "https://super-shadcn.rifkiaf.com",
     "items": [
       {
         "name": "button",
         "type": "registry:ui",
         "title": "Button",
         "description": "A simple button component.",
         "dependencies": [
           "@base-ui/react",
           "class-variance-authority"
         ],
         "files": [
           {
             "path": "registry/ui/button.tsx",
             "type": "registry:ui",
             "target": "components/ui/button.tsx"
           }
         ]
       },
       {
         "name": "button-demo",
         "type": "registry:example",
         "title": "Button Demo",
         "description": "Example demo for the button component.",
         "registryDependencies": ["button"],
         "files": [
           {
             "path": "registry/demos/button-demo.tsx",
             "type": "registry:example",
             "target": "components/demos/button-demo.tsx"
           }
         ]
       }
     ]
   }
   ```

2. **Building the Registry**:
   Run the build script to generate distributable JSON manifests in `./public/r`:

   ```bash
   npm run shadcn:build
   ```

3. **Distributing Components**:
   Users can install items directly into their projects via the shadcn CLI:

   ```bash
   npx shadcn@latest add https://super-shadcn.rifkiaf.com/r/button.json
   ```
