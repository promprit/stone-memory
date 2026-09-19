# Dryas Site v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sidebar-era site with the Claude Design "Dryas Site v3" look: dark ink ground, green accent, top header, five routes (`/`, `/services`, `/process`, `/about`, `/contact`) plus a restyled `/press` and `404`.

**Architecture:** Static Astro site, no client JavaScript. One layout (`Site.astro` = header + main + footer) replaces `Shell.astro`. Brand colours live only in `src/styles/tokens.css` (enforced by `npm test`). A new build-output check (`scripts/check-dist.mjs`) asserts every route's HTML; each task adds its routes to it first (red), then builds the page (green).

**Tech Stack:** Astro 7 (static), Fontsource (Space Grotesk, IBM Plex Mono, IBM Plex Sans Thai, Archivo Variable), plain CSS, Node ESM scripts, Cloudflare Pages.

**Spec:** `/Users/peemmacmini/Documents/DRYAS/site/docs/design/v3/Dryas Site v3.html` (Claude Design bundle; open in a browser to see it — the markup is gzip-packed, so read this plan for copy and styles). Its markup, copy and styles are transcribed into the tasks below; this plan is the spec. Owner decisions (2026-09-19): keep `/press`, restyled, linked from the footer only; remove the email signup UI but keep `functions/api/subscribe.ts`; ship the Thai lines.

**Kilo/Cline workspace:** `/Users/peemmacmini/Documents/DRYAS/site`

**Branch:** create `site-v3` from `main` (main is ahead of origin by one docs commit; nothing else needs merging first).

**Ledger:** `/Users/peemmacmini/Documents/DRYAS/site/.superpowers/sdd/2026-09-19-dryas-site-v3/progress.md`

## Global Constraints

- Shell rule: every command starts with `cd /Users/peemmacmini/Documents/DRYAS/site && …`. If a command fails, change it before retrying; never rerun it unchanged.
- First command on the branch: `cd /Users/peemmacmini/Documents/DRYAS/site && npm ci` (node_modules is absent).
- Colour literals (hex, `rgb()`, `hsl()`) only in `src/styles/tokens.css`. `npm test` fails otherwise. SVG strokes use `style="stroke: var(--accent)"`, never a hex.
- Palette (exact): ink `#0a0a0f`, fg `#edefea`, muted `#98a29b`, accent `#5fb884`, deep `#173d2e`, hairline `rgba(237, 239, 234, 0.08)`, underline `rgba(237, 239, 234, 0.2)`.
- Fonts self-hosted via Fontsource only; no Google Fonts link, no CDN.
- No client `<script>` anywhere in `src/`. No `data-signup` in any page.
- 2px radius everywhere. Motion: colour/border/background transitions at `120ms ease` only.
- Copy is exactly as written in the tasks (English + Thai). Do not rephrase.
- Do not touch `functions/`, `public/_routes.json`, or `public/_redirects`.
- Commit after each task with the message given in its last step.
- Every page: exactly one `<h1>`; nav has exactly one `aria-current="page"` on routed pages, none on `/`, `/press` and `404`.

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `scripts/check-dist.mjs` | create | Asserts built HTML per route (chrome, active nav, h1 count, Thai, key copy) |
| `package.json` | modify | Font deps; `test:dist` script; `verify` runs it |
| `src/styles/tokens.css` | rewrite | v3 palette, fonts, geometry |
| `src/styles/base.css` | rewrite | Reset + shared primitives (`.wrap`, `.kicker`, `.btn`, `.link-arrow`, `.cells`, `.th`, `.page-title`, `.lede`) |
| `src/lib/tokens.ts` | modify | Export `ink`, `accent` instead of old names |
| `src/layouts/Base.astro` | rewrite | Document shell: fonts, meta, favicon, skip link |
| `src/layouts/Site.astro` | create | Header + main + footer layout |
| `src/components/Mark.astro` | create | Inline Dryas mark SVG, accent stroke |
| `src/components/SiteHeader.astro` | create | Logo lockup + `/SERVICES /PROCESS /ABOUT /CONTACT` nav |
| `src/components/SiteFooter.astro` | create | Small mark, ©, `/PRESS`, tagline |
| `public/assets/dryas-favicon-v3.svg` | create | Accent favicon on ink |
| `src/pages/index.astro` | rewrite | Home |
| `src/pages/services.astro` | create | Services |
| `src/pages/process.astro` | create | Process |
| `src/pages/about.astro` | rewrite | About |
| `src/pages/contact.astro` | create | Contact |
| `src/pages/press.astro` | rewrite | Press kit in v3 style |
| `src/pages/404.astro` | rewrite | Not found |
| `src/layouts/Shell.astro`, `src/components/SidebarNav.astro`, `src/components/StudioFooter.astro`, `src/components/EmailSignup.astro`, `src/components/ImageWell.astro`, `src/lib/images.ts` | delete (Task 6) | Sidebar-era code |
| `README.md` | modify (Task 6) | Remove stale sidebar/signup/favicon notes |

---

### Task 1: Foundation — tokens, layout, chrome, dist check, 404

**Files:**
- Create: `scripts/check-dist.mjs`, `src/layouts/Site.astro`, `src/components/Mark.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `public/assets/dryas-favicon-v3.svg`
- Modify: `package.json`, `src/lib/tokens.ts`
- Rewrite: `src/styles/tokens.css`, `src/styles/base.css`, `src/layouts/Base.astro`, `src/pages/404.astro`

**Interfaces:**
- Produces: `Site.astro` props `{ title: string; description?: string; bareTitle?: boolean; active?: Route }`; `Route = 'services' | 'process' | 'about' | 'contact'` exported from `SiteHeader.astro`; `Mark.astro` props `{ size: number; variant?: 'full' | 'small'; strokeWidth?: number; label?: string; class?: string }`; CSS classes in base.css listed in the File Structure; `check-dist.mjs` `PAGES` array that later tasks append to.

- [ ] **Step 1: Install fonts and add the dist-check script entry**

```bash
cd /Users/peemmacmini/Documents/DRYAS/site && npm ci && npm install @fontsource/space-grotesk@^5.3.0 @fontsource/ibm-plex-mono@^5.3.0 @fontsource/ibm-plex-sans-thai@^5.3.0
```

Then edit the `scripts` block of `package.json` to exactly:

```json
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check && tsc --noEmit -p functions",
    "test": "node scripts/check-literals.mjs",
    "test:dist": "node scripts/check-dist.mjs",
    "verify": "npm run test && npm run check && npm run build && npm run test:dist"
  },
