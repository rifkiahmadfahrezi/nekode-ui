"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const projects = [
  {
    name: "Billing portal refresh",
    category: "Frontend",
    progress: 78,
    dueDate: "Nov 14",
    status: "In progress",
    team: [
      {
        name: "Hana Takeda",
        img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      },
      {
        name: "Daniel Osei",
        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      },
    ],
  },
  {
    name: "Mobile API v3",
    category: "Backend",
    progress: 92,
    dueDate: "Nov 7",
    status: "In review",
    team: [
      {
        name: "Ines Carvalho",
        img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      },
    ],
  },
  {
    name: "Stripe → Adyen migration",
    category: "Infrastructure",
    progress: 41,
    dueDate: "Dec 2",
    status: "In progress",
    team: [
      {
        name: "Marcus Lindqvist",
        img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      },
      {
        name: "Priya Raman",
        img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      },
    ],
  },
];

export function ProjectProgress() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-[15px] font-semibold tracking-tight">
            Active projects
          </CardTitle>
          <CardDescription className="text-[13px]">
            Progress and upcoming deadlines
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
        >
          All projects
          <ArrowRight />
        </Button>
      </CardHeader>

      <CardContent>
        <ul className="divide-y">
          {projects.map((project, i) => (
            <li
              key={project.name}
              className="space-y-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-0.5">
                  <h4 className="truncate text-[13px] font-medium">
                    {project.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {project.category} · {project.status}
                  </p>
                </div>
                <span className="text-[13px] font-medium tabular-nums">
                  {project.progress}%
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${project.name} progress`}
                className="h-1 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full origin-left animate-grow-x rounded-full bg-brand"
                  style={
                    {
                      "--i": i,
                      transform: `scaleX(${project.progress / 100})`,
                    } as React.CSSProperties
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {project.team.map((member) => (
                    <Avatar
                      key={member.name}
                      className="size-6 rounded-md ring-2 ring-card"
                    >
                      <AvatarImage
                        src={member.img}
                        alt={member.name}
                        className="rounded-md"
                      />
                      <AvatarFallback className="rounded-md text-[10px]">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  Due {project.dueDate}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
