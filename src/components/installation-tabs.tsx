"use client"

import { Tabs, Tab } from "fumadocs-ui/components/tabs"
import type { Packages } from "@/lib/constants"
import { packages } from "@/lib/constants"
import { registryBaseUrl } from "@/lib/constants"
import { useCopy } from "@/hooks/use-copy"
import { Clipboard, Check } from "lucide-react"


const commandTemplates : Record<Packages, string> = {
    npm: 'npx shadcn@latest add',
    yarn: 'yarn dlx shadcn@latest add',
    pnpm: 'pnpm dlx shadcn@latest add',
    bun: 'bunx --bun shadcn@latest add'
}

export function InstallationTabs({ componentName }: { componentName: string }) {
    const [copied, copy] = useCopy()
    const getCommand = (pkg: Packages) => {
        return `${commandTemplates[pkg]} ${registryBaseUrl}${componentName}.json`
    }

    return (
        <Tabs groupId="package-id" items={packages as unknown as string[]} className="w-full" persist>
            {packages.map((pkg) => (
                <Tab key={pkg} value={pkg} className={'flex items-center justify-between'}>
                    <span>{getCommand(pkg)}</span>
                    <button onClick={() => {
                        copy(getCommand(pkg))
                    }}>
                        {copied ? <Check className="size-4" /> : <Clipboard className="size-4 text-muted-foreground hover:text-primary" />}
                    </button>
                </Tab>
            ))}
        </Tabs>
    )
}   