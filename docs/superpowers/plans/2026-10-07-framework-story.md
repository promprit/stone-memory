# Framework Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Dryas:** this plan runs through `/orchestrate` (Dryas Workflow Framework). Tasks 1–2 go to Sonnet executors in the worktree below; Tasks 3–4 are orchestrator steps (they need the Playwright MCP and another repo).

**Goal:** Update the dryasstudio.com landing page so the scroll story shows the seven-stage Dryas loop (new Review chapter), names the Dryas Workflow Framework as how every project is delivered, and links to its repo.

**Architecture:** Everything lives in one hand-authored file, `public/index.html` (captions in HTML, scroll script, three.js module script). The 3D timeline is driven by one scroll value `c` (one unit per chapter). We insert a chapter at `c = 6`, shift every Ship-and-later timing by +1, and add a review beat. `scripts/check-dist.mjs` guards the built output.

**Tech Stack:** Astro 7 (copies `public/index.html` verbatim to `dist/`), three.js 0.160 (vendored), Node scripts, npm (repo has `package-lock.json`).

**Spec:** `docs/superpowers/specs/2026-10-07-framework-story-design.md`

**Worktree:** `/Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story` · branch `feat/framework-story` (from `main` @ `1d15628`).

## Global Constraints

- Every shell command starts with `cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && …`.
- Package manager: npm (existing `package-lock.json`). No new dependencies.
- Copy is verbatim from this plan (which copies the spec), including punctuation.
- Exact positioning line: `a target operating model for AI-assisted software delivery`.
- Repo link: `https://github.com/promprit/dryas-workflow`.
- Meta, og and twitter descriptions stay unchanged.
- Role colour classes: `c-opus` Orchestrator and Lead model, `c-sonnet` Builder, `c-jev` Judge, `c-fable` Frontier model.
- The landing page loads nothing from third parties (existing dist rule).
- Do not touch the Intro heading, Brainstorm, Build, Contact copy, header nav, `/contact/`, or any file outside each task's Scope.

## Review Focus

1. **Phone height (390×844 and shorter, e.g. 375×667):** the Framework chapter (motto heading, lead line, 5-row list, small print, button) must fit without its button falling off-screen. Pinned by the `.cap.wide h2.motto` size rule in Task 1 and the phone screenshots in Task 3.
2. **Arrow keys and rail across 11 chapters:** ArrowDown from Intro must visit all 11 in order, and the rail must show 11 dots labelled from `data-name`. No code change expected; pinned by the Playwright run in Task 3.
3. **Timing shift misses a constant:** a ship or finale effect plays in the Review chapter. Pinned by the literal audit (Task 2 Step 6), the camera-keyframe check (Task 2 Step 1) and the chapter 6–8 screenshots (Task 3).
4. **Reduced-motion and no-WebGL visitors:** captions for Review and Framework must still render, and rail clicks jump instantly. Pinned in Task 3.
5. **Overlapping 3D labels at the review node:** `REVIEW · spec`, `REVIEW · quality` and `TESTS · pass` share one anchor; their windows must not overlap. Pinned by the label windows in Task 2 Step 6 and the screenshots in Task 3.

---

### Task 1: Captions, copy, JSON-LD and dist guard

**Files:**
- Modify: `scripts/check-dist.mjs` (LANDING block, ~lines 95–125)
- Modify: `public/index.html`: JSON-LD (~lines 22–49), CSS (~line 153), captions (~lines 219–278)

Scope:
- `scripts/check-dist.mjs`
- `public/index.html`

**Interfaces:**
- Consumes: none.
- Produces: chapter sections `ch-0`…`ch-8`, `services`, `contact` (11 `.cap` elements; `data-name` in order: Intro, Brainstorm, Plan, Judge, Build, Escalate, Review, Ship, Framework, Services, Contact). Task 2 relies on 11 chapters and on `ch-6` being Review.

- [ ] **Step 1: Write the failing check**

In `scripts/check-dist.mjs`, replace the LANDING `head` and `body` arrays with:

