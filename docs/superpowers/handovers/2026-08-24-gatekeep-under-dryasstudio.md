# Handover: serving GATEKEEP at dryasstudio.com/gatekeep

**Date:** 2026-08-24
**For:** an agent working in `promprit/one-lane`
**From:** `promprit/stone-memory`, which now owns `dryasstudio.com`
**Status of the other side:** built, verified locally, not yet deployed

This is the whole of what `one-lane` has to do. It is self-contained — you do
not need to read the studio site's code, and nothing here asks you to change how
the game works.

---

## 1. What has been decided

`dryasstudio.com` is served by a Cloudflare Pages project built from
`stone-memory` (an Astro static site — the studio's home, devlog, about and
press pages).

**GATEKEEP owns `dryasstudio.com/gatekeep` outright.** Not a subdomain, not a
copy vendored into the studio repo. `one-lane` publishes to that path on its own
schedule, and the studio site never rebuilds because of it.

Cloudflare Pages binds a *hostname* to a project and has no native way to hand
one path prefix to a different project, so the studio repo carries a catch-all
Pages Function at `functions/gatekeep/[[path]].ts` that proxies the prefix to a
second Pages project built from this repo. A `_routes.json` confines the
Functions runtime to `/gatekeep*` and `/api/*`, so studio pages never enter it.

That Function is written, and verified under `wrangler pages dev` against a
stand-in origin: `/gatekeep/`, `/gatekeep/play/` and `/gatekeep/_next/app.js`
all resolve, `/gatekeep` 308s to `/gatekeep/`, and a 404 under the prefix comes
from the origin rather than the studio.

**This closes the Cloudflare Pages row in `docs/GATEKEEP-deployment-v1.md` §5**,
whose trigger was "Beta. Alpha runs from the mini; Pages is what a permanent
public URL would use." This is that permanent public URL. Whether the *game* is
ready for it is a separate call — see §5 below, which is the one thing here that
is genuinely your decision and not a mechanical change.

---

## 2. The contract, precisely

| | |
|---|---|
| Pages project | `gatekeep`, built from `promprit/one-lane` |
| Build command | whatever produces the static export (`pnpm --filter @gatekeep/web build`) |
| Build output directory | `apps/web/out` |
| Custom domain | **none.** It keeps its `*.pages.dev` hostname. |
| Public address | `https://dryasstudio.com/gatekeep/` |

The `pages.dev` origin is an implementation detail of the proxy. The studio side
reads it from a `GATEKEEP_ORIGIN` environment variable, so you do not need to
coordinate a hostname — just tell the studio side what it ended up being.

**The proxy strips `/gatekeep` before fetching from the origin.** So the origin
is addressed at its root: `dryasstudio.com/gatekeep/play/` fetches
`<origin>/play/`. Task 1 below is what confirms that is the right shape.

**The proxy does not rewrite the response body.** The HTML must already carry
`/gatekeep`-prefixed links, which is what `basePath` is for. A proxy that
rewrote HTML would be a second, invisible source of truth for the prefix.

---

## 3. The three changes

None of these is urgent in the sense of blocking the studio site — until they
land, `/gatekeep` serves an on-brand holding page rather than erroring. Do them
in this order; task 1 gates the other two only in the sense that it might change
what you expect to see.

### Task 1 — Confirm the export layout before changing anything else

Set `basePath: "/gatekeep"` in `apps/web/next.config.ts` on a scratch branch,
run the export, and **look at the tree**.

The studio side's proxy assumes: `out/` root corresponds to the base path, so
`out/index.html` is the page served at `/gatekeep/`, while the links and asset
URLs *inside* those files carry the `/gatekeep` prefix. That is asserted from
the Next.js contract, not from a build anyone has run.

Record what you actually find. If it differs — if the export nests the tree
under `out/gatekeep/` — say so, and the studio side changes one line in its
proxy. Nothing else in the design moves.

While you are there, check that `app/manifest.ts` still exports and that the
export build succeeds at all: the deployment doc records that
`export const dynamic = "force-static"` is load-bearing there, and `basePath`
touches manifest URL generation.

### Task 2 — `basePath` (and the service worker with it)

`apps/web/next.config.ts` currently sets `output: "export"` and
`trailingSlash: true` and nothing else. Add:

```ts
basePath: "/gatekeep",
```

Then the service worker, which will otherwise break in two ways:

- **`apps/web/components/RegisterSW.tsx` registers a hardcoded `"/sw.js"`.**
  Under the prefix that path is the *studio's* origin root, where nothing is
  served. It must register `/gatekeep/sw.js`.
- **`apps/web/public/sw.js` caches shell URLs** that all need the prefix, or the
  offline shell will cache the wrong paths and the PWA will serve blanks.

There is a quiet benefit worth knowing, because it otherwise looks like a risk:
a service worker served from `/gatekeep/sw.js` **cannot** claim a scope above its
own path. It is structurally incapable of intercepting requests for the studio
site. The prefix isolates it for free — no scope header, no configuration.

`trailingSlash: true` stays. It is why public URLs are `/gatekeep/play/`, and
the proxy already redirects `/gatekeep` → `/gatekeep/` to match.

**Do not remove `output: "export"`.** The whole arrangement depends on the game
being a folder of files.

### Task 3 — Decide about `noindex`

