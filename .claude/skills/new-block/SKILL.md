---
name: new-block
description: Scaffold a new nekode/ui block - a ready-to-use, plug-and-play React UI section (login, signup, pricing, settings, contact, dashboard section...) with registry source, registry.json `registry:block` entry, generated public/r JSON, and a preview card on the /blocks page. Use whenever the user asks to add/create/build a block, page section, or full-form UI for the registry, wants it to look good and be responsive, or names one (e.g. "buat block pricing", "add a settings-form block"), even if they never say "block".
---

A block is a composed UI section a consumer installs with one `shadcn add` command and drops into a page. It is different from a component (`new-component` skill): a component is a single primitive, a block assembles primitives into something that already looks finished. The two things that make a block worth installing are that it **looks good with zero tweaking** and that it **holds up at every screen width**. Most of this skill is about those two.

## File map

| File | Purpose |
|---|---|
| `src/registry/blocks/<name>.tsx` | Implementation. Registry source of truth. Multi-file blocks use `src/registry/blocks/<name>/` with one file per piece. |
| `registry.json` | Item with `"type": "registry:block"`. |
| `public/r/<name>.json` | **Generated** by `bun run shadcn:build`. Never hand-write. |
| `src/routes/blocks.tsx` | Add an entry to the `blocks` array so it shows on `/blocks` (live preview, viewport tabs, code tree, install command). |

There is no `components/ui` re-export and no docs mdx for blocks: the `/blocks` page is the documentation.

## Steps

1. **Read a sibling first.** Open `src/registry/blocks/login-form.tsx` (form block) and its `registry.json` entry + `blocks.tsx` entry before writing. Conventions live in code; copy the shape.

2. **Write the block** following the design rules below. Blocks are plug and play, so:
   - `"use client"` on top if it uses hooks.
   - Export the component and an `<Name>Props` interface. Expose data/behavior through props with sensible defaults (`onSubmit?(values)`, `plans`, `items`...), not by hardcoding backend calls. The consumer should never need to edit the file just to wire it up.
   - Export the value types (`LoginFormValues`) so callers can type their handlers.
   - Compose existing pieces: registry fields (`TextField`, `PasswordField`, `TextareaField`, `SelectField`...), shadcn primitives (`Button`, ...) from `@/components/ui/*`. Don't restyle or reimplement what those already give you (labels, errors, aria wiring).
   - Forms follow `login-form.tsx` exactly (see "Form behavior" below): TanStack Form + zod, validate on blur, errors only on touched fields, spinner while submitting, error alert, focus first invalid field.

3. **Register** in `registry.json`: `type: "registry:block"`, `title`, `description`, `dependencies` (npm packages, e.g. `@tanstack/react-form`, `zod`), `registryDependencies`, and `files` with `type: "registry:component"` and `target: "components/blocks/<name>.tsx"`.
   - shadcn primitives go by short name (`"button"`).
   - **nekode items must be full URLs** (`"https://ui.nekode.id/r/text-field.json"`). A short name is looked up in the official shadcn registry and the install fails.

4. **Build the registry**: `bun run shadcn:build`, confirm `public/r/<name>.json` appeared.

5. **Add to `/blocks`**: import the block in `src/routes/blocks.tsx`, add `{ name, title, description, files: [file("<name>")], preview: <Block onSubmit={showValues} /> }`. `name` must equal the registry name (it builds the install command). For a multi-file block list every file, using the registry `target` as the tree path.

6. **Verify visually, not just with types** (see below), then `bun run types:check` and `bunx biome check --write <changed files>`.

## Form behavior (why each exists)

