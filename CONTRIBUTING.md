# Contributing to nekode/ui

Thanks for taking the time to contribute. This project is a [shadcn/ui](https://ui.shadcn.com) registry — every component is meant to be copy-pasted into someone else's codebase via the CLI, so consistency in structure and documentation matters more here than in a typical app. This guide covers how to set up the project, the conventions every component and doc page follows, and how to submit changes.

## Table of contents

- [Before you start](#before-you-start)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [Adding a new UI component](#adding-a-new-ui-component)
- [Adding a new utility function](#adding-a-new-utility-function)
- [Documentation standard](#documentation-standard)
- [Component code standard](#component-code-standard)
- [Commit convention](#commit-convention)
- [Before opening a pull request](#before-opening-a-pull-request)
- [Pull request process](#pull-request-process)

## Before you start

- For a bug fix or small improvement, feel free to open a pull request directly.
- For a new component, a new utility, or any change to the public API of an existing one, please open an issue first to discuss the shape of it. This avoids wasted work on a PR that doesn't fit the project's direction.
- Check open issues and pull requests before starting — someone may already be working on it.

## Development setup

This project uses [Bun](https://bun.sh).

```bash
git clone https://github.com/rifkiahmadfahrezi/nekode-ui.git
cd nekode-ui
bun install
bun dev
```

Useful scripts:

| Command | What it does |
|---|---|
| `bun dev` | Starts the docs/dev site locally. |
| `bun run types:check` | Type-checks the whole project (`tsc --noEmit`). |
| `bun run lint` | Lints with Biome. |
| `bun run lint:fix` | Lints and auto-fixes what it can. |
| `bun test` | Runs the Vitest suite. |
| `bun run shadcn:build` | Regenerates `public/r/*.json` from `registry.json`. **Required** after any change to `registry.json` or a registry source file. |
| `bun run build` | Production build — also useful to confirm new/changed docs pages actually prerender. |

## Project structure

```
src/
  registry/
    ui/        # Real component source (registry of truth) — text-field.tsx, field-switch.tsx, ...
    lib/        # Utility source — date.ts, string.ts, number.ts, ...
    demos/      # Demo components shown in the docs (basic, playground, form examples)
  components/
    ui/        # Thin re-export barrels: `export * from "@/registry/ui/<name>"`
                # This is what consumers actually import from once installed.
    lib/        # (n/a — lib barrels live directly under src/lib/, see below)
  lib/
    date.ts     # Barrel: `export * from "@/registry/lib/date"`
    utils.ts    # Project-internal utilities (not a registry item)

registry.json    # Source of truth for every registry item (name, files, deps)
public/r/        # Generated — one JSON per registry item, built via `bun run shadcn:build`
content/docs/    # Fumadocs MDX documentation, one page per component/utility
```

The split between `src/registry/**` and `src/components/ui/**` (or `src/lib/**`) matters: the registry folder is what gets distributed to consumers, the barrel is what makes it usable inside *this* repo without a relative-import mess. Always edit the file under `src/registry/`, never the barrel.

## Adding a new UI component

Look at an existing sibling first — `text-field.tsx` for a simple labeled input, `field-switch.tsx` or `field-radio.tsx` for a component with a card variant, `date-picker-field.tsx` for something built on a popover + external primitive. Copying a working example beats guessing at the pattern.

1. **Component**: `src/registry/ui/<name>.tsx`
   - `"use client"` at the top if it uses hooks, state, or refs.
   - `React.forwardRef` + `.displayName` for anything wrapping a native/focusable element.
   - Compose from existing primitives (`Field`, `FieldLabel`, `FieldDescription`, `FieldError` from `@/components/ui/field`, plus whatever base shadcn primitive it wraps) — don't re-implement layout, label wiring, or error display `Field` already gives you.
   - Accessibility wiring: `aria-describedby` → description only (not the error), `aria-errormessage` → error, `aria-invalid` synced to whether `error` is set, required asterisk rendered with `sr-only` " (required)" text, decorative icons get `aria-hidden="true"`.
   - Expose `fieldClassName` / `labelClassName` / `<x>ClassName` split points only if the component has that many visually distinct parts — don't add class-name props nobody will use.
2. **Barrel**: `src/components/ui/<name>.tsx` — one line, `export * from "@/registry/ui/<name>";`. Nothing else goes in this file.
3. **Demos**: `src/registry/demos/<name>-demo.tsx` (required, smallest usage that shows the point), plus `<name>-playground-demo.tsx` (only if there are genuinely different visual states to toggle) and `<name>-form-demo.tsx` (only if it's a form-input component — use `@tanstack/react-form` + `zod`, matching the pattern in `text-field-form-demo.tsx`). Register every demo in `src/registry/demos/index.ts`, alphabetically.
4. **Registry entry**: add an item to `registry.json` — `name`, `type: "registry:ui"`, `title`, `description`, `dependencies` (npm packages beyond what's already covered by a `registryDependencies` entry), `registryDependencies` (other registry item names it composes, e.g. `field`, `input`, `label`), and `files` (`path` + `type` + `target`).
5. Run `bun run shadcn:build` and confirm `public/r/<name>.json` was generated. **Never hand-write this file.**
6. **Doc page**: `content/docs/<category>/<name>.mdx` — see [Documentation standard](#documentation-standard) below.
7. **Form Generator** (form fields only): every form-input component (anything documented under `content/docs/form-fields/`) must also be available in the `/form-generator` page. Wire it the same way as the closest existing field kind:
   - `src/lib/form-generator/types.ts` — add the kind to `FieldKind`.
   - `src/lib/form-generator/field-kinds.ts` — add a `FIELD_KINDS` entry. `importPath` must end in the registry item name, because the generated install command uses it. Set `needsOptions: true` if the component takes `options`.
   - `src/lib/form-generator/schema.ts` — `zodTypeFor` and `defaultValueFor` cases if the value is not a plain string.
   - `src/lib/form-generator/codegen.ts` — matching `zodSource`, `defaultValueSource`, and `fieldJsx` cases. Add the kind to `KINDS_WITHOUT_PLACEHOLDER` if the component has no `placeholder` prop.
   - `src/routes/form-generator.tsx` — import the component and add a `renderPreviewField` case.

   Renaming or removing a form field means updating these same files.
8. Verify: `bun run types:check`, `bun run lint`, and if it's a UI change, actually run the dev server and interact with it in a browser.

**Don't:**
- Hand-write `public/r/*.json`.
- Ship a new form field without adding it to the Form Generator.
- Add a playground or form-demo just to match another component's shape — only add one when it demonstrates something genuinely different.
- Invent new `Field` variants or class-name split props beyond what the component actually needs.
- Remove or modify a base shadcn primitive under `src/components/ui/` that this repo didn't add on purpose (e.g. `button.tsx`, `input.tsx`) — those come from `npx shadcn@latest add <name>` and should stay close to upstream.

## Adding a new utility function

Utilities live under `src/registry/lib/<name>.ts` and follow the exact same distribution model as components: registry source → barrel → `registry.json` entry → generated `public/r/<name>.json` → doc page. See `date.ts` / `string.ts` / `number.ts` for the pattern.

- If a function needs **more than two parameters**, bundle everything after the primary value into a single options object instead of adding more positional parameters:

  ```ts
  // Don't
  function clamp(value: number, min: number, max: number): number

  // Do
  function clamp(value: number, { min, max }: { min: number; max: number }): number
  ```

  Two parameters (a value plus one option, or two required values like `randomInt(min, max)`) can stay positional.
- If a utility legitimately needs a version with and without an external dependency (like `date` vs. `date-vanilla`), ship both as separate registry items with identical function names and signatures where possible, and document the one difference clearly instead of forcing a single file to branch on which implementation is installed.
- Keep functions small and single-purpose. Don't add two functions that do the same thing under different names.

## Documentation standard

Every `.mdx` page under `content/docs/` follows this section order. Skip a section if it genuinely doesn't apply — don't pad a page to look complete.

```mdx
---
title: ComponentOrUtilityName
description: One sentence — what it does and when to reach for it.
---

One short paragraph: what it wraps/composes (for a component) or what problem it solves (for a utility).

## Installation

<InstallationTabs componentName="component-or-utility-name" />

### Manual Installation

(Utilities only, or any component small enough to copy by hand.) Show the full
source in a fenced code block so someone can grab a single function without
running the CLI.

## Usage Example

<ComponentPreview path="src/registry/demos/name-demo.tsx">
  <NameDemo />
</ComponentPreview>

## Playground

(Optional — only if there are meaningfully different visual states to toggle.)

<NamePlaygroundDemo />

## Examples

### With TanStack Form and Zod

(Optional — only for form-input components.)

<ComponentPreview path="src/registry/demos/name-form-demo.tsx">
  <NameFormDemo />
</ComponentPreview>

## Accessibility

Bullet list of the actual aria/keyboard wiring implemented in the component.
Don't describe behavior it doesn't have.

## API Reference

### ComponentOrFunctionName

| Prop / Param | Type | Default | Description |
|---|---|---|---|
| ... | ... | ... | ... |
```

Rules:
- Every prop in the component's TS interface (or every parameter of a utility function) must have a row in the API Reference table — the table is the contract, keep it in sync with the code.
- The demo component name referenced in the doc (`<NameDemo />`) must match the exported function name exactly — it's resolved from the `demos` barrel at build time, and a typo silently renders nothing.
- No `meta.json` per component folder — docs nav is file-based. Adding a new top-level category just means adding a new folder under `content/docs/` and listing the page in `content/docs/meta.json`.

## Component code standard

- TypeScript, no `any` — if a prop type is genuinely open-ended, use a generic or a well-scoped union.
- `cn()` from `@/lib/utils` for all conditional/merged class names.
- No unused props, no speculative flexibility ("might need this later") — a prop earns its place by being used in an actual demo or a real request.
- Match the file's existing formatting; Biome (`bun run lint:fix`) will handle most of it, but don't fight the formatter by hand-formatting differently.
- Comments only where the *why* isn't obvious from the code (a workaround, a non-obvious constraint) — not restating what the code already says.

## Commit convention

This repo uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add field-radio component
fix: prevent date-range-picker-field trigger text overflow
docs: add manual installation section to date utilities page
test: add vitest configuration and datatable tests
style: update fumadocs theme from neutral to black
refactor: bundle >2-param date-vanilla helpers into options objects
chore: bump shadcn cli version
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`. Keep the subject line short and in the imperative mood ("add", not "added" or "adds").

## Before opening a pull request

Run all of these — CI will fail if any of them do:

```bash
bun run types:check
bun run lint
bun test
bun run shadcn:build   # if you touched registry.json or any registry source file
bun run build          # if you added/changed a doc page — confirms it prerenders
```

For a UI component, also start the dev server and interact with it in a browser — type-checking and the test suite verify correctness, not that the thing actually feels right to use.

## Pull request process

1. Fork the repo and create a branch from `main`.
2. Make your change, following the standards above.
3. Make sure `registry.json` and `public/r/*.json` are both committed and in sync (`bun run shadcn:build`).
4. Open a PR against `main`. Describe *what* changed and *why*; link the issue it addresses if there is one. For a visual change, a screenshot or short clip helps a lot.
5. A maintainer will review and may ask for changes. Once approved, it'll be merged.

By contributing, you agree your contributions will be licensed under this project's [MIT License](./LICENSE).