```js
  head: [
    '<title>Dryas Studio | AI Website &amp; App Development Studio in Bangkok</title>',
    '<link rel="canonical" href="https://dryasstudio.com/">',
    '<meta name="description"',
    '<meta property="og:image" content="https://dryasstudio.com/og.jpg">',
    '"@type": "ProfessionalService"',
    // The framework is how every project is delivered; keep it in the structured data.
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
    // The seven-stage loop: Review is its own chapter.
    'data-name="Review"',
    'Checked twice. Then challenged.',
    // The framework chapter names it, links it, and says every project runs on it.
    'data-name="Framework"',
    'Anything. Built by AI.',
    'a target operating model for AI-assisted software delivery',
    'href="https://github.com/promprit/dryas-workflow"',
    'Delivered with the Dryas Workflow Framework.',
    'href="https://dryasstudio.com/contact/"',
    // Arrow keys step chapters; a new handover of the design file must keep it.
    "addEventListener('keydown', onKey)",
  ],
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && npm ci --no-audit --no-fund >/dev/null 2>&1; npm run build >/dev/null 2>&1; npm run test:dist`
Expected: exit 1; failures include `<body> missing "data-name=\"Review\""`, `<body> missing "<section class=\"chapter\" id=\"ch-8\">"` and `<head> missing "\"@type\": \"CreativeWork\""`.

- [ ] **Step 3: JSON-LD**

In `public/index.html`, in the `ProfessionalService` JSON-LD, replace the `description` line with:

```json
  "description": "AI-native studio that turns ideas into websites, apps, platforms and digital businesses. Fixed price, live in weeks, cared for after launch. Every project is delivered with the Dryas Workflow Framework.",
```

Then replace:

```json
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Digital business building", "description": "From first sketch to launch." } }
    ]
  }
}
</script>
```

with:

```json
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Digital business building", "description": "From first sketch to launch." } }
    ]
  },
  "subjectOf": {
    "@type": "CreativeWork",
    "@id": "https://dryasstudio.com/#framework",
    "name": "Dryas Workflow Framework",
    "description": "A target operating model for AI-assisted software delivery.",
    "url": "https://github.com/promprit/dryas-workflow",
    "creator": { "@id": "https://dryasstudio.com/#studio" }
  }
}
</script>
```

- [ ] **Step 4: CSS for the framework chapter**

After the line `  html.scrolly .cap.wide{width:min(600px,48vw)}` add:

```css
  .cap.wide h2.motto{font-size:clamp(40px,4.8vw,72px)}
  .cap .svc + .small + .cta{margin-top:20px}
```

- [ ] **Step 5: Captions**

Replace the Intro paragraph `<p>We turn ideas into websites, apps, platforms, and digital businesses with AI. Scroll to watch how.</p>` with:

```html
    <p>We turn ideas into websites, apps, platforms, and digital businesses with AI. Every project runs on our own framework. Scroll to watch how.</p>
```

Replace the Plan paragraph (`ch-2`) with:

```html
    <p>The <b class="c-opus">Orchestrator</b> recalls what worked and what failed before, writes the plan in its own isolated branch, and splits it into small tasks. Each task names the files it may touch and how we'll know it's done.</p>
```

Replace the Judge paragraph (`ch-3`) with:

```html
    <p>The <b class="c-jev">Judge</b> is a fast decision model. It answers yes, no or pick-one in a fraction of a second. It never writes code. It only decides.</p>
```

Replace the Escalate paragraph (`ch-5`) with:

```html
    <p>A <b class="c-sonnet">Builder</b> gets two tries. Then a <b class="c-opus">Lead model</b> takes the task, after we've found out why it failed. A <b class="c-fable">Frontier model</b>, the most capable AI there is, runs once, and only if that fails too. After that, a person steps in.</p>
```

Replace the whole `ch-6` (Ship) and `ch-7` (Motto) sections, from `  <section class="chapter" id="ch-6">` through the `</section>` that closes `ch-7`, with:

```html
  <section class="chapter" id="ch-6"><div class="cap" data-name="Review">
    <p class="n">06 Review</p>
    <h2>Checked twice. Then challenged.</h2>
    <p>The <b class="c-opus">Orchestrator</b> reviews every result in two stages: does it match the design, and is it well built? Contested changes get second opinions from two different AI models. Then the tests run.</p>
  </div></section>

  <section class="chapter" id="ch-7"><div class="cap" data-name="Ship">
    <p class="n">07 Ship</p>
    <h2>Verified. Signed off. Merged.</h2>
    <p>Nothing merges until the tests pass and the work is verified. A person signs off on anything that goes live. Every outcome is saved, so the next project starts smarter.</p>
  </div></section>

  <section class="chapter" id="ch-8"><div class="cap wide" data-name="Framework">
    <p class="n">The Dryas Workflow Framework</p>
    <h2 class="motto">Anything. Built by AI.</h2>
    <p>Every project we deliver runs on the Dryas Workflow Framework, a target operating model for AI-assisted software delivery. Five layers:</p>
    <ul class="svc">
      <li><b>Memory</b><span>What was tried, what worked, what failed.</span></li>
      <li><b>Governance</b><span>Who decides, and what each AI may touch.</span></li>
      <li><b>Execution</b><span>Small tasks, kept apart, built test-first.</span></li>
      <li><b>Escalation</b><span>A stronger model only when a cheaper one failed.</span></li>
      <li><b>Review</b><span>Nothing merges unverified. A person ships.</span></li>
    </ul>
    <p class="small">The method is open. The tools are replaceable.</p>
    <div class="cta"><a class="btn" href="https://github.com/promprit/dryas-workflow">Read the framework on GitHub →</a></div>
  </div></section>
```

