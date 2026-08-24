"use client";

import { Loader2 } from "lucide-react";

export function DataTableLoader({ fetching }: { fetching?: boolean }) {
  if (!fetching) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center bg-background/40 backdrop-blur-[1px]">
      <div className="mt-4 flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    </div>
  );
}
