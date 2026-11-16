# Installation

frontend-craft is a set of Agent Skills: folders with a `SKILL.md`, scripts and data. Install **all of them as siblings**: the router (`frontend-craft`) builds websites with its own deal and takes their photographs from `design-taste-frontend`, sends polish to `impeccable` and the Emil skills, and `craft-motion`, `craft-review` and `craft-learn` call scripts inside `frontend-craft`.

Requirements: Node 22 or later; Chrome, Chromium or Edge for the checkers (or any browser at `CHROME_PATH`); Python 3 for `ui-ux-pro-max` and yt-dlp; ffmpeg for the client's videos, loops and sequences. `node <skill>/scripts/setup.mjs` reports all of it and `--install` adds what it can without sudo.

What each bundled skill needs beyond its own files:

| Skill | Needs | Checked on a clean HOME |
|---|---|---|
| `design-taste-frontend` | Node; network for licensed photo frames fetched on demand (Wikimedia Commons); Chrome for its own gate on a quiet site | `photos.mjs`, `start.mjs deal` and `gate.mjs` run |
| `impeccable` | Nothing preinstalled: `scripts/impeccable` downloads its engine (about 23 MB, pinned version, verified against `scripts/engine-checksums.txt`) on first run into `~/.impeccable/bin` | engine 0.1.23 downloaded and answered |
| `ui-ux-pro-max` | Python 3, no packages; run `scripts/search.py` from its folder | `--design-system` search answered |
| `ui-animation` | Only for measuring a screen recording: ffmpeg and `pip install opencv-python numpy scipy` | not run |
| `svg-craft` (own) | `npm ci --prefix tools` once | `npm ci` exits 0 |
| Emil skills | Nothing (Markdown only) | |

Libraries the build reads on your machine (not copied into the repository):

| Library | Needs | How |
|---|---|---|
| 21st.dev (library parts) | Its CLI and a free login | `npm install -g @21st-dev/cli` (or `setup.mjs --install`), then `21st login` once in a browser. `components.mjs search` asks it with cult-ui and React Bits; search is free, two source retrievals a day |
| MotionSites (reference designs, media shelf) | git and network | `setup.mjs --install` clones it into `~/.cache/frontend-craft/libraries/motionsites` at a pinned commit. Its examples and media are (c) MotionSites: use them to build sites, never redistribute them |

## Install with your agent (copy this prompt)

Paste this into Claude Code, OpenCode, Codex or any agent with a shell. It installs everything, never uses sudo
without asking, never prints a key, and ends with a check you can read.

```text
Install the frontend-craft skill set (https://github.com/nicolas2601/frontend-craft) on this machine and verify it.
Work step by step; after each step show the command and its last lines of output. Never run sudo without asking me
first, never print an API key or token, never commit anything.

1. Requirements: check `node --version` (needs 22 or later), `ffmpeg -version`, `python3 --version`, and a Chrome,
   Chromium or Edge. For anything missing, tell me the exact install command for this OS and wait.
2. The skills: if this is Claude Code, run `/plugin marketplace add nicolas2601/frontend-craft` and
   `/plugin install frontend-craft@frontend-craft`; in any other agent run
   `npx skills@latest add nicolas2601/frontend-craft --all`.
3. Find the installed frontend-craft folder (it contains scripts/setup.mjs: look in ~/.claude/skills,
   ~/.agents/skills, ~/.config/opencode/skills or the plugin cache) and run
   `node <that folder>/scripts/setup.mjs --install`. It installs playwright-cli and the 21st.dev CLI, yt-dlp with
   pip --user, clones the MotionSites reference library into ~/.cache, and in Claude Code adds the Playwright,
   Hugging Face, Awwwards and Figma MCP servers.
4. If this is OpenCode, add to ~/.config/opencode/opencode.json under "mcp" (keep what is there):
   playwright `{ "type": "local", "command": ["npx", "-y", "@playwright/mcp@latest"] }`,
   awwwards `{ "type": "local", "command": ["npx", "-y", "awwwards-mcp"] }`,
   figma `{ "type": "remote", "url": "https://mcp.figma.com/mcp" }`,
   hf-mcp-server `{ "type": "remote", "url": "https://huggingface.co/mcp" }`;
   copy the repo's integrations/opencode/agents/*.md to ~/.config/opencode/agents/ and
   integrations/opencode/frontend-craft-gate.js to ~/.config/opencode/plugins/.
5. Logins that only I can do (tell me, do not attempt them for me): `21st login` (free, for the component search),
   the Figma and Hugging Face MCP sign-ins the first time they are used, and optional free stock keys:
   PEXELS_API_KEY (https://www.pexels.com/api/) and PIXABAY_API_KEY (https://pixabay.com/api/docs/) in my shell
   profile.
6. Verify: run `node <frontend-craft folder>/scripts/setup.mjs` again and show the full report (every line should
   start with "ok", except the logins I still have to do). Then a smoke test in a new empty folder under the
   current directory: `node <frontend-craft folder>/scripts/start.mjs --kind landing --lang en` must print
   "# Studio brief", and `ls craft .craft` must show starter.html, recipes.css, brief.md and plan.md. Remove the
   test folder.
7. Report: what was installed, what was already there, what failed with its error, and what I still have to do.
```

