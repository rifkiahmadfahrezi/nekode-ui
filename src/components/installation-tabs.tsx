"use client";

import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Check, Clipboard } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import type { Packages } from "@/lib/constants";
import { packages } from "@/lib/constants";

const commandTemplates: Record<Packages, string> = {
  npm: "npx shadcn@latest add",
  yarn: "yarn dlx shadcn@latest add",
  pnpm: "pnpm dlx shadcn@latest add",
  bun: "bunx --bun shadcn@latest add",
};

export function InstallationTabs({ componentName }: { componentName: string }) {
  const [copied, copy] = useCopy();
  const registryBaseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}`
      : import.meta.env.VITE_BASE_URL;
  const getCommand = (pkg: Packages) => {
    return `${commandTemplates[pkg]} ${registryBaseUrl}/r/${componentName}.json`;
  };

  return (
    <Tabs
      groupId="package-id"
      items={packages as unknown as string[]}
      className="w-full"
      persist
    >
      {packages.map((pkg) => (
        <Tab
          key={pkg}
          value={pkg}
          className={"flex items-center justify-between"}
        >
          <span>{getCommand(pkg)}</span>
          <button
            onClick={() => {
              copy(getCommand(pkg));
            }}
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Clipboard className="size-4 text-muted-foreground hover:text-primary" />
            )}
          </button>
        </Tab>
      ))}
    </Tabs>
  );
}
