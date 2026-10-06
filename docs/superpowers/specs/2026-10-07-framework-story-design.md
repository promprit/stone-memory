# Framework story on the landing page — design

Date: 2026-10-07 · Repo: `site` · Branch: `feat/framework-story` · Status: approved in brainstorming, awaiting spec review

## Why

The landing page (`public/index.html`) tells the Dryas workflow as a scroll-driven three.js story. It was written on 2026-10-02. Since then the workflow became the **Dryas Workflow Framework** (dryas-workflow repo, 2026-10-03 to 10-06): a named target operating model with five layers (Memory, Governance, Execution, Escalation, Review), a seven-stage loop (Brainstorm → Plan → Judge → Build → Escalate → Review → Ship), a draft spec, and a public repo (README no longer says "not promoted", commit `2431f32`).

The page is now out of date in three ways:

1. Escalate says the Orchestrator takes over. The framework re-runs the task on a stronger executor, finds the root cause before each climb, and hands the task to a person if the Frontier model also fails.
2. Review is folded into Ship. The framework has a separate Review stage: two-stage review, optional interrogate (two models), tests.
3. The framework itself is never named.

## Goal

Visitors see the seven-stage loop and leave knowing Dryas runs a named, open framework (a target operating model for AI-assisted software delivery), with a link to it. The site uses the repo's own positioning line verbatim.

Audience: prospective clients, not developers. Internal plumbing (hooks, thresholds, `/handoff`, installer, OS support) stays off the site.

## Non-goals

- No new pages. No `/framework` page.
- No change to Brainstorm, Build, Contact copy, the header nav, or `/contact/`. Intro and Services change by one line each (delivery claim, below).
- No refactor of the timeline into named beats (approach B, rejected).

## Chapter map (after)

| c | id | data-name | Change |
|---|---|---|---|
| 0 | ch-0 | Intro | none |
| 1 | ch-1 | Brainstorm | none |
| 2 | ch-2 | Plan | copy |
| 3 | ch-3 | Judge | copy |
| 4 | ch-4 | Build | none |
| 5 | ch-5 | Escalate | copy, one 3D label |
| 6 | ch-6 | Review | **new** |
| 7 | ch-7 | Ship | renumbered, copy, timings +1 |
| 8 | ch-8 | Framework | replaces Motto, wide caption |
| 9 | services | Services | timings +1 only |
| 10 | contact | Contact | timings +1 only |

Chapter ids stay sequential (`ch-0`…`ch-8`). The header nav links `/#ch-1` and `/#services` are unaffected.

## Copy

Role names keep their colour classes: `c-opus` Orchestrator and Lead model, `c-sonnet` Builder, `c-jev` Judge, `c-fable` Frontier model.

**00 Intro** (heading unchanged). Last sentence "Scroll to watch how." becomes:
> Every project runs on our own framework. Scroll to watch how.

**02 Plan** (heading unchanged: "One plan, split three ways.")
> The **Orchestrator** recalls what worked and what failed before, writes the plan in its own isolated branch, and splits it into small tasks. Each task names the files it may touch and how we'll know it's done.

**03 Judge** (heading unchanged). Replace "in about a quarter of a second" with "in a fraction of a second". Reason: judge latency is now measured weekly (GOV-M1) and the old figure is unverified.

**05 Escalate** (heading unchanged: "When it's stuck, it climbs.")
> A **Builder** gets two tries. Then a **Lead model** takes the task, after we've found out why it failed. A **Frontier model**, the most capable AI there is, runs once, and only if that fails too. After that, a person steps in.

**06 Review** (new; `data-name="Review"`)
> Kicker: 06 Review
> Heading: Checked twice. Then challenged.
> The **Orchestrator** reviews every result in two stages: does it match the design, and is it well built? Contested changes get second opinions from two different AI models. Then the tests run.

**07 Ship** (`data-name="Ship"`)
> Kicker: 07 Ship
> Heading: Verified. Signed off. Merged.
> Nothing merges until the tests pass and the work is verified. A person signs off on anything that goes live. Every outcome is saved, so the next project starts smarter.

**08 Framework** (`data-name="Framework"`, `class="cap wide"`, list styled like `.svc`)
> Kicker: The Dryas Workflow Framework
> Heading (class `motto`): Anything. Built by AI.
> Lead line: Every project we deliver runs on the Dryas Workflow Framework, a target operating model for AI-assisted software delivery. Five layers:
> - **Memory** — what was tried, what worked, what failed.
> - **Governance** — who decides, and what each AI may touch.
> - **Execution** — small tasks, kept apart, built test-first.
> - **Escalation** — a stronger model only when a cheaper one failed.
> - **Review** — nothing merges unverified. A person ships.
>
> Small print: The method is open. The tools are replaceable.
> Link (`class="btn"`): Read the framework on GitHub → `https://github.com/promprit/dryas-workflow` (same-tab, like the X link).

**Services** (list unchanged). Small print becomes:
> Fixed price, quoted before we start. Delivered with the Dryas Workflow Framework. After launch, we stay on and keep it running.