```

- [ ] **Step 2: Write the failing dist check**

Create `scripts/check-dist.mjs`:

```js
#!/usr/bin/env node
/**
 * Build-output check. Run after `astro build`.
 *
 * Every page must carry the shared chrome (header nav + footer), exactly one
 * <h1>, the right active nav item, its own key copy, and Thai text only where
 * the design puts it. Later tasks append their routes to PAGES.
 *
 * Run: npm run build && npm run test:dist
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));

/** Present on every page. */
const CHROME = [
  'aria-label="Site"',
  'href="/services"',
  'href="/process"',
  'href="/about"',
  'href="/contact"',
  'href="/press"',
  'DESIGN → DEPLOY · BANGKOK',
];

/** Never present on any page. */
const FORBIDDEN = ['data-signup', '<script', 'fonts.googleapis.com'];

/**
 * file:   path under dist/
 * active: nav route that carries aria-current="page", or null
 * thai:   whether the page renders lang="th" text
 * must:   substrings unique to the page
 */
const PAGES = [
  { file: '404.html', active: null, thai: false, must: ['Page not found', '← BACK TO HOME'] },
];

const failures = [];

for (const { file, active, thai, must } of PAGES) {
  const path = join(dist, file);
  if (!existsSync(path)) {
    failures.push(`${file}: missing (did the build run?)`);
    continue;
  }
  const html = readFileSync(path, 'utf8');
  const fail = (msg) => failures.push(`${file}: ${msg}`);

  for (const s of [...CHROME, ...must]) if (!html.includes(s)) fail(`missing ${JSON.stringify(s)}`);
  for (const s of FORBIDDEN) if (html.includes(s)) fail(`contains forbidden ${JSON.stringify(s)}`);

  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) fail(`expected 1 <h1>, found ${h1s.length}`);

  const current = html.match(/aria-current="page"/g) ?? [];
  if (active === null) {
    if (current.length !== 0) fail(`expected no aria-current, found ${current.length}`);
  } else {
    if (current.length !== 1) fail(`expected 1 aria-current, found ${current.length}`);
    if (!new RegExp(`href="/${active}"[^>]*aria-current="page"`).test(html)) {
      fail(`nav item /${active} is not marked current`);
    }
  }

  const hasThai = html.includes('lang="th"');
  if (hasThai !== thai) fail(thai ? 'missing lang="th" text' : 'unexpected lang="th" text');
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} dist check failure${failures.length === 1 ? '' : 's'}:\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error('');
  process.exit(1);
}

console.log(`✓ dist check passed for ${PAGES.length} page${PAGES.length === 1 ? '' : 's'}`);
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm run build && npm run test:dist`
Expected: FAIL — `404.html: missing "aria-label=\"Site\""` (and other chrome strings). The old 404 uses the sidebar shell.

- [ ] **Step 4: Rewrite the tokens**

Replace `src/styles/tokens.css` entirely:

```css
/*
 * Dryas Studio brand tokens — site v3 (Claude Design "Dryas Site v3").
 *
 * THIS IS THE ONLY FILE IN THE BUILD THAT MAY CONTAIN A COLOUR LITERAL.
 * `npm test` (scripts/check-literals.mjs) fails on a hex, rgb() or hsl()
 * anywhere in src/pages, src/layouts or src/components.
 */

:root {
  /* ── Palette ────────────────────────────────────────────────────────── */
  --ink: #0a0a0f;    /* page ground                                       */
  --fg: #edefea;     /* headings, primary text                            */
  --muted: #98a29b;  /* body copy, metadata, inactive nav                 */
  --accent: #5fb884; /* mark, active nav, numerals, button border         */
  --deep: #173d2e;   /* primary button fill                               */

  /* ── Derived ────────────────────────────────────────────────────────── */
  --hairline: rgba(237, 239, 234, 0.08);  /* 1px dividers, cell gaps      */
  --underline: rgba(237, 239, 234, 0.2);  /* quiet link underline         */

  /* ── Type ───────────────────────────────────────────────────────────── */
  --font-sans: 'Space Grotesk', 'IBM Plex Sans Thai', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-thai: 'IBM Plex Sans Thai', system-ui, sans-serif;
  --font-wordmark: 'Archivo Variable', Archivo, system-ui, sans-serif;

  /* ── Geometry ───────────────────────────────────────────────────────── */
  --radius: 2px;
  --max-w: 1160px;
  --gutter: 40px;

  /* ── Motion ─────────────────────────────────────────────────────────── */
  --t: 120ms ease;
}

