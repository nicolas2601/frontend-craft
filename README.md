# frontend-craft

One install that gives a coding agent a complete frontend toolset: a website engine with real photographs and a browser gate, critique and polish passes, motion rules, a motion kit for apps, SVG authoring, and a router that sends each task to the right one. Works in any harness that reads Agent Skills (Claude Code, Codex, OpenCode, Gemini CLI, Cursor, pi) and in any framework.

Ask a model for "a landing page for a coffee shop" and most of them return the same flat page: cream background, a serif headline, a terracotta accent, three equal cards, no photographs and almost no motion. Rules in a prompt do not fix it, because the model falls back to its defaults whenever a decision is left open. The skills here close those decisions with scripts the model runs and a gate it cannot talk its way past.

```
prompt ──> frontend-craft (router)
             ├─ website / landing ──> design-taste-frontend run
             │                          deal ─ photographs ─ moments ─ build ─ checker ─ gate.mjs
             │                          then impeccable critique + review-animations, gate again
             ├─ app / dashboard / docs ──> frontend-craft run: dealt tokens + motion kit + check.mjs
             ├─ motion on existing UI ──> craft-motion + animate / choreograph / animation-performance
             ├─ review ──> craft-review + impeccable
             └─ icon, logo, illustration, diagram ──> svg-craft
```

## What is in the box

**Own skills**

| Skill | Job |
|---|---|
| [`frontend-craft`](skills/frontend-craft/SKILL.md) | The router, and the run for apps, dashboards and docs: dealt tokens, a dependency-free motion kit, `check.mjs`. |
| [`craft-motion`](skills/craft-motion/SKILL.md) | Add, fix or trim motion in an interface that already exists. |
| [`craft-review`](skills/craft-review/SKILL.md) | Strict rendered review: findings as Before, After, Why with exact values. Does not edit. |
| [`craft-learn`](skills/craft-learn/SKILL.md) | Turn a session's design corrections into testable rules in `DESIGN.md`. |
| [`svg-craft`](skills/svg-craft/SKILL.md) | Icons, logos, illustrations, diagrams and animated SVG, with a render-and-look loop. |

**Bundled skills**, copied unchanged from upstream at a pinned commit ([vendor.json](vendor.json), licences in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)):