**Delivery claim.** The framework is shown as how client work is delivered, not as a side project: Intro sets it up, chapters 1–7 show it, chapter 8 names it ("Every project we deliver runs on…"), Services repeats it next to the price promise.

## 3D scene

All in the module script of `public/index.html`. The timeline is driven by the scroll value `c`.

**Shift.** Every timing constant that belongs to Ship or later moves up by exactly 1.0: in `slots()` the ship packet (`6.38–7.05`) and finale (`≥ 6.95`); in `animate()` `fin`, `T.ship`, `T.trunk` reveals, the `O.main` setOrb, and the `LBL` rows for SHIPPED and THE LOOP. The branch packets' final approach (`6.05–6.38`), the review orb's appearance (`seen(c, 5.9)`) and the ring-opacity `seen(c, 5.9)` stay: they are the arrival at review, now chapter 6.

**Camera.** Insert one keyframe after escalate: `[V(10, 7, 9), V(6, 4.6, 0)]` (close on the review node). `K` grows from 10 to 11 rows, matching 11 captions.

**Review beat (c 6–7).**

| c | What |
|---|---|
| 6.05–6.35 | three branch packets finish at the review node (existing motion) |
| 6.30–6.60 | review rings pulse 1; label `REVIEW · spec` |
| 6.55–6.85 | review rings pulse 2; label `REVIEW · quality` |
| 6.60–6.90 | two small orbs (radius ~0.45, one `COL.sonnet`, one `COL.opus`) fade in either side of review (±z ≈ 2.4, y ≈ +1.4), dashed tethers to review; label `SECOND OPINIONS · 2 models`; faded out by 7.0 |
| 6.85–7.05 | label `TESTS · pass` in brand green at the review node |

The review orb's `uLit` uses the two pulses: `bump(c, 6.3, 6.6) + bump(c, 6.55, 6.85)`. The old `ORCHESTRATOR · review` label (`6.0–6.55`) is replaced by the two `REVIEW` labels.

**Escalate label.** `['ORCHESTRATOR', 'takes over', …]` becomes `['LEAD MODEL', 'second try', …]`. Position, colour and timing unchanged.

**Reduced motion / no WebGL.** Unchanged mechanisms: reduced motion snaps the scrub and jumps instantly; captions render without WebGL.

## Scroll, dots, keys

The rail, `CH`, scroll-to-chapter and arrow-key stepping all read `caps.length`, so they pick up 11 chapters without code changes. Verify, don't edit.

## SEO

- `<meta name="description">`, og and twitter descriptions: unchanged. They do not affect ranking, and the client-facing promise ("Fixed price, live in weeks, Bangkok") earns more clicks than framework terms.
- JSON-LD `ProfessionalService.description`: append "Every project is delivered with the Dryas Workflow Framework."
- JSON-LD: add a `CreativeWork` node (`name`: Dryas Workflow Framework, `description`: "A target operating model for AI-assisted software delivery.", `url`: the repo, `creator`: the studio's `@id`).

## Testing

1. **Failing check first.** Extend `scripts/check-dist.mjs` LANDING with: `data-name="Review"`, `data-name="Framework"`, `href="https://github.com/promprit/dryas-workflow"`, `Checked twice. Then challenged.`, `a target operating model for AI-assisted software delivery`, `Delivered with the Dryas Workflow Framework.` Run `npm run build && npm run test:dist`; it must fail before the HTML change and pass after.
2. `npm run verify` passes.
3. Playwright against the built site:
   - 11 rail dots; clicking each lands its chapter centred;
   - ArrowDown from Intro steps through all 11 in order; Shift+Arrow and focus-in-input still ignored;
   - no console errors from load to Contact;
   - screenshots of chapters 5–8 at 1440×900 and 390×844 (captions readable, labels not clipped);
   - `prefers-reduced-motion: reduce` jumps instantly;
   - WebGL disabled: all captions present.
4. Design pass with `ui-ux-pro-max` and `impeccable` on copy, the framework list layout and the review beat; fix material findings before `/wreview`.

## Release

Worktree `../.worktrees/site-framework-story` on `feat/framework-story` → `/wreview` → verification-before-completion → merge to `main` → push → wrangler direct-upload deploy to dryasstudio.com (asked before push and deploy).

## Related change (dryas-workflow repo, separate commit)

Add one line to the dryas-workflow README: "Built and run by [Dryas Studio](https://dryasstudio.com), which delivers every client project with it." GitHub marks README links `nofollow`, so the value is referral traffic and brand association, not ranking. The local clone is one commit behind `origin/main` (`2431f32`); fast-forward first.

## Risks

- **The timing shift misses a constant**, so a beat plays in the wrong chapter. Mitigation: list every numeric literal between 5.9 and 8.0 in the module script, check each against this spec, and screenshot chapters 6–8.
- **The wide framework caption crowds the 3D finale on phones.** Mitigation: reuse `.cap.wide` + `.svc` styling already proven by Services; phone screenshot.
