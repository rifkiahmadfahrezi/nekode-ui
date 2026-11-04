import * as React from "react";
import { RevenueChart } from "@/components/dashboard/overview/revenue-chart";
import { MetricCards } from "@/components/dashboard/overview/metric-cards";
import { PageHeader } from "@/components/dashboard/page-header";

export default function AnalyticsPage() {
  return (
    <div className="animate-rise space-y-8">
      <PageHeader
        title="Analytics"
        description="Revenue, orders and session trends for the current billing period."
      />
      <MetricCards />
      <div className="grid gap-6">
        <RevenueChart />
      </div>
    </div>
  );
}
