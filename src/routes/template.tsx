import { createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import { getRegistryRef, useOrigin } from "@/hooks/use-origin";
import { baseOptions } from "@/lib/layout.shared";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/template")({
  head: () =>
    seo({
      title: "Templates — nekode/ui",
      description:
        "Starter templates built with shadcn/ui and nekode/ui fields, ready to clone and deploy.",
      path: "/template",
    }),
  component: TemplatesPage,
});

interface Template {
  name: string;
  description: string;
  image?: string;
  repoUrl: string;
  demoUrl: string;
  stack: string[];
  /** Registry items installed together; a theme item must come first so its tokens overwrite. */
  install?: { label: string; items: string[] }[];
}

const templates: Template[] = [
  {
    name: "Shadcn Dashboard",
    description:
      "Admin dashboard built on Next.js 16 (App Router, React 19) with a shadcn/ui component set, sidebar navigation, and dark mode.",
    image:
      "/templates/dashboard.png",
    repoUrl: "https://github.com/rifkiahmadfahrezi/shadcn-dashboard",
    demoUrl: "https://shadcn-dashboard-flax-iota.vercel.app",
    stack: ["Next.js 16", "shadcn/ui", "Tailwind v4", "TanStack Query"],
    install: [
      { label: "Empty", items: ["dashboard-theme", "dashboard"] },
      {
        label: "With examples",
        items: ["dashboard-theme", "dashboard-examples"],
      },
    ],
  },
  {
    name: "Next.js Starter",
    description:
      "Minimal Next.js 16 boilerplate pre-configured with linting, formatting, type checking, pre-commit hooks, and data fetching tools.",
    repoUrl: "https://github.com/rifkiahmadfahrezi/next-starter",
    demoUrl: "https://next-starter-eight-lovat.vercel.app",
    stack: ["Next.js 16", "Tailwind v4", "TanStack Query", "Oxlint"],
  },
];

function TemplatesPage() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
        <div>
          <h1 className="text-lg font-semibold">Templates</h1>
          <p className="text-sm text-muted-foreground">
            Complete starter projects to clone and build from. Check the source
            before you commit, or try the live build first.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template.name}
              className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/20"
            >
              <a
                href={template.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden border-b"
              >
                {template.image ? (
                  <img
                    src={template.image}
                    alt={`${template.name} preview`}
                    className="aspect-video w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex aspect-video w-full items-end bg-muted/40 p-4"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, color-mix(in oklab, var(--muted-foreground) 8%, transparent) 0px, color-mix(in oklab, var(--muted-foreground) 8%, transparent) 1px, transparent 1px, transparent 12px)",
                    }}
                  >
                    <span className="rounded-md border bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
                      {template.name}
                    </span>
                  </div>
                )}
              </a>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h2 className="font-semibold">{template.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {template.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {template.install && (
                  <div className="space-y-2">
                    {template.install.map((cmd) => (
                      <InstallLine key={cmd.label} {...cmd} />
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Next.js + shadcn Base UI style (<code>base-*</code>). Adds
                      routes under <code>/dashboard</code>.
                    </p>
                  </div>
                )}

                <div className="mt-auto flex gap-2 pt-2">
                  <a
                    href={template.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <ExternalLink className="size-3.5" />
                    Live demo
                  </a>
                  <a
                    href={template.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                  >
                    View source
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </HomeLayout>
  );
}

function InstallLine({ label, items }: { label: string; items: string[] }) {
  const origin = useOrigin();
  const [copied, copy] = useCopy();
  const command = `npx shadcn@latest add ${items
    .map((name) => getRegistryRef(origin, name))
    .join(" ")}`;

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 py-1.5 pr-1.5 pl-3">
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <code className="min-w-0 flex-1 truncate font-mono text-xs">
        {command}
      </code>
      <button
        type="button"
        onClick={() => copy(command)}
        aria-label={`Copy ${label.toLowerCase()} install command`}
        className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </div>
  );
}