Copy these from `login-form.tsx`; each fixes a real annoyance:
- `validationLogic: revalidateLogic({ mode: "blur", modeAfterSubmission: "change" })` with `validators: { onDynamic: schema }`. Validating on every keystroke flags "a" as an invalid email before the user finished typing; blur first, then live once they have tried to submit.
- `error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}`. A form-level schema fills errors for every field on the first blur, so untouched fields would light up red without the user going near them. Submit marks all fields touched, so submit still shows everything.
- Submit button is `disabled={isSubmitting}` only, with `aria-busy` and a `LoaderCircle animate-spin` icon. Never disable it on `canSubmit`: a dead button gives no hint why.
- `onSubmitInvalid` focuses the first `[aria-invalid='true']` in `requestAnimationFrame` (errors render a frame later). Without it keyboard and screen reader users are left on the button.
- Wrap `await onSubmit?.()` in try/catch and show the message in a `role="alert"` box above the button. The consumer's handler will fail sometimes; the block must let the user retry.
- One-shot flows (forgot password, contact) swap to a success card after `onSubmit` resolves. The card is `tabIndex={-1}` and focused via ref so it is announced, and offers a way to go again.
- Inputs get `name`, `autoComplete`, and for email `type="email" inputMode="email" autoCapitalize="none" spellCheck={false}`, so password managers and mobile keyboards behave. Every input also gets a `placeholder` showing an example value (`you@example.com`, `Jane Doe`); it is a hint only, the visible label stays the accessible name.
- Navigation links (`forgotPasswordHref`, `registerHref`...) are optional props that render only when set. The block can't know the consumer's routes; default stays clean. Use plain `<a>` with `whitespace-nowrap` on short link text.
- Wrap the form in a card (`rounded-xl border bg-card p-6 shadow-xs sm:p-8`) so it looks finished on any background. Use a single column: `/blocks` previews narrow widths by constraining a `div`, so `sm:` grids would squeeze inside the "mobile" preview.

## Design rules (why each exists)

The goal is that a screenshot of the block at 375px, 768px and 1280px all look intentional. Blocks are pasted into unknown pages, so they cannot assume anything about the parent.

**Layout, mobile first**
- Base classes target a phone; add `sm:`/`md:`/`lg:` only to enhance. Grids start `grid-cols-1`, then `sm:grid-cols-2`, `lg:grid-cols-3`.
- The block fills its parent and caps itself: `w-full max-w-sm mx-auto` (forms), `max-w-md`, `max-w-5xl` (sections). Never a fixed pixel width (`w-72`) - that is what overflows on a 375px screen. Demos in this repo use fixed widths; blocks must not.
- `mx-auto` on a child of a flex column parent shrink-wraps it to its content width. Pair it with `w-full`, otherwise long content pushes the block off-screen.
- Flex children that hold long text need `min-w-0`, plus `truncate` or `break-words`. Without `min-w-0` a flex item refuses to shrink below its content.
- Button rows: `flex flex-col gap-3 sm:flex-row` so they stack on phones. Primary action full width on mobile (`w-full sm:w-auto`).
- Spacing scale stays on multiples of 4 (`gap-4`, `p-6`). Section padding shrinks on mobile (`px-4 py-12 md:py-20`).

**Visual quality**
- Clear hierarchy: one heading (`text-2xl font-semibold tracking-tight`), one muted supporting line (`text-sm text-muted-foreground`), then content, then a single obvious primary action. If two things compete for attention, demote one to `variant="outline"` or `"ghost"`.
- Semantic tokens only: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border`, `bg-primary`. A hardcoded `bg-white` or `text-gray-500` breaks dark mode and consumers' themes. Both themes are supported here, so look at light and dark.
- Cards: `rounded-lg border bg-card p-6`. Don't nest cards inside cards.
- Icons from `lucide-react` at `size-4`/`size-5`, decorative ones get `aria-hidden="true"`.

**States and accessibility** (a block that only looks good when filled with happy-path data is unfinished)
- Handle empty, loading (button label + disabled), and error states the block can reach.
- Touch targets stay at least ~36px tall (the `Button`/field defaults already do); keep them.
- Use real landmarks/semantics: `<form>`, `<nav aria-label>`, heading order that doesn't skip levels, visible focus (don't remove outlines).
- Every input has a label; reuse the field components to get this for free.

## Verify visually

Run the dev server (`bun run dev`, port 3000), then:

```bash
.claude/skills/new-block/scripts/shoot.sh http://localhost:3000/blocks /tmp/shots
```

Read the three PNGs (mobile-375, tablet-768, desktop-1280) and check: no horizontal scroll or clipped text, nothing touching the screen edge (16px gutter), buttons stack on mobile, readable contrast. Also confirm the install command under the card points at the right `/r/<name>.json`. Fix what you see and re-shoot; don't declare it done from the code alone.

## What NOT to do

- Don't hand-write `public/r/*.json`.
- Don't hardcode fetch calls, routes, or copy the consumer would have to edit; take props.
- Don't use raw color values or `dark:` overrides where a token exists.
- Don't add a docs mdx page per block; the `/blocks` page is the doc.
- Don't modify the original shadcn primitives in `src/components/ui`.
- Don't add categories/filters to `/blocks` until there are enough blocks to need them.
