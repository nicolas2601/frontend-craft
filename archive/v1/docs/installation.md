# Installation

The core skill is portable: copy the complete `skills/frontend-craft/` folder to a skill directory supported by the receiving client. Client discovery locations and reload behavior vary by version. Installation, discovery, invocation, and successful use are separate checks.

The tool-by-tool inventory, with install sources and verification status, is in the [README tool inventory](../README.md#tool-inventory). This page gives the procedures.

## Install the skill

For a client that supports project-local `.agents/skills`, run this from the target project root after replacing the source path with the actual unpacked location:

```sh
mkdir -p .agents/skills
test ! -e .agents/skills/frontend-craft && \
  cp -R /absolute/path/to/frontend-craft/skills/frontend-craft \
  .agents/skills/frontend-craft
```

The guard intentionally stops if a same-named skill already exists. Inspect a collision and merge deliberately; do not overwrite it blindly. For other clients, use their current documented skill directory. OpenCode documents `~/.agents/skills` and `~/.claude/skills` among its global discovery paths; project-level paths and client behavior can differ. If the client has no skill loader, read `SKILL.md` with its file tools and follow the relevant linked references.

After copying, reload the client if required, confirm that `frontend-craft` is discoverable, and invoke it using the client's own displayed mechanism. A symlink or directory on disk alone is not proof the active model loaded the skill.

## Install the svg-craft skill

`skills/svg-craft/` is a separate skill folder. Copy it next to `frontend-craft` in the same skill directory, then install its tools in place. Do not copy another machine's `node_modules`.

```sh
test ! -e <skills-dir>/svg-craft && \
  cp -R /absolute/path/to/frontend-craft/skills/svg-craft <skills-dir>/svg-craft
cd <skills-dir>/svg-craft/tools && npm ci
```

Replace `<skills-dir>` with the skill directory you used above. `npm ci` installs `playwright-core` and `svgo` from the lockfile. Rendering needs a Chrome or Chromium binary: set `CHROME_PATH` to its absolute path in the environment that runs the tools. `text2path.py` additionally needs Python 3 and fonttools:

```sh
python3 -m venv .venv
. .venv/bin/activate                 # macOS/Linux
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install fonttools
```

The bundled packs carry their own MIT license files (see [rights](rights-and-redistribution.md#svg-craft-packs)). The anatomy kit (about 40 MB) is not bundled and is not needed for the core tools.

## Install the subagents

The ten specialist agents are in `agents/frontend-craft/` as `fc-*.md` files. They are Claude Code subagent definitions. Install the folder as a whole, not one file at a time, into one of these scopes:

- Project scope, from the target project root:

```sh
mkdir -p .claude/agents
test ! -e .claude/agents/frontend-craft && \
  cp -R /absolute/path/to/frontend-craft/agents/frontend-craft \
  .claude/agents/frontend-craft
```

- User scope: the same pattern with `~/.claude/agents/` as the parent. Use `mkdir -p ~/.claude/agents` first.

The guard stops if the destination exists; inspect a collision before replacing anything. Claude Code scans `.claude/agents/` and `~/.claude/agents/` recursively; the subfolder does not change an agent's identity, which comes from its `name` frontmatter field (OFFICIAL-DOC, code.claude.com/docs/en/sub-agents, fetched 2026-11-05).

Reload: Claude Code watches existing agent directories and picks up added or edited files within seconds. If the agents directory did not exist when the session started, restart Claude Code, because a running session does not detect a newly created `agents` directory. Confirm the ten names (`fc-reference-scout`, `fc-ux-architect`, `fc-art-director`, `fc-ui-system-designer`, `fc-component-sourcer`, `fc-asset-artist`, `fc-frontend-builder`, `fc-motion-whimsy`, `fc-a11y-auditor`, `fc-finish-gate-reviewer`) appear in your client's own listing of subagents.

Only the main session spawns agents; the orchestration contract is the skill reference `agent-roster.md`. The attribution for the upstream roles is in [agents/NOTICE.md](../agents/NOTICE.md).

Other clients: OpenCode and other hosts use different agent formats. This repository does not convert the files, and no other client's format has been verified here.

## Runtime prerequisites

These commands are opt-in instructions, not actions performed for you. Use official installers for your OS, then verify the executables. The local authoring environment was observed on Node.js **26.2/Linux**; that does not establish compatibility for every OS. The observer's direct package dependencies support Node.js 18+, but the full optional toolchain was not verified on Node 18. HeroUI CLI requires Node.js **22.22.0+**. awwwards-mcp requires Node.js **22.13+**. Claude Code's npm install requires Node.js **22+**.

- [Node.js downloads](https://nodejs.org/en/download): install an LTS release compatible with the tool you choose, then run `node --version` and `npm --version`.
- [Python downloads](https://www.python.org/downloads/): Python 3 is required for the bundled helper, the tests, and svg-craft `text2path.py`. The helper uses only the standard library. Run `python3 --version` (or `python --version` on Windows).
- Example OS package-manager installs (not run here; package versions are controlled by the OS/package manager):

```sh
# Arch Linux
sudo pacman -S nodejs npm python

# macOS, if Homebrew is already installed
brew install node python
```

On Windows, use the official Node.js `.msi` and Python installer from the download pages above. Check the installed Node version against each tool's requirement; generic OS package commands may not provide a recent enough Node release.

- For optional Python CLI packages, prefer a project virtual environment instead of a global install:

```sh
python3 -m venv .venv
. .venv/bin/activate                 # macOS/Linux
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install --upgrade huggingface_hub
```

## Configure MCP servers

Configuration is separate from installation. Merge entries into an existing host configuration; never overwrite it. Replace every placeholder path. The examples contain no auth or environment values.

### Claude Code

Two equivalent routes exist. The command form writes the entry for you; `--scope project` writes it to `.mcp.json` in the project root so it can be shared:

```sh
claude mcp add --transport http figma --scope project https://mcp.figma.com/mcp
claude mcp add --scope project playwright -- npx @playwright/mcp@latest
```

Or merge the entries from [`examples/claude-code.mcp.example.json`](../examples/claude-code.mcp.example.json) into `.mcp.json` under `mcpServers`. That file includes the observer, Playwright, Chrome DevTools, Figma, UI Skills and shadcn entries. Claude Code asks before using project servers in an interactive session. Run `claude mcp get <name>` or `claude mcp list` yourself to inspect what is registered; this kit does not run those commands for you.

### OpenCode v2

OpenCode v2 uses `mcp.servers`, a different schema. Start from [`examples/opencode.mcp.example.json`](../examples/opencode.mcp.example.json), which uses `"type": "local"` with a `command` array. Remote servers use `"type": "remote"` with `url` and optional `headers`. Use `{env:NAME}` for secrets; shell forms like `$NAME` are not expanded in JSON (OFFICIAL-DOC, opencode.ai/v2/docs/mcp-servers, fetched 2026-11-05). Do not paste the Claude Code file into OpenCode's config.

## Optional OpenCode observer

The observer is not needed for the core skill. It requires a working OpenCode v2 CLI and an already-configured Cline Pass provider only for starting a run. It does not bundle credentials, create accounts, or promise free inference. Check provider quotas/cost before starting a run. The implementation calls `process.getuid()` for ownership checks; Windows behavior is not verified, so do not assume the observer works there.

Install OpenCode v2 using the upstream [documentation](https://opencode.ai/v2/docs). The recipe checked on 2026-11-05 (anomalyco/opencode README) includes:

```sh
npm install --global @opencode/cli@latest
opencode --version
```

The observer resolves `opencode` from `PATH` by default. If it is installed elsewhere, set the non-secret `OPENCODE_BIN` environment variable to its absolute executable path in the MCP server's environment. The API adapter expects OpenCode v2; it does not support a guessed v1 API recipe. From the repository root, install its locked dependencies and run unit tests:

```sh
cd tools/opencode-observer
npm ci
npm test
```

Register `tools/opencode-observer/index.mjs` as a local stdio MCP server, using the Claude Code or OpenCode example above. Replace the absolute clone-path placeholder and merge the entry.

The server exposes bounded session metadata/timelines; visible excerpts are opt-in and untrusted. Starting a test can spend provider quota and modify files; directory checks are not a sandbox. Do not pass secrets or private data. See [verification](verification.md).

## Supervised product-trial runner

The runner is optional and model-backed. It requires an existing, current-user-owned workspace under the user's home directory or the system temporary directory; the runner rejects several sensitive home subdirectories. Windows behavior is not verified. Choose an enabled native Cline Pass model ID and its supported effort from `opencode_models` first. `run` starts one build-agent session for the current phase and can consume quota and write files; there is no automatic login, approval, or rollback.

Keep the state JSON outside the workspace (neither inside it nor an ancestor of it). The workspace must already exist. The original brief is the final `init` argument, preserved verbatim; keep it short, 1-4000 characters, and free of credentials. On POSIX shells:

```sh
WORKSPACE="$HOME/work/frontend-trial-01"  # use an existing, owned trial directory
STATE="$HOME/.cache/opencode-observer/trials/trial-01.json"
MODEL_ID='cline-pass/<enabled-model-id>'
EFFORT='<supported-effort>'

node tools/opencode-observer/supervisor-cli.mjs init \
  "$STATE" "$WORKSPACE" trial-01 "$MODEL_ID" "$EFFORT" \
  "Preserve this user brief verbatim."
node tools/opencode-observer/supervisor-cli.mjs run "$STATE"
node tools/opencode-observer/supervisor-cli.mjs status "$STATE"
```

The four ordered phases are `direction`, `proof`, `interaction`, and `delivery`. Each producer session works in its own `<workspace>/<phase>/` directory. Later phases receive links to prior approved artifacts and notes as read-only handoffs. After each `run`, inspect the artifacts yourself, then record a human gate with `review <state.json> <approve|reject> <artifact-paths-json> <reviewer-notes> <evidence>`. Artifact paths are relative to the current phase directory (for example `study-1.png`, not `direction/study-1.png`) and must be nonempty regular files without symlinks or path traversal. An approval requires 1-20 existing files; rejection may use `[]`. Notes/evidence are required strings, but the CLI only hashes listed files; it does not view pixels or determine whether the written evidence is true. Only `awaiting_review` is reviewable; failed, interrupted, or uncertain run outcomes are not approval states and must not be retried or approved automatically.

Example syntax only; replace paths and notes with real artifacts and a review you actually performed:

```sh
node tools/opencode-observer/supervisor-cli.mjs review "$STATE" approve \
  '["study-1.png","study-2.png"]' \
  "Inspected both full-size design studies." \
  "Opened both rendered files directly and compared them with the brief."
```

Each trial allows up to four sequential phase sessions within one shared 1,200-second wall-clock budget from its first `run`; human review time counts. Each `run` requests shutdown of the session it started. If shutdown cannot be confirmed, the process keeps the global lock at `~/.cache/opencode-observer/supervisor.lock` fail-closed. A retained lock is not cleared automatically; inspect the state and session before taking action, and do not delete the lock to force a retry. The CLI records state but does not create a pixel-review certificate or self-approve a phase. See [Verification](verification.md) for the distinction between process checks and product review.

## Optional design and component tools

The commands and sources for each tool are in the [README tool inventory](../README.md#tool-inventory). Procedure notes that the table does not carry:

- **21st.dev**: `21st login` opens a browser sign-in and saves a local session. Retrieval has a daily quota. Use `search` and `get`; `add`, generation, and `publish` have side effects and are not part of discovery. Install a retrieved component only into a project after inspecting it.
- **HeroUI**: run `info` and `doc` for reference. `init`, `install`, `upgrade`, `uninstall`, `design-md` and `agents-md` change project files or dependencies; run them only after choosing HeroUI for a specific project and reviewing the target.
- **Context7**: `npx ctx7@latest library <name> "<question>"` returns a library ID; pass that ID to `docs`. No global install or account is required.
- **Playwright browsers**: `npx playwright install chromium` installs the browser binary. On Linux, `--with-deps` may need elevated OS-package permissions; run it only when appropriate.
- **Hugging Face CLI**: install with `python -m pip install --upgrade huggingface_hub` in a virtual environment, or the official standalone installer (`curl -LsSf https://hf.co/cli/install.sh | bash` on macOS and Linux). Verify with `hf --help`. Do not run `hf auth login` unless you deliberately need a gated, private, or write action.
- **UI Skills**: `list_skills` on a narrow topic, then `get_skill` for one returned path. Claude Code registration: `claude mcp add --transport http ui-skills https://www.ui-skills.com/mcp`.
- **ffmpeg**: `ffmpeg -version` and `ffprobe -version` verify the install. Installing FFmpeg does not install a video-generation model or provider. See [creative media limits](../skills/frontend-craft/references/creative-media.md).

## Included public image helper (no package install)

The helper uses Python 3's standard library only; no HF token or Hugging Face client is required. The command below sends the prompt to the public `mcp-tools/Z-Image-Turbo` Space, so use only non-sensitive, synthetic briefs and an empty output directory:

```sh
python3 -I -B skills/frontend-craft/scripts/hf_zerogpu_asset.py \
  --prompt "PUBLIC SYNTHETIC ASSET BRIEF" \
  --output-dir ./assets/generated/concept-01
```

It supports square, 3:2, and 2:3 resolutions; `--seed` is a non-negative 32-bit integer. Output is marked pending visual review and rights verification. The helper stops on endpoint/availability uncertainty; it does not retry through a paid fallback. Historical success is not a guarantee of current uptime, quota, quality, or redistribution rights. It generates images only, not video. See [free-first asset notes](../skills/frontend-craft/references/free-assets.md).

## Verify what was installed

Installing a CLI is not proof it is connected or useful. Use the exact host's list/status command, check discovered tools, and perform only a task-relevant read-only query before granting credentials or enabling generation/write actions. For the actual automated checks, optional live smoke test and frontend review, see [Verification](verification.md).