Replace the Services small print `<p class="small">Fixed price, quoted before we start. After launch, we stay on and keep it running.</p>` with:

```html
    <p class="small">Fixed price, quoted before we start. Delivered with the Dryas Workflow Framework. After launch, we stay on and keep it running.</p>
```

- [ ] **Step 6: Run the check to verify it passes**

Run: `cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && npm run build >/dev/null 2>&1; npm run test:dist`
Expected: `✓ dist check passed for 3 pages`

- [ ] **Step 7: JSON-LD parses**

Run: `cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && node -e "const h=require('fs').readFileSync('dist/index.html','utf8');const j=JSON.parse(h.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/)[1]);console.log(j.subjectOf['@type'], j.subjectOf.url)"`
Expected: `CreativeWork https://github.com/promprit/dryas-workflow`

- [ ] **Step 8: Commit**

```bash
cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && git add scripts/check-dist.mjs public/index.html && git commit -m "feat(site): Review chapter and Dryas Workflow Framework copy on the landing page"
```

---

### Task 2: 3D timeline: shift Ship and later, add the review beat

Runs after Task 1 (same file).

**Files:**
- Modify: `scripts/check-dist.mjs` (LANDING block, plus one structural check)
- Modify: `public/index.html`, module script only: after `const rings` (~line 568), `slots()` (~638–682), camera `K` (~695–708), `LBL` (~719–733), `animate()` reveal and orb block (~808–828)

Scope:
- `scripts/check-dist.mjs`
- `public/index.html`

**Interfaces:**
- Consumes: 11 chapters from Task 1 (Review at `c ∈ [6,7)`, Ship at `[7,8)`, Framework at `[8,9)`).
- Produces: nothing later tasks call.

- [ ] **Step 1: Write the failing checks**

In `scripts/check-dist.mjs`, add to the LANDING `body` array, after the `"addEventListener('keydown', onKey)"` line:

```js
    // 3D labels for the seven-stage loop.
    "['LEAD MODEL', 'second try'",
    "['REVIEW', 'spec'",
    "['REVIEW', 'quality'",
    "['SECOND OPINIONS', '2 models'",
    "['TESTS', 'pass'",
```

Add to LANDING `forbidden`, after `'fonts.gstatic.com'`:

```js
    // Escalation re-runs on a stronger builder; the Orchestrator does not take over.
    "'takes over'",
```

Then, in the LANDING check block, after the line ``for (const s of LANDING.forbidden) if (html.includes(s)) fail(`contains forbidden ${JSON.stringify(s)}`);`` add:

```js
    // One camera keyframe per chapter, or the camera drifts out of step with the captions.
    const chapters = (html.match(/<section class="chapter"/g) ?? []).length;
    const k = html.match(/const K = \[([\s\S]*?)\n\];/);
    const keys = k ? (k[1].match(/^\s*\[V\(/gm) ?? []).length : 0;
    if (keys !== chapters) fail(`camera has ${keys} keyframes for ${chapters} chapters`);
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && npm run build >/dev/null 2>&1; npm run test:dist`
Expected: exit 1 with `camera has 10 keyframes for 11 chapters`, `contains forbidden "'takes over'"` and the five missing label strings.

- [ ] **Step 3: Second-opinion orbs**

In `public/index.html`, directly after the line `const rings = [opusRings(N.plan), opusRings(N.review)];` add:

```js
// two second-opinion reviewers that flank review during the interrogate step
const SO = [V(6.6, 6.2, -2.4), V(6.6, 6.2, 2.4)];
const O2 = [orb(SO[0], 0.45, 320, COL.sonnet), orb(SO[1], 0.45, 320, COL.opus)];
const soLines = SO.map(p => {
  const geo = new THREE.BufferGeometry().setFromPoints([p, N.review]);
  const m = new THREE.LineDashedMaterial({ color: COL.opus, dashSize: 0.18, gapSize: 0.18, transparent: true, opacity: 0 });
  const l = new THREE.Line(geo, m); l.computeLineDistances(); scene.add(l); track(geo, m); return m;
});
```

