import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

// zod directly, not the `z` re-exported from `astro:content` — that re-export
// is deprecated in Astro 7.

/**
 * The devlog. "Static content collection (markdown), newest first; MILESTONE
 * is a frontmatter flag rendering the Earth Brown badge." — the handoff,
 * near-verbatim.
 *
 * `number` is the display index (#01, #04) and is what prev/next navigation
 * orders by, so an entry can be backdated without renumbering the series.
 */
const devlog = defineCollection({
  loader: glob({ base: './src/content/devlog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    number: z.number().int().positive(),
    milestone: z.boolean().default(false),
    readingTime: z.string(),
    summary: z.string(),
  }),
});

export const collections = { devlog };
