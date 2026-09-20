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
