import { createFileRoute } from "@tanstack/react-router";

// shadcn CLI resolves `@nekode/<name>` to /r/{style}/{name}.json, where
// {style} is the user's components.json style (base-vega, radix-nova,
// new-york-v4, ...). base-* styles get the Base UI build in /r, everything
// else gets the Radix build in /r/radix (scripts/build-radix-registry.ts).
export const Route = createFileRoute("/r/$style/$name")({
  server: {
    handlers: {
      GET: ({ params, request }) => {
        // /r/radix/* is a static dir; reaching here means the file is missing.
        if (params.style === "radix" || !/^[a-z0-9-]+\.json$/.test(params.name))
          return new Response("Not found", { status: 404 });
        const dir = params.style.startsWith("base-") ? "/r/" : "/r/radix/";
        return Response.redirect(new URL(dir + params.name, request.url), 307);
      },
    },
  },
});
