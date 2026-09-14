# graphify — knowledge graph first (mirrors the `## graphify` section of DRYAS/CLAUDE.md)

A knowledge graph of all three repos (`sidecraft/`, `sidecraft-os/`, `site/`) lives at
`/Users/peemmacmini/Documents/DRYAS/graphify-out/graph.json`. Use it before reading or
searching raw files — it returns a scoped subgraph with file paths and line numbers for a
fraction of the tokens.

Rules:
- Before exploring code or docs (reading files, `grep`, `find`, `list_files`, `search_files`),
  run one of these with `execute_command`:
  - `graphify query "<question>" --graph /Users/peemmacmini/Documents/DRYAS/graphify-out/graph.json`
  - `graphify path "<A>" "<B>" --graph /Users/peemmacmini/Documents/DRYAS/graphify-out/graph.json`
  - `graphify explain "<concept>" --graph /Users/peemmacmini/Documents/DRYAS/graphify-out/graph.json`
  Add `--budget 800` to keep output small. Then open only the files the graph points to
  (`src=... loc=L..`).
- Read `/Users/peemmacmini/Documents/DRYAS/graphify-out/GRAPH_REPORT.md` only for broad
  architecture review, or when query/path/explain don't surface enough.
- After modifying code, run `graphify update /Users/peemmacmini/Documents/DRYAS`
  (code-only rebuild, no LLM cost). A post-commit hook also does this on every commit.
- After big doc changes (new/rewritten spec, plan, handover, CLAUDE.md, README, business doc,
  or edits across 3+ docs), tell the user to run `/graphify /Users/peemmacmini/Documents/DRYAS --update`
  in Claude Code — Cline can't run that LLM re-extraction.
- After deleting a lot of code (removed files, modules, routes, components), run
  `graphify update /Users/peemmacmini/Documents/DRYAS --force` — without `--force` stale nodes stay.
- Never commit `graphify-out/` to a public repo — the graph includes private business docs.
