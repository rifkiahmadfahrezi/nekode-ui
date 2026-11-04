# Custom Component Registry Guide & Folder Structure

This document outlines how the **shadcn registry** is configured and structured in `nekode-ui`.

---

## 📁 Folder Structure Overview

```text
nekode-ui/
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
     "name": "nekode-ui",
     "homepage": "https://ui.nekode.id",
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
   npx shadcn@latest add https://ui.nekode.id/r/button.json
   ```

---

## 🧩 Templates (`src/registry/templates/`)

Full-app templates live here. They are **Next.js-only** and **Base UI only**:
they ship their own restyled primitives (`components/ui/*`), so they are
excluded from the Radix build (`"meta": { "baseUiOnly": true }`) and from
`tsc`/Biome (they import `next/*`, which this repo doesn't install).

| Item | Type | Contents |
| --- | --- | --- |
| `dashboard-theme` | `registry:theme` | Tokens, fonts, shadows, easing, entrance keyframes |
| `dashboard` | `registry:block` | Shell, sidebar, header, command menu, empty `/dashboard` page, restyled `badge`/`button`/`card`/`dropdown-menu`/`table`/`tooltip` |
| `dashboard-examples` | `registry:block` | `dashboard` + overview, analytics and projects pages |

Every other primitive (`avatar`, `breadcrumb`, `dialog`, `separator`,
`sidebar`, `tabs`) is stock shadcn via `registryDependencies`, styled from the
dashboard components with `className`. `_stock/` holds copies of those stock
files for `tsc` only; it is not shipped. If a user already has one of the six
restyled files, shadcn asks before overwriting it (default: keep theirs).

Install the theme **in the same command** as the block:

```bash
npx shadcn@latest add @nekode/dashboard-theme @nekode/dashboard
npx shadcn@latest add @nekode/dashboard-theme @nekode/dashboard-examples
```

shadcn only overwrites existing CSS variables when one of the items passed on
the command line is a `registry:theme`. Pulled in as a `registryDependency`,
the theme only adds missing variables and the default neutral palette stays.

The sources are a snapshot of
[shadcn-dashboard](https://github.com/rifkiahmadfahrezi/shadcn-dashboard),
with routes moved from `/` to `/dashboard` and `config/menus.ts` moved to
`components/dashboard/menus.ts`. Make changes there first, then copy them over.
