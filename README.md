# dryasstudio.com

The Dryas Studio website. Static site, Cloudflare Pages.

**Status:** built. Four of the five design screens are implemented (`/`,
`/devlog`, `/devlog/:slug`, `/about`, `/press`); the fifth, the Gatekeep
landing, belongs to the other repo. Not yet deployed — the Cloudflare projects
still need creating.

```bash
npm install
npm run dev        # astro dev
npm run verify     # literal guard + astro check + build
npm run build      # -> dist/
```

To exercise the Pages Functions (`/gatekeep/*` and `/api/subscribe`) you need
Wrangler, not `astro dev`:

```bash
cp .dev.vars.example .dev.vars
npm run build && npx wrangler pages dev dist
```

---

## The two-repo contract

One hostname, two repos.

| Path | Repo | How |
|---|---|---|
| `dryasstudio.com/*` | **this repo** | Cloudflare Pages project `dryas-studio`, static `dist/` |
| `dryasstudio.com/gatekeep/*` | [`promprit/one-lane`](https://github.com/promprit/one-lane) | Pages project `gatekeep`, reached through a proxy Function in this repo |

Cloudflare Pages binds a *hostname* to a project — it has no native way to hand
one path prefix to a different project. So this repo owns the hostname and
carries a single catch-all Pages Function at `functions/gatekeep/[[path]].ts`
that proxies to the GATEKEEP Pages project. `public/_routes.json` confines the
Functions runtime to `/gatekeep*`, so every studio page is served straight from
the asset CDN with no Worker invocation.

Both repos deploy independently. This one never builds the other.

### What `one-lane` needs to change

Three things, each a separate PR against that repo. **None of them block this
repo from shipping** — until they land, `/gatekeep` serves a holding page.

1. `basePath: "/gatekeep"` in `apps/web/next.config.ts`
2. Service worker registered at `/gatekeep/sw.js`, with the cached shell URLs prefixed
3. A decision on the global `robots: { index: false, follow: false }` in
   `apps/web/app/layout.tsx` — the proxy serves it faithfully, so `/gatekeep`
   launches invisible to search engines until GATEKEEP's own beta decision
   changes it

Full detail in [the design doc](docs/superpowers/specs/2026-08-24-dryasstudio-site-design.md) §4.

---

## How it is built

Astro 7, static output, no adapter. The devlog is a markdown content collection.
Fonts are self-hosted (Fontsource, latin subsets) rather than linked from Google
Fonts — a design prototype linking a CDN is right; a production page adding a
third-party connection to its critical path is not.

**The whole site ships one `<script>`**, on the home page, for the email form.
Every other page ships zero. The collapsed mobile nav wraps rather than using a
hamburger, precisely so it needs none.

**Brand colours are defined once**, in `src/styles/tokens.css`. `npm test` fails
the build on a hex, `rgb()` or `hsl()` anywhere in `src/pages`, `src/layouts` or
`src/components` — the same guard, and the same reasoning, as `one-lane`'s
`test/no-literals.test.ts`. A palette that is only a convention drifts within a
month.

## Docs

- [**Design**](docs/superpowers/specs/2026-08-24-dryasstudio-site-design.md) — routing, stack, screens, tokens
- [**Plan**](docs/superpowers/plans/2026-08-24-dryasstudio-site.md) — 19 tasks in five phases
- [`docs/design/`](docs/design/) — the delivered design bundle. Open
  `Dryas Studio Site.dc.html` in a browser to see all five screens; every style
  is inline on the element, so inspecting any element gives exact values.
  `HANDOFF.md` is the accompanying spec.

---

## Known gaps

**The brand SVGs are missing.** The handoff references four files in `assets/` —
`dryas-symbol-paper.svg`, `dryas-symbol.svg`, `dryas-symbol-small-cut.svg`,
`dryas-lockup-horizontal-reversed.svg`. None were in the delivered bundle and
none are in `one-lane`. The build scaffolds against those exact filenames with
placeholder marks so the real files drop in with no code change, but the site is
not finished until they arrive.

**Screen `2a Gatekeep landing` is not built here.** It is the game's own landing
page and belongs to `one-lane` — see design doc §4.7, which also notes that it
is drawn in hex while that repo's tests forbid colour literals.
