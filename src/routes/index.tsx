import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import {
  Calendar,
  ChevronDown,
  CircleAlert,
  Clock,
  Copy,
  Eye,
  GripVertical,
  Lock,
} from "lucide-react";
import type { ReactNode } from "react";
import { InstallCommand } from "@/components/install-command";
import { useCopy } from "@/hooks/use-copy";
import { getRegistryRef, useOrigin } from "@/hooks/use-origin";
import { baseOptions } from "@/lib/layout.shared";
import { seo } from "@/lib/seo";
import { gitConfig } from "@/lib/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "nekode/ui — shadcn form fields, blocks & templates",
      path: "/",
    }),
  component: Home,
});

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

/** Lebar konten desain 1440px; background section tetap full-bleed. */
const wrap = "mx-auto w-full max-w-[1440px] px-5 md:px-10 lg:px-16";

const tickerWords = [
  "COPY",
  "PASTE",
  "SHIP",
  "FORM GENERATOR",
  "NO LOCK-IN",
  "ACCESSIBLE BY DEFAULT",
  "SHADCN/UI REGISTRY",
];

const steps = [
  {
    title: "Copy the command",
    body: "Pick a component in the docs and copy one command.",
  },
  {
    title: "Paste it",
    body: (
      <>
        Run it in your project. The file lands in{" "}
        <span className="font-mono text-base text-foreground">
          components/ui
        </span>
        .
      </>
    ),
  },
  {
    title: "Ship",
    body: "It's your code now. Edit anything, no package to update.",
  },
];

const generatorFields = [
  ["Aa", "Text"],
  ["¶", "Textarea"],
  ["••", "Password"],
  ["12", "Number"],
  ["▾", "Select"],
  ["⌕", "Combobox"],
  ["⌕+", "Combobox Multi"],
  ["◉", "Radio"],
  ["◐", "Switch"],
  ["31", "Date Picker"],
  ["↔", "Date Range Picker"],
  ["31+", "Date Multi Picker"],
  ["◷", "Time Picker"],
  ["⇪", "File"],
];

const caret = <span className="h-[18px] w-0.5 bg-brand" />;
const stepper =
  "flex h-full w-11 items-center justify-center border-input font-bold";

const tickets: { name: string; slug: string; preview: ReactNode }[] = [
  {
    name: "TextField",
    slug: "text-field",
    preview: (
      <div className="mini">
        <span className="text-muted-foreground">Your full name</span>
        {caret}
      </div>
    ),
  },
  {
    name: "NumberField",
    slug: "number-field",
    preview: (
      <div className="mini justify-between overflow-hidden p-0">
        <span className={cn(stepper, "border-r-2")}>−</span>
        <span className="font-mono font-bold">12</span>
        <span className={cn(stepper, "border-l-2")}>+</span>
      </div>
    ),
  },
  {
    name: "PasswordField",
    slug: "password-field",
    preview: (
      <div className="mini justify-between">
        <span className="tracking-[3px]">••••••••</span>
        <Eye className="size-[18px] text-muted-foreground" />
      </div>
    ),
  },
  {
    name: "SelectField",
    slug: "select-field",
    preview: (
      <div className="mini justify-between">
        Editor
        <ChevronDown className="size-[18px]" />
      </div>
    ),
  },
  {
    name: "ComboboxField",
    slug: "combobox-field",
    preview: (
      <div className="mini gap-1.5 px-2">
        <span className="chip">React ×</span>
        <span className="chip">Zod ×</span>
        <span className="text-[13px] text-muted-foreground">Add…</span>
      </div>
    ),
  },
  {
    name: "DatePickerField",
    slug: "date-picker-field",
    preview: (
      <div className="mini">
        <Calendar className="size-[18px] text-brand" />
        Sep 29, 2026
      </div>
    ),
  },
  {
    name: "TextareaField",
    slug: "textarea-field",
    preview: (
      <div className="mini items-start pt-1.5 text-[13px] leading-[1.35]">
        <span className="text-muted-foreground">
          Tell us about your project…
        </span>
      </div>
    ),
  },
  {
    name: "TimePickerField",
    slug: "time-picker-field",
    preview: (
      <div className="mini justify-between">
        <span className="font-mono text-base font-bold">09:41</span>
        <Clock className="size-[18px] text-brand" />
      </div>
    ),
  },
];

