
export const packages = ['npm', 'yarn', 'pnpm', 'bun'] as const
export type Packages = typeof packages[number]
export const baseUrl = typeof process !== 'undefined' ? window.location.origin : undefined;
export const registryBaseUrl = `${baseUrl}/r/`
