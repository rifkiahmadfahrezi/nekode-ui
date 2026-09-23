import { createFileRoute } from "@tanstack/react-router";
import { siteUrl } from "@/lib/seo";
import { source } from "@/lib/source";

const staticRoutes = ["/", "/blocks", "/form-generator", "/template"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET() {
        const urls = [
          ...staticRoutes,
          ...source.getPages().map((page) => page.url),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${siteUrl}${url}</loc></url>`).join("\n")}
</urlset>
`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml" },
        });
      },
    },
  },
});
