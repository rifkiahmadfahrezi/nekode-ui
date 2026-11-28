import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { NekodeLogo } from "@/components/nekode-logo";
import { baseOptions } from "@/lib/layout.shared";
import { cn } from "@/lib/utils";

type StatusPageProps = {
  /** Teks stempel besar, misalnya "404" atau "Error". */
  code: string;
  /** Label kecil di atas judul. */
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  /** Tombol / link aksi. */
  actions?: ReactNode;
  /** Konten tambahan di bawah aksi, misalnya detail error. */
  children?: ReactNode;
  className?: string;
};

/** Kerangka halaman status (404, error) dengan gaya "neko zine" landing page. */
export function StatusPage({
  code,
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: StatusPageProps) {
  return (
    <HomeLayout {...baseOptions()}>
      <main
        className={cn(
          "nz bg-grain flex w-full flex-1 flex-col items-center justify-center px-5 py-16 md:px-10 md:py-24",
          className,
        )}
      >
        <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-4 md:gap-5">
            <NekodeLogo className="size-12 shrink-0 text-foreground md:size-16" />
            <span
              className="stamp stamp-lg -rotate-6 text-2xl md:text-4xl"
              aria-hidden="true"
            >
              {code}
            </span>
          </div>
          <div className="eyebrow mt-4 text-muted-foreground">{eyebrow}</div>
          <h1 className="display text-balance text-[clamp(2.5rem,6vw,4.5rem)]">
            {title}
          </h1>
          <p className="lede max-w-xl text-pretty">{description}</p>
          {actions ? (
            <div className="mt-2 flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              {actions}
            </div>
          ) : null}
          {children}
        </div>
      </main>
    </HomeLayout>
  );
}
