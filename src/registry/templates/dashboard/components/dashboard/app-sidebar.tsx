"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  Plus,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dashboardNavCategories } from "@/components/dashboard/menus";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = React.useState<
    Record<string, boolean>
  >({
    projects: true,
    settings: false,
  });

  const toggleSubmenu = (moduleName: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  return (
    <Sidebar collapsible="icon">
      {/* Workspace / Brand Header */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem className="w-full">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="flex items-center gap-3 rounded-lg p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-primary font-heading text-sm font-semibold text-primary-foreground shadow-sm">
                    H
                  </div>
                  <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-[13px] font-semibold tracking-tight">
                      Halden
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Team workspace
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Workspaces
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="gap-2 font-medium">
                    <div className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                      H
                    </div>
                    Halden
                    <span className="ml-auto text-xs text-muted-foreground">
                      Current
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-muted-foreground">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-muted text-xs">
                      F
                    </div>
                    Fjordline
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <Plus className="size-4 text-muted-foreground" />
                  New workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Sidebar Navigation Content */}
      <SidebarContent className="px-2 py-1">
        {/* Navigation Categories */}
        {dashboardNavCategories.map((group) => (
          <SidebarGroup key={group.category} className="py-1.5">
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
              {group.category}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const isSubOpen = !!openSubmenus[item.module];
                  const isActive =
                    pathname === item.path ||
                    (hasChildren &&
                      item.children?.some((c) => pathname === c.path));

                  if (hasChildren) {
                    return (
                      <SidebarMenuItem key={item.module}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => toggleSubmenu(item.module)}
                          aria-expanded={isSubOpen}
                          tooltip={item.title}
                          className="cursor-pointer"
                        >
                          <Icon className="size-4" strokeWidth={1.75} />
                          <span className="text-[13px] font-medium">
                            {item.title}
                          </span>
                          <ChevronDown
                            className={cn(
                              "ml-auto size-3.5 text-muted-foreground transition-transform duration-200 ease-in-out group-data-[collapsible=icon]:hidden",
                              isSubOpen && "rotate-180"
                            )}
                          />
                        </SidebarMenuButton>

                        {/* Always mounted so open/close is an interruptible transition. */}
                        <div
                          inert={!isSubOpen}
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-200 ease-in-out motion-reduce:transition-none",
                            isSubOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          )}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <SidebarMenuSub>
                              {item.children?.map((sub) => (
                                <SidebarMenuSubItem key={sub.path}>
                                  <SidebarMenuSubButton
                                    render={
                                      <Link href={sub.path}>
                                        <span>{sub.title}</span>
                                      </Link>
                                    }
                                    isActive={pathname === sub.path}
                                  />
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </div>
                        </div>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.module}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={
                          <Link href={item.path || "#"}>
                            <Icon className="size-4" strokeWidth={1.75} />
                            <span className="text-[13px] font-medium">
                              {item.title}
                            </span>
                            {item.badge && (
                              <SidebarMenuBadge className="text-xs font-normal text-muted-foreground tabular-nums">
                                {item.badge}
                              </SidebarMenuBadge>
                            )}
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
          <div className="space-y-3 rounded-xl bg-sidebar-accent/60 p-3">
            <div className="space-y-1">
              <p className="text-[13px] font-medium">Storage 82% full</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                8.2 of 10 GB used. Upgrade for 100 GB and audit logs.
              </p>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-sidebar-border">
              <div className="h-full w-[82%] rounded-full bg-warning" />
            </div>
            <Button size="xs" variant="outline" className="w-full">
              See plans
            </Button>
          </div>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer Menu */}
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="flex items-center gap-3 rounded-lg p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      alt="Mira Okafor"
                    />
                    <AvatarFallback>MO</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-[13px] font-medium">
                      Mira Okafor
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      mira@halden.co
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-[13px] leading-none font-medium">
                        Mira Okafor
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        mira@halden.co
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <User className="size-4 text-muted-foreground" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Settings className="size-4 text-muted-foreground" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <ShieldCheck className="size-4 text-muted-foreground" />
                    Security & API keys
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
