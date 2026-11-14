# Architecture and decisions

## 2.4: hero loops

A first screen can carry footage instead of a shader when the subject is real (`references/hero-video.md`).
Generation stays free: the Hugging Face MCP server's Z-Image Turbo makes the still and Wan 2.2
first-last-frame animates it with the same frame at both ends. `scripts/video.mjs` closes the seam with a
crossfade after motion interpolation (the generated end frame drifts from the start frame) and encodes mp4,
webm and a poster. The kit's `data-loop` owns playback (on screen only, poster under reduced motion and
Save-Data, a sticky pause), and the check reads every looping video in the normal pass (muted, poster, a pause
control, whether it played in the first screen) and in the reduced-motion pass (still playing).

## 2.3: range and the AI tells

2.3 widens what a deal can be and what the check refuses. Directions carry `modes` (persuade for websites,
operate for platforms) and `scenes`; `deal()` adds per-page set pieces for `--kind site` (no piece twice), a
React Bits component from `library/components.json`, a hero scene (`kit/motion/scene.js`, four WebGL shaders),
and the page language. Recent set pieces, components and scenes are avoided like recent directions. The check
runs every dealt page, judges the direction's breaks across the site, fails the tells a reviewer called
machine-made (`rules-slop.mjs`: language, slogan shapes, numbering systems, round badges, a photograph used twice)
and runs impeccable's detector on each page (`lib/impeccable.mjs`), softening the rules the deal itself chose.

## 2.2: websites get a dealt direction, set pieces and a richness floor

2.1 sent every website to `design-taste-frontend`. Two real runs on 2026-11-13 (a GPT model in Claude Code and MiniMax then
LongCat in OpenCode, the same cafe prompt) both followed that route faithfully and produced nearly the same still
page. The cause is in the engine's house rules, not in the models:

- a place page's hero is printed, never dealt (Recipe 3: the photograph on top, words under it);
- its eight cafe palettes are all a light warm ground with one accent, and every model takes the first one dealt;
- its cafe photographs come from one pool of 18 frames, shared across builds unless `TASTE_SKILL_RECENT` is set;
- its checker fails any effect (`effect-kind`) and any scroll-linked motion or parallax (`scroll`) on a place,
  shop or service page: "the page scrolls plainly and the parts sit still".

That engine is right for a credible, quiet small-business site, and wrong for a user who asks for an animated,
distinctive one. 2.2 keeps it bundled and unchanged, and changes the route:

```
skills/frontend-craft      router + the build run for every website, app and docs page
  library/directions.json  16 art directions (12 in 2.2): grounds, type floor, photo treatment, two template breaks, set pieces
  kit/set-pieces.css       9 scroll scenes on data-scrub (iris, type-pass, zoom, curtain, fan, letters, develop, tilt, split)
  scripts/lib/rules-richness.mjs   the floor a dealt website must clear
skills/design-taste-frontend  photo library for every website; the run for a quiet site the user asks for
```

- **Variety is dealt, not requested.** A prompt cannot make a model inventive; a deal can make two runs different.
  The direction is drawn at random with history (never one of the last four), and with `--risk bold` about 40% of
  the time from outside the subject's moods. A subject that matches fewer than three directions draws from at
  least three, so no single direction can own a trade (the coffee brief had one match and got it 60% of the time
  before this rule).
- **Richness is checked, not hoped for.** On a dealt website the check fails: fewer distinct section grounds than
  the direction asks, fewer photographs, no full-bleed photograph where the direction wants one, a headline under
  the direction's size, scroll-linked motion in fewer than two sections, a dealt set piece missing, and a missing
  or thin `.craft/concept.md`. Blueprints and framework builds are checked without the direction (they are
  skeletons).
- **The concept is written down.** `.craft/concept.md` (Idea, Signature, Rejected) makes the agent name the one
  thing only this subject has and the defaults it refuses, before markup. The check reads its structure, not its
  quality; the screenshots and the impeccable pass judge quality.
- **Taste's assets, not its house rules.** Photographs come from its `photos.mjs` (licensed, credited); the brief
  says to ignore the layout notes that command prints. Its gate never arms on a frontend-craft build: only its own
  `start.mjs` or `gate.mjs --start` arm it, and a `.taste-skill/found.json` left by a photo search does not.
- **Finish passes sharpen, they do not tame.** impeccable and review-animations run after `RESULT: PASS`; the
  router tells the agent to refuse fixes that remove set pieces, flatten grounds or shrink type.

## 2.1: the router and the bundle (superseded for websites by 2.2)

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
