# Changelog

## 2.1.0 - 2026-11-13

Websites now build with a bundled engine that has a real visual layer; frontend-craft becomes the router.

### Added
- Bundled skills, unchanged from upstream at pinned commits (`vendor.json`, `THIRD_PARTY_NOTICES.md`):
  `design-taste-frontend` (taste-skill 2.5.1, MIT), `impeccable` (Apache-2.0), fifteen Emil Kowalski skills (MIT),
  `ui-ux-pro-max` (MIT), `ui-animation` (MIT), each with its assets, scripts, references and licence file.
- `scripts/vendor.mjs`: restore, `--update` to upstream HEAD, `--check`; `npm run verify` fails when a bundled
  skill differs by one byte from its pinned commit or lacks its licence.
- `stop-gates.mjs`: one Stop hook that runs both gates (Codex `config.toml` example in docs/installation.md).
- The OpenCode plugin runs the website gate as well as frontend-craft's.

### Changed
- `frontend-craft` routes: websites to `design-taste-frontend` then the `review-animations` and `impeccable`
  finish passes; apps, dashboards and docs to its own run. `start.mjs` refuses a website kind while the engine is
  installed (`--fallback` overrides). The prompt hook and the OpenCode agent route the same way.
- README and docs rewritten around the router.

### Removed
- `examples/roastery` and its screenshots: the page passed the check but was visually flat.
- `skills/frontend-craft/history.json` from version control (deal history is user state).

## 2.0.0 - 2026-11-13

Rebuilt from a reference library into an executable system that weak and strong models can follow.

### Added
- `start.mjs`: deals palette, type pairing, composition and motion from a curated library by kind and mood, with cross-project history; copies the kit, writes `tokens.css` and a direction brief, arms the gate. Flags: `--redeal`, `--pin`, `--brand`, `--kit-only`, `--list`.
- Motion kit: 15 data-attribute effects (enter, words, reveal, mask, scroll-words, scrub, parallax, stack, rail, progress, count, scramble, marquee, magnetic, spotlight) plus `craft.css` tokens and base. No dependencies; any framework.
- `check.mjs`: headless Chrome check at 1440/1280/768/390, reduced motion and JavaScript off; about thirty rules; screenshots.
- `gate.mjs`: Stop hook for Claude Code and Codex, CLI exit codes elsewhere; OpenCode plugin in `integrations/opencode/`.
- Skills `craft-motion`, `craft-review`, `craft-learn`.
- Library: 24 palettes (WCAG AA tested), 24 Google Fonts pairings, 14 compositions, 14 motion signatures.
- Claude Code plugin and marketplace manifests; `agents/openai.yaml` per skill.
- Tests (node:test), structural verifier, pack script and an eval runner that drives a real agent CLI.
- Composition blueprints (`blueprints/`, `kit/layouts.css`): every composition ships a working page skeleton; `start.mjs` copies it and writes it as `index.html` for plain HTML. `npm run test:blueprints` renders all fourteen through the check.
- Claude Code plugin `UserPromptSubmit` hook that routes web-page prompts to the run.
- Checks: hero action inside the first screen (`fold-action-*`), colored italic accent words (`tell-italic-accent`), rendered size of SVG text, unfilled `{{...}}` markers.

### Fixed (found by running real agents)
- Scripts exited silently when called through a symlinked install.
- The deal matched type and palette to the brief but not to each other.
- Motion under-counted (unit-sized values) and sticky navs counted as pinned scenes.
- The OpenCode gate plugin now uses plugin API v2.
- The eval runner passes `PWD` with `cwd`, works on disk instead of tmpfs and requires a followed deal for a pass.

### Changed
- `frontend-craft/SKILL.md` is a 1,200-word run with numeric house rules instead of a 39-file reference set.

### Moved
- v1 skill, its ten subagents, Python tooling and docs to `archive/v1/`.
