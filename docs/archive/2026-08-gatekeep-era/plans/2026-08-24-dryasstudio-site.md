# dryasstudio.com Studio Site — Implementation Plan

**Status:** Phases B and C complete, Phase D complete in code and verified
locally against `wrangler pages dev`. Phase A and the Cloudflare-side tasks
remain — they need the real projects, or a `one-lane` checkout.

**Goal:** Ship `dryasstudio.com` from this repo as a static Astro site (home, devlog index, devlog entry, about, press), served by Cloudflare Pages, with `/gatekeep/*` proxied to the GATEKEEP Pages project so `promprit/one-lane` owns that path outright.

**Architecture:** One Pages project owns the hostname. A single catch-all Pages Function proxies `/gatekeep/*` to a second Pages project, and `_routes.json` confines the Functions runtime to the two prefixes that need it so the studio pages never leave the asset CDN. Everything else is static output from Astro content collections.

**Tech Stack:** Astro 7 (static), TypeScript, Astro content collections for the devlog, Cloudflare Pages + Pages Functions, self-hosted Fontsource (Archivo variable + JetBrains Mono, latin subsets). No CSS framework, no UI library, no client framework — one script island in the whole site.

**Spec:** [`docs/superpowers/specs/2026-08-24-dryasstudio-site-design.md`](../specs/2026-08-24-dryasstudio-site-design.md)

## Global Constraints

- **No colour literal outside the token module.** Hex, `rgb()` and `hsl()` are banned in `src/pages`, `src/layouts`, `src/components`; only `rgba(0,0,0,…)` is exempt. Enforced by `npm test`, not by convention. Mirrors `one-lane`'s `test/no-literals.test.ts` and exists for the same reason.
- **Border radius is `2px`. Everywhere.**
- **No gradients, shadows or glow.** The one permitted gradient in the whole design system is the hero scrim on screen `2a`, which lives in the other repo.
- **This repo never writes to `one-lane`.** The three changes it needs are listed in spec §4.6 and are separate PRs against that repo. This plan completes without any of them landing.
- **Do not implement screen `2a`.** It is the game's landing page and belongs to `one-lane` (spec §4.7).
- **Placeholder copy stays placeholder.** Ship the mock's words for the Gatekeep pitch, bio and devlog bodies.
- **Prove every new test fails before trusting it green.**
- **The brand SVGs do not exist yet** (spec §8). Built against the four exact filenames with a placeholder mark so the real files drop in with no code change.

---

## Phase A — resolve the one fragile assumption

- [ ] **Task 1 — Verify the `basePath` export layout.**
  In a local `one-lane` checkout on a scratch branch: set `basePath: "/gatekeep"` in `apps/web/next.config.ts`, run the export, and record the actual tree — specifically whether the page served at `/gatekeep/` is `out/index.html` or `out/gatekeep/index.html`, and what prefix the `_next` asset URLs inside the HTML carry.
  **Write the finding into spec §4.5 and close spec §10 item 1.** If the layout differs from the assertion, the only thing that changes is the strip in `functions/gatekeep/[[path]].ts`.
  Revert the scratch change. Do not commit to `one-lane`.

  *Partially de-risked:* the proxy was exercised against a stand-in origin laid
  out the way §4.5 predicts (root = base path, prefixed asset URLs inside), and
  `/gatekeep/`, `/gatekeep/play/` and `/gatekeep/_next/app.js` all resolved. That
  proves the Function; it does not prove Next produces that layout.

## Phase B — repo foundation ✅

- [x] **Task 2 — Scaffold Astro.** Static output to `dist/`, TypeScript strict, no adapter. Self-hosted fonts, latin subsets only.
- [x] **Task 3 — Token layer.** `src/styles/tokens.css` holds the eight brand colours and the hairline; `base.css` carries the type scale, the `2px` radius, `120ms` transitions, focus rings and a reduced-motion escape.
- [x] **Task 4 — The literal guard.** `scripts/check-literals.mjs`, run by `npm test`. **Proved red first** against a planted `#7C8A83` in `StudioFooter.astro`, then green once reverted.
- [x] **Task 5 — Brand asset placeholders.** Four files at the exact kit filenames, each carrying an SVG comment saying it is a placeholder.

## Phase C — the shell and the screens ✅

- [x] **Task 6 — The shell.** `Shell.astro` + `SidebarNav.astro` + `StudioFooter.astro`. `/contact` links to `/about#contact`.
- [x] **Task 7 — Email signup component.** Both variants, four states, honeypot, and a real no-JS form post.
- [x] **Task 8 — Devlog content collection.** Schema plus the four entries from the mock, `#04` flagged `milestone`.
- [x] **Task 9 — Home (`1c`).**
- [x] **Task 10 — Devlog index and entry (`2b`).**
- [x] **Task 11 — About (`2c`) and Press (`2d`).**

