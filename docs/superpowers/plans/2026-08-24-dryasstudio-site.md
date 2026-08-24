# dryasstudio.com Studio Site — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. Work the phases in order — Phase A gates everything, and Phase D cannot be verified until Phase A's finding is in hand.

**Goal:** Ship `dryasstudio.com` from this repo as a static Astro site (home, devlog index, devlog entry, about, press), served by Cloudflare Pages, with `/gatekeep/*` proxied to the GATEKEEP Pages project so `promprit/one-lane` owns that path outright.

**Architecture:** One Pages project owns the hostname. A single catch-all Pages Function proxies `/gatekeep/*` to a second Pages project, and `_routes.json` confines the Functions runtime to exactly those paths so the studio pages never leave the asset CDN. Everything else is static output from Astro content collections.

**Tech Stack:** Astro (static), TypeScript, Astro content collections for the devlog, Cloudflare Pages + Pages Functions, self-hosted Fontsource (Archivo variable + JetBrains Mono). No CSS framework, no UI library, no client framework — two script islands total.

**Spec:** [`docs/superpowers/specs/2026-08-24-dryasstudio-site-design.md`](../specs/2026-08-24-dryasstudio-site-design.md)

## Global Constraints

- **No colour literal outside the token module.** Hex, `rgb()` and `hsl()` are banned in `src/pages`, `src/layouts`, `src/components`; only `rgba(0,0,0,…)` and the brand hairline constant are exempt. Enforced by a test (Task 4), not by convention. Mirrors `one-lane`'s `test/no-literals.test.ts` and exists for the same reason.
- **Border radius is `2px`. Everywhere.** No exceptions in the design and none in the build.
- **No gradients, shadows or glow.** The one permitted gradient in the whole design system is the hero scrim on screen `2a`, which lives in the other repo.
- **This repo never writes to `one-lane`.** The three changes it needs are listed in spec §4.6 and are separate PRs against that repo. This plan can complete without any of them landing.
- **`_routes.json` must exist before the first deploy.** Without it Pages invokes the Functions runtime on every request to the site. See spec §4.3.
- **Do not implement screen `2a`.** It is the game's landing page and belongs to `one-lane` (spec §4.7).
- **Placeholder copy stays placeholder.** Ship the mock's words for the Gatekeep pitch, bio and devlog bodies. Do not invent replacements.
- **Prove every new test fails before trusting it green.** Inject the defect the test claims to catch and watch it go red first.
- **The brand SVGs do not exist yet** (spec §8). Build against the four exact filenames with a placeholder mark so the real files drop in with no code change.

---

## Phase A — resolve the one fragile assumption (Task 1)

**Nothing else in the routing design is uncertain; this is.** Spec §4.5 asserts that `basePath` + `output: "export"` puts `out/` at the base-path root, which determines whether the proxy strips `/gatekeep` before fetching. It is asserted from the Next.js contract, not from a build anyone has run.

Do this first, on a scratch branch of a local `one-lane` checkout, and **do not commit it there**.

## Phase B — repo foundation (Tasks 2–5)

## Phase C — the shell and the screens (Tasks 6–11)

## Phase D — routing, Functions and deploy (Tasks 12–16)

**Task 13 depends on Phase A's finding.** Everything else in Phase D is independent of it.

## Phase E — verification (Tasks 17–19)

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `package.json`, `astro.config.mjs`, `tsconfig.json` | Astro static build, `dist/` output | 2 |
| `src/styles/tokens.css` | the eight brand colours + hairline, as the only definition | 3 |
| `src/styles/base.css` | type scale, resets, focus rings, `120ms` transitions | 3 |
| `test/no-literals.test.ts` | fails the build on a colour literal outside tokens | 4 |
| `public/assets/*.svg` | the four brand marks — placeholders until spec §8 clears | 5 |
| `src/layouts/Shell.astro` | 380px Shade sidebar + `1fr` main, slotted sidebar | 6 |
| `src/components/SidebarNav.astro` | route nav, active state, `→` prefix on active | 6 |
| `src/components/Footer.astro` | hairline top, © left, socials right | 6 |
| `src/components/EmailSignup.astro` | both variants (devlog / playtest), island | 7 |
| `src/content.config.ts` | devlog collection schema — `date`, `title`, `milestone`, `readingTime` | 8 |
| `src/content/devlog/*.md` | the four entries from the mock | 8 |
| `src/pages/index.astro` | screen `1c` — feature band + entry list | 9 |
| `src/pages/devlog/index.astro` | the derived index, spec §6.2 | 10 |
| `src/pages/devlog/[slug].astro` | screen `2b` | 10 |
| `src/pages/about.astro` | screen `2c`, contact block carries `id="contact"` | 11 |
| `src/pages/press.astro` | screen `2d` | 11 |
| `functions/gatekeep/[[path]].ts` | the proxy, spec §4.2 | 13 |
| `functions/api/subscribe.ts` | email signup + provider adapter, spec §5 | 14 |
| `public/_routes.json` | confine Functions to `/gatekeep*`, spec §4.3 | 12 |
| `public/_headers` | security headers, cache policy | 12 |
| `.github/workflows/ci.yml` | typecheck, tests, build on PR | 16 |
| `README.md` | what this repo is, how to run it, the two-repo contract | 19 |

