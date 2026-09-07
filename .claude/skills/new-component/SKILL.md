---
name: new-component
description: Scaffold new nekode/ui component - registry source, components/ui re-export, demos, registry.json entry, generated public/r JSON, and docs mdx page. Use whenever user asks to add/create new component, new field, new UI primitive, or wants it published to the shadcn registry with documentation, even if they only name the component (e.g. "buatkan otp-field component").
---

Repo ships components as a shadcn registry (see `registry.json`, `public/r/*.json`) plus fumadocs documentation (`content/docs/**`). Every component follows the SAME file skeleton. Do not invent a new shape — copy the pattern from an existing sibling (`text-field` is the reference for form fields, `datatable` for multi-file components).

## File map (single-file component, e.g. `foo-field`)

| File | Purpose |
|---|---|
| `src/registry/ui/foo-field.tsx` | Real implementation. This is the registry source of truth. |
| `src/components/ui/foo-field.tsx` | One line: `export * from "@/registry/ui/foo-field";` |
| `src/registry/demos/foo-field-demo.tsx` | Minimal usage shown under "Usage Example" in docs. |
| `src/registry/demos/foo-field-playground-demo.tsx` | Optional interactive prop playground (skip for simple/non-visual components). |
| `src/registry/demos/foo-field-form-demo.tsx` | Optional TanStack Form + Zod example (only for form-input components). |
| `src/registry/demos/index.ts` | Add `export * from "./foo-field-demo";` (+ playground/form) in alphabetical order. Demos are auto-injected into MDX globally via `src/components/mdx.tsx` — no per-page import needed. |
| `registry.json` | Add the item entry (source of truth for the registry, alphabetical by name). |
| `public/r/foo-field.json` | **Generated, don't hand-write.** Run `bun run shadcn:build` after editing `registry.json`. |
| `content/docs/<category>/foo-field.mdx` | Doc page. Category = existing folder like `form-fields`, or new folder if it's a genuinely new category. |

Multi-file components (like `datatable/`) live under `src/registry/ui/<name>/` with an `index.ts` barrel, and list every sub-file individually in `registry.json`'s `files` array with matching `target` paths under `components/ui/<name>/`.

## Steps

1. **Read one real sibling end to end first** — pick the closest existing component (usually `text-field` for a labeled input, or whichever component is closest in shape) and read its four files (`src/registry/ui/*.tsx`, `registry.json` entry, its demos, its mdx) before writing anything. This repo's conventions live in code, not in this file — copying a working example beats guessing.

2. **Write the component** in `src/registry/ui/<name>.tsx`:
   - `"use client"` at top if it uses hooks/state/refs.
   - `React.forwardRef` + `displayName` for anything wrapping a native element.
   - Compose from existing primitives (`Field`, `FieldLabel`, `FieldDescription`, `FieldError` from `@/components/ui/field`, plus `Input`/`Textarea`/etc.) — don't reimplement layout, label wiring, or error display that `Field` already gives you.
   - Accessibility wiring matches the `text-field` pattern: `aria-describedby` → description only, `aria-errormessage` → error, `aria-invalid` synced to `error`, required asterisk with `sr-only` " (required)" text, decorative icons get `aria-hidden="true"`.
   - `className` merged via `cn()` from `@/lib/utils`; expose `fieldClassName`/`labelClassName`/`<x>ClassName` split points the same way `text-field` does, only if the component actually has that many visual parts — don't add class-name props nobody will use.

3. **Barrel it**: `src/components/ui/<name>.tsx` just re-exports from the registry path. Nothing else goes in this file — it exists so consumers import from `@/components/ui/*` while the registry copies from `src/registry/ui/*`.

4. **Write demos** using real dependencies already in the repo (`@tanstack/react-form` + `zod` for the form demo, `sonner` for the toast, `lucide-react` for icons). Keep the basic demo to the smallest usage that shows the component's point. Skip the playground demo if the component has few meaningfully-different visual states.

5. **Register in `registry.json`**: add an item with `name`, `type: "registry:ui"`, `title`, `description`, `dependencies` (npm packages it needs beyond what's already a registryDependency), `registryDependencies` (other registry item names it composes, e.g. `field`, `input`, `label`), and `files` (path + type + target). Keep the list alphabetically sorted like the existing entries.

6. **Generate the registry JSON**: run `bun run shadcn:build` (do NOT hand-author `public/r/<name>.json` — it's a build artifact and must byte-match what the build produces). Confirm the new file appeared under `public/r/`.

7. **Write the doc page** at `content/docs/<category>/<name>.mdx`. There's no `meta.json` in this repo — docs nav is file-based, so dropping the file in the right folder is enough. Use this exact section order, matching `text-field.mdx`:

```mdx
---
title: ComponentTitle
description: One sentence, what it's for and when to reach for it.
---

One short paragraph: what it wraps/composes and when to use it.

## Installation

<InstallationTabs componentName="foo-field" />

## Usage Example

<ComponentPreview path="src/registry/demos/foo-field-demo.tsx">
  <FooFieldDemo />
</ComponentPreview>

## Playground

(optional — only if you made a playground demo)

<FooFieldPlaygroundDemo />

## Examples

### With TanStack Form and Zod

(optional — only for form-input components)

<ComponentPreview path="src/registry/demos/foo-field-form-demo.tsx">
  <FooFieldFormDemo />
</ComponentPreview>

## Accessibility

Bullet list of the actual aria wiring you implemented in step 2 — don't describe behavior the component doesn't have.

## API Reference

### FooField

| Prop | Type | Default | Description |
|---|---|---|---|
| ... | ... | ... | ... |
```

Every prop in the component's TS interface must have a row in the API Reference table — the table is the contract, keep it in sync with the actual prop names/types.

8. **Verify**: `bun run types:check` and `bun run lint`. If the doc references a demo component name, double check it matches the exported function name in the demo file (e.g. `FooFieldDemo`) — that's the string fumadocs resolves from the `demos` barrel, a typo there renders nothing.

## What NOT to do

- Don't hand-write `public/r/*.json` — always regenerate via `shadcn:build`.
- Don't add a playground or form-demo section to a component that doesn't need one just to match `text-field`'s shape — `text-field` has three demos because it has three genuinely different usage stories, not because that's a required count.
- Don't create a `meta.json` — this repo doesn't use one.
- Don't invent new class-name split props or new Field variants — reuse `@/components/ui/field` as-is unless the task explicitly requires changing it.
- Don't remove, change or delete the original shadcn components (check this https://ui.shadcn.com/llms.txt)
