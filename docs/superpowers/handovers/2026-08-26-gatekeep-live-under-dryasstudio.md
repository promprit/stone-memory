# Handover: GATEKEEP is live under dryasstudio.com

**Date:** 2026-08-26
**For:** an agent working in `promprit/one-lane` (checked out at `~/Documents/GATEKEEP`)
**From:** `promprit/stone-memory`, which owns `dryasstudio.com`
**Supersedes:** `2026-08-24-gatekeep-under-dryasstudio.md`, whose three tasks are all done

Read this instead of the 2026-08-24 handover. That file described work that has
since landed; its §2 contract and §5 prohibitions still hold and are restated
here, but its task list is stale.

---

## 1. What is true now

Both halves are built and deployed. They were finished independently and sat
disconnected for two days, which is the state this file exists to close out.

| | Studio side | Game side |
|---|---|---|
| Repo | `promprit/stone-memory` | `promprit/one-lane` |
| Pages project | `dryas-studio` | `gatekeep` |
| Origin hostname | `dryas-studio.pages.dev` | `gatekeep-elu.pages.dev` |
| Public address | `https://dryasstudio.com` | `https://dryasstudio.com/gatekeep/` |
| Custom domain | apex + `www`, `www` 301s to apex | **none, by design** |
| Deployed commit | `7757e36` | `d16258e` — current `main` HEAD |

The studio site went live on 2026-08-26: apex and `www` both resolve, the
certificate is valid, and a zone-level Redirect Rule sends `www` to the apex
with path and query string preserved.

**The three tasks from the previous handover are complete in this repo.**
Verified against the live origin, not just the source:

- `basePath: "/gatekeep"` is set, sourced from `apps/web/lib/base-path.ts` so the
  config and the literal strings cannot drift. `gatekeep-elu.pages.dev/` serves
  HTML referencing `/gatekeep/_next/static/...`, which is exactly the shape the
  proxy needs.
- The service worker carries the prefix — `apps/web/public/sw.js` sets
  `BASE = "/gatekeep"`, and `test/base-path.test.ts` and
  `test/service-worker.test.ts` assert the two agree.
- The global `robots: { index: false, follow: false }` is gone. The landing page
  serves no `noindex` meta tag. See §4 — this is now a live decision, not a
  pending one.

`/`, `/play/`, `/cards/` and `/rules/` all return 200 from the origin.

---

## 2. The one thing still outstanding — and it is not yours

`GATEKEEP_ORIGIN` is **unset** on the `dryas-studio` Pages project. The studio's
proxy Function reads it, and

```ts
if (!env.GATEKEEP_ORIGIN) return holdingPage();
```

means `https://dryasstudio.com/gatekeep/` currently answers `503` with an
on-brand holding page rather than the game. Nothing is broken; this is the
defined unset state the proxy was written to have.

The fix is one variable on the studio side:

```
GATEKEEP_ORIGIN = https://gatekeep-elu.pages.dev
```

set on the `dryas-studio` project, followed by a redeploy of that project so the
Functions bundle picks it up. **Do not attempt this from `one-lane`.** If it has
not happened by the time you read this, say so rather than working around it.

Until it lands, verify your work against `https://gatekeep-elu.pages.dev/`
directly. Every path behaves identically there except that it lacks the
`/gatekeep` prefix in the URL bar.

---

## 3. The contract — unchanged, restated

Cloudflare Pages binds a *hostname* to a project and cannot hand one path prefix
to a different project. So `stone-memory` owns the hostname and carries a
catch-all Pages Function at `functions/gatekeep/[[path]].ts` that proxies the
prefix to this project's `pages.dev` deployment. `public/_routes.json` confines
the Functions runtime to `/gatekeep*` and `/api/*`, so studio pages are served
straight from the asset CDN with no Worker invocation.

Two properties of that proxy constrain you:

**It strips `/gatekeep` before fetching.** `dryasstudio.com/gatekeep/play/`
fetches `<origin>/play/`. Your `out/` root is the base path.

**It does not rewrite the response body.** The prefix must already be in the
HTML, which is what `basePath` is for. A body-rewriting proxy would be a second,
invisible source of truth for the prefix. If you ever find yourself wanting the
proxy to fix up a URL, the bug is on this side.

**Deploy with:**

```bash
pnpm --filter @gatekeep/web build
pnpm --filter @gatekeep/web deploy:pages
```

`deploy:pages` is `wrangler pages deploy out --project-name gatekeep --branch main`.
Deploys are independent — the studio site never rebuilds because of you, and you
never rebuild because of it.

**If the origin hostname ever changes** — a new project, a rename — the studio
side must be told, because `GATEKEEP_ORIGIN` is a literal. That is the only
coordination this arrangement requires.

---

## 4. Live decision: the game is now publicly indexable

The previous handover flagged the global `noindex` as the one genuine judgment
call. It has been removed, and once `GATEKEEP_ORIGIN` is set the game is
reachable at a real domain that people are given.

Treat that as a decision already made, not an oversight to revert — but know
that it is now load-bearing:

