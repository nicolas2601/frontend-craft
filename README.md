# frontend-craft

**A professional frontend design skill set for coding agents.** It turns "make me a landing page" into a page a
designer would sign: a structure chosen for the subject, a sober palette with one colour that gives it life, real
photographs, motion that is timed to the reader, and a browser check that refuses the look every generated page
falls into. Works in Claude Code, Codex, OpenCode, Cursor, Gemini CLI and pi, in any framework.

Ask a model for "a landing page for a guesthouse" and you usually get the same page: cream background, a serif
headline, a terracotta accent, three equal cards, an eyebrow above every heading, a footer in four grey columns.
Rules in a prompt do not fix it, because the model falls back to its defaults whenever a decision is left open.
frontend-craft closes those decisions: the model makes them as a designer, with real references and candidates in
front of it, and scripts check every choice before and after the build.

## Quick start

**Claude Code** (plugin: every skill, the two reviewer agents, the MCP servers and the Stop-hook gates):

```
/plugin marketplace add nicolas2601/frontend-craft
/plugin install frontend-craft@frontend-craft
```

**Any agent that reads Agent Skills** (Codex, OpenCode, Cursor, Gemini CLI, pi):

```sh
npx skills@latest add nicolas2601/frontend-craft --all
```

Then check the machine (Node 22+, a Chrome, ffmpeg, Python 3, playwright-cli, the sibling skills, the MCP servers):

```sh
node ~/.agents/skills/frontend-craft/scripts/setup.mjs            # what is there and what is missing
node ~/.agents/skills/frontend-craft/scripts/setup.mjs --install  # user-level installs only, never sudo
```

OpenCode, Codex and the manual install: [docs/installation.md](docs/installation.md).

## Prompts to start with

Copy one into your agent, in any language:

```
Use the frontend-craft skill: build the landing page for a six-room guesthouse in Barichara, Colombia,
with a looping video of the courtyard in the hero. Page in Spanish.
```

```
Use the frontend-craft skill: a landing page for a specialty coffee roaster in Bucaramanga that sells
beans online and has a tasting bar. Sober colours, real photographs.
```

```
Use the frontend-craft skill: a dashboard for our support queue in React with shadcn. Restraint, no set pieces.
```

```
Use craft-review on http://localhost:5173: strict review, Before | After | Why, do not edit.
```

```
/hallmark redesign ./src/app        (Hallmark's own redesign, keeping content and wiring)
```

## The design flow

```
prompt ─> frontend-craft (router)
  1  read the project, pick the kind, 2-3 moods and the language
  2  start.mjs lists the structures and art directions that fit  ─> the model chooses (ui-ux-pro-max landing patterns)
  3  concept.md: the idea only this client has, what it refuses   ─> inspiration.md, the Awwwards MCP
  4  photographs: the client's, or two licensed libraries          ─> design-taste-frontend, Hallmark (755 Wikimedia photos)
  5  the look: the model chooses colours and faces                 ─> color-type.md, ui-ux-pro-max, Hallmark themes,
                                                                       design.mjs accents <photo>, then design.mjs set (checked)
  6  hero loop when the subject is real                            ─> parallax.mjs (CPU), hf-asset-generate, kaggle-video
  7  build the first screen alone, look at it, then the rest       ─> blueprints, the motion kit, set pieces, components
  8  check.mjs in Chrome                                           ─> defects, richness, finish, impeccable detect, Hallmark sloplint
  9  two reviewers in parallel                                     ─> craft-design-critic, craft-motion-auditor (playwright-cli)
 10  polish and the motion review, check again, report             ─> impeccable, Emil Kowalski's skills
```

What decides what:

| Decision | Who makes it | What holds it |
|---|---|---|
| Structure (composition) and art direction | The model, from the lists that fit the subject | `start.mjs` refuses to start without them; a subject sold by its photographs is offered only photo-first structures |
| Colours | The model: a white or near-white ground, a near-black ink, one accent with life taken from the subject (or a Hallmark theme taken whole) | `design.mjs` checks contrast, the sober method, violet, neon and framework-default accents, and writes `tokens.css`; the check fails while the look is pending |
| Faces | The model, from ui-ux-pro-max's pairings and Google Fonts | `design.mjs` checks the families and weights exist and warns on the faces every generated page uses |
| Set pieces, motion, the library component | Dealt from the chosen direction, for variety | The check measures that they render, move, and finish while they can be read |
| Everything else | The two reviewers and the user | The order is: the user, accessibility, the subject, then the brief |

## What the check refuses

`check.mjs` loads every page in headless Chrome three times (normal at 1440, 1280, 768 and 390; reduced motion;
JavaScript off) and runs impeccable's detector and Hallmark's sloplint. A few of the things that fail a page:

- a subject sold by its photographs whose first screen is text, with the picture below the fold;
- cards and tiles left mostly empty, a footer with no way to reach the business;
- photographs tinted to match a palette, a palette that never was chosen;
- scroll animations that finish after their element has left the screen, motion with no reduced-motion fallback;
- eyebrows and tracked-caps labels, middle-dot meta strings, em dashes, an italic word in a heading, purple
  gradients, a card inside a card, invented testimonials or numbers, a form that thanks without sending;
- a hidden menu on phones, controls under 14 px, tap targets under 44 px, sideways scroll.

The full list with causes and fixes: [checks.md](skills/frontend-craft/references/checks.md).

## What is in the box

**Own skills**

