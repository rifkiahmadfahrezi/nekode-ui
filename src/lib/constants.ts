
export const packages = ['npm', 'yarn', 'pnpm', 'bun'] as const
export type Packages = typeof packages[number]
export const baseUrl = import.meta.env.VITE_BASE_URL!;
export const registryBaseUrl = `${baseUrl}/r/`
