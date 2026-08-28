import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import {
  ArrowRight,
  Blocks,
  Check,
  Code2,
  Layers,
  Paintbrush,
  Shield,
  Terminal,
} from "lucide-react";
import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/")({
  component: Home,
});

const features = [
  {
    icon: Blocks,
    title: "Ready-made Components",
    description:
      "Pre-composed, production-ready components you can drop straight into your project.",
  },
  {
    icon: Shield,
    title: "Accessible by Default",
    description:
      "ARIA attributes, focus management, and keyboard navigation handled out of the box.",
  },
  {
    icon: Layers,
    title: "Built on shadcn/ui",
    description:
      "Extends the patterns you already know. Install via the registry, then customize freely.",
  },
  {
    icon: Paintbrush,
    title: "Blocks & Templates",
    description:
      "Beyond primitives — full page sections, layouts, and starter templates to accelerate your builds.",
  },
  {
    icon: Code2,
    title: "Copy, Paste, Own",
    description:
      "No hidden dependencies. The code lives in your project — read it, change it, ship it.",
  },
];

const components = [
  "TextField",
  "NumberField",
  "PasswordField",
  "SelectField",
  "ComboboxField",
  "DatePickerField",
  "TextareaField",
  "TimePickerField",
];

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16 md:pt-32 md:pb-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground mb-6">
          <Terminal className="size-3.5" />
          <span>npx shadcn add</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
          Ship faster with
          <br />
          <span className="text-muted-foreground">better building blocks.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          A curated shadcn/ui registry — components, blocks, and templates you
          can install in one command. Accessible, composable, yours to own.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/docs/$"
            params={{ _splat: "" }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="https://github.com/rifkiahmadfahrezi/nekode-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Install snippet */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="mx-auto max-w-lg rounded-lg border bg-card p-4 font-mono text-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Terminal className="size-4" />
            <span className="text-xs uppercase tracking-wider">Install</span>
          </div>
          <code className="text-foreground">
            npx shadcn@latest add{" "}
            <span className="text-muted-foreground">
              https://nekode-ui.pages.dev/r/text-field.json
            </span>
          </code>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Why nekode/ui?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-6"
              >
                <feature.icon className="size-5 mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Components list */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">What's Inside</h2>
          <p className="text-muted-foreground mb-8">
            Form fields, data display, blocks, and more — growing every week.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {components.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm font-mono"
              >
                <Check className="size-3.5 text-emerald-500" />
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 md:pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Stop rebuilding the same UI.
          </h2>
          <p className="text-muted-foreground mb-6">
            Install what you need, own the code, and focus on what makes your
            product unique.
          </p>
          <Link
            to="/docs/$"
            params={{ _splat: "" }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Read the Docs
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </HomeLayout>
  );
}