function InstallPill({
  names = ["text-field"],
  className,
}: {
  names?: string[];
  className?: string;
}) {
  const origin = useOrigin();
  const [copied, copy] = useCopy();
  const command = `npx shadcn@latest add ${names.map((name) => getRegistryRef(origin, name)).join(" ")}`;

  return (
    <div
      className={cn(
        "pill max-sm:h-[52px] max-sm:gap-2.5 max-sm:pl-4 max-sm:text-[13px]",
        className,
      )}
    >
      <span className="font-bold text-brand">$</span>
      <code>{command}</code>
      <button
        type="button"
        className={cn("copy", copied && "done")}
        onClick={() => copy(command)}
        aria-label="Copy install command"
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}

function Ticker({ reverse }: { reverse?: boolean }) {
  // 4x supaya track selalu lebih lebar dari 2 viewport (animasi geser -50%)
  const words = Array.from({ length: 4 }, () => tickerWords).flat();
  return (
    <div className="ticker" aria-hidden="true">
      <div
        className={cn(
          "ticker-track",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {words.map((word, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: daftar statis, kata berulang
          <span key={i}>
            {word} <i>✦</i>{" "}
          </span>
        ))}
      </div>
    </div>
  );
}

/** "ネコ" (Noto Sans JP Black) sebagai outline — tanpa memuat font JP. */
function Neko({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 1960"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute hidden fill-brand select-none xl:block",
        className,
      )}
    >
      <path
        transform="translate(0 880) scale(1 -1)"
        d="M591 826Q589 807 586 782Q584 756 584 731Q584 715 584 694Q584 673 584 652Q584 631 584 613H425Q425 631 425 651Q425 671 425 692Q425 712 425 731Q425 757 424 782Q422 807 419 826ZM873 601Q851 579 826 552Q802 525 784 505Q755 473 718 436Q682 400 640 364Q599 327 554 295Q500 256 430 220Q360 185 284 155Q208 125 135 103L42 246Q188 277 288 324Q388 372 451 412Q486 435 514 458Q543 480 565 502Q587 523 600 542Q586 542 558 542Q531 542 497 542Q463 542 428 542Q392 542 360 542Q327 542 302 542Q278 542 268 542Q250 542 224 542Q198 541 174 540Q149 539 133 537V694Q164 690 202 688Q239 687 265 687Q276 687 306 687Q337 687 378 687Q420 687 466 687Q512 687 556 687Q599 687 632 687Q664 687 679 687Q705 687 729 690Q753 693 773 698ZM582 390Q582 364 582 324Q582 283 582 236Q582 190 582 146Q582 103 582 72Q582 51 583 25Q584 -1 586 -25Q588 -49 589 -65H416Q418 -51 420 -27Q422 -3 423 24Q424 51 424 72Q424 101 424 136Q424 171 424 206Q424 242 424 273Q424 304 424 326ZM870 95Q827 131 788 158Q749 186 711 210Q673 233 632 257L731 373Q777 349 812 329Q848 309 885 286Q922 263 971 229Z"
      />
      <path
        transform="translate(0 1840) scale(1 -1)"
        d="M148 724Q178 721 216 719Q253 717 280 717H790Q814 717 844 718Q874 719 885 720Q884 702 883 673Q882 644 882 619V100Q882 75 884 37Q885 -1 887 -30H711Q712 -1 712 26Q713 53 713 81V560H280Q246 560 208 559Q171 558 148 556ZM136 186Q165 184 199 182Q233 180 268 180H811V20H273Q245 20 204 18Q163 16 136 13Z"
      />
    </svg>
  );
}

function Paw({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <ellipse cx="32" cy="42" rx="14" ry="12" />
      <ellipse cx="13" cy="27" rx="6" ry="8" transform="rotate(-20 13 27)" />
      <ellipse cx="25" cy="15" rx="6" ry="8" />
      <ellipse cx="39" cy="15" rx="6" ry="8" />
      <ellipse cx="51" cy="27" rx="6" ry="8" transform="rotate(20 51 27)" />
    </svg>
  );
}

function RegMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={cn(
        "absolute top-[18px] hidden size-[30px] opacity-85 lg:block",
        className,
      )}
    >
      <circle cx="15" cy="15" r="8" />
      <path d="M15 0v30M0 15h30" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function WindowDots() {
  return (
    <>
      <span className="dot r" />
      <span className="dot" />
      <span className="dot" />
    </>
  );
}

function SectionHead({
  eyebrow,
  children,
  aside,
  className,
}: {
  eyebrow: ReactNode;
  children: ReactNode;
  aside: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16",
        className,
      )}
    >
      <div className="flex flex-col items-start gap-7">
        {eyebrow}
        {children}
      </div>
      {aside}
    </div>
  );
}

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="nz bg-grain w-full bg-background">
        {/* Hero */}
        <section
          className={cn(wrap, "relative pt-10 pb-20 xl:pr-[110px] xl:pb-26")}
        >
          <RegMark className="left-[22px]" />
          <RegMark className="right-[22px]" />
          <Neko className="top-[110px] -right-[34px] w-[230px]" />
          <div className="mb-10 flex justify-between font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase lg:mb-14">
            <span>nekode/ui ✦ vol.01</span>
            <span>ui.nekode.id</span>
          </div>
          <div className="relative z-2 grid grid-cols-1 items-end gap-24 xl:grid-cols-[minmax(0,1.66fr)_minmax(0,1fr)] xl:gap-12">
            <div className="flex flex-col items-start gap-8">
              <div className="eyebrow text-brand">
                Components as a service —
              </div>
              <h1 className="display text-[clamp(3.25rem,13vw,7.75rem)] xl:text-[min(8.6vw,7.75rem)]">
                Components as a service{" "}
                <span className="serif mt-2.5 block">
                  for your shadcn/ui project.
                </span>
              </h1>
              <p className="lede max-w-[600px] text-lg md:text-[21px]">
                Form fields, blocks, and full templates — installed straight
                into your codebase, no dependency added.
              </p>
              <InstallCommand />
              <div className="flex flex-wrap items-center gap-5">
                <Link
                  to="/docs/$"
                  params={{ _splat: "" }}
                  className="btn btn-primary"
                >
                  Browse components <span aria-hidden="true">→</span>
                </Link>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  <GitHubIcon />
                  GitHub
                </a>
              </div>
            </div>

            <div className="relative mb-5" aria-hidden="true">
              <div className="stamp absolute -top-[74px] left-0 z-3 -rotate-6 xl:-left-11">
                Copy.
              </div>
              <div className="stamp absolute -top-[46px] left-[136px] z-3 rotate-4 xl:left-[92px]">
                Paste.
              </div>
              <div className="win z-2">
                <div className="winbar">
                  <WindowDots />
                  <span className="ml-3 font-mono text-[12.5px] text-muted-foreground">
                    ~/my-app — zsh
                  </span>
                </div>
                <div className="term min-h-[330px] overflow-hidden px-4 pt-7 pb-[30px] text-[11.5px] whitespace-nowrap sm:px-6 sm:text-[13px] min-[1400px]:text-[14.5px]">
                  <div className="dim"># paste it in your project</div>
                  <div>
                    <span className="ok">$</span> npx shadcn@latest add
                    @nekode/text-field
                  </div>
                  <div className="h-3" />
                  <div>
                    <span className="ok">✔</span> Checking registry.
                  </div>
                  <div>
                    <span className="ok">✔</span> Created 1 file:
                  </div>
                  <div className="dim pl-[22px]">
                    - components/ui/text-field.tsx
                  </div>
                  <div className="h-3" />
                  <div>
                    <span className="ok">$</span> <span className="cur" />
                  </div>
                </div>
              </div>
              <div className="stamp absolute -right-1 -bottom-[34px] z-3 -rotate-4 text-4xl xl:-right-[26px]">
                Done.
              </div>
            </div>
          </div>
        </section>

        <Ticker />

        {/* How it works */}
        <section className={cn(wrap, "py-20 lg:pt-32 lg:pb-30")}>
          <SectionHead
            eyebrow={
              <div className="eyebrow text-muted-foreground">
                01 — How it works
              </div>
            }
            aside={
              <div className="card rotate-[1.2deg]" aria-hidden="true">
                <div className="winbar rounded-t-[9px]">
                  <WindowDots />
                  <span className="ml-3 font-mono text-[12.5px] text-muted-foreground">
                    my-app/
                  </span>
                </div>
                <div className="tree px-4 pt-[18px] pb-5">
                  <div className="row">
                    <i>▾</i> components
                  </div>
                  <div className="row pl-8">
                    <i>▾</i> ui
                  </div>
                  <div className="row pl-[58px]">
                    <i>·</i> button.tsx
                  </div>
                  <div className="row pl-[58px]">
                    <i>·</i> input.tsx
                  </div>
                  <div className="row new ml-[46px]">+ text-field.tsx</div>
                  <div className="row mt-2">
                    package.json <i>{"// untouched"}</i>
                  </div>
                </div>
              </div>
            }
          >
            <h2 className="display text-[clamp(3.5rem,8.9vw,8.25rem)]">
              Copy. Paste. <span className="serif text-brand">Ship.</span>
            </h2>
          </SectionHead>
          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 lg:mt-22">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="flex flex-col gap-[18px] border-t-[3px] border-(--ink-line) pt-7"
              >
                <div className="stepnum text-[clamp(4.5rem,7.8vw,7rem)]">
                  0<span className="text-brand">{i + 1}</span>
                </div>
                <h3 className="text-[30px] leading-tight font-bold tracking-[-0.03em]">
                  {step.title}
                </h3>
                <p className="lede text-lg">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Form generator */}
        <section className="fg p-3 md:px-7 md:py-10">
          <div className="fg-frame mx-auto max-w-[1384px] px-3 py-14 md:px-9 md:pt-22 md:pb-25">
            <SectionHead
              className="lg:gap-14"
              eyebrow={
                <span className="eyebrow inline-flex h-[34px] items-center rounded-full bg-(--fg-text) px-3.5 text-(--fg-bg)">
                  New — Form Generator
                </span>
              }
              aside={
                <div className="flex flex-col items-start gap-7 pb-2">
                  <p className="lede">
                    Pick fields from the sidebar, split them into steps, and
                    copy the source. You get a ready-to-use form built with
                    TanStack Form and Zod, plus one install command for every
                    field it uses.
                  </p>
                  <Link to="/form-generator" className="btn btn-primary">
                    Open Form Generator <span aria-hidden="true">→</span>
                  </Link>
                </div>
              }
            >
              <h2 className="display text-[clamp(3.25rem,8.9vw,8rem)]">
                Don't even write <span className="serif">the form.</span>
              </h2>
            </SectionHead>
            <div className="mt-12 mb-9 flex flex-wrap gap-3.5 md:mt-16">
              {["Pick fields", "Add steps", "Copy source"].map((label, i) => (
                <span key={label} className="fg-step">
                  <b>{i + 1}</b>
                  {label}
                </span>
              ))}
            </div>

            {/* app mockup */}
            <div className="win">
              <div className="winbar justify-between" aria-hidden="true">
                <div className="flex gap-2">
                  <WindowDots />
                </div>
                <div className="flex h-7 min-w-0 items-center gap-2 rounded-full border-2 border-input bg-card px-3.5 font-mono text-[12.5px] text-muted-foreground">
                  <Lock className="size-3 shrink-0" strokeWidth={2.5} />
                  <span className="truncate">ui.nekode.id/form-generator</span>
                </div>
                <div className="w-[60px] max-sm:hidden" />
              </div>
              <div className="grid grid-cols-1 md:h-[720px] md:grid-cols-[252px_minmax(0,1fr)]">
                <aside
                  aria-hidden="true"
                  className="hidden flex-col gap-0.5 border-r-[2.5px] border-border bg-card px-3 py-[18px] md:flex"
                >
                  <div className="eyebrow flex justify-between px-2.5 pb-2.5 text-[11px] text-muted-foreground">
                    Fields <span>{generatorFields.length}</span>
                  </div>
                  {generatorFields.map(([glyph, name], i) => (
                    <div
                      key={name}
                      className={cn("side-item", i === 0 && "on")}
                    >
                      <span className="badge">{glyph}</span>
                      {name}
                    </div>
                  ))}
                </aside>
                <div className="flex min-w-0 flex-col">
                  <div
                    aria-hidden="true"
                    className="flex h-[68px] items-center gap-2.5 overflow-hidden border-b-[2.5px] border-border px-5"
                  >
                    <span className="tab on">Step 1</span>
                    <span className="tab">Step 2</span>
                    <span className="tab dash">+ Add step</span>
                    <div className="grow" />
                    <div className="seg max-lg:hidden">
                      <span className="on">Preview</span>
                      <span>Source</span>
                    </div>
                    <span className="btn btn-primary btn-sm ml-1.5 max-md:hidden">
                      <Copy className="size-[15px]" strokeWidth={2.4} />
                      Copy source
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="relative grow overflow-hidden bg-muted p-5 md:px-10 md:py-9"
                  >
                    <div className="card flex w-full max-w-[500px] flex-col gap-3.5 p-5 shadow-[5px_5px_0_var(--shadow-color)] md:p-7 xl:max-[1399px]:max-w-[420px]">
                      <div className="mb-1 flex items-baseline justify-between">
                        <span className="text-lg font-bold tracking-[-0.02em] sm:text-xl">
                          Create account
                        </span>
                        <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                          STEP 1 / 2
                        </span>
                      </div>
                      <div className="canvas-field sel">
                        <GripVertical className="grip size-[18px]" />
                        <span className="field-label">Full name</span>
                        <div className="input ph">Your full name</div>
                      </div>
                      <div className="canvas-field">
                        <GripVertical className="grip size-[18px]" />
                        <span className="field-label">Password</span>
                        <div className="input justify-between">
                          <span className="tracking-[3px]">••••••••</span>
                          <Eye className="size-[18px] text-muted-foreground" />
                        </div>
                      </div>
                      <div className="canvas-field">
                        <GripVertical className="grip size-[18px]" />
                        <span className="field-label">Role</span>
                        <div className="input ph justify-between">
                          Select a role
                          <ChevronDown className="size-[18px]" />
                        </div>
                      </div>
                      <div className="mt-1.5 flex justify-end">
                        <span className="btn btn-primary btn-sm">
                          Next step →
                        </span>
                      </div>
                    </div>
                    {/* code panel peeking */}
                    <div className="absolute top-11 -right-[70px] hidden w-[520px] -rotate-[1.5deg] overflow-hidden rounded-xl border-[3px] border-(--code-line) bg-(--code-bg) shadow-[8px_8px_0_var(--shadow-color)] xl:block">
                      <div className="flex h-10 items-center gap-2.5 border-b-2 border-(--paper)/15 px-4 font-mono">
                        <span className="text-xs font-bold text-(--paper)">
                          signup-form.tsx
                        </span>
                        <span className="text-[11px] tracking-[0.12em] text-(--code-muted)">
                          SOURCE
                        </span>
                      </div>
                      <div className="code px-5 pt-[18px] pb-[22px]">
                        <div>
                          <span className="k">import</span>
                          {" { useForm } "}
                          <span className="k">from</span>{" "}
                          <span className="s">"@tanstack/react-form"</span>
                        </div>
                        <div>
                          <span className="k">import</span>
                          {" { z } "}
                          <span className="k">from</span>{" "}
                          <span className="s">"zod"</span>
                        </div>
                        <div> </div>
                        <div>
                          <span className="k">const</span>
                          {" schema = z.object({"}
                        </div>
                        <div>{"  fullName: z.string().min(1),"}</div>
                        <div>{"  password: z.string().min(8),"}</div>
                        <div>{"  role: z.string(),"}</div>
                        <div>{"})"}</div>
                        <div> </div>
                        <div>
                          <span className="k">export function</span>
                          {" SignupForm() {"}
                        </div>
                        <div>
                          {"  "}
                          <span className="k">const</span>
                          {" form = useForm({"}
                        </div>
                        <div>{"    validators: { onChange: schema },"}</div>
                        <div className="c">{"    // …"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[70px] items-center gap-3.5 border-t-[2.5px] border-border bg-card px-3 md:px-5">
                    <span className="eyebrow text-[11px] text-muted-foreground max-sm:hidden">
                      Install
                    </span>
                    <InstallPill
                      names={["text-field", "password-field", "select-field"]}
                      className="pill-sm min-w-0 flex-1 max-sm:h-11 max-sm:text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More than fields */}
        <section className={cn(wrap, "py-20 lg:pt-32 lg:pb-30")}>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-8 lg:mb-18">
            <div className="flex flex-col gap-7">
              <div className="eyebrow text-muted-foreground">
                03 — More than fields
              </div>
              <h2 className="display text-[clamp(3.25rem,8.3vw,7.5rem)]">
                More than <span className="serif">fields.</span>
              </h2>
            </div>
            <div className="stamp mb-5 rotate-5">No lock-in.</div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            <article className="card lift flex flex-col gap-[22px] p-5 md:p-8 lg:col-[1/8]">
              <div
                className="grid grid-cols-3 gap-2.5 sm:gap-4"
                aria-hidden="true"
              >
                <div className="flex h-[150px] flex-col gap-2.5 rounded-[10px] border-[2.5px] border-(--ink-line) bg-background p-2.5 sm:p-4">
                  <span className="eyebrow text-[10px] sm:text-[11px]">
                    Fields
                  </span>
                  <div className="mini h-[34px] max-sm:px-2 bg-card text-xs text-muted-foreground">
                    Email
                  </div>
                  <div className="mini h-[34px] max-sm:px-2 border-brand bg-card text-xs text-muted-foreground">
                    Password
                  </div>
                </div>
                <div className="flex h-[150px] flex-col gap-2 rounded-[10px] border-[2.5px] border-(--ink-line) bg-background p-2.5 sm:p-4">
                  <span className="eyebrow text-[10px] sm:text-[11px]">
                    Blocks
                  </span>
                  <div className="h-3 w-[70%] rounded-[3px] bg-foreground" />
                  <div className="h-2 w-[90%] rounded-[3px] bg-border" />
                  <div className="h-2 w-[60%] rounded-[3px] bg-border" />
                  <div className="mt-auto h-[26px] w-[48%] rounded-md bg-brand" />
                </div>
                <div className="flex h-[150px] flex-col gap-2 overflow-hidden rounded-[10px] border-[2.5px] border-(--ink-line) bg-background p-2.5 sm:p-4">
                  <span className="eyebrow text-[10px] sm:text-[11px]">
                    Templates
                  </span>
                  <div className="grid grow grid-cols-[26px_minmax(0,1fr)] gap-1.5">
                    <div className="rounded border-[1.5px] border-border bg-muted" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-3.5 rounded-[3px] border-[1.5px] border-border bg-muted" />
                      <div className="grow rounded border-[1.5px] border-dashed border-input" />
                    </div>
                  </div>
                </div>
              </div>
              <h3>Fields, blocks, and templates</h3>
              <p>
                Form fields today, full blocks and starter templates alongside —
                one registry, growing past forms.
              </p>
            </article>

            <article className="card lift flex flex-col gap-[22px] p-5 md:p-8 lg:col-[8/13] lg:row-[1/3]">
              <div
                className="relative flex grow flex-col justify-center gap-4 rounded-[10px] border-[2.5px] border-dashed border-border p-4 md:p-6"
                aria-hidden="true"
              >
                <div>
                  <span className="field-label">Email</span>
                  <div className="input">you@example.com</div>
                </div>
                <div>
                  <span className="field-label">Password</span>
                  <div className="input focus">
                    <span className="tracking-[3px]">••••••</span>
                    <span className="h-5 w-0.5 bg-brand" />
                  </div>
                </div>
                <div>
                  <span className="field-label">Username</span>
                  <div className="input err ph">Pick a username</div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-destructive">
                    <CircleAlert className="size-3.5" strokeWidth={2.6} />
                    Username is required
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-xs text-muted-foreground">
                  <span className="rounded-md border-[1.5px] border-border px-2 py-[3px]">
                    aria-invalid="true"
                  </span>
                  <span className="rounded-md border-[1.5px] border-border px-2 py-[3px]">
                    role="alert"
                  </span>
                </div>
                <div className="absolute -top-[22px] -right-2 inline-flex h-[58px] rotate-6 items-center gap-2.5 rounded-xl border-[3px] border-b-8 border-(--ink-line) bg-card px-[18px] font-mono text-lg font-extrabold tracking-[0.08em] shadow-[4px_4px_0_var(--shadow-color)] md:-right-3.5">
                  TAB <span className="text-[22px] text-brand">⇥</span>
                </div>
              </div>
              <h3>Keyboard and screen reader tested</h3>
              <p>
                Focus order, ARIA roles, and error announcements are handled —
                not bolted on after launch.
              </p>
            </article>

            <article className="card lift flex flex-col gap-[22px] p-5 md:p-8 lg:col-[1/8]">
              <div
                className="grid grid-cols-3 gap-2.5 font-[family-name:system-ui] text-[11px] sm:gap-4 sm:text-[13px]"
                aria-hidden="true"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-2.5 rounded-[10px] border-2 border-[#E4E4E7] bg-white p-2 sm:p-4">
                    <div className="flex h-9 items-center rounded-md border border-[#D4D4D8] px-2.5 text-[#52525B]">
                      Email
                    </div>
                    <div className="flex h-9 items-center justify-center rounded-md bg-[#18181B] font-semibold text-[#FAFAFA]">
                      Subscribe
                    </div>
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                    THEME: DEFAULT
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-2.5 rounded-[10px] border-2 border-[#27272A] bg-[#09090B] p-2 sm:p-4">
                    <div className="flex h-9 items-center rounded-md border border-[#3F3F46] px-2.5 text-[#A1A1AA]">
                      Email
                    </div>
                    <div className="flex h-9 items-center justify-center rounded-md bg-[#FAFAFA] font-semibold text-[#09090B]">
                      Subscribe
                    </div>
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                    THEME: DARK
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-2.5 rounded-[18px] border-2 border-[#BFD3F2] bg-[#F0F6FF] p-2 sm:p-4">
                    <div className="flex h-9 items-center rounded-full border border-[#A9C1E8] bg-white px-3.5 text-[#3B4A63]">
                      Email
                    </div>
                    <div className="flex h-9 items-center justify-center rounded-full bg-[#1D4ED8] font-semibold text-white">
                      Subscribe
                    </div>
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                    THEME: ROUNDED
                  </span>
                </div>
              </div>
              <h3>One command, no lock-in</h3>
              <p>
                Pulls straight from this registry into your project, styled with
                the shadcn/ui tokens you already have.
              </p>
            </article>

            <article className="card lift inv flex flex-col gap-[22px] p-5 md:p-8 lg:col-[1/6]">
              <div
                className="flex h-[150px] items-center gap-2.5"
                aria-hidden="true"
              >
                {[70, 55].map((width, i) => (
                  <div key={width} className="contents">
                    <div className="flex h-[110px] min-w-0 grow flex-col justify-between rounded-[10px] border-[2.5px] border-(--inv-fg) p-2 sm:p-3">
                      <span className="font-mono text-[11px] font-bold tracking-[0.12em] whitespace-nowrap">
                        STEP {i + 1}
                      </span>
                      <div className="h-2 rounded-[3px] bg-(--inv-fg) opacity-35" />
                      <div
                        className="h-2 rounded-[3px] bg-(--inv-fg) opacity-35"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-[22px] font-bold text-(--inv-accent)">
                      →
                    </span>
                  </div>
                ))}
                <div className="flex size-16 shrink-0 -rotate-10 items-center justify-center rounded-full border-[3.5px] border-(--inv-accent) text-(--inv-accent) sm:size-[86px]">
                  <Paw className="size-1/2" />
                </div>
              </div>
              <h3>Whole flows, not just fields</h3>
              <p>
                A form generator and starter templates for the pages you'd
                otherwise rebuild from scratch every project.
              </p>
            </article>

            <article className="card lift flex flex-col gap-[22px] p-5 md:p-8 lg:col-[6/13]">
              <div
                className="term min-h-[150px] overflow-hidden rounded-[10px] border-[2.5px] border-(--code-line) px-4 py-[18px] text-xs leading-[1.8] whitespace-pre sm:px-[22px] sm:text-sm"
                aria-hidden="true"
              >
                <div>
                  <span className="ok">$</span> git status
                </div>
                <div>
                  <span className="ok">+ new file:</span>
                  {"  components/ui/text-field.tsx"}
                </div>
                <div className="dim">{"  package.json    // untouched"}</div>
                <div className="dim">
                  {"  node_modules    // nothing new from us"}
                </div>
              </div>
              <h3>Nothing to import from us</h3>
              <p>
                Every component lands in your repo as plain code. No package to
                update, no version to chase.
              </p>
            </article>
          </div>
        </section>

        {/* Form fields */}
        <section className={cn(wrap, "pt-10 pb-24 lg:pb-34")}>
          <SectionHead
            className="mb-14 lg:mb-20"
            eyebrow={
              <div className="eyebrow text-muted-foreground">
                04 — Form fields
              </div>
            }
            aside={
              <p className="lede pb-2.5">
                Each one is a drop-in replacement for the shadcn/ui input you're
                already using. Blocks and templates ship the same way.
              </p>
            }
          >
            <h2 className="display text-[clamp(3rem,7.8vw,7rem)]">
              Start with these <span className="serif">form fields.</span>
            </h2>
          </SectionHead>
          <div className="grid grid-cols-1 gap-x-8 gap-y-11 sm:grid-cols-2 xl:grid-cols-4">
            {tickets.map((ticket, i) => (
              <Link
                key={ticket.slug}
                to="/docs/$"
                params={{ _splat: `form-fields/${ticket.slug}` }}
                className="ticket"
              >
                <div className="flex h-[76px] flex-col justify-center gap-1.5 px-5">
                  <div className="flex items-baseline justify-between">
                    <b className="text-[21px] tracking-[-0.02em]">
                      {ticket.name}
                    </b>
                    <span className="font-mono text-xs text-muted-foreground">
                      0{i + 1}/0{tickets.length}
                    </span>
                  </div>
                  <span className="font-mono text-[11.5px] tracking-[0.1em] text-muted-foreground uppercase">
                    @nekode/{ticket.slug}
                  </span>
                </div>
                <div className="perf px-5 pt-[22px] pb-6" aria-hidden="true">
                  {ticket.preview}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative border-t-[2.5px] border-(--ink-line)">
          <div
            className={cn(
              wrap,
              "relative flex flex-col items-start gap-10 py-24 lg:pt-35 lg:pb-30",
            )}
          >
            <Neko className="top-[90px] -right-10 w-[300px]" />
            <div className="relative w-full max-w-[1080px]">
              <h2 className="display text-[clamp(3.75rem,12vw,10.75rem)]">
                Stop rebuilding{" "}
                <span className="serif block">the same UI.</span>
              </h2>
              <div
                className="stamp stamp-lg absolute -top-10 right-0 -rotate-8 text-[clamp(2.25rem,5.3vw,4.75rem)] lg:-top-16 lg:right-auto lg:left-[76%]"
                aria-hidden="true"
              >
                Stop.
              </div>
            </div>
            <p className="lede max-w-[640px] md:text-[22px]">
              Install the components, wire up the flow, and get back to the part
              of the product only you can build.
            </p>
            <div className="relative z-2 flex max-w-full flex-wrap items-center gap-x-7 gap-y-5">
              <Link
                to="/docs/$"
                params={{ _splat: "" }}
                className="btn btn-primary"
              >
                Read the docs <span aria-hidden="true">→</span>
              </Link>
              <InstallPill />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-[2.5px] border-(--ink-line)">
          <div className={cn(wrap, "flex flex-col gap-11 pt-16 pb-12")}>
            <div className="flex items-center justify-between gap-4">
              <div className="logo text-[clamp(2.75rem,12vw,11rem)] leading-[0.9]">
                ui<b>.</b>nekode<b>.</b>id
              </div>
              <div className="flex size-[clamp(5rem,10.4vw,9.375rem)] shrink-0 -rotate-12 flex-col items-center justify-center gap-1 rounded-full border-[5px] border-brand text-brand shadow-[inset_0_0_0_4px_var(--background),inset_0_0_0_7px_var(--brand)] max-sm:hidden">
                <Paw className="size-[38%]" />
                <span className="font-mono text-xs font-extrabold tracking-[0.14em] max-lg:hidden">
                  VOL.01
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-9 gap-y-4 border-t-[2.5px] border-(--ink-line) pt-7">
              <nav aria-label="Footer" className="flex flex-wrap gap-x-9">
                <Link
                  to="/docs/$"
                  params={{ _splat: "" }}
                  className="foot-link"
                >
                  Docs
                </Link>
                <Link to="/form-generator" className="foot-link">
                  Form Generator
                </Link>
                <Link to="/blocks" className="foot-link">
                  Blocks
                </Link>
                <Link to="/template" className="foot-link">
                  Templates
                </Link>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="foot-link"
                >
                  GitHub
                </a>
              </nav>
              <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground">
                NEKODE/UI ✦ VOL.01
              </span>
            </div>
          </div>
          <Ticker reverse />
        </footer>
      </div>
    </HomeLayout>
  );
}
