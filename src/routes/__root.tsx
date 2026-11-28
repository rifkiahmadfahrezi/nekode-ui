import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import type * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { seo, siteDescription } from "@/lib/seo";
import { appName } from "@/lib/shared";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { name: "robots", content: "index, follow" },
      ...seo({ title: appName, description: siteDescription }).meta,
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", type: "image/svg+xml", href: "/icon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootDocument,
});

type FumadocsLinkProps = Omit<React.ComponentProps<"a">, "href"> & {
  href?: string;
  prefetch?: boolean;
};

function FumadocsLink({
  href = "#",
  prefetch = true,
  ...props
}: FumadocsLinkProps) {
  const [to, hash] = href.split("#", 2);

  return (
    <Link
      {...props}
      to={to || "."}
      hash={hash || undefined}
      preload={prefetch ? "intent" : false}
    />
  );
}

/** Shell HTML selalu dirender, termasuk saat root route error, jadi
 *  halaman error tetap dapat CSS, font, dan provider tema. */
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider components={{ Link: FumadocsLink }}>
          {children}
          <Toaster position="bottom-right" />
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
