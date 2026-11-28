import {
  type ErrorComponentProps,
  Link,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Bug, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusPage } from "@/components/status-page";
import { useCopy } from "@/hooks/use-copy";
import { gitConfig } from "@/lib/shared";
import { cn } from "@/lib/utils";

const issuesUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/issues/new`;

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === "string" ? error : JSON.stringify(error));
}

/**
 * Error boundary default untuk semua route (dipasang lewat
 * `defaultErrorComponent` di router). Detail error dan stack trace hanya
 * tampil saat development.
 */
export function ErrorPage({
  error: rawError,
  reset,
  info,
}: ErrorComponentProps) {
  const router = useRouter();
  const error = toError(rawError);
  const isDev = import.meta.env.DEV;
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    console.error(rawError);
  }, [rawError]);

  const retry = async () => {
    setRetrying(true);
    try {
      // Jalankan ulang loader route yang aktif, lalu reset boundary-nya.
      await router.invalidate();
      reset();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <StatusPage
      code="Error"
      eyebrow="Something went wrong"
      title={
        <>
          Our cat knocked <span className="serif block">something over.</span>
        </>
      }
      description="This page hit an unexpected error while loading. Try again, and if it keeps happening, let us know on GitHub."
      actions={
        <>
          <button
            type="button"
            onClick={retry}
            disabled={retrying}
            className="btn btn-primary disabled:pointer-events-none disabled:opacity-60"
          >
            <RotateCw className={cn("size-5", retrying && "animate-spin")} />
            {retrying ? "Retrying…" : "Try again"}
          </button>
          <Link to="/" className="btn btn-outline">
            <ArrowLeft className="size-5" />
            Back home
          </Link>
          <a
            href={issuesUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <Bug className="size-4" />
            Report an issue
          </a>
        </>
      }
    >
      {isDev ? (
        <ErrorDetails error={error} componentStack={info?.componentStack} />
      ) : null}
    </StatusPage>
  );
}

function ErrorDetails({
  error,
  componentStack,
}: {
  error: Error;
  componentStack?: string;
}) {
  const [copied, copy] = useCopy();
  const details = [
    `${error.name}: ${error.message}`,
    error.stack,
    componentStack ? `Component stack:${componentStack}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="mt-8 w-full overflow-hidden rounded-xl border-2 border-dashed border-brand/60 bg-card text-left">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <span className="eyebrow text-[11px] text-brand">
          Dev only · error details
        </span>
        <button
          type="button"
          onClick={() => copy(details)}
          className="rounded-md px-2 py-1 font-mono text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="px-4 pt-3 font-mono text-sm font-semibold break-words text-foreground">
        {error.name}: {error.message}
      </p>
      {error.stack || componentStack ? (
        <details className="group px-4 pt-2 pb-3">
          <summary className="cursor-pointer font-mono text-xs text-muted-foreground select-none hover:text-foreground">
            Stack trace
          </summary>
          <pre className="mt-2 max-h-72 overflow-auto font-mono text-xs leading-relaxed whitespace-pre text-muted-foreground">
            {error.stack}
            {componentStack ? `\n\nComponent stack:${componentStack}` : ""}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
