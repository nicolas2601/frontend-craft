# frontend-craft

One install that gives a coding agent a complete frontend toolset: dealt art directions with scroll set pieces and real photographs for websites, a richness and defect check in a real browser, critique and polish passes, motion rules, a motion kit, SVG authoring, and a router that sends each task to the right one. Works in any harness that reads Agent Skills (Claude Code, Codex, OpenCode, Gemini CLI, Cursor, pi) and in any framework.

Ask a model for "a landing page for a coffee shop" and most of them return the same flat page: cream background, a serif headline, a terracotta accent, three equal cards, no photographs and almost no motion. Ask two different models and you get nearly the same page twice. Rules in a prompt do not fix it, because the model falls back to its defaults whenever a decision is left open. The skills here close those decisions with scripts the model runs: a deal that changes from build to build (sometimes on purpose outside the subject's usual layout and type, never its colours or photographs), a palette taken from the subject's own picture, a gate that fails a page for being flat or careless, not only for being broken, and two independent reviewers who look at the result.

```
prompt ──> frontend-craft (router)
             ├─ website / landing ──> start.mjs deal: art direction + palette + type + composition + 2 set pieces
             │                          concept.md ─ real photographs ─ build ─ check.mjs (defects + richness)
             │                          then two reviewers in parallel (design critic, motion + mobile auditor), check again
             ├─ quiet, sober site (asked for) ──> design-taste-frontend run and its gate
             ├─ app / dashboard / docs ──> start.mjs deal: tokens + motion kit + check.mjs (restraint)
             ├─ motion on existing UI ──> craft-motion + animate / choreograph / animation-performance
             ├─ review ──> craft-review + impeccable
             └─ icon, logo, illustration, diagram ──> svg-craft
```

## What is in the box

**Own skills**

| Skill | Job |
|---|---|
| [`frontend-craft`](skills/frontend-craft/SKILL.md) | The router and the build run: 16 art directions, 24 palettes, 24 type pairings, 14 compositions, 14 scroll set pieces, 4 WebGL hero scenes, free hero video loops, 43 curated React Bits components, a dependency-free motion kit, and `check.mjs` (defects, a richness floor, the AI tells and impeccable's detector, on every page of a site). |
| [`craft-motion`](skills/craft-motion/SKILL.md) | Add, fix or trim motion in an interface that already exists. |
| [`craft-review`](skills/craft-review/SKILL.md) | Strict rendered review: findings as Before, After, Why with exact values. Does not edit. |
| [`craft-learn`](skills/craft-learn/SKILL.md) | Turn a session's design corrections into testable rules in `DESIGN.md`. |
| [`svg-craft`](skills/svg-craft/SKILL.md) | Icons, logos, illustrations, diagrams and animated SVG, with a render-and-look loop. |
| [`hf-asset-generate`](skills/hf-asset-generate/SKILL.md) | Free images, edits, short clips and voice through the Hugging Face MCP server (hero stills and loops). |

**Reviewer agents** (Claude Code plugin, generated from [`references/review.md`](skills/frontend-craft/references/review.md)): `craft-design-critic` and `craft-motion-auditor`, spawned in parallel at the end of every build. Other harnesses paste the same briefs into subagents.

**Bundled skills**, copied unchanged from upstream at a pinned commit ([vendor.json](vendor.json), licences in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)):

| Skill | From | Job here |
|---|---|---|
| [`design-taste-frontend`](skills/design-taste-frontend/SKILL.md) | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) 2.5.1, MIT | The photo library every website uses (bundled WebP frames plus licensed Wikimedia Commons frames, with credits), and the run for a quiet, sober site when the user asks for one |
| [`impeccable`](skills/impeccable/SKILL.md) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable), Apache-2.0 | Critique, audit and polish passes |
| `emil-design-eng`, `animate`, `choreograph`, `animation-performance`, `animation-vocabulary`, `review-animations`, `improve-animations`, `remove-animations`, `find-animation-opportunities`, `gestures`, `break-ui`, `pick-ui-library`, `prototype`, `apple-design`, `learn-taste` | [emilkowalski/skills](https://github.com/emilkowalski/skills), MIT | Motion and interaction craft |
| [`ui-ux-pro-max`](skills/ui-ux-pro-max/SKILL.md) | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), MIT | Searchable styles, palettes, font pairings and UX rules (Python 3) |
| [`ui-animation`](skills/ui-animation/SKILL.md) | [mblode/agent-skills](https://github.com/mblode/agent-skills), MIT | Springs, easing fitted from recordings, interface sound |
| [`playwright-cli`](skills/playwright-cli/SKILL.md) | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli), Apache-2.0 | Looking at and measuring the page from the shell: widths, scroll, reduced motion |

