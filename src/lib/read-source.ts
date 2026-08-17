import { createServerFn } from "@tanstack/react-start";
import path from "node:path";

export const readComponentSource = createServerFn({ method: "GET" })
  .validator((relativePath: string) => relativePath)
  .handler(async ({ data: relativePath }) => {
    const filePath = path.join(process.cwd(), relativePath);

    // Bun runtime tersedia (mis. deploy pakai nitro bun preset)
    if (typeof Bun !== "undefined") {
      const file = Bun.file(filePath);
      if (!(await file.exists())) {
        throw new Error(`Source tidak ditemukan: ${filePath}`);
      }
      return await file.text();
    }

    // fallback Node.js
    const { readFile } = await import("node:fs/promises");
    return readFile(filePath, "utf-8");
  });