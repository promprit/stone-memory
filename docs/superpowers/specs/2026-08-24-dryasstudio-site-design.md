# dryasstudio.com — studio site, and the two-repo domain split

**Date:** 2026-08-24
**Status:** design approved (Peem), not implemented
**Repo:** `promprit/stone-memory` — this repo, which becomes the Dryas Studio website
**Also touches:** `promprit/one-lane` (the GATEKEEP monorepo) at three named points — see §4.6

**Scope:** the studio site at `dryasstudio.com`, its Cloudflare Pages deployment,
and the routing contract that lets a **second repo** own `dryasstudio.com/gatekeep`
without either repo building the other.

**Design source:** `Dryas Studio Site.dc.html` (design-review canvas, five screens)
and its handoff README. Fidelity is **high** — colours, type, spacing and copy
structure are final; copy marked *placeholder* gets swapped, the layout does not.

---

## 1. The problem

Two repos, one hostname.

`stone-memory` is empty — zero commits at the time of writing. It becomes the
studio site: home, devlog, about, press.

`one-lane` is the GATEKEEP monorepo, and it already ships a Next.js App Router
app at `apps/web` with `output: "export"` — a folder of static files, 8 routes,
~2.9 MB. Its own deployment doc names **Cloudflare Pages as the beta plan**,
deferred pending "a permanent public URL". This is that URL.

The requirement is that **one-lane owns `dryasstudio.com/gatekeep`**. Not a
subdomain, not a copy vendored into this repo — the game repo publishes to that
path, on its own schedule, without this repo rebuilding.

**Cloudflare Pages cannot do this on its own.** A Pages project binds a
*hostname*. There is no project setting, no `_redirects` rule and no Bulk
Redirect that hands one path prefix of one hostname to a different project. Every
workable answer puts code in the request path. The design question is *whose*
code, and where it lives.

---

## 2. The decision

**`stone-memory` owns the hostname. A Pages Function in this repo proxies
`/gatekeep/*` to the GATEKEEP Pages project. `_routes.json` confines that
Function to exactly those paths, so every other request is served straight from
the static asset CDN with no Worker invocation at all.**

### 2.1 Why this shape and not the others

| Option | Why not |
|---|---|
| **Standalone Worker** on `dryasstudio.com/*` fanning out to two Pages projects | Functionally identical, and adds a third deploy unit whose route config lives in the Cloudflare dashboard rather than in either repo. The routing rule stops being reviewable in a diff. |
| **Vendor the game at build time** — this repo's CI checks out `one-lane`, builds `apps/web`, copies `out/` into `dist/gatekeep/` | One Pages project, no Function. But it inverts ownership: the game would ship only when the *studio* site rebuilds, a red game build would go red on the studio deploy, and this repo would need a cross-repo token. Directly contradicts the requirement. |
| **Subdomain** `gatekeep.dryasstudio.com` | Free and needs nothing from `one-lane`. Rejected: the design renders the breadcrumb as literal text `dryasstudio.com/gatekeep` on screen `2a`, and it splits link equity across two hostnames for a site whose whole SEO surface is one game. |

### 2.2 What the choice buys, beyond the requirement

Same-origin is not a side effect here, it is load-bearing:

- The game's nav can link to the studio devlog as a plain `href="/devlog"`. No
  absolute URL, no CORS, no cross-domain analytics gap.
- The playtest signup in the game's footer can `POST /api/subscribe` — the
  Function defined in *this* repo (§5) — with no preflight and no second
  provider integration.
- One set of security headers, one cookie origin, one Cloudflare zone analytics
  view.

---

## 3. Stack

**Astro, static output, self-hosted fonts.**

- The devlog is described in the handoff as "static content collection
  (markdown), newest first; MILESTONE is a frontmatter flag". That is Astro's
  content collections, near-verbatim — schema-validated frontmatter, typed
  queries, zero runtime.
- The site ships **no JavaScript by default**. The handoff's interaction budget
  is "~120ms ease transitions; no motion beyond colour". The only scripted
  behaviour on the whole site is the email form (§5) and the mobile nav toggle
  (§6.3), both of which are islands.
- Pages Functions coexist with an Astro static build without an adapter: the
  build emits `dist/`, and `functions/` is picked up by Pages alongside it.

**Rejected:** Next.js static export, for consistency with `one-lane`. This site
has no React state worth the framework, and Next's export sits awkwardly beside
Pages Functions. **Rejected:** hand-rolled HTML, which means hand-rolling the
content collection, the shared shell and nav-active state across four screens.

