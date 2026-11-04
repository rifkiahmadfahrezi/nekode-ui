// next isn't installed in this repo; declare just what the templates use.
declare module "next/link" {
  import type { ComponentProps } from "react";
  export default function Link(
    props: ComponentProps<"a"> & { href: string },
  ): React.JSX.Element;
}

declare module "next/navigation" {
  export function usePathname(): string;
  export function useRouter(): { push(href: string): void };
}