/* Phones: keep a 20px side gutter so nothing scrolls sideways. */
@media (max-width: 600px) {
  :root {
    --gutter: 20px;
  }
}
```

- [ ] **Step 5: Rewrite the base layer**

Replace `src/styles/base.css` entirely:

```css
/*
 * Base layer: reset plus the primitives every v3 page shares.
 * Colours come from tokens.css only.
 */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  background: var(--ink);
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img,
svg {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
  transition: color var(--t), border-color var(--t), background var(--t), opacity var(--t);
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

::selection {
  background: var(--accent);
  color: var(--ink);
}

h1,
h2,
h3,
p,
dl,
dd,
ol {
  margin: 0;
}

/* ── Layout ───────────────────────────────────────────────────────────── */

/* Centred 1160px column with the side gutter. */
.wrap {
  width: 100%;
  max-width: var(--max-w);
  margin: 0 auto;
  padding-inline: var(--gutter);
}

.rule-top {
  border-top: 1px solid var(--hairline);
}

/* Hairline grid: a 1px gap over a hairline ground draws the dividers. */
.cells {
  display: grid;
  gap: 1px;
  background: var(--hairline);
  max-width: var(--max-w);
  margin: 0 auto;
}
.cells > * {
  background: var(--ink);
}

/* ── Type ─────────────────────────────────────────────────────────────── */

.kicker {
  font: 400 11px var(--font-mono);
  letter-spacing: 0.24em;
  color: var(--muted);
  text-transform: uppercase;
}

.page-title {
  font: 600 clamp(38px, 5vw, 64px) / 1.05 var(--font-sans);
  letter-spacing: -0.035em;
  color: var(--fg);
  text-wrap: balance;
}

.lede {
  font: 400 17px/1.7 var(--font-sans);
  color: var(--muted);
  max-width: 52ch;
}

/* Thai lines: always lang="th", always Plex Sans Thai. */
.th {
  font: 400 15px/1.8 var(--font-thai);
  color: var(--muted);
}

.accent {
  color: var(--accent);
}

/* ── Actions ──────────────────────────────────────────────────────────── */

/* Primary: deep fill, accent border; hover fills accent. */
.btn {
  display: inline-block;
  font: 500 13px var(--font-mono);
  letter-spacing: 0.12em;
  background: var(--deep);
  color: var(--fg);
  border: 1px solid var(--accent);
  padding: 16px 30px;
  border-radius: var(--radius);
}
.btn:hover {
  background: var(--accent);
  color: var(--ink);
}

/* Secondary: mono text with a quiet underline; hover turns accent. */
.link-arrow {
  font: 500 13px var(--font-mono);
  letter-spacing: 0.12em;
  color: var(--muted);
  border-bottom: 1px solid var(--underline);
  padding-bottom: 3px;
}
.link-arrow:hover {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Update the token reader**

In `src/lib/tokens.ts`, replace the four `export const` lines at the bottom with:

```ts
export const ink = token('ink');
export const accent = token('accent');
```

- [ ] **Step 7: Create the accent favicon**

Create `public/assets/dryas-favicon-v3.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="32" height="32" role="img" aria-label="Dryas Studio favicon">
  <rect width="120" height="120" fill="#0A0A0F"></rect>
  <g fill="none" stroke="#5FB884" stroke-width="10" stroke-linejoin="round">
    <path d="M60 28 90 82H30Z"></path>
    <path d="M60 80V108"></path>
  </g>
</svg>
```

- [ ] **Step 8: Rewrite Base.astro**

Replace `src/layouts/Base.astro` entirely:

```astro
---
/**
 * The document shell. Everything on the site renders inside this.
 *
 * Fonts are self-hosted via Fontsource (the design links Google Fonts; a
 * production page should not add a third-party connection to its critical
 * path). Only the weights the design uses are imported.
 */
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-ext-400.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-ext-600.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-ext-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-ext-500.css';
import '@fontsource/ibm-plex-sans-thai/thai-400.css';
import '@fontsource-variable/archivo';
import '../styles/tokens.css';
import '../styles/base.css';
import { ink } from '../lib/tokens';

interface Props {
  title: string;
  description?: string;
  /** Titles that already carry the name (the home page) skip the suffix. */
  bareTitle?: boolean;
}

const {
  title,
  description = 'Dryas Studio is a digital agency in Bangkok. Sidecraft, our service, takes websites from design to deploy in weeks — then runs them.',
  bareTitle = false,
} = Astro.props;

const fullTitle = bareTitle ? title : `${title} — Dryas Studio`;
const canonical = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="icon" href="/assets/dryas-favicon-v3.svg" type="image/svg+xml" />
    <meta name="theme-color" content={ink} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Dryas Studio" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta name="twitter:card" content="summary" />
  </head>
  <body>
    <a href="#main" class="skip">Skip to content</a>
    <slot />
    <style>
      .skip {
        position: absolute;
        left: -9999px;
        top: 0;
        z-index: 100;
        background: var(--accent);
        color: var(--ink);
        font: 500 12px var(--font-mono);
        letter-spacing: 0.1em;
        padding: 12px 18px;
        border-radius: var(--radius);
      }
      .skip:focus {
        left: 12px;
        top: 12px;
      }
    </style>
  </body>
</html>
```

- [ ] **Step 9: Create Mark.astro**

Create `src/components/Mark.astro`:

```astro
---
/**
 * The Dryas mark — canopy, crown and root in one triangle — stroked in the
 * accent. `small` is the two-path cut for 16–28px sizes. Pass `label` when
 * the mark carries meaning; without it the SVG is decorative.
 */
interface Props {
  size: number;
  variant?: 'full' | 'small';
  strokeWidth?: number;
  label?: string;
  class?: string;
}

const { size, variant = 'full', strokeWidth, label, class: className } = Astro.props;
const stroke = strokeWidth ?? (variant === 'small' ? 10 : 3.4);
---

<svg
  class={className}
  width={size}
  height={size}
  viewBox="0 0 120 120"
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
>
  <g fill="none" stroke-width={stroke} stroke-linejoin="round" style="stroke: var(--accent)">
    <path d="M60 26 92 84H28Z"></path>
    {variant === 'full' && <path d="M60 48 76 82H44Z"></path>}
    <path d="M60 84V108"></path>
  </g>
</svg>
```

- [ ] **Step 10: Create SiteHeader.astro**

Create `src/components/SiteHeader.astro`:

```astro
---
/**
 * Top bar: mark + DRYAS / STUDIO lockup on the left, route nav on the right.
 * Active route is accent; the rest are muted and brighten to fg on hover.
 */
import Mark from './Mark.astro';

export type Route = 'services' | 'process' | 'about' | 'contact';

interface Props {
  active?: Route;
}

const { active } = Astro.props;

const items: { key: Route; label: string; href: string }[] = [
  { key: 'services', label: '/SERVICES', href: '/services' },
  { key: 'process', label: '/PROCESS', href: '/process' },
  { key: 'about', label: '/ABOUT', href: '/about' },
  { key: 'contact', label: '/CONTACT', href: '/contact' },
];
---

<header class="header">
  <a href="/" class="brand" aria-label="Dryas Studio — home">
    <Mark size={38} />
    <span class="lockup" aria-hidden="true">
      <span class="name">DRYAS</span>
      <span class="sub">STUDIO</span>
    </span>
  </a>
  <nav class="nav" aria-label="Site">
    {
      items.map(({ key, label, href }) => (
        <a
          href={href}
          class:list={['item', { active: key === active }]}
          aria-current={key === active ? 'page' : undefined}
        >
          {label}
        </a>
      ))
    }
  </nav>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 18px var(--gutter);
    border-bottom: 1px solid var(--hairline);
    flex-wrap: wrap;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .lockup {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }

  .name {
    font: 500 17px var(--font-wordmark);
    letter-spacing: 0.22em;
    color: var(--fg);
  }

  .sub {
    font: 400 8px var(--font-mono);
    letter-spacing: 0.62em;
    color: var(--accent);
    margin-top: 4px;
  }

  .nav {
    display: flex;
    gap: 28px;
    font: 500 12px var(--font-mono);
    letter-spacing: 0.14em;
    flex-wrap: wrap;
  }

  .item {
    color: var(--muted);
  }
  .item:hover {
    color: var(--fg);
  }
  .item.active {
    color: var(--accent);
  }

  @media (max-width: 600px) {
    .nav {
      gap: 0 20px;
    }
    /* >=44px touch target without changing the type. */
    .item {
      padding: 14px 0;
    }
  }
</style>
```

- [ ] **Step 11: Create SiteFooter.astro**

Create `src/components/SiteFooter.astro`:

```astro
---
/**
 * Footer: small mark + copyright left; /PRESS and the tagline right.
 * /press is not in the header nav (the design has four routes), so this is
 * its only entry point.
 */
import Mark from './Mark.astro';

const year = new Date().getFullYear();
---

<footer class="footer">
  <span class="left">
    <Mark size={16} variant="small" />
    <span class="meta">© {year} DRYAS STUDIO</span>
  </span>
  <span class="right">
    <a href="/press" class="meta press">/PRESS</a>
    <span class="meta">DESIGN → DEPLOY · BANGKOK</span>
  </span>
</footer>

<style>
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding: 24px var(--gutter);
    border-top: 1px solid var(--hairline);
    flex-wrap: wrap;
  }

  .left,
  .right {
    display: flex;
    align-items: center;
    gap: 10px 24px;
    flex-wrap: wrap;
  }
  .left {
    gap: 10px;
  }

  .meta {
    font: 400 11px var(--font-mono);
    letter-spacing: 0.16em;
    color: var(--muted);
  }

  .press:hover {
    color: var(--fg);
  }
</style>
```

- [ ] **Step 12: Create Site.astro**

Create `src/layouts/Site.astro`:

```astro
---
/**
 * The v3 page layout: header, main column, footer, full-viewport min-height.
 * `active` marks the current route in the header nav; omit it on /, /press
 * and 404, which are not in the nav.
 */
import Base from './Base.astro';
import SiteHeader from '../components/SiteHeader.astro';
import type { Route } from '../components/SiteHeader.astro';
import SiteFooter from '../components/SiteFooter.astro';

interface Props {
  title: string;
  description?: string;
  bareTitle?: boolean;
  active?: Route;
}

const { title, description, bareTitle, active } = Astro.props;
---

<Base title={title} description={description} bareTitle={bareTitle}>
  <div class="site">
    <SiteHeader active={active} />
    <main id="main" class="main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</Base>

<style>
  .site {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
```

- [ ] **Step 13: Rewrite 404.astro**

Replace `src/pages/404.astro` entirely:

```astro
---
/**
 * 404. Astro emits dist/404.html; Cloudflare Pages serves it with a real 404
 * status for any unmatched path, instead of a soft 404 on index.html.
 */
import Site from '../layouts/Site.astro';
---

<Site title="Not found" description="That page does not exist.">
  <section class="wrap page">
    <p class="kicker">404</p>
    <h1 class="page-title title">Page not found</h1>
    <p class="lede body">That address does not exist, or it has moved.</p>
    <a href="/" class="link-arrow">← BACK TO HOME</a>
  </section>
</Site>

<style>
  .page {
    padding-block: clamp(56px, 8vw, 110px) 96px;
  }
  .title {
    margin-top: 24px;
  }
  .body {
    margin: 22px 0 40px;
  }
</style>
```

- [ ] **Step 14: Run the checks to confirm they pass**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm test && npm run build && npm run test:dist`
Expected: `✓ no colour literals …`, build succeeds, `✓ dist check passed for 1 page`.

Note: `astro check` is not run yet — `index/about/press` still import the old `Shell`, which still exists; `npm run check` is gated at Task 6. If `npm run build` fails because the old pages reference removed tokens, that is fine only if the error is a CSS custom property warning — Astro does not fail on unknown `var()`. Any hard build error must be fixed before committing.

- [ ] **Step 15: Commit**

```bash
cd /Users/peemmacmini/Documents/DRYAS/site && git add -A && git commit -m "feat(site): v3 foundation — tokens, header/footer layout, dist check, 404"
```

---

### Task 2: Home page

**Files:**
- Rewrite: `src/pages/index.astro`
- Modify: `scripts/check-dist.mjs` (PAGES)

**Interfaces:**
- Consumes: `Site.astro`, `Mark.astro`, base.css classes from Task 1.

- [ ] **Step 1: Add the home route to the dist check**

In `scripts/check-dist.mjs`, add this entry as the first element of `PAGES`:

```js
  {
    file: 'index.html',
    active: null,
    thai: true,
    must: [
      'Websites that ship in',
      'START A PROJECT',
      'HOW IT WORKS →',
      'Weeks to live',
      'Monitoring after launch',
      'BrewMind',
      'Collex',
      'จากดีไซน์ถึงเปิดใช้งานจริงในไม่กี่สัปดาห์ แล้วดูแลต่อหลังเปิดตัว',
    ],
  },
```

- [ ] **Step 2: Run to confirm it fails**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm run build && npm run test:dist`
Expected: FAIL — `index.html: missing "aria-label=\"Site\""` and missing home copy.

- [ ] **Step 3: Rewrite index.astro**

Replace `src/pages/index.astro` entirely:

```astro
---
/**
 * Home — hero, three-stat strip, "In production" client list.
 */
import Site from '../layouts/Site.astro';
import Mark from '../components/Mark.astro';

const stats = [
  { value: '01', label: 'Service — Sidecraft' },
  { value: '2–4', label: 'Weeks to live' },
  { value: '24/7', label: 'Monitoring after launch' },
];

const work = [
  { name: 'BrewMind', pitch: 'AI coffee recipe platform — dark-first SaaS.' },
  { name: 'Collex', pitch: 'Collectibles retail — landing, gallery and contact at mycollex.com.' },
];
---

<Site title="Dryas Studio — websites that ship in weeks" bareTitle>
  <section class="wrap hero">
    <Mark size={560} strokeWidth={2} class="watermark" />
    <p class="kicker">Digital agency · Bangkok · 2026</p>
    <h1 class="headline">Websites that ship in <span class="accent">weeks.</span></h1>
    <p class="intro">
      Design to deploy, one studio, no hand-offs. Then monitoring, incidents and changes — handled,
      for years.
    </p>
    <p lang="th" class="th intro-th">จากดีไซน์ถึงเปิดใช้งานจริงในไม่กี่สัปดาห์ แล้วดูแลต่อหลังเปิดตัว</p>
    <div class="actions">
      <a href="/contact" class="btn">START A PROJECT</a>
      <a href="/process" class="link-arrow">HOW IT WORKS →</a>
    </div>
  </section>

  <section class="rule-top" aria-label="Studio at a glance">
    <div class="cells stats">
      {
        stats.map(({ value, label }) => (
          <div class="stat">
            <div class="stat-value">{value}</div>
            <div class="stat-label">{label}</div>
          </div>
        ))
      }
    </div>
  </section>

  <section class="rule-top work-band">
    <div class="wrap">
      <h2 class="kicker work-head">In production</h2>
      <ul class="work">
        {
          work.map(({ name, pitch }) => (
            <li class="row">
              <span class="row-name">{name}</span>
              <span class="row-pitch">{pitch}</span>
            </li>
          ))
        }
      </ul>
    </div>
  </section>
</Site>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    padding-block: clamp(72px, 11vw, 150px) 80px;
  }

  /* Oversized mark behind the hero copy, as in the design. */
  .hero :global(.watermark) {
    position: absolute;
    right: -40px;
    top: 50%;
    transform: translateY(-50%);
    width: min(46vw, 560px);
    height: auto;
    opacity: 0.1;
    pointer-events: none;
  }

  .hero .kicker {
    margin-bottom: 30px;
  }

  .headline {
    font: 600 clamp(46px, 7.5vw, 100px) / 1 var(--font-sans);
    letter-spacing: -0.04em;
    color: var(--fg);
    max-width: 13ch;
    text-wrap: balance;
  }

  .intro {
    margin-top: 30px;
    font: 400 18px/1.7 var(--font-sans);
    color: var(--muted);
    max-width: 46ch;
  }

  .intro-th {
    margin-top: 12px;
    max-width: 46ch;
  }

  .actions {
    display: flex;
    gap: 16px;
    margin-top: 48px;
    flex-wrap: wrap;
    align-items: center;
  }

  .stats {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .stat {
    padding: 34px var(--gutter);
  }

  .stat-value {
    font: 500 28px var(--font-mono);
    color: var(--accent);
  }

  .stat-label {
    font: 400 11px var(--font-mono);
    letter-spacing: 0.16em;
    color: var(--muted);
    text-transform: uppercase;
    margin-top: 10px;
  }

  .work-band {
    padding-block: 56px 80px;
  }

  .work-head {
    margin-bottom: 8px;
  }

  .work {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .row {
    display: flex;
    gap: 8px 32px;
    padding: 22px 0;
    border-bottom: 1px solid var(--hairline);
    flex-wrap: wrap;
    align-items: baseline;
  }

  .row-name {
    width: 160px;
    flex: none;
    font: 600 17px var(--font-sans);
    letter-spacing: -0.01em;
    color: var(--fg);
  }

  .row-pitch {
    font: 400 14px/1.6 var(--font-sans);
    color: var(--muted);
  }
</style>
```

- [ ] **Step 4: Run to confirm it passes**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm test && npm run build && npm run test:dist`
Expected: PASS — `✓ dist check passed for 2 pages`.

- [ ] **Step 5: Commit**

```bash
cd /Users/peemmacmini/Documents/DRYAS/site && git add -A && git commit -m "feat(site): v3 home page"
```

---

### Task 3: Services and Process pages

**Files:**
- Create: `src/pages/services.astro`, `src/pages/process.astro`
- Modify: `scripts/check-dist.mjs` (PAGES)

**Interfaces:**
- Consumes: `Site.astro` with `active="services"` / `active="process"`; base.css classes.

- [ ] **Step 1: Add both routes to the dist check**

Append to `PAGES` in `scripts/check-dist.mjs`:

```js
  {
    file: 'services/index.html',
    active: 'services',
    thai: false,
    must: [
      'Sidecraft',
      'Brand-true screens, real copy, every state',
      'Uptime checks every 15 minutes',
      'GET A QUOTE',
      'fixed price book',
    ],
  },
  {
    file: 'process/index.html',
    active: 'process',
    thai: false,
    must: ['Scope', 'Days 1–3', 'Weeks 2–3', 'Ship + care', 'Week 4 →', 'nine-point QA gate'],
  },
```

- [ ] **Step 2: Run to confirm it fails**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm run build && npm run test:dist`
Expected: FAIL — `services/index.html: missing (did the build run?)` and same for process.

- [ ] **Step 3: Create services.astro**

Create `src/pages/services.astro`:

```astro
---
/**
 * /services — Sidecraft, the one service: four stages, then a quote CTA.
 */
import Site from '../layouts/Site.astro';

const stages = [
  { n: '01', title: 'Design', body: 'Brand-true screens, real copy, every state — signed off before a line of code.' },
  { n: '02', title: 'Build', body: 'Static-first, fast by default. Performance budgets are requirements, not hopes.' },
  { n: '03', title: 'Deploy', body: 'Edge hosting, custom domain, SSL — live on your own infrastructure, not ours.' },
  { n: '04', title: 'Care', body: 'Uptime checks every 15 minutes, incident handling, changes on request.' },
];
---

<Site
  title="Services"
  description="Sidecraft takes a website from first scope to live production, then stays on as its operator. Fixed scope, weekly cadence."
  active="services"
>
  <section class="wrap intro">
    <p class="kicker">Services</p>
    <h1 class="page-title title">Sidecraft<span class="accent">.</span></h1>
    <p class="lede body">
      One service, the whole delivery: we take a website from first scope to live production — then
      stay on as its operator. Fixed scope, weekly cadence, no agency overhead.
    </p>
  </section>

  <section class="rule-top">
    <div class="cells stages">
      {
        stages.map(({ n, title, body }) => (
          <div class="stage">
            <div class="n">{n}</div>
            <h2 class="stage-title">{title}</h2>
            <p class="stage-body">{body}</p>
          </div>
        ))
      }
    </div>
  </section>

  <section class="rule-top cta-band">
    <div class="wrap cta">
      <p class="cta-copy">
        Every engagement is quoted up front against a fixed price book — you know the number before
        we start.
      </p>
      <a href="/contact" class="btn">GET A QUOTE</a>
    </div>
  </section>
</Site>

<style>
  .intro {
    padding-block: clamp(56px, 8vw, 110px) 64px;
  }
  .title {
    margin-top: 24px;
  }
  .body {
    margin-top: 22px;
  }

  .stages {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .stage {
    padding: 36px var(--gutter);
  }

  .n {
    font: 500 13px var(--font-mono);
    color: var(--accent);
  }

  .stage-title {
    font: 600 19px var(--font-sans);
    color: var(--fg);
    margin-top: 14px;
  }

  .stage-body {
    font: 400 14px/1.65 var(--font-sans);
    color: var(--muted);
    margin-top: 10px;
  }

  .cta-band {
    padding-block: 56px 80px;
  }

  .cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }

  .cta-copy {
    font: 400 16px/1.6 var(--font-sans);
    color: var(--muted);
    max-width: 50ch;
  }
</style>
```

- [ ] **Step 4: Create process.astro**

Create `src/pages/process.astro`:

```astro
---
/**
 * /process — four numbered steps with their timing.
 */
import Site from '../layouts/Site.astro';

const steps = [
  {
    n: '01',
    title: 'Scope',
    body: 'A short call, then a fixed quote from the price book. Pages, features, deadline — agreed in writing before anything starts.',
    when: 'Days 1–3',
  },
  {
    n: '02',
    title: 'Design',
    body: 'High-fidelity screens with your real content, reviewed live. One round of revisions is in every quote.',
    when: 'Week 1',
  },
  {
    n: '03',
    title: 'Build',
    body: 'An eight-step build checklist, visible to you, with a staging link from day one. A nine-point QA gate before anything goes live.',
    when: 'Weeks 2–3',
  },
  {
    n: '04',
    title: 'Ship + care',
    body: 'Go-live on your domain, then monitoring every 15 minutes, incident response, and change requests at a fixed rate.',
    when: 'Week 4 →',
  },
];
---

<Site
  title="Process"
  description="Four steps, one owner, weekly checkpoints: scope, design, build, then ship and care."
  active="process"
>
  <section class="wrap intro">
    <p class="kicker">Process</p>
    <h1 class="page-title title">Design <span class="accent">→</span> deploy.</h1>
    <p class="lede body">
      Four steps, one owner, weekly checkpoints. You see the real site every week — never a slide
      deck of promises.
    </p>
  </section>

  <section class="wrap steps-band">
    <ol class="steps">
      {
        steps.map(({ n, title, body, when }) => (
          <li class="step">
            <span class="n">{n}</span>
            <div class="step-main">
              <h2 class="step-title">{title}</h2>
              <p class="step-body">{body}</p>
            </div>
            <span class="when">{when}</span>
          </li>
        ))
      }
    </ol>
  </section>
</Site>

<style>
  .intro {
    padding-block: clamp(56px, 8vw, 110px) 56px;
  }
  .title {
    margin-top: 24px;
  }
  .body {
    margin-top: 22px;
  }

  .steps-band {
    padding-bottom: 80px;
  }

  .steps {
    list-style: none;
    padding: 0;
  }

  .step {
    display: flex;
    gap: 16px 32px;
    padding: 32px 0;
    border-top: 1px solid var(--hairline);
    flex-wrap: wrap;
  }
  .step:last-child {
    border-bottom: 1px solid var(--hairline);
  }

  .n {
    width: 80px;
    flex: none;
    font: 500 30px var(--font-mono);
    color: var(--accent);
  }

  .step-main {
    flex: 1;
    min-width: 260px;
  }

  .step-title {
    font: 600 20px var(--font-sans);
    color: var(--fg);
  }

  .step-body {
    font: 400 15px/1.65 var(--font-sans);
    color: var(--muted);
    margin-top: 8px;
    max-width: 56ch;
  }

  .when {
    font: 400 11px var(--font-mono);
    letter-spacing: 0.14em;
    color: var(--muted);
    text-transform: uppercase;
  }

  @media (max-width: 600px) {
    .step-main {
      min-width: 0;
      flex-basis: 100%;
    }
  }
</style>
```

- [ ] **Step 5: Run to confirm it passes**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm test && npm run build && npm run test:dist`
Expected: PASS — `✓ dist check passed for 4 pages`.

- [ ] **Step 6: Commit**

```bash
cd /Users/peemmacmini/Documents/DRYAS/site && git add -A && git commit -m "feat(site): v3 services and process pages"
```

---

### Task 4: About and Contact pages

**Files:**
- Rewrite: `src/pages/about.astro`
- Create: `src/pages/contact.astro`
- Modify: `scripts/check-dist.mjs` (PAGES)

**Interfaces:**
- Consumes: `Site.astro` with `active="about"` / `active="contact"`, `Mark.astro`.

- [ ] **Step 1: Add both routes to the dist check**

Append to `PAGES`:

```js
  {
    file: 'about/index.html',
    active: 'about',
    thai: true,
    must: [
      'A studio of one, built like a system.',
      'Dryas octopetala',
      'Sidecraft OS',
      'aria-label="Dryas Studio mark"',
      'EN · TH',
      'สตูดิโอเล็ก ๆ ในกรุงเทพฯ ที่ออกแบบ สร้าง และดูแลเว็บไซต์เองทุกขั้นตอน',
    ],
  },
  {
    file: 'contact/index.html',
    active: 'contact',
    thai: true,
    must: [
      'Tell us what you need live in four weeks.',
      'href="mailto:hello@dryasstudio.com"',
      'href="https://x.com/dryasstudio"',
      'One business day',
      'คุยกันก่อนได้ ไม่มีค่าใช้จ่าย — ตอบกลับภายในหนึ่งวันทำการ',
    ],
  },
```

- [ ] **Step 2: Run to confirm it fails**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm run build && npm run test:dist`
Expected: FAIL — `about/index.html: missing "aria-label=\"Site\""` (old sidebar page) and `contact/index.html: missing (did the build run?)`.

- [ ] **Step 3: Rewrite about.astro**

Replace `src/pages/about.astro` entirely:

```astro
---
/**
 * /about — studio story on the left, mark + facts panel on the right.
 */
import Site from '../layouts/Site.astro';
import Mark from '../components/Mark.astro';

const facts = [
  { label: 'FOUNDED', value: '2026' },
  { label: 'BASE', value: 'BANGKOK' },
  { label: 'SERVICE', value: 'SIDECRAFT' },
  { label: 'LANGUAGES', value: 'EN · TH' },
];
---

<Site
  title="About"
  description="Dryas Studio is a one-person digital agency in Bangkok, backed by its own operating system, Sidecraft OS."
  active="about"
>
  <section class="wrap about">
    <div>
      <p class="kicker">About</p>
      <h1 class="page-title title">A studio of one, built like a system.</h1>
      <p class="body">
        Dryas Studio is a one-person digital agency in Bangkok. One owner designs, builds, deploys and
        operates every site — backed by its own operating system, Sidecraft OS, so nothing depends on
        memory or luck.
      </p>
      <p class="body">
        The studio is named after <i>Dryas octopetala</i> — a mountain flower that grows where almost
        nothing else does. The mark is that resilience drawn as a tree: canopy, crown and root in one
        triangle.
      </p>
      <p lang="th" class="th body-th">
        สตูดิโอเล็ก ๆ ในกรุงเทพฯ ที่ออกแบบ สร้าง และดูแลเว็บไซต์เองทุกขั้นตอน
      </p>
    </div>

    <div class="panel">
      <div class="mark-cell">
        <Mark size={130} label="Dryas Studio mark" />
      </div>
      <dl class="facts">
        {
          facts.map(({ label, value }) => (
            <div class="fact">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))
        }
      </dl>
    </div>
  </section>
</Site>

<style>
  .about {
    padding-block: clamp(56px, 8vw, 110px) 80px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
    gap: 64px;
  }

  .title {
    margin-top: 24px;
    font-size: clamp(38px, 5vw, 60px);
  }

  .body {
    margin-top: 16px;
    font: 400 17px/1.75 var(--font-sans);
    color: var(--muted);
    max-width: 54ch;
  }
  .title + .body {
    margin-top: 24px;
  }

  .body-th {
    margin-top: 16px;
    line-height: 1.9;
    max-width: 54ch;
  }

  /* 1px gaps over a hairline ground draw the panel dividers. */
  .panel {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--hairline);
    border: 1px solid var(--hairline);
    align-self: start;
  }

  .mark-cell {
    background: var(--ink);
    padding: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .facts {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .fact {
    background: var(--ink);
    padding: 24px 28px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font: 400 12px var(--font-mono);
    letter-spacing: 0.14em;
  }

  .fact dt {
    color: var(--muted);
  }

  .fact dd {
    font-weight: 500;
    color: var(--fg);
  }
</style>
```

- [ ] **Step 4: Create contact.astro**

Create `src/pages/contact.astro`:

```astro
---
/**
 * /contact — headline and three contact rows. No form: email is the channel.
 */
import Site from '../layouts/Site.astro';
---

<Site
  title="Contact"
  description="Tell Dryas Studio what you need live in four weeks. Reply within one business day."
  active="contact"
>
  <section class="wrap contact">
    <p class="kicker">Contact</p>
    <h1 class="title">Tell us what you need live in four weeks.</h1>
    <p lang="th" class="th sub">คุยกันก่อนได้ ไม่มีค่าใช้จ่าย — ตอบกลับภายในหนึ่งวันทำการ</p>

    <dl class="rows">
      <div class="row">
        <dt>EMAIL</dt>
        <dd><a href="mailto:hello@dryasstudio.com" class="email">hello@dryasstudio.com</a></dd>
      </div>
      <div class="row">
        <dt>X</dt>
        <dd><a href="https://x.com/dryasstudio" class="quiet">@dryasstudio</a></dd>
      </div>
      <div class="row">
        <dt>REPLY TIME</dt>
        <dd class="plain">One business day</dd>
      </div>
    </dl>
  </section>
</Site>

<style>
  .contact {
    padding-block: clamp(64px, 10vw, 140px) 96px;
  }

  .title {
    margin-top: 28px;
    font: 600 clamp(36px, 5vw, 64px) / 1.1 var(--font-sans);
    letter-spacing: -0.035em;
    color: var(--fg);
    max-width: 20ch;
    text-wrap: balance;
  }

  .sub {
    margin-top: 16px;
  }

  .rows {
    margin-top: 48px;
    max-width: 640px;
  }

  .row {
    display: flex;
    gap: 8px 24px;
    padding: 22px 0;
    border-top: 1px solid var(--hairline);
    flex-wrap: wrap;
  }
  .row:last-child {
    border-bottom: 1px solid var(--hairline);
  }

  .row dt {
    width: 110px;
    flex: none;
    font: 400 12px var(--font-mono);
    letter-spacing: 0.16em;
    color: var(--muted);
  }

  .email {
    font: 500 15px var(--font-mono);
    color: var(--fg);
    border-bottom: 1px solid var(--accent);
  }
  .email:hover {
    color: var(--accent);
  }

  .quiet {
    font: 500 15px var(--font-mono);
    color: var(--muted);
  }
  .quiet:hover {
    color: var(--fg);
  }

  .plain {
    font: 400 15px var(--font-mono);
    color: var(--muted);
  }
</style>
```

- [ ] **Step 5: Run to confirm it passes**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm test && npm run build && npm run test:dist`
Expected: PASS — `✓ dist check passed for 6 pages`.

- [ ] **Step 6: Commit**

```bash
cd /Users/peemmacmini/Documents/DRYAS/site && git add -A && git commit -m "feat(site): v3 about and contact pages"
```

---

### Task 5: Press page in v3 style

**Files:**
- Rewrite: `src/pages/press.astro`
- Modify: `scripts/check-dist.mjs` (PAGES)

**Interfaces:**
- Consumes: `Site.astro` (no `active`), `Mark.astro`.

- [ ] **Step 1: Add the press route to the dist check**

Append to `PAGES`:

```js
  {
    file: 'press/index.html',
    active: null,
    thai: false,
    must: ['Press kit', 'Fact sheet', 'BREWMIND · COLLEX', 'PRESS@DRYASSTUDIO.COM', 'KIT ON REQUEST'],
  },
```

- [ ] **Step 2: Run to confirm it fails**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm run build && npm run test:dist`
Expected: FAIL — `press/index.html: missing "aria-label=\"Site\""`.

- [ ] **Step 3: Rewrite press.astro**

Replace `src/pages/press.astro` entirely:

```astro
---
/**
 * /press — fact sheet and marks. Not in the header nav; linked from the footer.
 * The downloadable kit does not exist yet, so the page says it is on request
 * rather than showing a dead download button.
 */
import Site from '../layouts/Site.astro';
import Mark from '../components/Mark.astro';

const facts = [
  { label: 'Agency', value: 'DRYAS STUDIO' },
  { label: 'Type', value: 'DIGITAL AGENCY' },
  { label: 'Base', value: 'BANGKOK' },
  { label: 'Service', value: 'SIDECRAFT' },
  { label: 'Clients', value: 'BREWMIND · COLLEX' },
  { label: 'Founded', value: '2026' },
  { label: 'Contact', value: 'PRESS@DRYASSTUDIO.COM' },
];
---

<Site title="Press" description="Press kit, fact sheet and marks for Dryas Studio, a digital agency in Bangkok.">
  <section class="wrap intro">
    <p class="kicker">Press</p>
    <h1 class="page-title title">Press kit</h1>
  </section>

  <section class="wrap cols">
    <div>
      <h2 class="kicker head">Fact sheet</h2>
      <dl class="facts">
        {
          facts.map(({ label, value }) => (
            <div class="fact">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))
        }
      </dl>
    </div>

    <div>
      <h2 class="kicker head">Mark</h2>
      <div class="swatches">
        <div class="swatch">
          <Mark size={64} label="Dryas Studio mark" />
        </div>
        <div class="swatch">
          <Mark size={28} variant="small" label="Dryas Studio mark, small cut" />
        </div>
        <div class="swatch wide" role="img" aria-label="Dryas Studio lockup">
          <Mark size={48} />
          <span class="lockup" aria-hidden="true">
            <span class="name">DRYAS</span>
            <span class="sub">STUDIO</span>
          </span>
        </div>
      </div>
      <p class="footnote">KIT ON REQUEST — PRESS@DRYASSTUDIO.COM</p>
    </div>
  </section>
</Site>

<style>
  .intro {
    padding-block: clamp(56px, 8vw, 110px) 48px;
  }
  .title {
    margin-top: 24px;
  }

  .cols {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
    gap: 56px;
    padding-bottom: 96px;
  }

  .head {
    margin-bottom: 14px;
  }

  .fact {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 0;
    border-top: 1px solid var(--hairline);
    font: 400 13px var(--font-mono);
    letter-spacing: 0.08em;
  }
  .fact:last-child {
    border-bottom: 1px solid var(--hairline);
  }

  .fact dt {
    color: var(--muted);
    text-transform: uppercase;
  }

  .fact dd {
    color: var(--fg);
    text-align: right;
  }

  .swatches {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--hairline);
    border: 1px solid var(--hairline);
  }

  .swatch {
    background: var(--ink);
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
  }

  .swatch.wide {
    grid-column: 1 / -1;
  }

  .lockup {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }

  .name {
    font: 500 22px var(--font-wordmark);
    letter-spacing: 0.22em;
    color: var(--fg);
  }

  .sub {
    font: 400 10px var(--font-mono);
    letter-spacing: 0.62em;
    color: var(--accent);
    margin-top: 5px;
  }

  .footnote {
    font: 400 11px var(--font-mono);
    letter-spacing: 0.12em;
    color: var(--muted);
    margin-top: 12px;
  }
</style>
```

- [ ] **Step 4: Run to confirm it passes**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm test && npm run build && npm run test:dist`
Expected: PASS — `✓ dist check passed for 7 pages`.

- [ ] **Step 5: Commit**

```bash
cd /Users/peemmacmini/Documents/DRYAS/site && git add -A && git commit -m "feat(site): v3 press page"
```

---

### Task 6: Remove sidebar-era code, full verify, visual check

**Files:**
- Delete: `src/layouts/Shell.astro`, `src/components/SidebarNav.astro`, `src/components/StudioFooter.astro`, `src/components/EmailSignup.astro`, `src/components/ImageWell.astro`, `src/lib/images.ts`
- Modify: `package.json` (drop `@fontsource/jetbrains-mono`), `README.md`

- [ ] **Step 1: Confirm nothing imports the old files**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && grep -rnE "Shell|SidebarNav|StudioFooter|EmailSignup|ImageWell|lib/images|jetbrains" src || echo CLEAN`
Expected: `CLEAN`. If any line prints, fix that import before continuing.

- [ ] **Step 2: Delete the files and the unused font**

```bash
cd /Users/peemmacmini/Documents/DRYAS/site && git rm src/layouts/Shell.astro src/components/SidebarNav.astro src/components/StudioFooter.astro src/components/EmailSignup.astro src/components/ImageWell.astro src/lib/images.ts && npm uninstall @fontsource/jetbrains-mono
```

`functions/api/subscribe.ts` stays (owner decision: drop the UI, keep the API).

- [ ] **Step 3: Update README**

In `README.md`, replace the paragraph starting `**The whole site ships one \`<script>\`**` (3 lines) with:

```markdown
**The site ships no client JavaScript.** Every page is static HTML and CSS.
The mobile header nav wraps rather than using a hamburger, so it needs none.
```

Then replace everything from the line `## Known gaps` to the end of the file with:

```markdown
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
```

- [ ] **Step 4: Run the full verify**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && npm run verify`
Expected: literal check ✓, `astro check` 0 errors, `tsc` 0 errors, build succeeds, `✓ dist check passed for 7 pages`.

- [ ] **Step 5: Visual check in a browser**

Run the preview in the background: `cd /Users/peemmacmini/Documents/DRYAS/site && npx astro preview --port 4321` (background process).

With the Playwright MCP (Kilo: `playwright_browser_*`), for each of `/`, `/services`, `/process`, `/about`, `/contact`, `/press`, `/nope-404`:
1. `browser_resize` to 1440×900, `browser_navigate` to `http://localhost:4321<path>`, `browser_take_screenshot`.
2. `browser_resize` to 390×844, navigate again, screenshot.
3. `browser_evaluate` with `() => document.documentElement.scrollWidth <= window.innerWidth` — must return `true` at 390px (no sideways scroll).
4. `browser_console_messages` — must contain no errors (a missing font file would show here).

Also open `file:///Users/peemmacmini/Documents/DRYAS/site/docs/design/v3/Dryas%20Site%20v3.html` at 1440×900 and screenshot it for side-by-side comparison with `/`.

Check against the design: ink background, green mark and active nav, Space Grotesk headings, mono labels, Thai text rendered in Plex Sans Thai (not tofu boxes). Record any mismatch in the ledger and fix it before committing. Stop the preview process afterwards.

- [ ] **Step 6: Commit**

```bash
cd /Users/peemmacmini/Documents/DRYAS/site && git add -A && git commit -m "chore(site): remove sidebar-era layout, signup UI and unused font"
```

- [ ] **Step 7: Refresh the knowledge graph**

Run: `cd /Users/peemmacmini/Documents/DRYAS/site && graphify update /Users/peemmacmini/Documents/DRYAS --force`
(`--force` because files were deleted.) Expected: graph written without error.

---

## Self-Review

- **Spec coverage:** header/nav/footer (T1), home hero + stats + production list (T2), services + process (T3), about + contact incl. Thai lines (T4), press kept + restyled + footer-linked (T1 footer, T5), signup UI removed / API kept (T6, `FORBIDDEN` guards `data-signup`), fonts self-hosted (T1), 404 (T1).
- **Deliberate deviations from the design:** the design is a single-page client router; here each view is a real static route, and nav links point at `/services` etc. instead of `#`. Mobile gutter drops to 20px under 600px and nav items get 44px touch targets. Contact rows and facts use `<dl>`; process steps use `<ol>`. The press page and `/PRESS` footer link are additions (owner decision).
- **Names used across tasks:** `Site.astro`, `SiteHeader.astro` (`Route`), `SiteFooter.astro`, `Mark.astro` (`size`, `variant`, `strokeWidth`, `label`, `class`), classes `.wrap .rule-top .cells .kicker .page-title .lede .th .accent .btn .link-arrow` — all defined in Task 1.