- [ ] **Step 4: Packets (`slots`)**

Change the comment `// one function: where every packet is, for a given chapter value c (0..8)` to end in `(0..10)`.

Change `  if (c >= 2.05 && c < 6.45) {` to:

```js
  if (c >= 2.05 && c < 7.45) {                              // builders' work waits at review until it ships
```

Replace:

```js
  if (c >= 6.38 && c < 7.05) s.push({ c: P.ship, t: ease(remap(c, 6.45, 6.95)), col: COL.opus, size: 7.5 });
  if (c >= 6.95) {                                          // finale: the loop keeps running on its own
    const fade = remap(c, 6.95, 7.3);
```

with:

```js
  if (c >= 7.38 && c < 8.05) s.push({ c: P.ship, t: ease(remap(c, 7.45, 7.95)), col: COL.opus, size: 7.5 });
  if (c >= 7.95) {                                          // finale: the loop keeps running on its own
    const fade = remap(c, 7.95, 8.3);
```

Leave `} else t = k === 1 ? 1 : 0.76 + 0.24 * ease(remap(c, 6.05, 6.38));` unchanged (arrival at review, now chapter 6).

- [ ] **Step 5: Camera keyframe**

In `const K = [`, replace:

```js
  [V(12.5, 12, 5.5), V(2.5, 7, -5)],                  // escalate
  [V(15.5, 5.6, 9.5), V(8.4, 2.6, 0)],                // ship
```

with:

```js
  [V(12.5, 12, 5.5), V(2.5, 7, -5)],                  // escalate
  [V(10, 7, 9), V(6, 4.6, 0)],                        // review: close on the review node
  [V(15.5, 5.6, 9.5), V(8.4, 2.6, 0)],                // ship
```

- [ ] **Step 6: Labels, then audit literals**

In `const LBL = [`, replace:

```js
  ['ORCHESTRATOR', 'takes over', N.exec[1], '#4FD1B9', 1.5, 5.26, 5.5],
```

with:

```js
  ['LEAD MODEL', 'second try', N.exec[1], '#4FD1B9', 1.5, 5.26, 5.5],
```

Replace:

```js
  ['ORCHESTRATOR', 'review', N.review, '#4FD1B9', 1.9, 6.0, 6.55],
  ['SHIPPED', 'live', N.main, '#3DFF8B', 1.1, 6.8, 7.25],
  ['THE LOOP', 'ship · learn · improve', P.trunk.getPointAt(0.62), '#3DFF8B', 0.5, 7.05, 8.0]
```

with (labels fade over 0.12 at each edge via `bump`, so `spec` is gone at 6.6 when `quality` starts):

```js
  ['REVIEW', 'spec', N.review, '#4FD1B9', 1.9, 6.22, 6.6],
  ['REVIEW', 'quality', N.review, '#4FD1B9', 1.9, 6.6, 6.92],
  ['SECOND OPINIONS', '2 models', SO[1], '#8AA9FF', 0.9, 6.62, 6.98],
  ['TESTS', 'pass', N.review, '#3DFF8B', -1.4, 6.85, 7.12],
  ['SHIPPED', 'live', N.main, '#3DFF8B', 1.1, 7.8, 8.25],
  ['THE LOOP', 'ship · learn · improve', P.trunk.getPointAt(0.62), '#3DFF8B', 0.5, 8.05, 9.0]
```

Audit: run `cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && grep -n -o -E '\b[5-8]\.[0-9]+\b' public/index.html | awk -F: '$1>430'`. Every hit between 5.9 and 8.0 must be one of the new values in Steps 4–7, or on this keep-list: `6.05`, `6.38` (branch arrival), `seen(c, 5.9)` (review orb and ring appear), escalate values below `6.1`, and the review camera keyframe coordinates. Fix any other hit by adding 1.0.

- [ ] **Step 7: `animate()` reveals and orbs**

Replace `  const fin = remap(c, 6.9, 7.4);` with:

```js
  const fin = remap(c, 7.9, 8.4);
```

Replace:

```js
  T.ship.mat.uniforms.uReveal.value = Math.max(remap(c, 6.4, 6.95), fin) * 1.1;
  T.trunk.mat.uniforms.uReveal.value = remap(c, 6.75, 7.25) * 1.1;
```

with:

```js
  T.ship.mat.uniforms.uReveal.value = Math.max(remap(c, 7.4, 7.95), fin) * 1.1;
  T.trunk.mat.uniforms.uReveal.value = remap(c, 7.75, 8.25) * 1.1;
```

Replace:

