# frontend-craft

**A design studio for coding agents.** frontend-craft makes an agent build a website the way a studio does: the
client's own material first (their photographs and their TikTok or Instagram videos), real references, a written
direction and a section-by-section storyboard, real media (the client's footage, licensed stock, their product in
3D, a real map), finished section recipes and component libraries, and a browser that photographs every section in
motion so nothing ships half done. The model makes every design decision; scripts fetch media and catch defects.
Works in Claude Code, Codex, OpenCode, Cursor, Gemini CLI and pi, in any framework.

Ask a model for "a landing page for a café" and you usually get the same page: a near-black ground with one bright
accent (or cream with a serif and terracotta), an eyebrow above every heading, a big number with a small label, a
paragraph that lights up word by word, a drawn map, and a dark stage that opens on three words. Rules in a prompt do
not fix it, and neither do scripts that force more effects. frontend-craft 4 puts the model in the design lead's
chair with the client's real material in front of it, gives it finished parts to build with, and makes it look at
every section in motion before a check that only refuses what is objectively broken.

## Quick start

**Let your agent install everything:** paste the prompt in [docs/installation.md](docs/installation.md#install-with-your-agent-copy-this-prompt) into Claude Code, OpenCode or any agent with a shell. Or by hand:

**Claude Code** (plugin: every skill, the reviewer agents, the MCP servers and the Stop-hook gates):

```
/plugin marketplace add nicolas2601/frontend-craft
/plugin install frontend-craft@frontend-craft
```

**Any agent that reads Agent Skills** (Codex, OpenCode, Cursor, Gemini CLI, pi):

```sh
npx skills@latest add nicolas2601/frontend-craft --all
```

Then check the machine (Node 22+, a Chrome, ffmpeg, Python 3, yt-dlp, playwright-cli, the 21st.dev CLI, the sibling skills, the MotionSites library, the MCP servers):

```sh
node ~/.agents/skills/frontend-craft/scripts/setup.mjs            # what is there and what is missing
node ~/.agents/skills/frontend-craft/scripts/setup.mjs --install  # user-level installs only, never sudo
```

OpenCode, Codex and the manual install: [docs/installation.md](docs/installation.md).

## Prompts to start with

Copy one into your agent, in any language:

```
Use the frontend-craft skill: the landing page for Panadería Riomar, a sourdough bakery at Calle 10 #4-21 in
Bogotá. Their photos are in ./fotos and their videos are on their TikTok (they gave permission). Page in Spanish.
Follow the studio run and show me the plan before you build.
```

```
Use the frontend-craft skill: a landing page for a specialty coffee roaster that sells beans online and has a
tasting bar. Sober colours, their own photographs, the bag in 3D, a real map.
```

```
Use the frontend-craft skill: a dashboard for our support queue in React with shadcn. Restraint, no scroll effects.
```

```
Use craft-review on http://localhost:5173: strict review, Before | After | Why, do not edit.
```

## The studio run

```
prompt ─> frontend-craft
  1  start.mjs: the kit, a starter page, the studio brief, .craft/plan.md      (nothing is dealt)
  2  material first: the client's photographs and videos                      ─> media.mjs social <their URL>, media.mjs sheet
  3  three real references, one move from each                                ─> Awwwards MCP, land-book, MotionSites designs
  4  direction: the idea, palette, faces, the one moment, then attack it      ─> color-type.md, ui-ux-pro-max, design.mjs set, Figma MCP (optional)
  5  storyboard: one row per section (question, picture, media, motion, part) ─> recipes.md, components.mjs search (21st.dev, cult-ui, React Bits)
  6  media: their footage as loops and scroll sequences, their product in 3D  ─> video.mjs, media.mjs frames, product3d, media.mjs stock
  7  the first screen alone, looked at, fixed; then every section            ─> starter.html, the kit's recipes
  8  look in motion: every section entering, middle, leaving, 1440 and 390    ─> look.mjs contact sheets
  9  check: defects only                                                      ─> check.mjs (blank screens, drawn placeholders, contrast, overflow, AI tells)
 10  an independent critic, the motion review, look and check again          ─> craft-design-critic, Emil Kowalski's rules
```

What decides what:

| Decision | Who makes it | What holds it |
|---|---|---|
| Idea, structure, the one moment, every section | The model, written in `.craft/plan.md` before building | The check fails a studio build without a storyboard (`plan-missing`) |
| Colours and faces | The model: a white ground, near-black ink, one accent from the subject; faces with character | `design.mjs set` checks contrast, the sober method, violet, neon, overused faces, and writes `tokens.css` |
| Media | The model, from the client's own files and videos first | `media.mjs` fetches and shows them; the check refuses broken, repeated and letterboxed pictures |
| Parts | The model: a kit recipe, a library piece, or built for real | `components.mjs search` lists 21st.dev, cult-ui and React Bits candidates with previews |
| Whether it is good | The model looking at `look.mjs` sheets, then an independent critic | The check only refuses what is broken: blank or half-empty screens, drawings of boxes, contrast, overflow, invisible content |

## Section recipes

Finished sections in the kit, each working without JavaScript and under reduced motion
([recipes.md](skills/frontend-craft/references/recipes.md)):

| Recipe | What it is |
|---|---|
| `dive` | The hero's photograph or loop at full bleed; scrolling flies into it toward a focal point (the sign, the door) |
| `journey` | A pinned horizontal story: the client's photographs pass while two lines of type cross |
| `carousel` | A row that snaps, drags, answers arrows and keys, and counts "1 / 4" |
| `sequence` | Frames of the client's own clip scrubbed by scroll, with steps that light up |
| `product3d` | The client's packaged product in 3D from its artwork, swaying with the scroll (three.js) |
| `map` | A real map with a pin on the door: OpenStreetMap tiles from OpenFreeMap, free and keyless (MapLibre) |
| `spec` | Facts as a quiet two-column list instead of cards or a big number |

## What the check refuses

`check.mjs` loads every page in headless Chrome three times (normal at 1440, 1280, 768 and 390; reduced motion;
JavaScript off) and runs impeccable's detector and Hallmark's sloplint. It refuses defects, not taste. A few of the
things that fail a page:

- a screen that is one flat colour while scrolling (an empty stage, a curtain opening on nothing, a map that never
  rendered), measured from real screenshots; sparse and half-empty screens warn;
- a drawing of boxes and lines where a picture or a real map belongs;
- a subject sold by its photographs whose first screen is text, with the picture below the fold;
- cards and tiles left mostly empty, a footer with no way to reach the business;
- a studio build with no storyboard, parts built without ever searching a library;
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
| [`frontend-craft`](skills/frontend-craft/SKILL.md) | The studio run: the studio brief and plan, seven section recipes, a dependency-free motion kit, `media.mjs` (client videos, frames, stock), `look.mjs` (every section in motion), `design.mjs`, `components.mjs` and `check.mjs`; the dealt run of earlier versions stays behind its flags |
| [`craft-motion`](skills/craft-motion/SKILL.md) | Add, fix or trim motion in an interface that already exists |
| [`craft-review`](skills/craft-review/SKILL.md) | A strict rendered review: findings as Before, After, Why with exact values. Does not edit |
| [`craft-learn`](skills/craft-learn/SKILL.md) | Turn a session's design corrections into testable rules in `DESIGN.md` |
| [`svg-craft`](skills/svg-craft/SKILL.md) | Icons, logos, illustrations and diagrams, with a render-and-look loop and a geometry lint |
| [`hf-asset-generate`](skills/hf-asset-generate/SKILL.md) | Free images, edits and short clips through the Hugging Face MCP server |
| [`kaggle-video`](skills/kaggle-video/SKILL.md) | Image-to-video with Wan 2.2 on Kaggle's free GPUs, for hero loops with real motion |

**Reviewer agents**, generated from [review.md](skills/frontend-craft/references/review.md) for Claude Code
([agents/](agents/)) and OpenCode ([integrations/opencode/agents/](integrations/opencode/agents/)):
`craft-design-critic` (every build) and `craft-motion-auditor` (when more than one section moves).

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

**Libraries read at build time** (downloaded or called on your machine, not copied into this repository):

| Library | What the build takes from it | How it gets there |
|---|---|---|
| [21st.dev](https://21st.dev) | Community components for each part of the page, searched by job, with previews | Its CLI: `npm install -g @21st-dev/cli`, then `21st login` (free search, two free source retrievals a day) |
| [cult-ui](https://www.cult-ui.com) | Interaction pieces from its shadcn registry, MIT | Its public registry, cached for a week |
| [MotionSites](https://github.com/Motionsites-AI/claude-skill) | 40 finished hero and landing designs read for their precision, a shelf of cinematic loops and cut-outs, 58 technique recipes ([what to take and leave](skills/frontend-craft/references/motionsites.md)) | `setup.mjs --install` clones it into `~/.cache` at a pinned commit; its examples and media stay (c) MotionSites |

**MCP servers** ([.mcp.json](.mcp.json) in the plugin; the others in [docs/installation.md](docs/installation.md)):
Playwright, Hugging Face (free stills and clips), Awwwards (references and motion timing of award winners) and
Figma (drawing the direction for approval before code).

## Media, for free

| Route | How |
|---|---|
| The client's own videos | `media.mjs social <their TikTok, Instagram or YouTube URL>` (yt-dlp), `media.mjs sheet` to look, frames and loops from the good seconds |
| A loop from their footage | `video.mjs clip.mp4 --start <s> --end <s>`: a seamless muted loop (mp4, webm, poster), played only on screen, with a corner pause icon |
| A scroll sequence | `media.mjs frames clip.mp4` and the `sequence` recipe |
| Their product in 3D | The `product3d` recipe with the packaging artwork |
| Free stock (atmosphere only) | `media.mjs stock "<query>"` with a free Pexels or Pixabay key |
| Generated clips | `hf-asset-generate`, `kaggle-video` (free quotas), `scripts/parallax.mjs` as the last resort |
| Motion graphics | bang-motion or HyperFrames render HTML to MP4 |

[media.md](skills/frontend-craft/references/media.md) has the order, the licences and the rules that keep media looking expensive.

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
