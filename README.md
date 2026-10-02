# dryasstudio.com

The website of Dryas Studio, a digital agency. Sidecraft is its service;
BrewMind is a client. Static site, Cloudflare Pages.

**Status:** live at `https://dryasstudio.com` (apex + `www`, `www` 301s to the
apex). Pages project `dryas-studio`, deployed by direct upload.

**2026-10-02 — one landing page.** Home is a scroll-driven three.js film,
[`public/index.html`](public/index.html), the final design file served as-is.
Its only changes from the handoff: metadata moved from `<body>` into `<head>`
(search engines ignore a canonical in the body) and `lang="en"`.
`/services/`, `/process/`, `/about/` and `/press/` were folded into it and 301
to their chapter (`public/_redirects`). `/contact/` stays an Astro page because
the landing page's "Start a project" buttons link to it. `public/og.jpg` is the
landing page's intro frame at 1200×630.

**2026-09-13 — game studio → digital agency.** GATEKEEP and the game devlog
were removed. `/gatekeep*` and `/devlog*` 301 to the home page. The pre-change
design docs and devlog posts are kept in
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

**Two kinds of page.** The landing page is a hand-off file in `public/`, copied
into `dist/` untouched, and defines its own colours. Edit it as the design, not
through Astro. Every other page (`/contact/`, 404) is Astro 7, static output, no
adapter, no client JavaScript, styled to match the landing page.

**Nothing loads from a third party.** The landing page's three.js (pinned
`three@0.160.0` in `package.json`) and fonts (Fontsource) are copied into
`public/vendor/` and `public/fonts/` by
[`scripts/vendor-landing.mjs`](scripts/vendor-landing.mjs), an Astro
integration that runs before every `astro dev` and `astro build`. Both
directories are generated and gitignored. Upgrading three means bumping the
package and the paths in the page's import map together; `npm run test:dist`
fails if any file the page loads is missing from `dist/`.

`public/_routes.json` confines the Functions runtime to `/api/*`, so every page
is served straight from the asset CDN with no Worker invocation.

**Astro-page colours are defined once**, in `src/styles/tokens.css`, using the
landing page's palette. `npm test`
fails the build on a hex, `rgb()` or `hsl()` anywhere in `src/pages`,
`src/layouts` or `src/components`. The landing page is outside that guard. A palette that is only a convention drifts within a month.

---

## Known gaps

**Signup has no UI.** Site v3 (2026-09-19) removed the email form.
`functions/api/subscribe.ts` is kept for a later newsletter; with
`BUTTONDOWN_API_KEY` unset it answers `501`.

**Old brand files.** The marks and social images in `public/assets/` (other
than `dryas-favicon-v4.svg`) still use the pre-v3 green palette and are linked
from no page.

**Build-output check.** `npm run test:dist` (part of `npm run verify`) asserts
every route's HTML after a build. Astro pages: shared chrome, one `<h1>`, the
active nav item, key copy, and Thai text only where the design has it. The
landing page: metadata in `<head>`, one `<h1>`, every chapter, the contact
link, `og.jpg`, no third-party URL, and every same-origin file it loads
(followed through module imports and stylesheet `url()`s).

**Design source.** `public/index.html` is its own source. `docs/design/v3/Dryas
Site v3.html` is the Claude Design bundle the retired v3 pages were built
from.
