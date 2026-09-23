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
} from "lucide-react";
import { InstallCommand } from "@/components/install-command";
import { baseOptions } from "@/lib/layout.shared";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "nekode/ui — shadcn form fields, blocks & templates",
      path: "/",
    }),
  component: Home,
});

const features = [
  {
    icon: Blocks,
    title: "Fields, blocks, and templates",
    description:
      "Form fields today, full blocks and starter templates alongside — one registry, growing past forms.",
  },
  {
    icon: Shield,
    title: "Keyboard and screen reader tested",
    description:
      "Focus order, ARIA roles, and error announcements are handled — not bolted on after launch.",
  },
  {
    icon: Layers,
    title: "One command, no lock-in",
    description:
      "Pulls straight from this registry into your project, styled with the shadcn/ui tokens you already have.",
  },
  {
    icon: Paintbrush,
    title: "Whole flows, not just fields",
    description:
      "A form generator and starter templates for the pages you'd otherwise rebuild from scratch every project.",
  },
  {
    icon: Code2,
    title: "Nothing to import from us",
    description:
      "Every component lands in your repo as plain code. No package to update, no version to chase.",
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
      <section className="flex w-full flex-col items-center justify-center px-4 pt-24 pb-16 md:pt-32 md:pb-24 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
          Components as a service
          <br />
          <span className="text-muted-foreground">
            for your shadcn/ui project.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          Form fields, blocks, and full templates — installed straight into
          your codebase, no dependency added.
        </p>

        <div className="mb-8 flex w-full justify-center">
          <InstallCommand />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/docs/$"
            params={{ _splat: "" }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Browse components
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

      {/* Features */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            More than fields
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Start with these form fields
          </h2>
          <p className="text-muted-foreground mb-8">
            Each one is a drop-in replacement for the shadcn/ui input you're
            already using. Blocks and templates ship the same way.
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
            Install the components, wire up the flow, and get back to the
            part of the product only you can build.
          </p>
          <Link
            to="/docs/$"
            params={{ _splat: "" }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Read the docs
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </HomeLayout>
  );
}