Every bundled skill arrives with its assets, scripts, references and licence file. `npm run verify` fails if any of them differs by one byte from the pinned upstream commit.

## Install

Requirements: Node 22 or later and Chrome, Chromium or Edge (set `CHROME_PATH` for anything else). Python 3 for `ui-ux-pro-max`; ffmpeg for hero loops and palettes from a photograph. After installing, run the setup report: it lists what is missing and, with `--install`, adds `playwright-cli` and (in Claude Code) the Playwright and Hugging Face MCP servers. Nothing secret is written; Hugging Face logs in with OAuth.

```sh
node <skills folder>/frontend-craft/scripts/setup.mjs            # report
node <skills folder>/frontend-craft/scripts/setup.mjs --install  # user-level installs, never sudo
```

**Any harness that reads Agent Skills.** Install every skill in the repo, so the router finds its siblings:

```sh
npx skills@latest add nicolas2601/frontend-craft --all          # every skill, every detected agent
npx skills@latest add nicolas2601/frontend-craft -g -a claude-code -s '*' -y   # one agent, global
```

**Claude Code plugin.** Brings every skill, the two reviewer agents, the Playwright and Hugging Face MCP servers (`.mcp.json`), the two Stop-hook gates (each skill's own) and a prompt hook that points web-page requests at the router:

```sh
/plugin marketplace add nicolas2601/frontend-craft
/plugin install frontend-craft@frontend-craft
```

**OpenCode gate.** OpenCode has no Stop hook. Copy [`integrations/opencode/frontend-craft-gate.js`](integrations/opencode/frontend-craft-gate.js) to `~/.config/opencode/plugins/`. When a session goes idle it runs both gates (frontend-craft's and, for a quiet site, design-taste-frontend's) and sends a block's fix list back into the session. An optional `frontend` agent is in [`integrations/opencode/agents/`](integrations/opencode/agents/frontend.md).

**By hand.** Copy each folder in `skills/` into your agent's skills directory (`~/.agents/skills/`, `~/.claude/skills/`, `~/.config/opencode/skills/`, or `.agents/skills/` in a project). Keep them as siblings.

Details and the gate in each harness: [docs/installation.md](docs/installation.md).

## Use

Ask in plain words; the skills supply the design decisions.

> haz una landing page para una cafetería de especialidad en Bucaramanga
>
> make a dashboard for our support queue, React
>
> this page looks generic, fix it
>
> review localhost:5173 strictly

A model that does not pick the router by itself can be pointed at it: `@frontend-craft` in OpenCode, `/frontend-craft` in Claude Code, or "use the frontend-craft skill" anywhere.

The website run, as the agent executes it (from the project folder; `<skill>` is the installed `frontend-craft` folder):

```sh
node <skill>/scripts/start.mjs --kind landing --moods warm,coffee      # deal; --risk safe|bold|wild
# write .craft/concept.md (idea, signature, rejected defaults)
node <taste>/scripts/photos.mjs search "specialty coffee bar Bucaramanga" --out .   # real, licensed frames
node <taste>/scripts/photos.mjs fetch <ids> --hero <id> --out . && node <taste>/scripts/photos.mjs credits --out . --write
# ...build from craft/blueprint.html with the direction and the two set pieces...
node <skill>/scripts/check.mjs       # until RESULT: PASS, then impeccable and review-animations, then the check again
```

### Why two agents no longer build the same page

Two models given the same prompt used to converge: the same palette family, the same hero, the same photographs. Now each build is dealt an **art direction** (night poster, editorial magazine, colour block, cinematic chapters, collage, Swiss grid, kinetic type, origin route, brutal, soft pop, gallery rail, split duotone, bento grid, glass layers, riso print, terminal mono), each with its own grounds, type scale, photo treatment and two moves that break the template. With `--risk bold` (the default) about 40% of deals come from outside the subject's usual moods on purpose, and a subject that matches only one direction still draws from at least three. Measured over 2,000 deals for a coffee brief (`--moods coffee,warm`), all 16 directions come up and none more than 13.1% of the time; two independent deals share a direction 8.7% of the time and the whole hand (direction, palette, type, composition) 0.2%; 39 of the 43 components and all four hero scenes come up (`tests/deal.test.mjs` asserts under 20% and 2%).

### Set pieces

`kit/set-pieces.css` holds fourteen scroll scenes on the kit's `data-scrub`: `iris` (the next ground opens through a circle), `type-pass` (a huge line crosses the screen), `zoom` (a full-bleed photograph opens from an inset frame), `curtain` (a photograph parts in two), `fan` (a pile of photographs fans out), `letters` (a heading assembles), `develop` (a photograph comes up from grey), `tilt`, `split`, and the word scroll pieces `word-track` (huge words travel sideways on a pinned screen), `word-swap` (one word of a sentence changes with the scroll), `type-zoom` (the camera flies through a word), `word-mask` (lines rise out of masks) and `bento-assemble`. Each shows its finished state without JavaScript and under reduced motion, and all pass the check in Chrome (`tests/fixtures/expressive`, `tests/fixtures/range`).

The first screen carries one live object, dealt with the direction: `chrome` (liquid metal metaballs), `iridescent` (a pearl ring with thin-film colour), `ink` (the hero photograph in two inks, true colour opening around the pointer) or `dots` (a halftone field that answers the pointer), in plain WebGL and the dealt colours ([scenes.md](skills/frontend-craft/references/scenes.md)). A real subject in real light (a courtyard, a dish, a product) gets a hero loop instead: a still from Z-Image Turbo animated by Wan 2.2 over the free Hugging Face MCP server, closed into a seamless 30 fps loop by `scripts/video.mjs`, and played by the kit's `data-loop` only on screen, never under reduced motion, with a pause button ([hero-video.md](skills/frontend-craft/references/hero-video.md)). Materials (glass, bento, riso, mono, page transitions) are in `kit/surfaces.css`. Every build is also dealt one React Bits component that fits its direction ([components.md](skills/frontend-craft/references/components.md)). Markup: [set-pieces.md](skills/frontend-craft/references/set-pieces.md).

## The app run and the kit

For app screens, dashboards and docs, `frontend-craft` deals tokens and copies the motion kit, with no direction and no motion floor:

```sh
node <skill>/scripts/start.mjs --kind app --moods calm,precise
node <skill>/scripts/check.mjs       # until RESULT: PASS
```

The kit is fifteen effects on data attributes (`data-enter`, `data-words`, `data-scroll-words`, `data-stack`, `data-count`, `data-press`, ...), one `requestAnimationFrame` loop and no dependencies. Under `prefers-reduced-motion` every effect shows its final state, without JavaScript all content stays visible, and cleanup restores the DOM. Reference: [motion.md](skills/frontend-craft/references/motion.md), framework wiring: [frameworks.md](skills/frontend-craft/references/frameworks.md).

## Keeping the bundle current

```sh
node scripts/vendor.mjs            # restore every bundled skill at its pinned commit
node scripts/vendor.mjs --update   # move to upstream HEAD, re-copy, record new hashes
npm run verify                     # own skills' structure + bundled skills unchanged + licences present
```

Bundled skills are never edited in this repo. Integration lives in the router (`skills/frontend-craft`), the prompt hook (`hooks/route.mjs`) and the OpenCode plugin.

## Evals

`evals/cases.json` holds deliberately short prompts; `node scripts/eval.mjs --case <id>` runs one through a real agent CLI and loops the gate's FAIL list back into the session. [docs/evals.md](docs/evals.md) records every run, failures included: the 2.0 kit pages that passed the check but looked flat, and the 2.1 runs where two models routed through `design-taste-frontend` built nearly the same still cafe page, because that engine's house rules fail any scroll motion or effect on a place page. 2.2 and 2.3 are the answer; their agent runs are recorded there.

## Develop

```sh
npm test                 # unit tests, deal divergence, richness rules, routing, gates, set pieces (Chrome)
npm run verify           # own skills' structure and the bundled skills' hashes
npm run test:blueprints  # the 14 composition blueprints through the check
npm run test:frameworks  # the kit built in real Vue and Svelte projects, then checked
npm run pack             # dist/<skill>.skill zip files, one per skill
```

Layout: `skills/` (what gets installed: own and bundled), `vendor.json` (bundled sources and hashes), `tests/`, `scripts/` (verify, vendor, eval, pack), `evals/`, `integrations/` (harness glue), `hooks/` (Claude Code plugin hooks), `docs/`, `tools/opencode-observer/`, `archive/v1/`.

## Credits and licence

Own code is MIT ([LICENSE](LICENSE)). Bundled skills keep their own licences (MIT or Apache-2.0) in their folders; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). `svg-craft` vendors MIT packs listed in `skills/svg-craft/packs/*/LICENSE-*`. The writing discipline for agent-facing documents follows [mattpocock/skills](https://github.com/mattpocock/skills).