`apps/web/app/layout.tsx:22` sets `robots: { index: false, follow: false }`
globally. That is deliberate, and `docs/GATEKEEP-deployment-v1.md` §1 is explicit
about why: alpha is "unlisted and disposable", and the `noindex` is what makes it
unlisted rather than merely unadvertised.

**The proxy will serve that header faithfully.** So on the day
`dryasstudio.com/gatekeep` goes live it is invisible to search engines, while the
studio site links to it prominently from the home page, the nav, and the press
kit.

That is not a bug and the studio side deliberately does not work around it.
Rewriting another repo's robots directive from a proxy would be exactly the kind
of invisible second source of truth this design avoids everywhere else.

**This is the one genuine decision in this handover.** The deployment doc frames
it as alpha-vs-beta: "Alpha is unlisted and disposable. Beta is public and
permanent." Moving to a permanent public URL is the beta event that doc names,
so either:

- the game is going public → drop the global `robots` (or scope it to the routes
  that should stay unlisted, e.g. `/design`), or
- the game is not going public yet → keep it, and tell the studio side, so the
  home page's Gatekeep band can be worded as a preview rather than a destination.

Either answer is fine. Silently shipping the first while believing the second is
what this section exists to prevent.

---

## 4. How to verify

Locally, before any deploy — the studio side did exactly this and it caught two
real bugs:

```bash
# build the export with basePath set
pnpm --filter @gatekeep/web build

# serve it as the proxy origin would see it: at the ROOT, no prefix
cd apps/web/out && python3 -m http.server 4399
```

Then from a `stone-memory` checkout:

```bash
npm run build
npx wrangler pages dev dist --binding GATEKEEP_ORIGIN=http://127.0.0.1:4399
```

and check, at `http://127.0.0.1:8788`:

- [ ] `/gatekeep/` serves the game's home page
- [ ] `/gatekeep/play/` is playable — deck select, dealt hand, clock running
- [ ] the `_next` assets load (no 404s in the console)
- [ ] `/gatekeep` (no slash) 308s to `/gatekeep/`
- [ ] `/gatekeep/play/?layout=portrait` still pins the layout
- [ ] `/` and `/devlog` are the studio site, unaffected
- [ ] the service worker registers at `/gatekeep/sw.js` and its scope is `/gatekeep/`

The layout-pinning check matters for the same reason the deployment doc gives:
a desktop otherwise never shows the phone view, and they are different component
trees rather than one tree restyled.

---

## 5. What is NOT being asked of you

- **Do not add a custom domain to the `gatekeep` Pages project.** Its address is
  the studio's hostname, through the proxy.
- **Do not touch the telemetry Worker.** `gatekeep-telemetry` is unrelated to
  this and keeps working exactly as it does now; `NEXT_PUBLIC_TELEMETRY_URL` is
  still read at build time.
- **Do not wire `/play` to the socket server** as part of this. The deployment
  doc defers that behind its own trigger, and this changes nothing about it.
- **Do not implement the studio site's screens.** Four of the five are built in
  `stone-memory` already.

---

## 6. One thing you inherit: screen `2a`

The design bundle that produced the studio site contains five screens. Four are
built in `stone-memory`. The fifth — `2a Gatekeep landing` — is the game's own
landing page, which under this arrangement is `/gatekeep/`, i.e.
`apps/web/app/page.tsx` **in this repo**.

It is yours now, and two things about it are worth knowing before you start:

**It is drawn in hex, and this repo forbids that.** `2a` is specified against
District Green `#1B342C`, Shade `#10201B`, Paper `#EFEEE8` and so on, while
`apps/web` styles from the OKLCH token layer in `lib/tokens.ts` and
`test/no-literals.test.ts` fails the build on a hex, `rgb()` or `hsl()` literal
anywhere in `app/`, `lib/` or `components/`. Implementing `2a` here means
expressing the brand palette as OKLCH tokens, not pasting the hex values. That is
real work and it is not in anyone's plan yet.

**Its sub-nav does not match the app's routes.** `2a` draws `/overview`
`/devlog` `/media` `/press`; the app actually has `/`, `/cards`, `/design`,
`/play`, `/rules`, `/settings`, `/spots`. Reconciling them is your call.

Two of those four sub-routes have a natural answer, though, and it is a payoff
of staying same-origin: `/devlog` and `/press` already exist on the studio site.
Because the game is served from the same hostname, the game's nav can link to
them as plain `href="/devlog"` and `href="/press"` — no absolute URL, no CORS,
no duplicate content collection. **The studio owns all devlog entries**; that was
decided when the split was designed.

Likewise the "GET PLAYTEST INVITES" and playtest-list forms on `2a` can POST
same-origin to `/api/subscribe` with `{ "email": "...", "list": "playtest" }`.
That endpoint is a Pages Function in the studio repo; it needs no CORS handling
and puts no third-party script on your page. It returns `200` on success, `400`
on a malformed address, `501` while no list provider is configured, and `502` if
the provider rejects it.

---

## 7. Source of truth

The full design lives at
`docs/superpowers/specs/2026-08-24-dryasstudio-site-design.md` in
`promprit/stone-memory` — §4 is the routing contract, §4.6 is this handover in
condensed form, §4.7 is screen `2a`.

Where this file and `docs/GATEKEEP-deployment-v1.md` disagree about the game,
**the deployment doc wins.** It is canonical for where the game runs and who can
reach it; this file only describes the path in front of it.
