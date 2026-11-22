import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { NekodeLogo } from "@/components/nekode-logo";
import { gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 font-bold tracking-tighter">
          <NekodeLogo className="size-5 shrink-0" />
          <span>
            nekode<b className="text-brand">/</b>ui
          </span>
        </span>
      ),
    },
    links: [
      {
        text: "Docs",
        url: "/docs",
        secondary: false,
      },
      {
        text: "Form Generator",
        url: "/form-generator",
        secondary: false,
      },
      {
        text: "Blocks",
        url: "/blocks",
        secondary: false,
      },
      {
        text: "Templates",
        url: "/template",
        secondary: false,
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
