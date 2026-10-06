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
  'href="/#ch-1"',
  'href="/#services"',
  'href="/contact/"',
  'Dryas Studio · Bangkok',
  'property="og:image" content="https://dryasstudio.com/og.jpg"',
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
      'What do you want to exist?',
      'Tell us the idea. We reply within one business day, and the first call is free.',
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
 * (search engines ignore a canonical in <body>), one <h1>, every chapter, the
 * links out to /contact/, and every same-origin file it loads (see
 * checkLocalAssets).
 */
const LANDING = {
  file: 'index.html',
  /** It must load nothing from a third party: three.js and fonts are vendored. */
  forbidden: ['unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com', "'takes over'"],
  head: [
    '<title>Dryas Studio | AI Website &amp; App Development Studio in Bangkok</title>',
    '<link rel="canonical" href="https://dryasstudio.com/">',
    '<meta name="description"',
    '<meta property="og:image" content="https://dryasstudio.com/og.jpg">',
    '"@type": "ProfessionalService"',
    '"@type": "CreativeWork"',
    'Every project is delivered with the Dryas Workflow Framework.',
    '<script type="importmap">',
  ],
  body: [
    '<canvas id="gl"',
    'Imagine it. AI builds it.',
    ...['ch-0', 'ch-1', 'ch-2', 'ch-3', 'ch-4', 'ch-5', 'ch-6', 'ch-7', 'ch-8', 'services', 'contact'].map(
      (id) => `<section class="chapter" id="${id}">`,
    ),
    'data-name="Review"',
    'Checked twice. Then challenged.',
    'data-name="Framework"',
    'Anything. Built by AI.',
    'a target operating model for AI-assisted software delivery',
    'href="https://github.com/promprit/dryas-workflow"',
    'Delivered with the Dryas Workflow Framework.',
    'href="https://dryasstudio.com/contact/"',
    // Arrow keys step chapters; a new handover of the design file must keep it.
    "addEventListener('keydown', onKey)",
    "['LEAD MODEL', 'second try'",
    "['REVIEW', 'spec'",
    "['REVIEW', 'quality'",
    "['SECOND OPINIONS', '2 models'",
    "['TESTS', 'pass'",
  ],
};

const failures = [];

/**
 * Every same-origin file the landing page loads must be in dist/: hrefs in
 * <link>, import-map targets, each `three/addons/` import, every relative
 * import inside those modules, and every url() in a loaded stylesheet. These
 * come from scripts/vendor-landing.mjs, so a version bump or a new addon that
 * is not vendored fails here instead of on the live site.
 */
function checkLocalAssets(html, fail) {
  const toFile = (url) => join(dist, url.replace(/^\//, ''));
  const queue = [];
  for (const [, href] of html.matchAll(/<link[^>]+href="(\/[^"]+)"/g)) queue.push(href);
  const map = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
  const imports = map ? JSON.parse(map[1]).imports : {};
  for (const target of Object.values(imports)) if (!target.endsWith('/')) queue.push(target);
  const addons = imports['three/addons/'];
  for (const [, rel] of html.matchAll(/from 'three\/addons\/([^']+)'/g)) {
    if (!addons) fail('imports three/addons/ but the import map does not map it');
    else queue.push(addons + rel);
  }
  if (!queue.length) fail('loads no local assets (import map or stylesheet missing?)');
  const seen = new Set();
  while (queue.length) {
    const url = queue.pop();
    if (seen.has(url)) continue;
    seen.add(url);
    const file = toFile(url);
    if (!existsSync(file)) {
      fail(`loads ${url}, which is not in dist/`);
      continue;
    }
    const dir = url.slice(0, url.lastIndexOf('/') + 1);
    const text = /\.(js|css)$/.test(url) ? readFileSync(file, 'utf8') : '';
    if (url.endsWith('.js')) {
      for (const [, spec] of text.matchAll(/from\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
        queue.push(new URL(spec, `https://x${dir}`).pathname);
      }
    }
    if (url.endsWith('.css')) {
      for (const [, ref] of text.matchAll(/url\(([^)]+)\)/g)) queue.push(new URL(ref, `https://x${dir}`).pathname);
    }
  }
}

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
    for (const s of LANDING.forbidden) if (html.includes(s)) fail(`contains forbidden ${JSON.stringify(s)}`);
    const chapters = (html.match(/<section class="chapter"/g) ?? []).length;
    const k = html.match(/const K = \[([\s\S]*?)\n\];/);
    const keys = k ? (k[1].match(/^\s*\[V\(/gm) ?? []).length : 0;
    if (keys !== chapters) fail(`camera has ${keys} keyframes for ${chapters} chapters`);
    checkLocalAssets(html, fail);
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
