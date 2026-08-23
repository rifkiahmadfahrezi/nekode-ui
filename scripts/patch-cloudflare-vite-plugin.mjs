import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = resolve(
  __dirname,
  "../node_modules/@cloudflare/vite-plugin/dist/index.mjs",
);

const original = "...deployConfig.auxiliaryWorkers]";
const patched = "...(deployConfig.auxiliaryWorkers ?? [])]";

let content = readFileSync(filePath, "utf-8");

if (content.includes(patched)) {
  console.log("[patch] @cloudflare/vite-plugin already patched, skipping.");
  process.exit(0);
}

if (!content.includes(original)) {
  console.warn(
    "[patch] @cloudflare/vite-plugin: target string not found, patch may not be needed or package changed.",
  );
  process.exit(0);
}

content = content.replace(original, patched);
writeFileSync(filePath, content, "utf-8");
console.log("[patch] @cloudflare/vite-plugin patched successfully.");
