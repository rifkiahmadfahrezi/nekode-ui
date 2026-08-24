# DataTable (shadcn/ui + Base UI)

A mantine-datatable-inspired data table built on shadcn/ui's **Base UI**
backend (`@base-ui/react`, not Radix), split into small, memoized pieces for
performance, and fully type-checked against Base UI's real types.

## Install

```bash
npx shadcn@latest add table checkbox button select context-menu
```

Also needs `lucide-react` (ships with shadcn) and `cn` from `@/lib/utils`.

## Files

```
datatable/
├── types.ts               Public types (DataTableColumn, props, etc.)
├── utils.ts                Pure helpers: id/key extraction, pin-offset math,
│                            pagination range, useMergedRef
├── DataTableHeader.tsx     <thead> — sort buttons, select-all checkbox
├── DataTableRow.tsx        One <tr> (+ optional nested row) — React.memo'd
├── DataTableFooter.tsx     <tfoot> — only rendered if a column has `footer`
├── DataTableLoader.tsx     Fetching overlay
├── DataTableEmptyState.tsx "No records" row
├── DataTablePagination.tsx Pagination bar
├── DataTable.tsx            Orchestrator — state, memoized callbacks, layout
└── index.ts                 Barrel export
```

Import everything from the barrel:

```tsx
import { DataTable, type DataTableColumn, type SortStatus } from "@/components/datatable";
```

## Why it's split up (performance)

`DataTableRow` is `React.memo`'d with a custom comparator. As long as you
don't inline new functions/objects as `rowClassName`/`rowStyle` on every
render, toggling selection or expansion on **one** row only re-renders that
row — not the whole table. All the callbacks the table hands down to rows
(`onToggleSelect`, `onToggleExpand`, pin helpers, etc.) are `useCallback`'d
in `DataTable.tsx` for exactly this reason.

## What changed vs. the Radix/shadcn version

- **Checkbox**: Base UI splits tri-state checkboxes into `checked?: boolean`
  and `indeterminate?: boolean` (two props) instead of Radix's single
  `checked: boolean | "indeterminate"`.
- **No `asChild`**: Base UI has no Radix Slot mechanism. Context-menu-enabled
  rows use Base UI's `render` prop instead — see `DataTableRow.tsx` for the
  pattern (row "shell" passed via `render`, cells passed as `children`).
- Verified against the actual `@base-ui/react` package types (not guessed)
  for `Checkbox` and `ContextMenu`. `Select`/`Button` usage is unchanged
  since shadcn keeps the same component names/props for those regardless of
  backend — if your generated `select.tsx`/`button.tsx` diverge from stock
  shadcn output, adjust accordingly.

## Features

- Sortable columns, with `sortStatus`/`onSortStatusChange` required by
  TypeScript once any column has `sortable: true` (inline `columns` array).
- Row selection with header indeterminate state **and shift-click range
  select** (click a row, shift-click another to select everything between).
- Declarative column pinning: `{ pinned: "left" | "right" }` per column.
- Expandable nested rows (lazy-rendered, only computed when a row is open),
  with optional `rowExpandable` guard and `singleExpand` (accordion) mode.
- Right-click row context menu.
- Column **footers** (`col.footer`) — renders a `<tfoot>` automatically.
- Pagination with numbered pages + ellipsis, custom info text.
- Fixed `height` → sticky header/footer, only the body scrolls.
- **Scroll shadows** — subtle left/right fade indicators when there's more
  horizontally-scrollable content, toggled via a real scroll listener.
- Refs: `headerRef`, `bodyRef`, `footerRef`, `tableRef`, `scrollViewportRef`,
  and a per-row `rowRef` callback.
- `variant="bordered" | "borderless"`.

## Intentionally not included

To keep this a single reviewable component rather than a full library port,
these mantine-datatable features were left out — happy to add any of them if
you need them:

- Column drag-to-reorder / resize / show-hide + `localStorage` persistence
- Two-level grouped column headers
- Row virtualization (fine for hundreds of rows; add `@tanstack/react-virtual`
  yourself for tens of thousands)
- CSS-variable-based theming system (this version leans on Tailwind classes
  directly, which is more idiomatic for a shadcn component)
