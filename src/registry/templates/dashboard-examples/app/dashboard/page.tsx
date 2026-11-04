"use client";

import * as React from "react";
import { Download, Calendar, ArrowRight, FileText, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCards } from "@/components/dashboard/overview/metric-cards";
import { RevenueChart } from "@/components/dashboard/overview/revenue-chart";
import { RecentSales } from "@/components/dashboard/overview/recent-sales";
import { ProjectProgress } from "@/components/dashboard/overview/project-progress";
import { ActivityFeed } from "@/components/dashboard/overview/activity-feed";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reports" },
  { value: "notifications", label: "Notifications" },
];

const panel = "animate-in duration-150 ease-out fade-in-0";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="animate-rise">
        <PageHeader
          eyebrow="Tuesday, 4 November"
          title="Good morning, Mira"
          description="Revenue is tracking 8.3% ahead of October. Two invoices need your attention."
          actions={
            <>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Calendar />
                <span className="tabular-nums">Oct 6 – Nov 4</span>
              </Button>
              <Button size="sm" className="gap-1.5">
                <Download />
                Export
              </Button>
            </>
          }
        />
      </div>

      <Tabs
        defaultValue="overview"
        className="animate-rise gap-6"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <TabsList
          variant="line"
          className="h-10 w-full justify-start gap-5 overflow-x-auto rounded-none border-b p-0"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-full flex-none px-0 text-muted-foreground after:scale-x-50 after:transition-[opacity,transform] after:duration-200 after:ease-out group-data-horizontal/tabs:after:-bottom-px dark:text-muted-foreground data-active:after:scale-x-100"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className={`space-y-6 ${panel}`}>
          <MetricCards />

          <div
            className="grid animate-rise grid-cols-1 gap-6 lg:grid-cols-8"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <RevenueChart />
            <RecentSales />
          </div>

          <div
            className="grid animate-rise grid-cols-1 gap-6 lg:grid-cols-4"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <ProjectProgress />
            <ActivityFeed />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className={panel}>
          <EmptyState
            title="Cohort analysis is still collecting data"
            description="We need about 14 days of events before retention curves are meaningful. The first report lands on Nov 18."
            action={
              <Button variant="outline" size="sm" className="gap-1.5">
                Open live analytics
                <ArrowRight />
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="reports" className={panel}>
          <EmptyState
            icon={FileText}
            title="No reports scheduled"
            description="Schedule a monthly CSV or PDF summary and it will arrive in your inbox on the first business day."
            action={
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download />
                Download Q3 audit
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="notifications" className={panel}>
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="Email and in-app alerts are on. Adjust which events reach you from settings."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