---

## Phase A

- [ ] **Task 1 — Verify the `basePath` export layout.**
  In a local `one-lane` checkout on a scratch branch: set `basePath: "/gatekeep"` in `apps/web/next.config.ts`, run the export, and record the actual tree — specifically whether the page served at `/gatekeep/` is `out/index.html` or `out/gatekeep/index.html`, and what prefix the `_next` asset URLs inside the HTML carry.
  **Write the finding into spec §4.5 and close spec §10 item 1.** If the layout differs from the assertion, the only thing that changes is the strip in Task 13.
  Revert the scratch change. Do not commit to `one-lane`.

## Phase B

- [ ] **Task 2 — Scaffold Astro.** Static output to `dist/`, TypeScript strict, no adapter. Add `@fontsource-variable/archivo` and `@fontsource/jetbrains-mono`; self-host, do not link Google Fonts (spec §3).
- [ ] **Task 3 — Token layer.** `tokens.css` defines the eight colours from spec §7 and the hairline as custom properties, and is the only place any of them appear. `base.css` carries the Archivo/JetBrains scale, the `2px` radius constant, `120ms` transitions, and visible focus rings.
- [ ] **Task 4 — The literal guard.** A test that walks `src/pages`, `src/layouts`, `src/components` and fails on hex, `rgb()` or `hsl()`, exempting `rgba(0,0,0,…)`. **Prove it red first** by planting `#1B342C` in a component.
- [ ] **Task 5 — Brand asset placeholders.** Create `public/assets/` with the four exact filenames from spec §8, each a plain geometric placeholder mark, each carrying an SVG comment saying it is a placeholder awaiting the real brand kit. Add the same note to the README (Task 19).

## Phase C

- [ ] **Task 6 — The shell.** `Shell.astro`: `380px | 1fr` grid, Shade sidebar with right hairline, `48px/40px` padding, flex column, `36–40px` gaps, full-viewport min-height. Sidebar contents are a slot. `SidebarNav.astro` renders `/gatekeep /devlog /about /press /contact` with the active route in Paper prefixed `→` and the rest Slate; **`/contact` links to `/about#contact`** (spec §6.2). Footer per `1c`.
- [ ] **Task 7 — Email signup component.** Both variants — sidebar `DEVLOG BY EMAIL` with the Earth Brown `→` button, and the wider `PLAYTEST LIST` / `JOIN` used in the game footer. Client-side format validation, idle/submitting/success/error states, success swaps the form for a mono confirmation line. Posts to `/api/subscribe` (Task 14). Includes the honeypot field.
- [ ] **Task 8 — Devlog content collection.** Schema: `title`, `date`, `number`, `milestone` (boolean → the Earth Brown badge), `readingTime`, `summary`. Seed the four entries from the mock (`#01`–`#04`) with the mock's placeholder bodies, `#04` flagged `milestone: true`. Sort newest first.
- [ ] **Task 9 — Home (`1c`).** Sidebar: 64px mark, studio name (Archivo 500 30px caps `.06em`), `SOLO · GAMES · 2026` at `.32em` Slate, intro paragraph, nav, signup pinned bottom. Main: Gatekeep feature band (`CURRENT PROJECT` Earth Brown badge, `STATUS: IN DEVELOPMENT`, `1fr | 320px` grid, GATEKEEP at 56px `.08em`, outlined `dryasstudio.com/gatekeep →` button, 200px screenshot well), then the devlog list from the collection, then `ALL ENTRIES →`.
- [ ] **Task 10 — Devlog index and entry.** Index per spec §6.2 — `1c`'s row treatment at full length in the shell. Entry (`2b`): sidebar shows the all-entries list with the current one in the `rgba(201,207,196,.08)` pill; article at `72px/96px` padding, `860px` max-width, badge row, H1 Archivo 500 44px/1.15 **sentence case**, body 17px/1.75, figure wells with `FIG.01 —` mono captions, mono stat block on Shade, prev/next footer.
- [ ] **Task 11 — About and Press.** `2c`: 180×180 portrait slot in the sidebar, kicker, H1 uppercase, bio paragraphs, three-cell stats strip using the 1px grid-gap hairline trick, contact block **with `id="contact"`** and a 90px mono label column. `2d`: `DOWNLOAD FULL KIT (.ZIP)` primary button in the sidebar, fact-sheet rows, the 2-up logo swatches plus full-width reversed lockup, mono footnote, 4-up screenshot wells at 130px.

