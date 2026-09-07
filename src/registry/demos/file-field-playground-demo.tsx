"use client";

import * as React from "react";
import { FileField } from "@/components/ui/file-field";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-blue-500" : "bg-fd-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
            checked && "translate-x-4",
          )}
        />
      </button>
      <span className="text-sm text-fd-foreground">{label}</span>
    </label>
  );
}

export function FileFieldPlaygroundDemo() {
  const [multiple, setMultiple] = React.useState(true);
  const [disabled, setDisabled] = React.useState(false);
  const [error, setError] = React.useState("");

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-fd-border md:flex-row">
      <div className="flex min-h-[320px] flex-1 items-center justify-center p-10">
        <FileField
          label="Attachments"
          description={!error ? "PNG, JPG or PDF up to 5MB." : undefined}
          error={error || undefined}
          multiple={multiple}
          disabled={disabled}
          accept="image/*,.pdf"
          className="w-full max-w-sm"
        />
      </div>

      <div className="w-full shrink-0 space-y-5 border-t border-fd-border bg-fd-muted/20 p-5 md:w-72 md:border-l md:border-t-0">
        <Toggle checked={multiple} onChange={setMultiple} label="Multiple" />
        <Toggle checked={disabled} onChange={setDisabled} label="Disabled" />

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-fd-foreground">Error</p>
          <input
            className="w-full rounded-md border border-fd-border bg-fd-background px-3 py-1.5 text-sm text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={error}
            onChange={(e) => setError(e.target.value)}
            placeholder="Enter prop value"
          />
        </div>
      </div>
    </div>
  );
}
