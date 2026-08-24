# Handoff: dryasstudio.com — Studio Website

## Overview
Website UI for Dryas Studio (dryasstudio.com), a solo indie game studio building **Gatekeep** (hosted at dryasstudio.com/gatekeep). The chosen direction is "devlog-first / technical": a dark, mono-heavy index site with a persistent sidebar and route-style navigation. Five screens are specified: Home, /gatekeep, /devlog (entry), /about, /press.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. Recreate these designs in the target codebase's environment. The GATEKEEP repo already has `apps/web` — implement there using its existing framework and conventions; otherwise pick a simple static/SSG stack (Astro or plain HTML is a good fit for this site).

`Dryas Studio Site.dc.html` is a design-review canvas containing ALL screens side by side. Each screen is wrapped in a card with a `data-screen-label` attribute:
- `1c Devlog-first` — Home page (chosen direction; ignore `1a`, `1b` — rejected explorations)
- `2a Gatekeep landing` — /gatekeep
- `2b Devlog entry` — /devlog/:slug
- `2c About` — /about (includes contact)
- `2d Press kit` — /press

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy structure are final. Recreate pixel-perfectly. Copy explicitly marked "placeholder" (Gatekeep pitch, bio, devlog bodies) will be replaced by the studio owner — keep the layout, swap the words.

## Design Tokens (from the official Dryas brand kit)
Colors — never invent new ones:
- District Green `#1B342C` — anchor, default page background
- Shade `#10201B` — depth: sidebar, image wells, code blocks
- Driving Mist `#4A5D53` — links underlines, active UI
- Earth Brown `#5C4A3F` — accent ONLY (badges, subscribe button); never a background ground
- Moss Pale `#C9CFC4` — body copy on dark
- Slate Grey `#7C8A83` — metadata, inactive nav, dividers
- Paper `#EFEEE8` — headings on dark, primary button fill, light ground
- Hairline dividers: `rgba(201,207,196,.12)` (1px solid)

Typography (Google Fonts):
- Display/headings: **Archivo Medium (500)**, uppercase, letter-spacing `.06em` (headings) / `.22em` (wordmark-scale kickers)
- System/metadata/nav: **JetBrains Mono** 400–500, letter-spacing `.10–.18em`, uppercase
- Body: Archivo 400, 15–17px, line-height 1.6–1.75

Other:
- Border radius: `2px` everywhere (buttons, badges, inputs). Nothing rounder.
- No gradients on brand marks, no shadows, no glow (brand rule). The only gradient allowed is the photographic scrim over hero imagery.
- Buttons: primary = Paper bg / Shade text; secondary = 1px `rgba(201,207,196,.35)` border, transparent; accent (subscribe/join) = Earth Brown bg / Paper text. All JetBrains Mono 500, 12–13px, letter-spacing `.10em`, padding ~14–16px × 24–30px.

## Brand asset rules (from brand README)
- Mark 6A SVGs are in `assets/` (paper + green variants, small-cut for ≤28px, reversed lockup).
- Clearspace = axis length below the triangle; minimum size 20px; below 28px use `dryas-symbol-small-cut.svg`.
- Never place the mark on photography without a solid plate.

## Screens

### Home (`1c Devlog-first`)
- 1280px reference width. Grid: `380px sidebar | 1fr main`, min-height full viewport.
- **Sidebar** (Shade bg, right hairline, 48px/40px padding, flex column, 36–40px gaps): paper mark (64px), studio name (Archivo 500, 30px, caps, `.06em`), mono tagline "SOLO · GAMES · 2026" (`.32em` tracking, Slate), 1-paragraph intro (Archivo 14px/1.7 Moss Pale), route nav (mono 13px, `.12em`: `→ /gatekeep` active in Paper, rest Slate: /devlog /about /press /contact), email signup pinned to bottom (label + input + Earth Brown `→` button).
- **Main**: Gatekeep feature band (48–56px padding, bottom hairline): "CURRENT PROJECT" Earth Brown badge + "STATUS: IN DEVELOPMENT" mono meta; grid `1fr | 320px` — left: "GATEKEEP" Archivo 500 56px `.08em` Paper, pitch paragraph, outlined link button `dryasstudio.com/gatekeep →`; right: 200px screenshot well (Shade bg, hairline border).
- Devlog list: "DEVLOG — LATEST ENTRIES" kicker; rows separated by top hairlines: date (mono 12px Slate, 110px fixed) + title (Archivo 500 17px; latest Paper, older Moss Pale) + optional "MILESTONE" badge. "ALL ENTRIES →" link below.
- Footer: hairline top, © left, social links right (mono 11px `.14em` Slate).

