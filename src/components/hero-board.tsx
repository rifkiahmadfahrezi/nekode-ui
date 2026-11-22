"use client";

import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoginForm } from "@/registry/blocks/login-form";
import { ComboboxFieldDemo } from "@/registry/demos/combobox-field-demo";
import { DataTableSelectionDemo } from "@/registry/demos/datatable-selection-demo";
import { DateRangePickerFieldDemo } from "@/registry/demos/date-range-picker-field-demo";
import { DialogModalDemo } from "@/registry/demos/dialog-modal-demo";
import { FieldCheckboxGroupDemo } from "@/registry/demos/field-checkbox-group-demo";
import { FieldRadioDemo } from "@/registry/demos/field-radio-demo";
import { FieldSwitchDemo } from "@/registry/demos/field-switch-demo";
import { FileFieldDemo } from "@/registry/demos/file-field-demo";
import { MarqueeDemo } from "@/registry/demos/marquee-demo";
import { NumberTickerDemo } from "@/registry/demos/number-ticker-demo";
import { TextTyperRotateDemo } from "@/registry/demos/text-typer-rotate-demo";
import { TextareaFieldDemo } from "@/registry/demos/textarea-field-demo";

type Card = {
  name: string;
  href: string;
  title?: string;
  text?: string;
  body: ReactNode;
};

const ui = (name: string) => `/docs/ui-components/${name}`;
const field = (name: string) => `/docs/form-fields/${name}`;

/** Satu array = satu kolom. Layar sempit hanya menampilkan kolom-kolom awal,
    jadi isi kolom pertama yang paling mewakili registry. */
const columns: Card[][] = [
  [
    {
      name: "datatable",
      href: ui("datatable"),
      title: "Team members",
      body: <DataTableSelectionDemo />,
    },
    {
      name: "number-ticker",
      href: ui("number-ticker"),
      title: "Seats",
      body: (
        <div className="flex justify-center py-2">
          <NumberTickerDemo />
        </div>
      ),
    },
  ],
  [
    {
      name: "dashboard",
      href: "/template",
      body: (
        <img
          src="/templates/dashboard.png"
          alt="Dashboard template with a sidebar, metric cards, and charts"
          loading="lazy"
          className="aspect-[4/3] w-full rounded-lg border object-cover object-left-top"
        />
      ),
    },
    {
      name: "dialog-modal",
      href: ui("dialog-modal"),
      title: "Profile",
      text: "Open the modal to edit your details.",
      body: <DialogModalDemo />,
    },
    {
      name: "field-switch",
      href: field("field-switch"),
      body: <FieldSwitchDemo />,
    },
  ],
  [
    {
      name: "login-form",
      href: "/blocks",
      body: (
        // kartu board sudah jadi bingkai, jadi bingkai bawaan form dilepas
        <div className="[&>form]:max-w-none! [&>form]:border-0! [&>form]:p-0! [&>form]:shadow-none!">
          <LoginForm onSubmit={() => void toast("Form submitted!")} />
        </div>
      ),
    },
    {
      name: "text-typer",
      href: ui("text-typer"),
      body: (
        <div className="flex min-h-16 items-center">
          <TextTyperRotateDemo />
        </div>
      ),
    },
    { name: "marquee", href: ui("marquee"), body: <MarqueeDemo /> },
  ],
  [
    {
      name: "date-range-picker-field",
      href: field("date-range-picker-field"),
      body: <DateRangePickerFieldDemo />,
    },
    { name: "file-field", href: field("file-field"), body: <FileFieldDemo /> },
    {
      name: "combobox-field",
      href: field("combobox-field"),
      body: <ComboboxFieldDemo />,
    },
  ],
  [
    {
      name: "field-radio",
      href: field("field-radio"),
      body: <FieldRadioDemo />,
    },
    {
      name: "field-checkbox",
      href: field("field-checkbox"),
      body: <FieldCheckboxGroupDemo />,
    },
    {
      name: "textarea-field",
      href: field("textarea-field"),
      body: <TextareaFieldDemo />,
    },
  ],
];

const columnVisibility = [
  "",
  "max-sm:hidden",
  "max-lg:hidden",
  "max-xl:hidden",
  "max-2xl:hidden",
];

/** Papan hero: komponen registry asli. Menyentuh kartu memindahkan perintah
    install ke komponen itu. */
export default function HeroBoard({
  active,
  onPick,
}: {
  active: string;
  onPick: (name: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {columns.map((cards, i) => (
        <div
          key={cards[0].name}
          className={cn("flex min-w-0 flex-col gap-6", columnVisibility[i])}
        >
          {cards.map((card) => (
            <div
              key={card.name}
              onFocusCapture={() => onPick(card.name)}
              onPointerDownCapture={() => onPick(card.name)}
              className="min-w-0 rounded-xl border-[3px] border-(--ink-line) bg-card shadow-[6px_6px_0_var(--shadow-color)]"
            >
              <div className="flex flex-col gap-4 p-5 [&_.w-72]:w-full! [&_.w-80]:w-full!">
                {card.title && (
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold tracking-tight">
                      {card.title}
                    </h2>
                    {card.text && (
                      <p className="text-sm text-muted-foreground">
                        {card.text}
                      </p>
                    )}
                  </div>
                )}
                {card.body}
              </div>
              <Link
                to={card.href}
                className={cn(
                  "flex h-10 items-center justify-between rounded-b-[9px] border-t-[2.5px] border-border px-5 font-mono text-[12.5px] transition-colors hover:bg-muted",
                  card.name === active
                    ? "bg-brand text-(--ink) hover:bg-brand"
                    : "text-muted-foreground",
                )}
              >
                <span className="truncate">@nekode/{card.name}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
