import { createFileRoute, notFound } from "@tanstack/react-router";

// shadcn CLI resolves `@nekode/<name>` to /r/{style}/{name}.json, where
// {style} is the user's components.json style (base-vega, radix-nova, ...).
// Every style gets the Base UI build for now; radix-* will map to /r/radix/.
export const Route = createFileRoute("/r/$style/$name")({
  server: {
    handlers: {
      GET: ({ params, request }) => {
        if (!/^[a-z0-9-]+\.json$/.test(params.name)) throw notFound();
        return Response.redirect(
          new URL(`/r/${params.name}`, request.url),
          307,
        );
      },
    },
  },
});