```js
  setOrb(O.review, Math.max(seen(c, 5.9), fin), bump(c, 6.0, 6.55));
  setOrb(O.main, Math.max(seen(c, 6.75), fin), remap(c, 6.85, 7.0) * 0.8);
```

with:

```js
  setOrb(O.review, Math.max(seen(c, 5.9), fin), bump(c, 6.22, 6.6) + bump(c, 6.6, 6.92));   // two review stages, two pulses
  setOrb(O.main, Math.max(seen(c, 7.75), fin), remap(c, 7.85, 8.0) * 0.8);
```

Directly after `  O.fable.mat.uniforms.uAlpha.value = 0.22 + 0.78 * Math.max(bump(c, 5.45, 6.1), fin * 0.4);` add:

```js
  const so = bump(c, 6.6, 6.98);                            // second opinions appear only during the interrogate step
  O2.forEach(o => { o.mat.uniforms.uAlpha.value = so; o.mat.uniforms.uLit.value = so * 0.6; });
  soLines.forEach(m => { m.opacity = 0.35 * so; });
```

- [ ] **Step 8: Run checks to verify they pass**

Run: `cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && npm run verify 2>&1 | tail -5`
Expected: last line `✓ dist check passed for 3 pages`, exit 0.

- [ ] **Step 9: Module script parses**

Run: `cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && node -e "const fs=require('fs');const h=fs.readFileSync('public/index.html','utf8');const m=h.match(/<script type=\"module\">([\s\S]*?)<\/script>/);fs.writeFileSync('/tmp/landing-module.mjs',m[1]);" && node --check /tmp/landing-module.mjs && echo PARSE-OK`
Expected: `PARSE-OK`

- [ ] **Step 10: Commit**

```bash
cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && git add scripts/check-dist.mjs public/index.html && git commit -m "feat(site): review beat in the 3D story; shift ship and finale one chapter"
```

---

### Task 3 (orchestrator): browser verification and design pass

Not an executor task: it needs the Playwright MCP and the design skills.

- [ ] **Step 1:** `cd /Volumes/Peem1TB/Dev/projects/dryas/.worktrees/site-framework-story && npm run build && npx astro preview --port 4329` (background).
- [ ] **Step 2: Playwright MCP at 1440×900** (`browser_run_code_unsafe`):
  - the rail has 11 buttons, `aria-label`s `Go to Intro` … `Go to Contact` in spec order;
  - clicking each, `STORY.c` settles within ±0.15 of `i + 0.5`;
  - from the top, 10× ArrowDown visits chapters 1…10 in order; Shift+ArrowDown does not move;
  - `browser_console_messages` at level error: none.
- [ ] **Step 3: Screenshots** at `c = 5.5, 6.4, 6.75, 6.95, 7.6, 8.5` (scroll to `story.offsetTop + c / 11 * (story.offsetHeight - innerHeight)`), at 1440×900 and 390×844, plus chapter 8 at 375×667. Check: captions readable; labels not clipped or overlapping; second-opinion orbs visible only around 6.75; Framework button on-screen at 375×667.
- [ ] **Step 4:** `browser_emulate_media` with reduced motion: a rail click jumps instantly; Review and Framework captions visible.
- [ ] **Step 5:** No WebGL (stub `HTMLCanvasElement.prototype.getContext` to return null before load): all 11 captions present.
- [ ] **Step 6: Design pass:** run `ui-ux-pro-max` and `impeccable` (critique) on the Framework chapter layout, the Review copy and the review-beat screenshots. Material findings become a fix task (Sonnet executor, same Scope as Task 2); re-run Steps 2–3 afterwards.
- [ ] **Step 7:** `/wreview`, `superpowers:verification-before-completion`, `/commit` for any fixes, then ask the owner before merge, push and the wrangler deploy.

---

### Task 4 (orchestrator, separate repo): README backlink in dryas-workflow

Single-file docs change in `/Volumes/Peem1TB/Dev/projects/dryas-workflow` (plain Claude, no worktree).

- [ ] **Step 1:** Ask the owner, then `cd /Volumes/Peem1TB/Dev/projects/dryas-workflow && git pull --ff-only origin main` (local is one commit behind, `2431f32`).
- [ ] **Step 2:** In `README.md`, after the line that starts `This repo is public but expect rough edges.`, add a blank line and:

```markdown
Built and run by [Dryas Studio](https://dryasstudio.com), which delivers every client project with it.
```

- [ ] **Step 3:** `/commit` with message `docs(readme): link Dryas Studio, which delivers with the framework`. Push only after the owner says so.
