#!/usr/bin/env node
/**
 * The literal guard.
 *
 * Fails if a colour literal appears anywhere in src/pages, src/layouts or
 * src/components. The eight brand colours are defined once, in
 * src/styles/tokens.css, and the handoff is explicit that new ones are never
 * invented. A palette that is only a convention drifts within a month.
 *
 * Exempt:
 *   - src/styles/tokens.css   the definition itself
 *   - rgba(0,0,0,…)           neutral scrims, which carry no brand colour
 *   - public/, functions/     not part of the styled build; the no-JS form
 *                             response is a standalone document that cannot reach the
 *                             stylesheet, and the placeholder SVGs are
 *                             replaced wholesale when the real kit lands
 *
 * Run: npm test
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const SCANNED = ['src/pages', 'src/layouts', 'src/components'];

const PATTERNS = [
  { name: 'hex colour', re: /#[0-9a-fA-F]{3,8}\b/g },
  { name: 'rgb()', re: /\brgba?\(\s*(?!0\s*,\s*0\s*,\s*0\s*[,)])/g },
  { name: 'hsl()', re: /\bhsla?\(/g },
];

/** `#main`, `#contact` and friends are anchors, not colours. */
const NOT_A_COLOUR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.(astro|css|ts|js|mjs)$/.test(entry)) out.push(path);
  }
  return out;
}

const findings = [];

for (const dir of SCANNED) {
  for (const file of walk(join(root, dir))) {
    const source = readFileSync(file, 'utf8');
    const lines = source.split('\n');

    for (const { name, re } of PATTERNS) {
      for (const match of source.matchAll(re)) {
        // A hex-shaped token that is not a valid colour length is an anchor
        // or an id selector, not a colour.
        if (name === 'hex colour' && !NOT_A_COLOUR.test(match[0])) continue;

        const before = source.slice(0, match.index);
        const line = before.split('\n').length;
        findings.push({
          file: relative(root, file),
          line,
          name,
          text: match[0],
          source: lines[line - 1].trim(),
        });
      }
    }
  }
}

if (findings.length > 0) {
  console.error(
    `\n✗ ${findings.length} colour literal${findings.length === 1 ? '' : 's'} outside the token layer:\n`,
  );
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  ${f.name} ${f.text}`);
    console.error(`    ${f.source}\n`);
  }
  console.error('Define the colour in src/styles/tokens.css and use var(--token) instead.\n');
  process.exit(1);
}

console.log(`✓ no colour literals in ${SCANNED.join(', ')}`);
