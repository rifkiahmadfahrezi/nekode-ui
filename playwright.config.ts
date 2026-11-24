import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const baseURL = `http://localhost:${PORT}`;

/**
 * End-to-end tests for registry components, run against the demos on a
 * production build of the docs site (dev-mode SSR is too slow to test in
 * parallel). `bunx playwright install chromium` once, then
 * `bun run test:e2e`. Set PLAYWRIGHT_CHANNEL=chrome to use an installed
 * Google Chrome instead. While iterating, keep `bun run build && bun run
 * preview --port 4173` running in another terminal; it is reused.
 */
export default defineConfig({
  testDir: "e2e",
  // `.e2e.ts` keeps these out of Vitest and `bun test`.
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  // Each docs page mounts several editors; more workers than this starve the
  // CPU and turn hydration into flaky timeouts.
  workers: 2,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `bun run build && bun run preview --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
