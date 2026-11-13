# Installation

frontend-craft is a set of Agent Skills: folders with a `SKILL.md`, scripts and data. Any agent that loads skills can use them. The scripts need Node 22 or later; the check needs Chrome, Chromium or Edge (or Playwright's Chromium, or any browser at `CHROME_PATH`).

Install all four craft skills together; `craft-motion`, `craft-review` and `craft-learn` call scripts inside `frontend-craft`. `svg-craft` is optional.

## Claude Code

As a plugin (the gate comes with it as a Stop hook declared in the skill's frontmatter):

```sh
/plugin marketplace add nicolas2601/frontend-craft
/plugin install frontend-craft@frontend-craft
```

From a local clone: `/plugin marketplace add /path/to/frontend-craft`.

Verified on 2026-11-13 with Claude Code 2.1.321: `claude plugin validate .` passes with no warnings, and installing from a local clone through the marketplace loads five skills at about 830 always-on tokens (`frontend-craft` costs about 3,200 tokens when it fires). The GitHub form works once the manifests are on the default branch.

Or as plain skills: symlink or copy `skills/*` into `~/.claude/skills/` (user) or `.claude/skills/` (project). The Stop hook is in `skills/frontend-craft/SKILL.md` and runs only while that skill is active in the session; it does nothing when no build is armed.

## Codex

Copy or symlink `skills/*` into `~/.agents/skills/` (or `.agents/skills/` in the repository). Each skill has `agents/openai.yaml` with its display name. The gate's hook mode accepts the same JSON as Claude Code (`node <skill>/scripts/gate.mjs --hook claude`); where hooks are not available the skill tells the agent to run `gate.mjs` and not to stop while it exits 1.

## OpenCode

OpenCode discovers skills in `~/.config/opencode/skills/`, `~/.claude/skills/` and `~/.agents/skills/`. Then:

1. Gate: copy `integrations/opencode/frontend-craft-gate.js` to `~/.config/opencode/plugins/`; OpenCode loads every plugin in that folder (plugin API v2: a default export with `id` and `setup`). Do not also list the file in `opencode.json`. When a top-level session goes idle while an armed build in its directory still fails, the plugin sends the fix list back into the session. Restart OpenCode (and its background service) to load it.
2. Optional agent: copy `integrations/opencode/agents/frontend.md` to `~/.config/opencode/agents/`. It routes to the right skill and holds the agent to the check.

## pi

`pi -p --skill <path to skills/frontend-craft> --skill <path to skills/craft-motion> ...`, or copy the folders into `~/.pi/agent/skills/`. pi has no Stop hook: the skill tells the agent to run `gate.mjs` before it stops.

## Cursor, Gemini CLI, Windsurf and others

Use the `skills` CLI, which knows each tool's skills folder:

```sh
npx skills@latest add nicolas2601/frontend-craft
```

Without hook support the gate is a command the agent runs: `node <skill>/scripts/gate.mjs`. The skill's run makes that the last step.

## Private repository

While the repository is private, the marketplace and `skills` commands need GitHub access to it (a logged-in `gh`, or a clone you install from with a local path).

## Check that it works

```sh
cd /path/to/frontend-craft
npm test             # includes an end-to-end run of the checker in your Chrome
npm run verify
node skills/frontend-craft/scripts/start.mjs --list
```