## Phase D

- [ ] **Task 12 — Pages config.** `public/_routes.json` exactly as spec §4.3. `public/_headers`: long cache for hashed assets, short for HTML, plus `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`. **Do not add a CSP yet** — the proxied game's requirements are not known until it is actually serving through the Function.
- [ ] **Task 13 — The `/gatekeep` proxy.** `functions/gatekeep/[[path]].ts` per spec §4.2, reading `GATEKEEP_ORIGIN` from the environment — **not** a hardcoded `pages.dev` host. Strip the prefix per Task 1's finding. Redirect `/gatekeep` → `/gatekeep/`. Pass status, body and content type through unmodified; **do not rewrite the HTML body**. When `GATEKEEP_ORIGIN` is unbound, serve a small on-brand holding page rather than throwing — this is the state the site ships in until `one-lane`'s Pages project exists.
- [ ] **Task 14 — The subscribe Function.** `functions/api/subscribe.ts` per spec §5: `{ email, list }`, `list ∈ {devlog, playtest}`, honeypot rejection, server-side format validation, provider behind an adapter with Buttondown as the default. **`501` when `BUTTONDOWN_API_KEY` is unbound** — a defined state, not a crash.
- [ ] **Task 15 — Create the Cloudflare projects.** Pages project `dryas-studio` from this repo, build `npm run build`, output `dist/`. Attach `dryasstudio.com` and `www.dryasstudio.com`, with `www` redirecting to apex. Bind `GATEKEEP_ORIGIN` and `BUTTONDOWN_API_KEY`. The `gatekeep` project (from `one-lane`, output `apps/web/out/`) gets **no custom domain** — spec §4.1.
- [ ] **Task 16 — CI.** A workflow running typecheck, the literal guard, and the build on every PR. Cloudflare Pages' own Git integration handles deploys; CI exists to keep a broken build off `main`.

## Phase E

- [ ] **Task 17 — Verify the routing contract end to end.** With both Pages projects live: `/gatekeep/` serves the game; `/gatekeep/play/` serves the game and its assets load; `/` and `/devlog` are served from the asset CDN with **no** Functions invocation (check the Pages analytics request count, not just the response); `/gatekeep` redirects to `/gatekeep/`; a 404 inside `/gatekeep/*` comes from the game, not the studio.
- [ ] **Task 18 — Verify responsive and accessibility.** Below 900px: sidebar becomes a top bar, grids stack, side padding ≥24px, touch targets ≥44px. Check colour contrast for Slate Grey on District Green at metadata sizes — **it is the one pairing in the palette likely to fail**, and if it does, the fix is a size or weight change, not a new colour (spec §7).
- [ ] **Task 19 — README.** What this repo is, how to run it, and the two-repo contract in brief: this repo owns the hostname, `one-lane` owns `/gatekeep`, the three changes that repo needs (spec §4.6), and the missing brand assets (spec §8).

---

## Verification Strategy

- **The literal guard is the only test that runs on every build**, because it is the only invariant that silently rots. Everything else about a static marketing site is verified by looking at it.
- **Task 17 is the real test of this plan** and it cannot be run locally — the proxy only exists on Cloudflare. Budget for it as its own session with both projects deployed.
- **Do not treat a working `/gatekeep/` as proof the design is done** until spec §4.6.3 is resolved. A `noindex` game page behind a prominent studio link is the expected state at launch, not a regression.
