#!/usr/bin/env node
/**
 * Build-output check. Run after `astro build`.
 *
 * Home is the scroll-driven three.js landing page, copied verbatim from
 * public/index.html; LANDING checks it. Every other page is an Astro page and
 * must carry the shared chrome (header nav + footer), exactly one <h1>, the
 * right active nav item, its own key copy, and Thai text only where the design
 * puts it.
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
  'href="/contact/"',
  'DESIGN → DEPLOY · BANGKOK',
  'property="og:image" content="https://dryasstudio.com/assets/social/dryas-post-1600x900.png"',
  'name="twitter:card" content="summary_large_image"',
];

/** Never present on any page. */
const FORBIDDEN = ['data-signup', 'fonts.googleapis.com'];

/** No executable script. JSON-LD is data, so it is the one allowed type. */
const EXECUTABLE_SCRIPT = /<script(?![^>]*type="application\/ld\+json")/;

/**
 * file:   path under dist/
 * active: nav route that carries aria-current="page", or null
 * thai:   whether the page renders lang="th" text
 * must:   substrings unique to the page
 */
const PAGES = [
  { file: '404.html', active: null, thai: false, must: ['Page not found', '← BACK TO HOME'] },
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
];

/**
 * The landing page. It is the design file as handed over, so it is checked for
 * what must survive the copy, not for the Astro chrome: metadata in <head>
 * (search engines ignore a canonical in <body>), one <h1>, every chapter, and
 * the links out to /contact/.
 */
const LANDING = {
  file: 'index.html',
  head: [
    '<title>Dryas Studio | AI Website &amp; App Development Studio in Bangkok</title>',
    '<link rel="canonical" href="https://dryasstudio.com/">',
    '<meta name="description"',
    '<meta property="og:image" content="https://dryasstudio.com/og.jpg">',
    '"@type": "ProfessionalService"',
    '<script type="importmap">',
  ],
  body: [
    '<canvas id="gl"',
    'Imagine it. AI builds it.',
    ...['ch-0', 'ch-1', 'ch-2', 'ch-3', 'ch-4', 'ch-5', 'ch-6', 'ch-7', 'services', 'contact'].map(
      (id) => `<section class="chapter" id="${id}">`,
    ),
    'Anything. Built by AI.',
    'href="https://dryasstudio.com/contact/"',
  ],
};

const failures = [];

const sitemapPath = join(dist, 'sitemap.xml');
if (!existsSync(sitemapPath)) failures.push('sitemap.xml: missing');
else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  for (const { file } of [...PAGES, LANDING]) {
    if (file === '404.html') continue;
    const loc = `https://dryasstudio.com/${file.replace(/index\.html$/, '')}`;
    if (!sitemap.includes(`<loc>${loc}</loc>`)) failures.push(`sitemap.xml: missing ${loc}`);
  }
  if (sitemap.includes('404')) failures.push('sitemap.xml: lists 404');
}

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
  if (EXECUTABLE_SCRIPT.test(html)) fail('contains an executable <script>');

  const indexable = file !== '404.html';
  if (html.includes('rel="canonical"') !== indexable) fail(indexable ? 'missing canonical' : 'unexpected canonical');
  if (html.includes('content="noindex"') === indexable) fail(indexable ? 'unexpected noindex' : 'missing noindex');

  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) fail(`expected 1 <h1>, found ${h1s.length}`);

  const current = html.match(/aria-current="page"/g) ?? [];
  if (active === null) {
    if (current.length !== 0) fail(`expected no aria-current, found ${current.length}`);
  } else {
    if (current.length !== 1) fail(`expected 1 aria-current, found ${current.length}`);
    if (!new RegExp(`href="/${active}/"[^>]*aria-current="page"`).test(html)) {
      fail(`nav item /${active} is not marked current`);
    }
  }

  const hasThai = html.includes('lang="th"');
  if (hasThai !== thai) fail(thai ? 'missing lang="th" text' : 'unexpected lang="th" text');
}

{
  const path = join(dist, LANDING.file);
  if (!existsSync(path)) failures.push(`${LANDING.file}: missing (did the build run?)`);
  else {
    const html = readFileSync(path, 'utf8');
    const fail = (msg) => failures.push(`${LANDING.file}: ${msg}`);
    const split = html.indexOf('</head>');
    if (split < 0) fail('no </head>');
    const head = html.slice(0, split);
    const body = html.slice(split);
    for (const s of LANDING.head) if (!head.includes(s)) fail(`<head> missing ${JSON.stringify(s)}`);
    for (const s of LANDING.body) if (!body.includes(s)) fail(`<body> missing ${JSON.stringify(s)}`);
    const h1s = html.match(/<h1[\s>]/g) ?? [];
    if (h1s.length !== 1) fail(`expected 1 <h1>, found ${h1s.length}`);
    if (html.includes('content="noindex"')) fail('unexpected noindex');
  }
}
if (!existsSync(join(dist, 'og.jpg'))) failures.push('og.jpg: missing (the landing page uses it as og:image)');

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} dist check failure${failures.length === 1 ? '' : 's'}:\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error('');
  process.exit(1);
}

console.log(`✓ dist check passed for ${PAGES.length + 1} pages`);
