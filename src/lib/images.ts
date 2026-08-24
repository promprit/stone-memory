import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Build-time lookup for real imagery dropped into `public/images/`.
 *
 * The point is that the studio owner can upload a photo through the GitHub web
 * UI and have it appear, with no code change and no rebuild of anything but the
 * site. So the wells name an image by stem — `gatekeep/key-art` — and this
 * resolves whichever extension actually landed.
 *
 * `process.cwd()` rather than a path relative to this module: Vite bundles this
 * into `dist/.prerender/` during the static build, where a module-relative path
 * no longer points at the project. cwd is the project root for the whole of
 * `astro build`.
 *
 * Returns null when nothing is there, which is the normal state — every well
 * falls back to its placeholder caption.
 */

const ROOT = join(process.cwd(), 'public', 'images');

// Raster formats plus SVG. Deliberately no HEIC/TIFF: browsers cannot display
// them, and a silently-broken <img> is worse than a visible placeholder.
const EXTENSIONS = ['avif', 'webp', 'jpg', 'jpeg', 'png', 'svg'];

/**
 * `gatekeep/key-art` → `/images/gatekeep/key-art.jpg`, or null.
 *
 * Extension precedence follows EXTENSIONS, so dropping in an AVIF alongside a
 * legacy JPEG picks the AVIF without deleting anything.
 */
export function findImage(stem: string): string | null {
  const slash = stem.lastIndexOf('/');
  const dir = slash === -1 ? '' : stem.slice(0, slash);
  const base = slash === -1 ? stem : stem.slice(slash + 1);

  const absDir = dir ? join(ROOT, dir) : ROOT;
  if (!existsSync(absDir)) return null;

  let entries: string[];
  try {
    entries = readdirSync(absDir);
  } catch {
    return null;
  }

  for (const ext of EXTENSIONS) {
    const wanted = `${base}.${ext}`;
    // Case-insensitive: an upload from a phone is as likely to be .JPG.
    const hit = entries.find((e) => e.toLowerCase() === wanted.toLowerCase());
    if (hit) return `/images/${dir ? `${dir}/` : ''}${hit}`;
  }

  return null;
}
