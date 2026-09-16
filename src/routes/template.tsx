import { createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ExternalLink } from "lucide-react";
import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/template")({
  component: TemplatesPage,
});

interface Template {
  name: string;
  description: string;
  image?: string;
  repoUrl: string;
  demoUrl: string;
  stack: string[];
}

const templates: Template[] = [
  {
    name: "Shadcn Dashboard",
    description:
      "Admin dashboard built on Next.js 16 (App Router, React 19) with a shadcn/ui component set, sidebar navigation, and dark mode.",
    image:
      "https://raw.githubusercontent.com/rifkiahmadfahrezi/shadcn-dashboard/main/public/screen-capture.png",
    repoUrl: "https://github.com/rifkiahmadfahrezi/shadcn-dashboard",
    demoUrl: "https://shadcn-dashboard-flax-iota.vercel.app",
    stack: ["Next.js 16", "shadcn/ui", "Tailwind v4", "TanStack Query"],
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
            Full starter projects built with nekode/ui components. Clone the
            repo or preview the live demo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template.name}
              className="flex flex-col overflow-hidden rounded-lg border bg-card"
            >
              <a
                href={template.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {template.image ? (
                  <img
                    src={template.image}
                    alt={`${template.name} preview`}
                    className="aspect-video w-full border-b object-cover object-top"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center border-b bg-muted/40 text-sm font-medium text-muted-foreground">
                    {template.name}
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

                <div className="mt-auto flex gap-2 pt-2">
                  <a
                    href={template.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <ExternalLink className="size-3.5" />
                    Live Demo
                  </a>
                  <a
                    href={template.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                  >
                    View Repo
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
