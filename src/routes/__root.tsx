import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import type * as React from "react";
import { Toaster } from "@/components/ui/sonner";
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
      {
        title: appName,
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
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

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider components={{ Link: FumadocsLink }}>
          <Outlet />
          <Toaster position="bottom-right" />
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
