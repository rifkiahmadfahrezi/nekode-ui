export const siteUrl = "https://ui.nekode.id";
export const siteDescription =
  "Copy-paste form fields, blocks, and templates for shadcn/ui — accessible by default, styled with your own tokens.";

/** Meta + link tags for a route's `head()`. Pass an absolute `path` (e.g. "/blocks"). */
export function seo({
  title,
  description = siteDescription,
  path = "/",
  image = "/icon.svg",
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}) {
  const url = `${siteUrl}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: `${siteUrl}${image}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: `${siteUrl}${image}` },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
