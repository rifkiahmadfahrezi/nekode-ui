import * as React from "react";
import { LineChart, type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = LineChart,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-start gap-4 rounded-2xl border border-dashed bg-card/50 px-6 py-10 sm:px-10">
      <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </section>
  );
}
