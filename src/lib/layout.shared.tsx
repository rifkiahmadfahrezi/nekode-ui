import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="font-bold tracking-tighter">
          nekode<b className="text-brand">/</b>ui
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
