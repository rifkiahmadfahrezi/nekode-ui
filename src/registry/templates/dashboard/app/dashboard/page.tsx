import { Plus } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="animate-rise space-y-8">
      <PageHeader
        title="Overview"
        description="This is your dashboard. Add pages under app/dashboard and list them in components/dashboard/menus.ts."
      />
      <EmptyState
        title="Nothing here yet"
        description="Start with a metric, a table or a chart. Every page gets the sidebar, breadcrumbs and command menu for free."
        action={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus />
            Add a widget
          </Button>
        }
      />
    </div>
  );
}