### /gatekeep (`2a`)
- Full-width, no sidebar — it's the game's own landing.
- **Top nav** (22px/48px, bottom hairline): paper mark 26px + breadcrumb `dryasstudio.com/gatekeep` (mono; domain Slate, `/gatekeep` Paper); right: sub-routes `/overview` (active Paper) `/devlog` `/media` `/press`.
- **Hero**: 520px full-bleed key-art image, scrim `linear-gradient(180deg, transparent 40%, rgba(16,32,27,.9) 92%)`; bottom-left: kicker "A GAME BY DRYAS STUDIO — IN DEVELOPMENT" (mono `.22em`), "GATEKEEP" Archivo 500 96px `.08em` Paper.
- **CTA row** overlapping hero bottom by 26px (`translateY(-26px)`): primary "GET PLAYTEST INVITES", secondary "WATCH 40s OF GAMEPLAY" (Shade bg behind border), right-aligned meta "TARGET: PC · RELEASE TBA".
- **About grid** `1.2fr | 1fr`, 56px gap: left — "WHAT IS GATEKEEP" kicker, lede Archivo 22px/1.55 Paper, body paragraph Moss Pale (PLACEHOLDER copy); right — mono spec table, rows split label/value with hairlines: STATUS / DEVELOPER / PLATFORM / DEVLOG / PRESS KIT (last value is a link with Driving Mist underline).
- **Media**: 3-up grid of 200px image wells (16px gap).
- **Footer**: © + "← BACK TO THE STUDIO" link left; playtest email signup right (label, input, Earth Brown JOIN).

### /devlog entry (`2b`)
- Same 380px sidebar shell as Home, but nav shows `→ /devlog` active and below it an "ALL ENTRIES" list: mono 13px items, current entry highlighted with `rgba(201,207,196,.08)` bg pill (2px radius), others Slate.
- **Article** (72px/96px padding, max-width 860px): badge row ("MILESTONE" Earth Brown badge + "DEVLOG #04 · 2026-08-14 · 6 MIN" mono meta); H1 Archivo 500 44px/1.15 Paper (sentence case here, not caps); body Archivo 17px/1.75 Moss Pale.
- Figures: full-column image well (320px) + mono caption "FIG.01 — …" (11px `.12em` Slate).
- Stat/code block: JetBrains Mono 14px/1.8 on Shade, hairline border, 20–24px padding.
- Prev/next footer: hairline top, mono links left (`← #03 …` Slate) and right (`ALL ENTRIES →` Moss Pale).

### /about (`2c`)
- Sidebar shell (`→ /about` active) + 180×180 portrait slot in sidebar.
- Main (max-width 900px, 40px section gaps): kicker "ABOUT"; H1 "A STUDIO OF ONE, ON PURPOSE." Archivo 44px caps; bio paragraphs (PLACEHOLDER — note the Dryas octopetala naming story).
- Stats strip: 3 cells on Shade separated by hairline gaps (1px grid-gap trick with hairline bg): big mono number (28px Paper) + mono label (12px Slate).
- Contact block under hairline: mono rows, 90px label column (EMAIL / X / DISCORD / PRESS); email link Paper with Driving Mist underline.

### /press (`2d`)
- Sidebar shell (`→ /press` active) + primary button "DOWNLOAD FULL KIT (.ZIP)" in sidebar.
- Main: H1 "PRESS KIT"; two-column grid (56px gap):
  - Fact sheet: mono label/value rows with hairlines (STUDIO / TEAM / CURRENT TITLE / FOUNDED / CONTACT).
  - Logo & mark: 2-up swatches — paper mark on Shade, green mark on Paper — plus full-width reversed lockup on Shade; mono footnote about SVG/PNG + clearspace.
- Screenshots: 4-up grid of 130px image wells.

## Interactions & Behavior
- Nav/link hover: Slate `#7C8A83` → Moss Pale `#C9CFC4` (active items stay Paper). Body links: Driving Mist underline, text brightens to Paper on hover. ~120ms ease transitions; no motion beyond color.
- Buttons hover: primary Paper → pure `#FFFFFF`-ish lift or opacity .9; outlined buttons brighten border to `.6` alpha.
- Email signup: single input + submit; validate email format; success swaps form for a mono confirmation line. Wire to whatever list provider is chosen (Buttondown/etc.).
- /gatekeep "WATCH 40s OF GAMEPLAY": opens a video (modal or inline swap into the hero) — video asset TBD.
- Devlog: static content collection (markdown), newest first; MILESTONE is a frontmatter flag rendering the Earth Brown badge.
- Responsive (not mocked — apply these rules): sidebar collapses below ~900px into a top bar (mark + hamburger or wrapped route nav); grids stack to one column; /gatekeep hero drops to ~360px with GATEKEEP at ~48px; keep 24px side padding minimum. Hit targets ≥44px on touch.

## State Management
Static site + one form. No client state beyond: email form (idle/submitting/success/error), optional video modal open/closed, active-route highlighting from the router/current path.

## Assets
In `assets/` (from the official brand kit, v2.0):
- `dryas-symbol-paper.svg` — mark for dark grounds (used everywhere on this site)
- `dryas-symbol.svg` — District Green mark for light grounds (press page swatch)
- `dryas-symbol-small-cut.svg` — use at ≤28px (favicons, tiny UI)
- `dryas-lockup-horizontal-reversed.svg` — full lockup on dark
Game imagery: all image wells are placeholders (dashed drop zones in the mock) — real Gatekeep key art/screenshots to be supplied by the studio.
Fonts: Archivo + JetBrains Mono via Google Fonts (or self-host).

## Files
- `Dryas Studio Site.dc.html` — all screens (see `data-screen-label` mapping above). Every style is inline on the element — inspect any element in this file for exact values.
- `assets/*.svg` — brand marks.