| Skill | From | Job here |
|---|---|---|
| [`design-taste-frontend`](skills/design-taste-frontend/SKILL.md) | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) 2.5.1, MIT | The website engine: kind-based plans, dealt palettes and type, a vetted photo library with credits (bundled WebP frames plus licensed Unsplash and Wikimedia Commons frames fetched on demand), 18 scroll and type moments, 25 shader effects and 11 scenes for tech pages, a checker and a finish gate |
| [`impeccable`](skills/impeccable/SKILL.md) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable), Apache-2.0 | Critique, audit and polish passes |
| `emil-design-eng`, `animate`, `choreograph`, `animation-performance`, `animation-vocabulary`, `review-animations`, `improve-animations`, `remove-animations`, `find-animation-opportunities`, `gestures`, `break-ui`, `pick-ui-library`, `prototype`, `apple-design`, `learn-taste` | [emilkowalski/skills](https://github.com/emilkowalski/skills), MIT | Motion and interaction craft |
| [`ui-ux-pro-max`](skills/ui-ux-pro-max/SKILL.md) | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), MIT | Searchable styles, palettes, font pairings and UX rules (Python 3) |
| [`ui-animation`](skills/ui-animation/SKILL.md) | [mblode/agent-skills](https://github.com/mblode/agent-skills), MIT | Springs, easing fitted from recordings, interface sound |

Every bundled skill arrives with its assets, scripts, references and licence file. `npm run verify` fails if any of them differs by one byte from the pinned upstream commit.

## Install

Requirements: Node 22 or later and Chrome, Chromium or Edge (set `CHROME_PATH` for anything else). Python 3 for `ui-ux-pro-max`; ffmpeg is optional (photo crops).

**Any harness that reads Agent Skills.** Install every skill in the repo, so the router finds its siblings:

```sh
npx skills@latest add nicolas2601/frontend-craft --all          # every skill, every detected agent
npx skills@latest add nicolas2601/frontend-craft -g -a claude-code -s '*' -y   # one agent, global
```

**Claude Code plugin.** Brings every skill, the two Stop-hook gates (each skill's own) and a prompt hook that points web-page requests at the router:

```sh
/plugin marketplace add nicolas2601/frontend-craft
/plugin install frontend-craft@frontend-craft
```

**OpenCode gate.** OpenCode has no Stop hook. Copy [`integrations/opencode/frontend-craft-gate.js`](integrations/opencode/frontend-craft-gate.js) to `~/.config/opencode/plugins/`. When a session goes idle it runs both gates (the website engine's and frontend-craft's) and sends a block's fix list back into the session. An optional `frontend` agent is in [`integrations/opencode/agents/`](integrations/opencode/agents/frontend.md).

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

The website run, as the agent executes it (from the project folder; `<taste>` is the installed `design-taste-frontend` folder):

```sh
node <taste>/scripts/gate.mjs --start index.html --kind place --category "specialty coffee" --primary "Get directions"
node <taste>/scripts/start.mjs deal --page place --trade cafe --history .taste-skill/history.json
node <taste>/scripts/photos.mjs pick --trade cafe --draft-lead --sections hero,bar,coffee,visit
node <taste>/scripts/moments.mjs pick --page place --count 1 --photo --history .taste-skill/history.json
# ...build from assets/starter.html...
node <taste>/scripts/gate.mjs        # until GATE: PASS, then the impeccable and review-animations passes, then the gate again
```

## The app run and the kit

For app screens, dashboards and docs, `frontend-craft` deals tokens and copies a motion kit:

```sh
node <skill>/scripts/start.mjs --kind app --moods calm,precise
node <skill>/scripts/check.mjs       # until RESULT: PASS
```

The kit is fifteen effects on data attributes (`data-enter`, `data-words`, `data-scroll-words`, `data-stack`, `data-count`, `data-press`, ...), one `requestAnimationFrame` loop and no dependencies. Under `prefers-reduced-motion` every effect shows its final state, without JavaScript all content stays visible, and cleanup restores the DOM. Reference: [motion.md](skills/frontend-craft/references/motion.md), framework wiring: [frameworks.md](skills/frontend-craft/references/frameworks.md). `start.mjs` refuses a website kind while `design-taste-frontend` is installed; `--fallback` builds one with the kit when that engine cannot run.

## Keeping the bundle current

```sh
node scripts/vendor.mjs            # restore every bundled skill at its pinned commit
node scripts/vendor.mjs --update   # move to upstream HEAD, re-copy, record new hashes
npm run verify                     # own skills' structure + bundled skills unchanged + licences present
```

Bundled skills are never edited in this repo. Integration lives in the router (`skills/frontend-craft`), the prompt hook (`hooks/route.mjs`) and the OpenCode plugin.

## Evals

`evals/cases.json` holds deliberately short prompts; `node scripts/eval.mjs --case <id>` runs one through a real agent CLI and loops the gate's FAIL list back into the session. The earlier runs ([docs/evals.md](docs/evals.md)) measured the dealt-kit website path that is now the fallback: they passed the check but the pages were visually flat, which is why websites now route to `design-taste-frontend`. Runs of the new route are pending and will be recorded there, failures included.

## Develop

```sh
npm test                 # unit tests, contrast tests, routing, gates (Chrome)
npm run verify           # own skills' structure and the bundled skills' hashes
npm run test:blueprints  # the 14 app/fallback blueprints through the check
npm run test:frameworks  # the kit built in real Vue and Svelte projects, then checked
npm run pack             # dist/<skill>.skill zip files, one per skill
```

Layout: `skills/` (what gets installed: own and bundled), `vendor.json` (bundled sources and hashes), `tests/`, `scripts/` (verify, vendor, eval, pack), `evals/`, `integrations/` (harness glue), `hooks/` (Claude Code plugin hooks), `docs/`, `tools/opencode-observer/`, `archive/v1/`.

## Credits and licence

Own code is MIT ([LICENSE](LICENSE)). Bundled skills keep their own licences (MIT or Apache-2.0) in their folders; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). `svg-craft` vendors MIT packs listed in `skills/svg-craft/packs/*/LICENSE-*`. The writing discipline for agent-facing documents follows [mattpocock/skills](https://github.com/mattpocock/skills).
