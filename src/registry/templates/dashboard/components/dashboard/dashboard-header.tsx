"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bell, CheckCircle2, FileText } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { HeaderSearchMenu } from "@/components/dashboard/header-search-menu";
import { dashboardNavCategories } from "@/components/dashboard/menus";

const ROOT = "/dashboard";

interface BreadcrumbSegment {
  title: string;
  href?: string;
  isClickable: boolean;
  isCurrent: boolean;
}

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [
    {
      title: "Dashboard",
      href: ROOT,
      isClickable: pathname !== ROOT,
      isCurrent: pathname === ROOT,
    },
  ];

  if (pathname === ROOT) {
    segments.push({
      title: "Overview",
      isClickable: false,
      isCurrent: true,
    });
    return segments;
  }

  // Find matching menu in config
  let matchedGroup: (typeof dashboardNavCategories)[0] | null = null;
  let matchedItem: (typeof dashboardNavCategories)[0]["items"][0] | null = null;
  let matchedChild: { title: string; path: string } | null = null;

  for (const group of dashboardNavCategories) {
    for (const item of group.items) {
      if (item.children) {
        for (const child of item.children) {
          if (
            pathname === child.path ||
            pathname.startsWith(child.path + "/")
          ) {
            matchedGroup = group;
            matchedItem = item;
            matchedChild = child;
            break;
          }
        }
      }
      if (
        !matchedChild &&
        item.path &&
        (pathname === item.path ||
          (item.path !== ROOT && pathname.startsWith(item.path + "/")))
      ) {
        matchedGroup = group;
        matchedItem = item;
        break;
      }
    }
    if (matchedItem) break;
  }

  if (matchedGroup && matchedItem) {
    // 1. Module level (tidak bisa di klik)
    segments.push({
      title: matchedGroup.category,
      isClickable: false,
      isCurrent: false,
    });

    const hasChildren = !!(
      matchedItem.children && matchedItem.children.length > 0
    );
    const isItemCurrent = !matchedChild && pathname === matchedItem.path;

    // 2. Menu level
    // Jika ada anaknya -> tidak bisa di klik
    // Jika tidak ada anaknya -> bisa di klik jika bukan current page
    segments.push({
      title: matchedItem.title,
      href: !hasChildren && matchedItem.path ? matchedItem.path : undefined,
      isClickable: !hasChildren && !isItemCurrent && !!matchedItem.path,
      isCurrent: isItemCurrent,
    });

    // 3. Sub Menu level (jika ada child)
    if (matchedChild) {
      const isChildCurrent = pathname === matchedChild.path;
      segments.push({
        title: matchedChild.title,
        href: matchedChild.path,
        isClickable: !isChildCurrent,
        isCurrent: isChildCurrent,
      });

      // Handing extra dynamic path segments if any
      if (pathname.length > matchedChild.path.length) {
        segments[segments.length - 1].isClickable = true;
        segments[segments.length - 1].isCurrent = false;

        const subSegments = pathname
          .slice(matchedChild.path.length)
          .split("/")
          .filter(Boolean);

        subSegments.forEach((sub, idx) => {
          const formatted = sub.charAt(0).toUpperCase() + sub.slice(1);
          const isLast = idx === subSegments.length - 1;
          segments.push({
            title: formatted,
            isClickable: !isLast,
            isCurrent: isLast,
          });
        });
      }
    }
  } else {
    // Fallback for paths not in config
    const pathParts = pathname.slice(ROOT.length).split("/").filter(Boolean);
    let accumPath = ROOT;
    pathParts.forEach((part, idx) => {
      accumPath += `/${part}`;
      const formatted = part.charAt(0).toUpperCase() + part.slice(1);
      const isLast = idx === pathParts.length - 1;
      const isModule = idx === 0 && pathParts.length > 1;
      segments.push({
        title: formatted,
        href: isModule ? undefined : accumPath,
        isClickable: !isModule && !isLast,
        isCurrent: isLast,
      });
    });
  }

  return segments;
}

export function DashboardHeader() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-xl backdrop-saturate-150 md:px-6">
      {/* Left section: Sidebar trigger & Breadcrumb */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <SidebarTrigger className="cursor-pointer text-muted-foreground" />
        <Separator orientation="vertical" className="mr-0.5 h-3.5" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  <BreadcrumbItem>
                    {crumb.isCurrent ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : crumb.isClickable && crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.title}
                      </BreadcrumbLink>
                    ) : (
                      <span className="text-muted-foreground/70 select-none">
                        {crumb.title}
                      </span>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center/Right section: Search & Actions */}
      <div className="flex items-center gap-1.5">
        {/* Header Menu Search Component */}
        <HeaderSearchMenu />

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
              />
            }
          >
            <Bell strokeWidth={1.75} />
            <span className="sr-only">Notifications, 3 unread</span>
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand ring-2 ring-background" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-semibold">Notifications</h4>
                <span className="text-xs text-muted-foreground tabular-nums">
                  3 unread
                </span>
              </div>
              <button className="cursor-pointer rounded-sm text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                Mark all read
              </button>
            </div>

            <div className="max-h-72 divide-y overflow-y-auto">
              <div className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-muted/50">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                  <CheckCircle2 className="size-3.5" strokeWidth={1.75} />
                </div>
                <div className="space-y-0.5 text-[13px] leading-snug">
                  <p className="font-medium">Payment received</p>
                  <p className="text-muted-foreground">
                    Ortho Labs paid INV-4029 ($312.00)
                  </p>
                  <p className="text-xs text-muted-foreground/80">5 min ago</p>
                </div>
              </div>

              <div className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-muted/50">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                  <FileText className="size-3.5" strokeWidth={1.75} />
                </div>
                <div className="space-y-0.5 text-[13px] leading-snug">
                  <p className="font-medium">Weekly summary ready</p>
                  <p className="text-muted-foreground">
                    Revenue, churn and top accounts for Oct 27 – Nov 2.
                  </p>
                  <p className="text-xs text-muted-foreground/80">1 h ago</p>
                </div>
              </div>

              <div className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-muted/50">
                <Avatar className="mt-0.5 size-7 rounded-lg">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                    alt="Daniel Osei"
                  />
                  <AvatarFallback>DO</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5 text-[13px] leading-snug">
                  <p className="font-medium">Daniel commented</p>
                  <p className="text-muted-foreground">
                    &ldquo;Portal looks good on staging. Merging after
                    QA.&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground/80">3 h ago</p>
                </div>
              </div>
            </div>

            <div className="border-t p-2 text-center">
              <button className="w-full cursor-pointer rounded-md py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                View all notifications
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
