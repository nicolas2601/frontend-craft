# Changelog

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

### Changed
- `frontend-craft/SKILL.md` is a 1,200-word run with numeric house rules instead of a 39-file reference set.

### Moved
- v1 skill, its ten subagents, Python tooling and docs to `archive/v1/`.
