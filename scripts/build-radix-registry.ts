// Prepares the Radix flavour of the registry in .registry-radix; the
// shadcn:build script then builds it into public/r/radix.
//
// Sources are written against shadcn's Base UI components. Most of them work
// unchanged on Radix-based shadcn; the few Base-UI-only APIs are rewritten
// below. Every rewrite must match, so a source change that breaks a pattern
// fails the build instead of silently shipping Base UI code to Radix users.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const OUT_DIR = ".registry-radix";
const SITE_R = "https://ui.nekode.id/r/";

type Rewrite = [pattern: string | RegExp, replacement: string];

const rewrites: Record<string, Rewrite[]> = {
  // Radix SelectValue renders the selected item's label by itself; `items`
  // is a Base UI Select root prop.
  "src/registry/ui/select-field.tsx": [
    [
      /\n\s*\/\/ Base UI's SelectValue[\s\S]*?\[groups, options\],\n\s*\);\n/,
      "\n",
    ],
    [/\n\s*items=\{items\}/, ""],
  ],
  // Base UI's `render` prop → Radix `asChild`.
  "src/registry/ui/datatable/DataTableRow.tsx": [
    [
      /<ContextMenuTrigger\s+render=\{\s*(<TableRow[\s\S]*?)\s*\/>\s*\}\s*>\s*\{cells\}\s*<\/ContextMenuTrigger>/,
      "<ContextMenuTrigger asChild>$1>{cells}</TableRow></ContextMenuTrigger>",
    ],
  ],
  // Radix Checkbox has no `indeterminate` prop; it's a `checked` state.
  "src/registry/ui/datatable/DataTableHeader.tsx": [
    [
      /checked=\{selectionChecked\}\s*indeterminate=\{selectionIndeterminate\}/,
      'checked={selectionIndeterminate ? "indeterminate" : selectionChecked}',
    ],
  ],
};

function applyRewrites(path: string, source: string) {
  let out = source;
  for (const [pattern, replacement] of rewrites[path] ?? []) {
    const next = out.replace(pattern, replacement);
    if (next === out)
      throw new Error(`Radix rewrite did not match in ${path}: ${pattern}`);
    out = next;
  }
  return out;
}

const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const unused = new Set(Object.keys(rewrites));

rmSync(OUT_DIR, { recursive: true, force: true });

for (const item of registry.items) {
  let usesBaseUi = false;
  for (const file of item.files) {
    const path = normalize(file.path);
    const source = applyRewrites(path, readFileSync(path, "utf8"));
    unused.delete(path);
    usesBaseUi ||= source.includes("@base-ui/react");

    const outPath = `./${join(OUT_DIR, path)}`;
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, source);
    file.path = outPath;
  }

  // Radix projects only need @base-ui/react where we import it directly.
  if (!usesBaseUi && item.dependencies) {
    item.dependencies = item.dependencies.filter(
      (d: string) => d !== "@base-ui/react",
    );
  }
  // Point our own cross-item dependencies at the Radix build.
  item.registryDependencies = item.registryDependencies?.map((d: string) =>
    d.startsWith(SITE_R) ? `${SITE_R}radix/${d.slice(SITE_R.length)}` : d,
  );
}

if (unused.size)
  throw new Error(
    `Radix rewrites for unknown files: ${[...unused].join(", ")}`,
  );

writeFileSync(
  join(OUT_DIR, "registry.json"),
  JSON.stringify(registry, null, 2),
);
