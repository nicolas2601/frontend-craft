---
name: craft-motion
description: >-
  Adds, fixes or trims motion in an interface that already exists, without redesigning it:
  first-screen entrances, one scroll story, press and hover feedback, count-ups, marquees,
  reduced-motion fallbacks. Any framework, using the frontend-craft kit or the project's own
  Motion or GSAP with the same timing rules. Use when the user asks for animations, says a page
  feels static, flat or lifeless, wants scroll effects, or wants janky or excessive motion fixed.
---

# craft-motion

Motion needs a job: feedback, continuity, explanation, direct manipulation or delight. A page gets one entrance, one scroll story and quiet feedback; not a fade on every section. Requires the `frontend-craft` skill next to this one (`<fc>` below is its folder).

## The run

1. **Measure what moves now.** Start the page, then `node <fc>/scripts/check.mjs --url <url> --no-deal --kind <kind>`. Read the Motion line and open `.craft/shots/`. Search the code for `transition`, `animation`, `@keyframes`, `motion`, `gsap`, `framer`.
2. **Mark the opportunities, in this order.**
   1. Press feedback on every button and button-like link (`data-press`).
   2. First-screen entrance: 3-6 elements in reading order, done by about 1.5 s (`data-enter`, or `data-words` on the h1).
   3. One scroll story that explains something: a statement lit as it is read (`data-scroll-words` in a `data-pin`), chapters that stack (`data-stack`), a process that moves sideways (`data-rail`), an object that turns or fills with scroll (`data-scrub` + `var(--p)`).
   4. Proof that counts (`data-count`) on real numbers only.
   Never animate: keyboard shortcuts, text inputs, tabs and nav links beyond a 150 ms color change, anything used many times a minute, tooltips in a group after the first.
3. **Remove before adding.** Delete fade-ins on every section, `transition: all`, `ease-in` entrances, `scale(0)` starts, scroll listeners without rAF, ambient loops with no job.
4. **Install the kit** if the project has no motion library: `node <fc>/scripts/start.mjs --kit-only --kind <kind> --url <url>`, then wire it as in `<fc>/references/frameworks.md`. If the project uses Motion or GSAP, keep it and apply the same numbers.
5. **Implement** with the numbers below; kit attributes and options are in `<fc>/references/motion.md`.
6. **Verify.** `node <fc>/scripts/check.mjs` until `RESULT: PASS`; look at `1440-early.png`, `1440.png` and the tiles. Toggle reduced motion in the browser devtools and confirm the final states show.
7. **Report** as a table: `| Where | Before | After | Why |`, one row per change, with the values used.

## Numbers

| Thing | Value |
|---|---|
| Press | `scale(0.97)`, 100-160 ms, ease-out |
| Hover | only under `(hover: hover) and (pointer: fine)`; 150-220 ms |
| UI feedback (menus, popovers, toggles) | 150-300 ms, `cubic-bezier(0.23, 1, 0.32, 1)` |
| Entrance per element | 600-800 ms, 16-24 px rise, 0-8 px blur |
| Stagger | 30-90 ms; whole entrance under 1.5 s |
| Exit | 60-75% of the matching entrance |
| Scale start | 0.9-0.97, never 0 |
| Effects per viewport | at most 4 moving; at most 1 pinned or scrubbed |
| Parallax | speed 0.05-0.3, capped at 160 px |
| Reduced motion | final state at once; keep opacity and color changes, drop movement |

Properties: `transform`, `opacity`, `clip-path`, `filter` only. Read scroll position in `requestAnimationFrame`. Never leave content at `opacity: 0` when JavaScript fails: hide initial states only under a class the script adds (the kit uses `html.craft-js`).