**Fonts are self-hosted** (`@fontsource-variable/archivo`,
`@fontsource/jetbrains-mono`), not linked from Google Fonts as the design canvas
does. A canvas prototype linking a CDN is right; a production page adding a
third-party connection to its critical path is not. It also keeps a strict CSP
available later.

---

## 4. The routing contract

This is the part that must be written down, because it is split across two repos
and neither one's tests can see the other.

### 4.1 Projects

| Cloudflare Pages project | Repo | Build output | Custom domain |
|---|---|---|---|
| `dryas-studio` | `promprit/stone-memory` | `dist/` | `dryasstudio.com`, `www.dryasstudio.com` |
| `gatekeep` | `promprit/one-lane` | `apps/web/out/` | *none* — reached only via the proxy |

The GATEKEEP project keeps its default `*.pages.dev` hostname and gets **no**
custom domain. Its public address is `dryasstudio.com/gatekeep`, and the
`pages.dev` origin is an implementation detail of the proxy.

### 4.2 The Function

```
functions/gatekeep/[[path]].ts     # catch-all: /gatekeep and /gatekeep/*
```

Behaviour:

1. Strip the leading `/gatekeep` from the incoming pathname.
2. Fetch the same path from `GATEKEEP_ORIGIN` (an environment variable, not a
   hardcoded `pages.dev` string — preview and production point at different
   deployments).
3. Return the response, passing through status, body and content type.

Explicitly **not** rewriting the response body. The HTML that comes back already
carries `/gatekeep`-prefixed links, because of §4.6.1. A proxy that rewrote HTML
would be a second, invisible source of truth for the prefix.

### 4.3 `_routes.json`

```json
{ "version": 1, "include": ["/gatekeep", "/gatekeep/*"], "exclude": [] }
```

**This file is not optional.** Pages defaults to `include: ["/*"]`, which invokes
the Functions runtime for every request to the site — turning a static marketing
page into a Worker invocation. With the file, the studio pages are served by the
asset CDN and never enter the Functions runtime at all.

### 4.4 Path shape

`one-lane` sets `trailingSlash: true`, so its export writes `play/index.html`,
not `play.html`. Public URLs are therefore `/gatekeep/play/`. `/gatekeep` with no
trailing slash redirects to `/gatekeep/`.

### 4.5 Why the prefix is stripped

With `basePath: "/gatekeep"` and `output: "export"`, Next writes an `out/`
directory whose **root corresponds to the base path** — `out/index.html` is the
page served at `/gatekeep/` — while the *links and asset URLs inside* those files
carry the `/gatekeep` prefix. So the origin is addressed without the prefix and
the browser sees it everywhere.

**This is the single most fragile assumption in the design, and it is asserted
from the Next.js contract, not from a build that has been run.** The
implementation plan opens with a task that builds `one-lane` with `basePath` set
and inspects the resulting tree before any proxy code is written. If the layout
differs, the strip in §4.2 changes and nothing else does.

### 4.6 The three changes needed in `one-lane`

None of these are made by this repo. Each is a PR against `one-lane`, and the
studio site can ship and serve a holding page at `/gatekeep` before any of them
land.

**4.6.1 `basePath: "/gatekeep"` in `apps/web/next.config.ts`.** Without it, every
asset URL in the exported HTML is root-absolute (`/_next/...`) and 404s against
the studio site. This is the change that makes the game addressable under a
prefix at all.

**4.6.2 The service worker registration.**
`apps/web/components/RegisterSW.tsx` registers a hardcoded `"/sw.js"`. Under the
prefix it must register `/gatekeep/sw.js`, and the shell URLs cached inside
`public/sw.js` need the same prefix.

There is a quiet benefit here worth stating, because it would otherwise look like
a risk: a service worker served from `/gatekeep/sw.js` **cannot** claim a scope
above its own path. It is structurally incapable of intercepting requests for the
studio site. The prefix isolates it for free.

**4.6.3 `robots: { index: false, follow: false }` in `apps/web/app/layout.tsx`.**
Set globally at line 22, deliberately — the deployment doc is explicit that alpha
is "unlisted and disposable" and that the `noindex` is what makes it unlisted
rather than merely unadvertised.

**The proxy will serve that header faithfully.** So on the day
`dryasstudio.com/gatekeep` goes live, it is invisible to search engines, and the
studio site will be linking prominently to a page no crawler will follow.

