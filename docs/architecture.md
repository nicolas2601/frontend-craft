# Architecture and decisions

## 2.1: the router and the bundle

The 2.0 pages passed their own check and still looked flat: text, cards and a chart, no photographs, no
texture, no scenes. The check measured defects, not richness, and the skill had no visual layer to draw from.
`design-taste-frontend` (taste-skill 2.5.1) has that layer and its own gate, built and tested over many more
runs. Rebuilding it would duplicate work and lag behind upstream, so 2.1 bundles it and routes to it:

```
skills/frontend-craft      router + app/docs run (dealt tokens, kit, check.mjs, gate.mjs, stop-gates.mjs)
skills/design-taste-frontend  website engine, bundled unchanged (vendor.json pins the commit, verify checks the hash)
skills/impeccable, Emil skills, ui-ux-pro-max, ui-animation   finish passes and specialist advice, bundled unchanged
hooks/route.mjs            Claude Code prompt hook: web work -> router
integrations/opencode      plugin that runs both gates on session idle
```

- **Bundled, never forked.** `scripts/vendor.mjs` copies each upstream folder at a pinned commit; `npm run verify`
  fails on any byte of difference. Integration lives only in the router, the hooks and the plugin, so updating is
  `vendor.mjs --update` plus a test run.
- **One owner per page.** A website is built and gated by `design-taste-frontend` alone; the router forbids mixing
  in frontend-craft's palettes, blueprints or kit. `start.mjs` refuses a website kind while that engine is installed
  (`--fallback` overrides it and the report must say so).
- **Advice has an order.** User, accessibility, the engine's house rules, then impeccable and the Emil skills, then
  defaults. The finish passes run only after `GATE: PASS` and the gate runs again after them.
- **Gates per harness.** Claude Code: each skill's own Stop hook. Codex: `stop-gates.mjs` as one Stop hook. OpenCode:
  the plugin. Elsewhere the skills tell the agent to run the gate; nothing enforces it.

## Why 2.0 existed

Version 1 was a research archive: 39 Markdown files, about 94,000 words, four hops from the entry file to a working recipe, no numeric rules in the entry file, and verification written as prose ("inspect the render", "compare with references"). Strong models could use it. A weaker model (DeepSeek V4.1 Flash in OpenCode, given a one-line brief for a coffee shop) produced the generated default anyway: cream background, serif headline with an italic word, terracotta accent, tracked mono labels, three equal cards and almost no motion. It also reported the work as done.

The failure was structural, not a missing rule:

| v1 | Effect on a weak model | v2 |
|---|---|---|
| Open design decisions ("choose a direction") | Falls back to its prior | Decisions dealt from a library (`start.mjs`) |
| Motion described in prose and long recipes | Writes weak versions or none | Copy-in kit driven by data attributes |
| Verification as instructions | Skipped, then "done" | A browser check with exit codes and a Stop-hook gate |
| 94k words behind pointers | Never reaches the relevant part | 1,200-word run with numbers; references one hop away |
| Structure verified, output never measured | Regressions invisible | Evals run a real agent and score it with the gate |

## Components

```
skills/frontend-craft/
  SKILL.md            the run, house rules with numbers, framework wiring (Stop hook in frontmatter)
  kit/                craft.css (tokens, base, motion states), craft-motion.js + motion/ (runtime)
  library/            palettes, type pairings, compositions, motion signatures (JSON)
  scripts/start.mjs   deal + copy kit + tokens.css + brief + arm gate
  scripts/check.mjs   render in Chrome and evaluate rules
  scripts/gate.mjs    hook and CLI around check: block while FAILs remain, never trap
  scripts/lib/        chrome (CDP client), probes (in-page), rules (pure), deal, render, copy lint
  references/         motion.md, frameworks.md, checks.md
skills/craft-motion, craft-review, craft-learn   one job each, reuse the scripts above
integrations/opencode                            gate plugin and agent for a harness without Stop hooks
```

## Decisions

- **No dependencies.** The checker drives Chrome over the DevTools protocol with Node's built-in WebSocket. Nothing to install in the user's project beyond copying the kit; the kit is plain ES modules.
- **Facts, then rules.** Probes run in the page and return JSON; rules are pure functions over that JSON, so every rule is unit-tested without a browser and the browser path is covered by two end-to-end fixtures.
- **Measure effects, not attributes.** Motion presence is detected from what changes on screen (animations started, style mutations, computed transforms at two scroll positions), so pages built with GSAP, Motion or CSS scroll timelines pass as well as kit pages.
- **Content is never hostage to motion.** Hidden initial states apply only under `html.craft-js`; a CSS failsafe shows them after 2.5 s if the runtime never starts; reduced motion shows final states. The check fails a page whose text is invisible with JavaScript off, under reduced motion, or after a full scroll.
- **The deal is binding but escapable.** `--redeal`, `--pin` and `--brand` keep the user in control; the check enforces the dealt display font and the first screen's field color so a model cannot quietly swap back to its default.
- **Novelty over a perfect mood match.** When every on-mood item was used in the last six deals, the deal widens to the whole library before repeating one.
- **The gate never traps.** A block budget per build (4), repeated identical stops, missing targets and unreachable servers are each let through once explained, so an agent can always stop and report a blocker.
- **Taste stays human.** The check cannot judge composition quality; it writes screenshots and the run requires the agent to open them and fix the three weakest things it sees.