- Anything you ship to `main` and deploy is public within a minute.
- The studio site links to `/gatekeep`, so crawlers will find it.
- If the game reaches a state that should not be seen, the fix is a `noindex` in
  `apps/web/app/layout.tsx`, not undeploying — the studio's holding page is for
  a missing origin, not for a game you want hidden.

---

## 5. Your actual remaining work: same-origin integration

Being served from the studio's hostname buys three things that are currently
unused. `grep` confirms none of them are wired.

**Link to the studio's pages as plain relative hrefs.** `/devlog` and `/press`
exist on the studio site. Same origin, so `href="/devlog"` just works — no
absolute URL, no CORS, no duplicate devlog collection in this repo. **The studio
owns all devlog entries**; that was decided when the split was designed. The
game's nav currently offers `/`, `/cards`, `/design`, `/play`, `/rules`,
`/settings`, `/spots` and links to neither.

Careful: `basePath` rewrites `<Link href>` for you, so `href="/devlog"` inside a
Next `Link` becomes `/gatekeep/devlog`, which does not exist. Use a plain
`<a href="/devlog">` for studio destinations, or `withBase`-free literals — this
is the one place the prefix must *not* be applied. Whatever you choose, add a
test; `test/base-path.test.ts` is the natural home.

**POST the playtest signup same-origin to `/api/subscribe`.** It is a Pages
Function in the studio repo. No CORS handling, no third-party script on your
page, and the provider credential never reaches the browser.

```
POST /api/subscribe
{ "email": "...", "list": "playtest" }
```

Responses: `200` success, `400` malformed address, `501` while no list provider
is configured, `502` if the provider rejects it. It is `501` today — the studio
has no Buttondown key set — so build the UI against that and it will start
working with no change on your side.

Same `basePath` trap: this URL must reach `/api/subscribe`, not
`/gatekeep/api/subscribe`.

**Screen `2a`.** The design bundle's fifth screen is the game's landing page,
i.e. `apps/web/app/page.tsx` here. A landing page already exists with its own
components (`HeroBoard`, `SiteHeader`, `StandingFigure`), so this is
reconciliation rather than a blank page. Two things worth knowing before you
touch it:

- **`2a` is drawn in hex and this repo forbids that.** It specifies District
  Green `#1B342C`, Shade `#10201B`, Paper `#EFEEE8`; `apps/web` styles from the
  OKLCH token layer in `lib/tokens.ts` and `test/no-literals.test.ts` fails the
  build on any hex, `rgb()` or `hsl()` in `app/`, `lib/` or `components/`.
  Implementing `2a` means expressing the brand palette as OKLCH tokens, not
  pasting hex. That is real work and it is in nobody's plan yet.
- **Its sub-nav does not match the app's routes.** `2a` draws `/overview`
  `/devlog` `/media` `/press`. Reconciling that with the actual route list is
  your call — but `/devlog` and `/press` have the natural answer above.

---

## 6. What is NOT being asked of you

- **Do not add a custom domain to the `gatekeep` project.** Its address is the
  studio's hostname, through the proxy. The `pages.dev` hostname is an
  implementation detail.
- **Do not set `GATEKEEP_ORIGIN`** or otherwise touch the `dryas-studio` project.
- **Do not touch the telemetry Worker.** `gatekeep-telemetry` is unrelated;
  `NEXT_PUBLIC_TELEMETRY_URL` is still read at build time. Telemetry was turned
  on in `d16258e`.
- **Do not wire `/play` to the socket server** as part of this. The deployment
  doc defers that behind its own trigger.
- **Do not implement the studio site's other screens.** Four of the five are
  built in `stone-memory`.
- **Do not vendor the devlog.** The studio owns it.

---

## 7. Verifying

Against the origin directly, which works today:

```bash
curl -sI https://gatekeep-elu.pages.dev/            # 200
curl -s https://gatekeep-elu.pages.dev/ | grep -o '/gatekeep/_next[^"]*' | head -1
```

Once `GATEKEEP_ORIGIN` is set, through the proxy:

```bash
curl -sI https://dryasstudio.com/gatekeep          # 308 -> /gatekeep/
curl -sI https://dryasstudio.com/gatekeep/         # 200, the game
curl -sI https://dryasstudio.com/gatekeep/play/    # 200
curl -sI https://dryasstudio.com/gatekeep/nope/    # 404, from THIS origin
curl -sI https://dryasstudio.com/about/            # 200, unaffected
```

That fourth line is the one that proves the design: a 404 under the prefix must
come from the game's export, not from the studio.

Locally, `pnpm --filter @gatekeep/web serve` symlinks `out/` under a `gatekeep/`
directory so `http://127.0.0.1:4173/gatekeep/` mirrors production's prefix.

---

## 8. Source of truth

The routing contract lives at
`docs/superpowers/specs/2026-08-24-dryasstudio-site-design.md` in
`promprit/stone-memory` — §4 routing, §4.6 this handover condensed, §4.7 screen
`2a`.

Where this file and `docs/GATEKEEP-deployment-v1.md` disagree about the game,
**the deployment doc wins.** It is canonical for where the game runs and who can
reach it; this file only describes the path in front of it.
