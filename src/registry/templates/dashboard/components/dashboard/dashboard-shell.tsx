"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm font-medium shadow-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset className="flex min-h-dvh flex-col">
        <DashboardHeader />
        <main
          id="main"
          className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 pt-6 pb-10 md:px-8 md:pt-8 md:pb-14"
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
