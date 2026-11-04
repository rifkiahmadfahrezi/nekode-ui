import * as React from "react";
import { ProjectProgress } from "@/components/dashboard/overview/project-progress";
import { PageHeader } from "@/components/dashboard/page-header";

export default function ProjectsPage() {
  return (
    <div className="animate-rise space-y-8">
      <PageHeader
        title="Projects"
        description="Track delivery, owners and deadlines across every active project."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectProgress />
      </div>
    </div>
  );
}
