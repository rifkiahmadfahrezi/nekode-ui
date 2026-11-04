"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ranges = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "1y", label: "12M" },
] as const;

const monthlyData = [
  { month: "Jan", revenue: 2840, sales: 1912 },
  { month: "Feb", revenue: 3415, sales: 2308 },
  { month: "Mar", revenue: 4187, sales: 2794 },
  { month: "Apr", revenue: 3902, sales: 2611 },
  { month: "May", revenue: 5126, sales: 3388 },
  { month: "Jun", revenue: 5763, sales: 3917 },
  { month: "Jul", revenue: 6431, sales: 4206 },
  { month: "Aug", revenue: 5894, sales: 3771 },
  { month: "Sep", revenue: 7218, sales: 4932 },
  { month: "Oct", revenue: 6847, sales: 4519 },
  { month: "Nov", revenue: 8106, sales: 5584 },
  { month: "Dec", revenue: 9372, sales: 6713 },
];

const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

const summary = [
  { label: "Total revenue", value: "$69,101" },
  { label: "Monthly average", value: "$5,758" },
  { label: "Conversion", value: "4.85%" },
];

export function RevenueChart() {
  const [activeRange, setActiveRange] =
    React.useState<(typeof ranges)[number]["value"]>("1y");

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="space-y-1">
          <CardTitle className="text-[15px] font-semibold tracking-tight">
            Revenue
          </CardTitle>
          <CardDescription className="text-[13px]">
            Gross revenue against net sales, per month
          </CardDescription>
        </div>

        <div
          role="radiogroup"
          aria-label="Time range"
          className="flex items-center rounded-lg bg-muted p-0.5"
        >
          {ranges.map((range) => (
            <button
              key={range.value}
              role="radio"
              aria-checked={activeRange === range.value}
              onClick={() => setActiveRange(range.value)}
              className={cn(
                "active:scale-97 cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium tabular-nums transition-[color,background-color,box-shadow,transform] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeRange === range.value
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <dl className="grid grid-cols-3 gap-4">
          {summary.map((item) => (
            <div key={item.label} className="space-y-1">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="font-heading text-lg font-semibold tracking-tight tabular-nums">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="space-y-3">
          <div className="flex h-56 items-end gap-1.5 pt-10 sm:gap-2.5">
            {monthlyData.map((data, i) => {
              const heightPercent = (data.revenue / maxRevenue) * 100;
              const salesHeightPercent = (data.sales / maxRevenue) * 100;

              return (
                <div
                  key={data.month}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="pointer-events-none absolute -top-10 z-20 flex translate-y-1 flex-col items-center rounded-md bg-foreground px-2 py-1 text-[11px] whitespace-nowrap text-background tabular-nums opacity-0 shadow-md transition-[opacity,transform] duration-150 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                    <span>${data.revenue.toLocaleString()}</span>
                    <span className="opacity-60">
                      ${data.sales.toLocaleString()} net
                    </span>
                  </div>

                  <div
                    className="relative flex size-full animate-grow-y items-end justify-center gap-0.5"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <div
                      style={{ height: `${salesHeightPercent}%` }}
                      className="w-full max-w-2.5 rounded-t-[3px] bg-chart-2 transition-opacity duration-150 ease-out group-hover:opacity-80"
                    />
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-2.5 rounded-t-[3px] bg-chart-1 transition-opacity duration-150 ease-out group-hover:opacity-80"
                    />
                  </div>

                  <span className="text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-[2px] bg-chart-1" />
              Gross revenue
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-[2px] bg-chart-2" />
              Net sales
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
