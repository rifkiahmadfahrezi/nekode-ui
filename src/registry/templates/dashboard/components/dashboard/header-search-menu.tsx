"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Command,
  CornerDownLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { dashboardNavCategories } from "@/components/dashboard/menus";
import { cn } from "@/lib/utils";

interface FlattenedMenuItem {
  id: string;
  title: string;
  category: string;
  path: string;
  icon?: React.ElementType;
  badge?: string;
  parentTitle?: string;
}

export function HeaderSearchMenu() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setMounted(true);
  }, []);

  // Flatten all menu items from config
  const allMenuItems = React.useMemo(() => {
    const items: FlattenedMenuItem[] = [];

    dashboardNavCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.path) {
          items.push({
            id: `${cat.category}-${item.module}`,
            title: item.title,
            category: cat.category,
            path: item.path,
            icon: item.icon,
            badge: item.badge,
          });
        }

        if (item.children) {
          item.children.forEach((child) => {
            items.push({
              id: `${cat.category}-${item.module}-${child.path}`,
              title: child.title,
              category: cat.category,
              path: child.path,
              icon: item.icon,
              badge: child.badge,
              parentTitle: item.title,
            });
          });
        }
      });
    });

    return items;
  }, []);

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!query.trim()) {
      return allMenuItems;
    }
    const q = query.toLowerCase().trim();
    return allMenuItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.parentTitle && item.parentTitle.toLowerCase().includes(q)) ||
        item.path.toLowerCase().includes(q)
    );
  }, [allMenuItems, query]);

  // Handle global ⌘K or Ctrl+K keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset search query and focus input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // oxlint-disable-next-line react/set-state-in-effect
      setQuery("");
    }
  }, [isOpen]);

  // Reset selected index when query or filtered items change
  React.useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setSelectedIndex(0);
  }, [query, filteredItems]);

  // Scroll selected item into view during keyboard navigation
  React.useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, isOpen]);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) =>
          (prev - 1 + filteredItems.length) % (filteredItems.length || 1)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex].path);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Header Search Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group active:scale-98 flex h-8 w-9 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-card text-muted-foreground shadow-xs transition-[color,background-color,transform] duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-56 sm:justify-between sm:px-2.5"
      >
        <div className="flex min-w-0 items-center gap-2 truncate">
          <Search className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span className="hidden truncate text-[13px] sm:inline">Search…</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 shrink-0 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none sm:inline-flex">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Portaled Dialog Search Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-16 max-w-[calc(100%-2rem)] translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 shadow-md sm:top-24 sm:max-w-lg data-open:animate-none data-closed:animate-none"
        >
          <DialogTitle className="sr-only">Search Menu</DialogTitle>
          <DialogDescription className="sr-only">
            Search dashboard menu options and navigation routes
          </DialogDescription>

          {/* Modal Search Input Header */}
          <div className="flex items-center border-b px-3.5 py-2.5">
            <Search className="mr-2.5 size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="mr-1.5 cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              ESC
            </button>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1 text-[10px] font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Command className="size-3" />
              {query ? `Results for "${query}"` : "Pages"}
            </span>
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[9px] font-medium"
            >
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </Badge>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="max-h-80 space-y-0.5 overflow-y-auto p-1.5"
          >
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <Search className="mx-auto mb-2 size-6 text-muted-foreground/30" />
                <p className="text-xs font-semibold text-foreground">
                  No pages match
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  No matches found for &quot;{query}&quot;. Try searching for
                  &quot;Analytics&quot; or &quot;Settings&quot;.
                </p>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const Icon = item.icon || FileText;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.path)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs",
                      isSelected
                        ? "bg-accent font-medium text-accent-foreground shadow-2xs"
                        : "text-foreground hover:bg-accent/60"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground",
                        isSelected &&
                          "border-foreground/15 bg-background text-foreground"
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>

                    <div className="flex flex-1 flex-col truncate leading-none">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold">
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="h-4 border-0 px-1 text-[10px] font-medium text-muted-foreground"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>{item.category}</span>
                        {item.parentTitle && (
                          <>
                            <ChevronRight className="size-2.5 opacity-60" />
                            <span>{item.parentTitle}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="flex shrink-0 items-center gap-1 rounded border bg-background/80 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground shadow-2xs">
                        <span>Jump</span>
                        <CornerDownLeft className="size-2.5" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Modal Footer Keyboard Guide */}
          <div className="flex items-center justify-between border-t bg-muted/40 px-3 py-1.5 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">
                  ↑
                </kbd>
                <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">
                  ↓
                </kbd>{" "}
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">
                  ↵
                </kbd>{" "}
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">
                ESC
              </kbd>{" "}
              Close
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
