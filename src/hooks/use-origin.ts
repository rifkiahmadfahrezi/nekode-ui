import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** window.location.origin on client; VITE_BASE_URL (or "") during SSR. */
export function useOrigin() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => import.meta.env.VITE_BASE_URL ?? "",
  );
}

const REGISTRY_NAMESPACE = "@nekode";

/** Registry ref for a component: namespace on prod, direct URL on localhost dev. */
export function getRegistryRef(origin: string, name: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)/.test(origin)
    ? `${origin}/r/${name}.json`
    : `${REGISTRY_NAMESPACE}/${name}`;
}
