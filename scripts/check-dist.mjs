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
  { file: '404.html', active: null, thai: false, must: ['Page not found', '← BACK TO HOME'] },
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
  {
    file: 'press/index.html',
    active: null,
    thai: false,
    must: ['Press kit', 'Fact sheet', 'BREWMIND · COLLEX', 'PRESS@DRYASSTUDIO.COM', 'KIT ON REQUEST'],
  },
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
