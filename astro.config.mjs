// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Static output to `dist/`, which is what the Cloudflare Pages project
 * `dryas-studio` serves. No adapter: `functions/` is picked up by Pages
 * alongside the static build, and `public/_routes.json` confines the
 * Functions runtime to `/gatekeep*` so every page here stays on the asset
 * CDN. See docs/superpowers/specs/2026-08-24-dryasstudio-site-design.md §4.
 */
export default defineConfig({
  site: 'https://dryasstudio.com',
  output: 'static',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
