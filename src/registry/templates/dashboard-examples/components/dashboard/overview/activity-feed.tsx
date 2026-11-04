"use client";

import * as React from "react";
import {
  GitCommitHorizontal,
  UserPlus,
  Fingerprint,
  PackageCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const activities = [
  {
    id: "1",
    user: "Ines Carvalho",
    action: "shipped",
    target: "v2.4.0 to production",
    timestamp: "12 min ago",
    icon: PackageCheck,
  },
  {
    id: "2",
    user: "Daniel Osei",
    action: "pushed 4 commits to",
    target: "feature/billing-portal",
    timestamp: "47 min ago",
    icon: GitCommitHorizontal,
  },
  {
    id: "3",
    user: "Priya Raman",
    action: "invited",
    target: "tomas@halden.co",
    timestamp: "2 h ago",
    icon: UserPlus,
  },
  {
    id: "4",
    user: "Security",
    action: "flagged a new sign-in from",
    target: "Lisbon, PT",
    timestamp: "5 h ago",
    icon: Fingerprint,
  },
];

export function ActivityFeed() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-[15px] font-semibold tracking-tight">
            Activity
          </CardTitle>
          <CardDescription className="text-[13px]">
            Recent events across the workspace
          </CardDescription>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          Live
        </span>
      </CardHeader>

      <CardContent>
        <ol className="relative space-y-5 before:absolute before:inset-y-2 before:left-3.5 before:w-px before:bg-border">
          {activities.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="relative flex items-start gap-3">
                <span className="relative flex size-7 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                  <Icon className="size-3.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 space-y-0.5 pt-0.5">
                  <p className="text-[13px] leading-snug text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {item.user}
                    </span>{" "}
                    {item.action}{" "}
                    <span className="font-medium text-foreground">
                      {item.target}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground/80 tabular-nums">
                    {item.timestamp}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
