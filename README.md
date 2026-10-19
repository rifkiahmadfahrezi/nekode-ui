# nekode/ui

A shadcn/ui registry with production-ready composed components, blocks, and templates. Install what you need with one command, own the code, ship faster.

## Installation

Install any component through the shadcn CLI:

```bash
npx shadcn@latest add @nekode/text-field
```

Swap the component name for whichever piece you need. Works with both Base UI and Radix shadcn projects: the CLI picks the matching build from the `style` in your `components.json`.

If you configured the `@nekode` registry manually, point it at `https://ui.nekode.id/r/{style}/{name}.json` to get the Radix build in Radix projects.

## Documentation

Full docs, usage examples, and the complete component list live at [ui.nekode.id/docs](https://ui.nekode.id/docs).

## Tech stack

- React + TanStack Router
- Tailwind CSS
- Fumadocs (documentation site)
- shadcn/ui registry format

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/rifkiahmadfahrezi/nekode-ui).

## License

MIT