That is not a bug in this design and **this repo must not work around it.**
Whether the game page becomes public is the beta decision recorded in
`docs/GATEKEEP-deployment-v1.md` §1, and it belongs to `one-lane`. It is recorded
here only so that "why doesn't /gatekeep show up in Google" is answered before it
is asked.

### 4.7 Screen `2a` belongs to `one-lane` now

The design bundle contains five screens. **Four of them are built in this repo.**
Screen `2a Gatekeep landing` is the game's own landing page, which by this design
lives at `/gatekeep/` — the route `apps/web/app/page.tsx` in `one-lane`.

Two consequences that a later session will otherwise rediscover the hard way:

- **The `2a` design reference should be handed to `one-lane`**, not implemented
  here. The handoff README describes it as part of this bundle; the repo split
  makes it the game repo's work.
- **`2a` is drawn in hex against District Green. `one-lane` forbids that.** Its
  `apps/web` styles from an OKLCH token layer in `lib/tokens.ts`, and
  `test/no-literals.test.ts` fails the build on a hex, `rgb()` or `hsl()` literal
  anywhere in `app/`, `lib/` or `components/`. Implementing `2a` there means
  expressing the brand palette as OKLCH tokens, not pasting the hex values. That
  is a real piece of work and it is *not* in this plan.
- The sub-nav drawn on `2a` (`/overview` `/devlog` `/media` `/press`) does not
  match the app's actual routes (`/`, `/cards`, `/design`, `/play`, `/rules`,
  `/settings`, `/spots`). Reconciling them is `one-lane`'s call.

---

## 5. Email signup

Two forms in the design: "DEVLOG BY EMAIL" in the studio sidebar, and "PLAYTEST
LIST" in the GATEKEEP footer. They are different lists and the same mechanism.

**`functions/api/subscribe.ts`** — a Pages Function in this repo, taking
`{ email, list }` where `list` is `devlog` or `playtest`.

- **No third-party JavaScript on any page.** The form posts same-origin; the
  Function holds the provider credential. This is why the split-domain option in
  §2.1 would have cost something real: the game's footer form can reach this
  endpoint only because it is same-origin.
- **The provider sits behind an adapter.** Buttondown is the default (mono
  aesthetic, cheap, plain REST). Swapping it is one file.
- **Unconfigured is a defined state, not a crash.** With no
  `BUTTONDOWN_API_KEY` bound, the Function returns `501` and the form shows its
  error state. Local dev and preview deploys work without a credential.
- Spam floor: a honeypot field and server-side format validation. No CAPTCHA —
  Turnstile is available later if it is ever actually needed.

Success swaps the form for a mono confirmation line, per the handoff.

---

## 6. Screens and routes

### 6.1 Route map

| Route | Screen | Owner |
|---|---|---|
| `/` | `1c Devlog-first` | this repo |
| `/devlog` | *not mocked* — see §6.2 | this repo |
| `/devlog/[slug]` | `2b Devlog entry` | this repo |
| `/about` | `2c About` (includes contact) | this repo |
| `/press` | `2d Press kit` | this repo |
| `/contact` | *see §6.2* | this repo |
| `/gatekeep/*` | `2a` + the game | **`one-lane`**, via §4 |

### 6.2 Two gaps in the design, and how they are closed

**`/contact` is in every sidebar nav and has no screen.** The handoff says
`/about` "includes contact", and `2c` does carry the full contact block. So
`/contact` is **not a page**: the nav item points at `/about#contact`, and the
contact block gets that anchor id. One fewer page to keep in sync, and the nav
item still resolves to something that answers the question it asks.

**`/devlog` (the index) is not mocked.** It is derivable without invention:
screen `1c` draws the entry row — date in a fixed 110px mono column, title,
optional MILESTONE badge, separated by top hairlines — and `2b`'s sidebar draws
the full entry list. The index is `1c`'s list at full length in the standard
sidebar shell, with the `1c` page's "ALL ENTRIES →" link as its entry point. No
new vocabulary.

### 6.3 The shell

Three of the four screens (`1c`, `2b`, `2c`, `2d` — all but the home page's
feature band) share one layout: a `380px` Shade sidebar with a right hairline,
and a `1fr` main column, `min-height` full viewport. The sidebar's *contents*
vary by route (home gets the intro paragraph and signup; `2b` gets the entry
list; `2c` gets the portrait; `2d` gets the download button), so the shell takes
a slot rather than branching.