| Skill | Job |
|---|---|
| [`frontend-craft`](skills/frontend-craft/SKILL.md) | The router and the build run: 16 art directions, 15 compositions with working blueprints, 14 scroll set pieces, 4 WebGL hero scenes, hero loops, 43 curated React Bits components, a dependency-free motion kit, `design.mjs` and `check.mjs` |
| [`craft-motion`](skills/craft-motion/SKILL.md) | Add, fix or trim motion in an interface that already exists |
| [`craft-review`](skills/craft-review/SKILL.md) | A strict rendered review: findings as Before, After, Why with exact values. Does not edit |
| [`craft-learn`](skills/craft-learn/SKILL.md) | Turn a session's design corrections into testable rules in `DESIGN.md` |
| [`svg-craft`](skills/svg-craft/SKILL.md) | Icons, logos, illustrations and diagrams, with a render-and-look loop and a geometry lint |
| [`hf-asset-generate`](skills/hf-asset-generate/SKILL.md) | Free images, edits and short clips through the Hugging Face MCP server |
| [`kaggle-video`](skills/kaggle-video/SKILL.md) | Image-to-video with Wan 2.2 on Kaggle's free GPUs, for hero loops with real motion |

**Reviewer agents**, generated from [review.md](skills/frontend-craft/references/review.md) for Claude Code
([agents/](agents/)) and OpenCode ([integrations/opencode/agents/](integrations/opencode/agents/)):
`craft-design-critic` and `craft-motion-auditor`, run in parallel at the end of every build.

**Bundled skills**, copied unchanged from upstream at a pinned commit ([vendor.json](vendor.json), licences in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)); `npm run verify` fails if one byte differs:

| Skill | From | Job here |
|---|---|---|
| [`hallmark`](skills/hallmark/SKILL.md) | [nutlope/hallmark](https://github.com/nutlope/hallmark), MIT | Its sloplint inside the check, fifty finished themes to choose a look from, a 755-photo library, the hero-first and finish reviews, its own run when named |
| [`design-taste-frontend`](skills/design-taste-frontend/SKILL.md) | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), MIT | The photo library with credits, and the run for a quiet site when the user asks for one |
| [`impeccable`](skills/impeccable/SKILL.md) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable), Apache-2.0 | Critique, audit, polish and the detector |
| [`ui-ux-pro-max`](skills/ui-ux-pro-max/SKILL.md) | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), MIT | Candidates: font pairings, Google Fonts, palettes, landing patterns, UX rules |
| `emil-design-eng`, `animate`, `choreograph`, `animation-performance`, `animation-vocabulary`, `review-animations`, `improve-animations`, `remove-animations`, `find-animation-opportunities`, `gestures`, `break-ui`, `pick-ui-library`, `prototype`, `apple-design`, `learn-taste` | [emilkowalski/skills](https://github.com/emilkowalski/skills), MIT | Motion and interaction craft |
| [`ui-animation`](skills/ui-animation/SKILL.md) | [mblode/agent-skills](https://github.com/mblode/agent-skills), MIT | Springs, easing fitted from recordings, interface sound |
| [`playwright-cli`](skills/playwright-cli/SKILL.md) | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli), Apache-2.0 | Looking at and measuring the page from the shell |

**MCP servers** ([.mcp.json](.mcp.json) in the plugin; the others in [docs/installation.md](docs/installation.md)):
Playwright, Hugging Face (free stills and clips) and, optionally, Awwwards (references and motion timing of award
winners).

## Hero loops, for free

| Route | How | Cost |
|---|---|---|
| Parallax from a still | `scripts/parallax.mjs`: a depth map on the CPU, a slow periodic camera move, an exact loop of any length | Free, local, no GPU |
| Generated motion | `hf-asset-generate`: Z-Image Turbo, a camera-moved keyframe, Wan 2.2 from A to B and back | Free account, a few runs a day |
| Generated motion on Kaggle | `kaggle-video`: Wan 2.2 TI2V-5B in a private kernel on a T4 | Free, 30 GPU hours a week |
| Coded film | HyperFrames or bang-motion | Free, local |

`scripts/video.mjs` turns any of them into a muted 30 fps loop (mp4, webm, poster) that the kit plays only on
screen, never under reduced motion, with a pause button. [hero-video.md](skills/frontend-craft/references/hero-video.md).

## Develop

```sh
npm test                 # unit tests, deals, rules, gates, set pieces, the check in Chrome
npm run verify           # own skills' structure and the bundled skills' hashes
npm run test:blueprints  # every composition blueprint through the check
npm run test:frameworks  # the kit in real Vue and Svelte projects
node scripts/vendor.mjs --update   # move the bundled skills to upstream HEAD, record new hashes
```

Layout: `skills/` (what gets installed), `vendor.json`, `tests/`, `scripts/` (verify, vendor, eval, pack,
review-agents, sync-landing), `integrations/` (OpenCode), `hooks/` (Claude Code), `docs/`.
Architecture and decisions: [docs/architecture.md](docs/architecture.md). Changes: [CHANGELOG.md](CHANGELOG.md).

## Credits and licence

Own code is MIT ([LICENSE](LICENSE)). Bundled skills keep their own licences (MIT or Apache-2.0) in their folders;
see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Hero-loop depth uses Depth Anything V2 Small (Apache-2.0),
downloaded on first use. The writing discipline for agent-facing documents follows
[mattpocock/skills](https://github.com/mattpocock/skills).
