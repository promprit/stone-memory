// `?raw` hands us the stylesheet's text at build time. Reading it from disk
// instead would break the moment Vite bundles this module — during prerender
// it lands in `dist/.prerender/`, where the relative path no longer resolves.
import tokensCss from '../styles/tokens.css?raw';

/**
 * Build-time reader for the brand palette.
 *
 * A handful of places need a colour as a *value* rather than a CSS custom
 * property — the `theme-color` meta tag, an inline SVG fill. Hardcoding them
 * would put a second copy of the palette outside tokens.css, which is exactly
 * the drift `scripts/check-literals.mjs` exists to prevent.
 *
 * This resolves during the static build and never reaches a browser. A
 * missing token is a build failure rather than a silently-wrong colour.
 */
function token(name: string): string {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(tokensCss);
  if (!match) {
    throw new Error(
      `Brand token --${name} is not defined in src/styles/tokens.css`,
    );
  }
  return match[1].trim();
}

export const districtGreen = token('district-green');
export const shade = token('shade');
export const paper = token('paper');
export const mossPale = token('moss-pale');