**Responsive is specified but not mocked.** Applying the handoff's rules: below
~900px the sidebar collapses to a top bar (mark + toggle), grids stack to one
column, minimum 24px side padding, touch targets ≥44px. The nav toggle is the
site's second and last piece of JavaScript.

---

## 7. Design tokens

Restated as canonical. **No colour outside this table appears anywhere in the
build.** These are the brand kit's values and the handoff is explicit: never
invent new ones.

| Token | Value | Role |
|---|---|---|
| District Green | `#1B342C` | anchor, default page background |
| Shade | `#10201B` | depth: sidebar, image wells, code blocks |
| Driving Mist | `#4A5D53` | link underlines, active UI |
| Earth Brown | `#5C4A3F` | accent **only** — badges, subscribe button; never a background ground |
| Moss Pale | `#C9CFC4` | body copy on dark |
| Slate Grey | `#7C8A83` | metadata, inactive nav, dividers |
| Paper | `#EFEEE8` | headings on dark, primary button fill, light ground |
| Hairline | `rgba(201,207,196,.12)` | 1px solid dividers |

Type: **Archivo** 500 for display (uppercase, `.06em`; `.22em` at wordmark
kickers), 400 for body at 15–17px / 1.6–1.75. **JetBrains Mono** 400–500 for
metadata, nav and system text, uppercase, `.10–.18em`.

Border radius is **`2px` everywhere**. No gradients on brand marks, no shadows,
no glow — the only gradient in the whole site is the photographic scrim over the
hero on `2a`, which lives in the other repo.

**The token layer is enforced, not merely documented.** A test fails the build on
a hex literal outside the token module. This mirrors `one-lane`'s
`test/no-literals.test.ts`, and it exists for the same reason: a palette that is
only a convention drifts within a month.

---

## 8. Blocked: the brand assets are missing

The handoff README lists four SVGs in `assets/`:

- `dryas-symbol-paper.svg` — the mark on dark grounds, used on every screen
- `dryas-symbol.svg` — District Green mark, for the light swatch on `2d`
- `dryas-symbol-small-cut.svg` — required at ≤28px, so: the favicon
- `dryas-lockup-horizontal-reversed.svg` — full lockup on dark, `2d`

**None of them were in the delivered bundle, and none are in `one-lane`** — its
`apps/web/public/` holds only the game's own `icon.svg` and
`icon-maskable.svg`, which are a different mark.

The build proceeds against those exact four filenames with a placeholder mark, so
that supplying the real files is a drop-in with no code change. But **the site
cannot be called done until they land**, and the brand rules that depend on them
(clearspace = axis length below the triangle; 20px minimum; the small-cut variant
below 28px; never on photography without a solid plate) cannot be verified
against a placeholder.

This is the one open dependency on the studio owner. Everything else in this
design is buildable today.

---

## 9. Deferred, with triggers

Nothing here is rejected.

| Thing | Trigger |
|---|---|
| Real key art, screenshots, portrait | Studio supplies them. Every image well is a placeholder until then, by design — the handoff says so. |
| The `2a` screen | `one-lane` takes it, with the OKLCH translation of §4.7. |
| Making `/gatekeep` indexable | `one-lane`'s beta decision, §4.6.3. Not this repo's call. |
| Video modal on `2a` ("WATCH 40s OF GAMEPLAY") | A video asset exists. Also `one-lane`'s screen. |
| Turnstile on the signup form | Actual spam, not anticipated spam. |
| Renaming the repo from `stone-memory` | Cosmetic. `dryas-studio-site` would read better; a GitHub rename keeps redirects, so this is free whenever. |

---

## 10. Open

1. **Does `basePath` + `output: "export"` place `out/` at the base path root?**
   §4.5. Asserted from the Next contract; verified by Task 1 of the plan, before
   any proxy code exists.
2. **Which email provider.** Buttondown is the default and the adapter makes it
   reversible, but nobody has actually signed up for an account yet.
3. **Who writes the placeholder copy that replaces the placeholder copy.** The
   handoff marks the Gatekeep pitch, the bio and the devlog bodies as the studio
   owner's to write. The build ships the mock's words until then, which is
   correct but should not be mistaken for finished.

---

*Routing lives here. Screens live here. The GATEKEEP side of the contract is
three named changes in §4.6 and nothing else — if this file and `one-lane`'s
`docs/GATEKEEP-deployment-v1.md` disagree about the game, that file wins.*