## Phase D — routing, Functions and deploy

- [x] **Task 12 — Pages config.** `public/_routes.json` and `public/_headers`. No CSP yet — see the file's own note.
- [x] **Task 13 — The `/gatekeep` proxy.** Reads `GATEKEEP_ORIGIN`; strips the prefix; rewrites an origin `Location` back onto the prefix; passes the body through untouched; serves an on-brand `503` holding page when unbound.
- [x] **Task 14 — The subscribe Function.** Buttondown behind an adapter, `501` when unconfigured, honeypot, JSON and form-encoded bodies, explicit `405` on non-POST.
- [ ] **Task 15 — Create the Cloudflare projects.** Pages project `dryas-studio` from this repo (build `npm run build`, output `dist/`), custom domains `dryasstudio.com` + `www` redirecting to apex, bindings `GATEKEEP_ORIGIN` and `BUTTONDOWN_API_KEY`. The `gatekeep` project (from `one-lane`, output `apps/web/out/`) gets **no** custom domain.
- [x] **Task 16 — CI.** `.github/workflows/ci.yml` runs the guard, `astro check` and the build on every PR. Pages' Git integration handles deploys.

## Phase E — verification

- [x] **Task 17a — Local verification against `wrangler pages dev`.** With a stand-in origin: `/gatekeep/`, `/gatekeep/play/` and `/gatekeep/_next/app.js` all resolve through the proxy; `/gatekeep` 308s to `/gatekeep/`; a 404 under the prefix comes from the origin; `/` and `/about/` are unaffected; `GET /api/subscribe` is 405 and `POST` is 501 unconfigured.
- [ ] **Task 17b — Verify on real Cloudflare.** Needs both projects live. The one thing local dev cannot show: that `/` and `/devlog` are served **without a Functions invocation** — check the Pages analytics request count, not just the response.
- [x] **Task 18a — Responsive and rendering.** All five routes screenshotted at 1280px and 390px in Chromium: no console errors, no failed requests, sidebar collapses to a top bar, grids stack, nav wraps.
- [ ] **Task 18b — Contrast audit.** Slate Grey on District Green at metadata sizes is the one pairing in the palette likely to fail WCAG. If it does, the fix is a size or weight change, **not a new colour** (spec §7).
- [x] **Task 19 — README.**

---

## What changed from the original plan

Recorded so the deviations are not re-litigated later.

- **Astro 7, not 5.** The `^5` pin resolved to 5.18.2, which carries live XSS advisories. Nothing to migrate on a fresh scaffold, so it went straight to 7.2.4 — `npm audit` clean. `zod` is imported directly, since Astro 7 deprecates the `z` re-export from `astro:content`.
- **`scripts/check-literals.mjs`, not `test/no-literals.test.ts`.** One invariant does not justify pulling in a test runner. Same guard, same proof-it-fails-first discipline.
- **`_routes.json` includes `/api/*`.** The plan and spec §4.3 both said `/gatekeep*` only, which would have left the signup endpoint permanently unreachable. Spec corrected.
- **No mobile nav toggle.** The handoff offers "hamburger or wrapped route nav"; wrapped needs no JavaScript, so the site's only script is the email form.
- **No main-column footer on `2b`/`2c`/`2d`.** First pass rendered both a sidebar copyright and a main footer, which the canvas does not. Only `1c` has the main footer; the other three close the sidebar with the copyright line, and the shell now defaults to that.
- **Image wells resolve from `public/images/` at build time.** Not in the original plan. The studio owner uploads through the GitHub web UI, so a well names an image by stem (`gatekeep/key-art`) and `src/lib/images.ts` finds whichever extension landed. Verified both ways: dropping a file in swaps the placeholder for the photo, removing it reverts.
- **Two tsconfigs.** The Functions run on workerd and typecheck against `@cloudflare/workers-types`; the Astro app needs Node's. Merging both global lib sets into one root config makes `fetch`/`Request` ambiguous, so `functions/` has its own and `npm run check` runs `tsc --noEmit -p functions` after `astro check`. Proved it actually checks by planting a type error.
- **`src/lib/tokens.ts` reads the palette via a Vite `?raw` import.** A few places need a colour as a value rather than a custom property (`theme-color`). Reading `tokens.css` from disk broke once the module was bundled into `dist/.prerender/`.

## Verification Strategy

- **The literal guard is the only test that runs on every build**, because it is the only invariant that silently rots. Everything else about a static marketing site is verified by looking at it.
- **Task 17b is the real test of this design** and it cannot be run locally — the proxy only exists on Cloudflare. Budget for it as its own session with both projects deployed.
- **Do not treat a working `/gatekeep/` as proof the design is done** until spec §4.6.3 is resolved. A `noindex` game page behind a prominent studio link is the expected state at launch, not a regression.