## Any harness: the skills CLI

```sh
npx skills@latest add nicolas2601/frontend-craft --all                     # every skill into every detected agent
npx skills@latest add nicolas2601/frontend-craft -g -a codex -s '*' -y     # every skill, one agent, global
```

The CLI knows each tool's skills folder (Claude Code, Codex, OpenCode, Gemini CLI, Cursor, pi and others). Installing a single skill with `-s frontend-craft` works, but the brief then has no photo library: it tells the agent to download licensed stand-ins by hand.

## The finish gates

Two gates decide when an agent may stop: `frontend-craft/scripts/gate.mjs` for websites, apps and docs, and `design-taste-frontend/scripts/gate.mjs` for a quiet site built with that skill's own run. Each one only acts on a build armed in the project folder, allows the stop after its block budget, and prints a fix list when it blocks. How each harness runs them:

| Harness | How the gates run |
|---|---|
| Claude Code | Each skill declares its own Stop hook in its frontmatter; it fires while the skill is active. The plugin adds a prompt hook that points web-page requests at the router. |
| Codex | Add one Stop hook that runs both (below). |
| OpenCode | The plugin in `integrations/opencode/` (below). |
| pi, Gemini CLI, Cursor, others | The skills tell the agent to run the gate and not to stop while it fails. Nothing enforces it; a weak model can skip it. |

## Claude Code

As a plugin:

```sh
/plugin marketplace add nicolas2601/frontend-craft
/plugin install frontend-craft@frontend-craft
```

From a local clone: `/plugin marketplace add /path/to/frontend-craft`. Or as plain skills: copy or symlink `skills/*` into `~/.claude/skills/` (user) or `.claude/skills/` (project).

## Codex

Install with the skills CLI (`-a codex`) or copy `skills/*` into `~/.agents/skills/`. Each own skill has `agents/openai.yaml`. Then add the combined gate to `~/.codex/config.toml`:

```toml
[[hooks.Stop]]
[[hooks.Stop.hooks]]
type = "command"
command = 'node "$HOME/.agents/skills/frontend-craft/scripts/stop-gates.mjs" --host codex'
timeout = 600
```

`stop-gates.mjs` runs every gate it finds next to the router and returns the first block in the `{"decision":"block","reason":...}` shape Codex reads.

## OpenCode

OpenCode discovers skills in `~/.config/opencode/skills/`, `~/.claude/skills/` and `~/.agents/skills/` (and the project's `.opencode/skills/`, `.claude/skills/`, `.agents/skills/`). Then:

1. Gate: copy `integrations/opencode/frontend-craft-gate.js` to `~/.config/opencode/plugins/`; OpenCode loads every plugin in that folder (plugin API v2). Do not also list it in `opencode.json`. When a session goes idle it runs the frontend-craft gate and design-taste-frontend's; a block's fix list is sent back into the same session. Restart OpenCode to load it. `TASTE_GATE` and `FRONTEND_CRAFT_GATE` override the script paths.
2. Agents: copy `integrations/opencode/agents/*.md` to `~/.config/opencode/agents/` (choose `frontend` with Tab): `frontend` (a primary agent that follows the run) and the two read-only reviewer subagents the design review starts, `craft-design-critic` and `craft-motion-auditor` (generated from `references/review.md` by `scripts/review-agents.mjs`).
3. MCP servers, in `mcp.servers` of `~/.config/opencode/opencode.json`: `"playwright": { "type": "local", "command": ["npx", "-y", "@playwright/mcp@latest"] }`, `"awwwards": { "type": "local", "command": ["npx", "-y", "awwwards-mcp"] }` (references), `"figma": { "type": "remote", "url": "https://mcp.figma.com/mcp" }` (drawing the direction for approval; `opencode mcp auth figma` once) and `"hf-mcp-server": { "type": "remote", "url": "https://huggingface.co/mcp" }` (then `opencode mcp auth hf-mcp-server` once, and turn on Dynamic Spaces in huggingface.co/settings/mcp for generated clips). `opencode mcp list` shows them; its first call after a restart can print none while the servers start.
4. `playwright-cli` for the reviewers: `npm install -g @playwright/cli@latest` (or `node <skill>/scripts/setup.mjs --install`).

In a prompt, `@frontend-craft` loads the router for sure.

## pi

Copy the folders into `~/.pi/agent/skills/`, or pass each with `pi -p --skill <path> ...`. pi has no Stop hook: the skills tell the agent to run the gate before it stops.

## Private repository

While the repository is private, the marketplace and `skills` commands need GitHub access to it (a logged-in `gh`, or a clone installed from a local path).

## Check that it works

```sh
cd /path/to/frontend-craft
npm test             # includes end-to-end runs of the checker in your Chrome
npm run verify       # own skills' structure, bundled skills unchanged, licences present
node skills/frontend-craft/scripts/start.mjs --list
```
