---
name: craft-review
description: >-
  Strict review of a rendered web page or app screen: runs the frontend-craft browser check,
  looks at the screenshots and returns prioritized findings as Before, After, Why with exact
  values, plus what must not change. Does not edit unless asked. Use when the user asks to
  review, audit, critique or grade a page, compare it to a reference, or asks why it looks
  generic, cheap or "AI-made".
---

# craft-review

Judge the page a visitor gets, not the code you expect. Requires the `frontend-craft` skill next to this one (`<fc>` below is its folder). Review only; edit only when the user asks.

## The run

1. **Render it.** `node <fc>/scripts/check.mjs --url <url> --kind <kind>` (or `--root <build folder>`). Use `--no-deal` unless the project has a `.craft/deal.json` you are reviewing against.
   A page built by `design-taste-frontend` (it has a `.taste-skill/` folder): also run its gate, `node <taste>/scripts/gate.mjs` with `<taste>` that skill's folder (a manual run lists its FAILs), and judge against its house rules, not this skill's.
2. **Look.** Open every screenshot in `.craft/shots/`. Answer each with a fact, not an adjective:
   - What dominates the first screen at 1440, and is it the thing being sold?
   - At 390 px, is the primary action visible without scrolling? What is cropped?
   - Which parts read as a generated default (cream + serif italic + terracotta, purple gradient, glow blobs, three equal cards, an eyebrow over every heading, stock phrases)?
   - What moves, and what job does each motion do? What should move and does not?
   - Where does the type scale, spacing or color break its own system?
   Then load `impeccable` and run its critique on the same screenshots; merge its findings into yours, deduplicated.
3. **Write the findings**: at most 12 rows, highest visitor impact first.

```
Verdict: Ship: no | yes, with fixes | yes  (check: <n> FAIL, <n> WARN)

| # | Where | Before | After | Why |
|---|-------|--------|-------|-----|
| 1 | Hero h1 at 390 | 7 lines, breaks "Bucaramanga" | --t-display, max-width 12ch, 4 lines | The promise is lost below the fold |
| 2 | Primary button | transition: all 300ms ease-in | transform 140ms var(--ease-out), scale(0.97) on press | Instant feedback; no layout transitions |

Keep: <the specific things that work and must survive the fixes>
Not verified: <what the screenshots and check cannot show: real devices, slow networks, content not supplied>
```

## Standards

Every "After" names a value: px, ms, a token (`--t-display`, `--c-muted`), a ratio or an attribute. "Make it pop", "more premium" and "cleaner" are not findings. The bar is the house rules in `<fc>/SKILL.md` and the check catalogue in `<fc>/references/checks.md`. A FAIL from the check is always a finding; a WARN is one when the screenshot confirms it. Praise is listed under Keep, never padded into the table.
