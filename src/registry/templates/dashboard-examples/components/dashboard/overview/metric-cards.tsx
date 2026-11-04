"use client";

import * as React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const metrics = [
  {
    title: "Net revenue",
    value: "$48,316.40",
    change: "+8.3%",
    trend: "up",
    timeframe: "vs. October",
  },
  {
    title: "Active subscriptions",
    value: "2,184",
    change: "+142",
    trend: "up",
    timeframe: "this month",
  },
  {
    title: "Orders",
    value: "11,907",
    change: "+3.6%",
    trend: "up",
    timeframe: "vs. October",
  },
  {
    title: "Live sessions",
    value: "537",
    change: "−4.2%",
    trend: "down",
    timeframe: "last hour",
  },
];

export function MetricCards() {
  return (
    <Card className="grid grid-cols-1 gap-0 py-0 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, i) => {
        const isUp = metric.trend === "up";
        const Arrow = isUp ? ArrowUpRight : ArrowDownRight;

        return (
          <div
            key={metric.title}
            className={cn(
              "space-y-3 p-5 transition-colors duration-150 ease-out hover:bg-muted/40",
              i > 0 && "border-t sm:border-t-0",
              i % 2 === 1 && "sm:border-l",
              i >= 2 && "sm:border-t lg:border-t-0",
              i === 2 && "lg:border-l"
            )}
          >
            <p className="text-[13px] font-medium text-muted-foreground">
              {metric.title}
            </p>
            <p className="font-heading text-[1.65rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
              {metric.value}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium tabular-nums",
                  isUp ? "text-success" : "text-destructive"
                )}
              >
                <Arrow className="size-3.5" />
                {metric.change}
              </span>
              {metric.timeframe}
            </p>
          </div>
        );
      })}
    </Card>
  );
}
