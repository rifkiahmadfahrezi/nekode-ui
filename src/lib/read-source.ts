// lib/read-source.ts
import { createServerFn } from "@tanstack/react-start";

const sourceModules = import.meta.glob("/src/registry/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const readComponentSource = createServerFn({ method: "GET" })
  .validator((relativePath: string) => relativePath)
  .handler(async ({ data: relativePath }) => {
    const key = relativePath.startsWith("/")
      ? relativePath
      : `/${relativePath}`;

    const source = sourceModules[key];
    if (!source) {
      throw new Error(
        `Source not found: ${key}. Available: ${Object.keys(sourceModules).join(", ")}`,
      );
    }
    return source;
  });
