# Images

Drop real image files in here. **No code change is needed** — the site scans
this folder at build time, and any well whose file is present renders the photo
instead of the placeholder caption.

Upload straight through the GitHub web UI ("Add file → Upload files") into the
right subfolder. Filenames must match the table below; the extension can be
`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` or `.svg`.

## What goes where

| File | Where it appears | Rendered size |
|---|---|---|
| `gatekeep/key-art.*` | Home page feature band | 320 × 200 |
| `gatekeep/screenshot-01.*` … `-04.*` | `/press` screenshot grid | ~160 × 130 each |
| `studio/portrait.*` | `/about` sidebar | 180 × 180 |
| `devlog/<slug>-fig-01.*` | The figure in that devlog entry | full column × 320 |

`<slug>` is the entry's URL segment — the filename in `src/content/devlog/`
without its number prefix. So `04-the-rebrand.md` wants
`devlog/the-rebrand-fig-01.jpg`.

## Before you upload

- **Resize first.** These are served as-is with no image pipeline. Nothing here
  should exceed ~2× its rendered size, and 200–400 KB is a sensible ceiling per
  file.
- **Wells crop to fill** (`object-fit: cover`), so keep the subject clear of the
  edges. The home well is landscape (16:10), the portrait well is square.
- Brand marks do **not** go here — they live in `public/assets/`.
