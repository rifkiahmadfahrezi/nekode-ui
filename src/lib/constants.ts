
export const packages = ['npm', 'yarn', 'pnpm', 'bun'] as const
export type Packages = typeof packages[number]
export const baseUrl =
  import.meta.env.VITE_BASE_URL ||
  (typeof process !== 'undefined' ? process.env?.VITE_BASE_URL : undefined) ||
  '';
export const registryBaseUrl = `${baseUrl}/r/`
