# dryasstudio.com

The Dryas Studio website. Static site, Cloudflare Pages.

**Status:** live at `https://dryasstudio.com` (apex + `www`, `www` 301s to the
apex). Pages project `dryas-studio`, deployed by direct upload.

**2026-09-13 — GATEKEEP dropped.** Dryas Studio is now the parent studio of
Sidecraft and BrewMind. The proxy to the game, its images, handovers and the
game devlog were removed; the pages carry placeholder copy until the new
studio site is planned. `/gatekeep*` 301s and `/devlog*` 302s to the home page
(`public/_redirects`). The pre-drop design docs and devlog posts are kept in
[`docs/archive/2026-08-gatekeep-era/`](docs/archive/2026-08-gatekeep-era/).

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

**The whole site ships one `<script>`**, on the home page, for the email form.
Every other page ships zero. The collapsed mobile nav wraps rather than using a
hamburger, precisely so it needs none.

`public/_routes.json` confines the Functions runtime to `/api/*`, so every page
is served straight from the asset CDN with no Worker invocation.

**Brand colours are defined once**, in `src/styles/tokens.css`. `npm test` fails
the build on a hex, `rgb()` or `hsl()` anywhere in `src/pages`, `src/layouts` or
`src/components`. A palette that is only a convention drifts within a month.

---

## Known gaps

**Placeholder copy.** Home, about and press describe the studio in one line
each until the parent-studio site is planned.

**Signup is not wired up.** `BUTTONDOWN_API_KEY` is unset, so `/api/subscribe`
answers `501` and the form says so. That is a defined state, not a crash.

**The favicon is weak on dark browser chrome.** The delivered
`dryas-symbol-small-cut.svg` is stroked District Green — made for light grounds.

**Image wells are placeholders.** Drop files into
[`public/images/`](public/images/README.md) and the wells pick them up on the
next build with no code change.
