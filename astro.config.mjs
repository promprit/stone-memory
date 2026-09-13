// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Static output to `dist/`, which is what the Cloudflare Pages project
 * `dryas-studio` serves. No adapter: `functions/` is picked up by Pages
 * alongside the static build, and `public/_routes.json` confines the
 * Functions runtime to `/api/*` so every page here stays on the asset CDN.
 */
export default defineConfig({
  site: 'https://dryasstudio.com',
  output: 'static',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
