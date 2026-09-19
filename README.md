# dryasstudio.com

The website of Dryas Studio, a digital agency. Sidecraft is its service;
BrewMind is a client. Static site, Cloudflare Pages.

**Status:** live at `https://dryasstudio.com` (apex + `www`, `www` 301s to the
apex). Pages project `dryas-studio`, deployed by direct upload.

**2026-09-13 — game studio → digital agency.** GATEKEEP and the game devlog
were removed; the pages carry placeholder agency copy until the new site is
planned. `/gatekeep*` and `/devlog*` 301 to the home page
(`public/_redirects`). The pre-change design docs and devlog posts are kept in
[`docs/archive/2026-08-gatekeep-era/`](docs/archive/2026-08-gatekeep-era/).
Brand guidelines live in [`docs/brand/`](docs/brand/); marks and social images
in `public/assets/`.

```bash
npm install
npm run dev        # astro dev
npm run verify     # literal guard + astro check + build
npm run build      # -> dist/
```

To exercise the Pages Function (`/api/subscribe`) you need Wrangler, not
`astro dev`:

```bash
cp .dev.vars.example .dev.vars
npm run build && npx wrangler pages dev dist
```

---

## How it is built

Astro 7, static output, no adapter. Fonts are self-hosted (Fontsource, latin
subsets) rather than linked from Google Fonts — a production page should not
add a third-party connection to its critical path.

**The site ships no client JavaScript.** Every page is static HTML and CSS.
The mobile header nav wraps rather than using a hamburger, so it needs none.

`public/_routes.json` confines the Functions runtime to `/api/*`, so every page
is served straight from the asset CDN with no Worker invocation.

**Brand colours are defined once**, in `src/styles/tokens.css`. `npm test` fails
the build on a hex, `rgb()` or `hsl()` anywhere in `src/pages`, `src/layouts` or
`src/components`. A palette that is only a convention drifts within a month.

---

## Known gaps

**Signup has no UI.** Site v3 (2026-09-19) removed the email form.
`functions/api/subscribe.ts` is kept for a later newsletter; with
`BUTTONDOWN_API_KEY` unset it answers `501`.

**No downloadable press kit.** `/press` says the kit is on request. The files in
`public/assets/` still use the pre-v3 green palette and are not linked from any
page except as social images.

**Build-output check.** `npm run test:dist` (part of `npm run verify`) asserts
every route's HTML after a build: shared chrome, one `<h1>`, the active nav
item, key copy, and Thai text only where the design has it.

**Design source.** `docs/design/v3/Dryas Site v3.html` is the Claude Design
bundle this site was built from. Open it in a browser to compare.
