import { getCollection, type CollectionEntry } from 'astro:content';

export type DevlogEntry = CollectionEntry<'devlog'>;

/**
 * Filenames carry a `NN-` prefix so the content directory sorts the way the
 * series reads. The URL should not: `/devlog/the-rebrand`, not
 * `/devlog/04-the-rebrand`.
 */
export function slugOf(entry: DevlogEntry): string {
  return entry.id.replace(/^\d+-/, '');
}

export function hrefOf(entry: DevlogEntry): string {
  return `/devlog/${slugOf(entry)}`;
}

/** `#04` — the display index, zero-padded, as it appears everywhere. */
export function numberOf(entry: DevlogEntry): string {
  return `#${String(entry.data.number).padStart(2, '0')}`;
}

/** `2026-08-14` — the mono date format used in every list and meta row. */
export function dateOf(entry: DevlogEntry): string {
  return entry.data.date.toISOString().slice(0, 10);
}

/** Newest first, which is the order every surface on the site wants. */
export async function allEntries(): Promise<DevlogEntry[]> {
  const entries = await getCollection('devlog');
  return entries.sort((a, b) => b.data.number - a.data.number);
}

/**
 * Prev/next in *series* order: `prev` is the lower-numbered entry (the
 * `← #03` link at the foot of an article), `next` the higher.
 */
export function neighbours(entries: DevlogEntry[], current: DevlogEntry) {
  // `entries` is newest-first, so the lower-numbered neighbour is the one
  // after the current index.
  const i = entries.findIndex((e) => e.id === current.id);
  return {
    prev: i >= 0 ? entries[i + 1] : undefined,
    next: i > 0 ? entries[i - 1] : undefined,
  };
}
