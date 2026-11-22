import type { ComponentProps } from "react";

/** nekode "Grid Cat" mark: a 2x2 UI component grid where one component is a cat.
 *  Tiles follow the text colour, the cat uses the brand token, so it adapts to light/dark. */
export function NekodeLogo(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="30 14 196 228" aria-hidden="true" {...props}>
      <g className="fill-current">
        <rect x="30" y="46" width="86" height="86" rx="20" />
        <rect x="30" y="156" width="86" height="86" rx="20" />
        <rect x="140" y="156" width="86" height="86" rx="20" />
      </g>
      <path
        className="fill-brand"
        d="M140 112V93.3L146 14L178 46H188L220 14L226 93.3V112A20 20 0 0 1 206 132H160A20 20 0 0 1 140 112Z"
      />
    </svg>
  );
}
