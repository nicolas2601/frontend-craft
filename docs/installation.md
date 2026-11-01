# Installation

The core skill is portable: copy the complete `skills/frontend-craft/` folder to a skill directory supported by the receiving client. Client discovery locations and reload behavior vary by version. Installation, discovery, invocation, and successful use are separate checks.

## Install the skill in a project

For a client that supports project-local `.agents/skills`, run this from the target project root after replacing the source path with the actual unpacked location:

```sh
mkdir -p .agents/skills
test ! -e .agents/skills/frontend-craft && \
  cp -R /absolute/path/to/frontend-craft/skills/frontend-craft \
  .agents/skills/frontend-craft
```

The guard intentionally stops if a same-named skill already exists. Inspect a collision and merge deliberately; do not overwrite it blindly. For other clients, use their current documented skill directory. OpenCode documents `~/.agents/skills` and `~/.claude/skills` among its global discovery paths; project-level paths and client behavior can differ. If the client has no skill loader, read `SKILL.md` with its file tools and follow the relevant linked references.

After copying, reload the client if required, confirm that `frontend-craft` is discoverable, and invoke it using the client's own displayed mechanism. A symlink or directory on disk alone is not proof the active model loaded the skill.

## Runtime prerequisites

These commands are opt-in instructions, not actions performed for you. Use official installers for your OS, then verify the executables. The local authoring environment was observed on Node.js **26.2/Linux**; that does not establish compatibility for every OS. Although the observer's direct package dependencies support Node.js 18+, the full optional toolchain was not verified on Node 18. HeroUI CLI 3.2.0 requires Node.js **22.22.0+** and pnpm **12+**.

- [Node.js downloads](https://nodejs.org/en/download): install an LTS release compatible with the tool you choose, then run `node --version` and `npm --version`.
- [Python downloads](https://www.python.org/downloads/): Python 3 is required for the bundled helper/tests; the helper uses only the standard library. Run `python3 --version` (or `python --version` on Windows). No `pip install` is needed for the helper.
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

## Optional OpenCode observer

The observer is not needed for the core skill. It requires a working OpenCode v2 CLI and an already-configured Cline Pass provider only for starting a run. It does not bundle credentials, create accounts, or promise free inference. Check provider quotas/cost before starting a run. The implementation calls `process.getuid()` for ownership checks; Windows behavior is not verified, so do not assume the observer works there.

Install OpenCode v2 using the upstream [CLI instructions](https://github.com/anomalyco/opencode#installation). The upstream v2 recipe checked here is:

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

Register `tools/opencode-observer/index.mjs` as a local stdio MCP server. The host configuration schemas differ: use the [Claude Code `.mcp.json` example](../examples/claude-code.mcp.example.json) for Claude Code's `mcpServers` format, or the [OpenCode v2.1.2 config example](../examples/opencode.mcp.example.json) for OpenCode's `mcp.servers` format. Replace the absolute clone-path placeholder and merge the entry; never overwrite an existing host configuration. The examples contain no auth or environment values. Schemas were checked against [Claude Code MCP docs](https://code.claude.com/docs/en/mcp) on 2026-11-01 and [OpenCode v2.1.2 MCP docs](https://github.com/anomalyco/opencode/blob/v2.1.2/services/www/src/docs/content/mcp-servers.mdx). Other clients/versions can differ.

The server exposes bounded session metadata/timelines; visible excerpts are opt-in and untrusted. Starting a test can spend provider quota and modify files; directory checks are not a sandbox. Do not pass secrets or private data. See [verification](verification.md).

## Supervised product-trial runner

The runner is optional and model-backed. It requires an existing, current-user-owned workspace under the user's home directory or the system temporary directory; the runner rejects several sensitive home subdirectories. Windows behavior is not verified. Choose an enabled native Cline Pass model ID and its supported effort from `opencode_models` first. `run` starts one build-agent session for the current phase and can consume quota and write files; there is no automatic login, approval, or rollback.

Keep the state JSON outside the workspace (neither inside it nor an ancestor of it). The workspace must already exist. The original brief is the final `init` argument, preserved verbatim; keep it short, 1–4000 characters, and free of credentials. On POSIX shells:

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

The four ordered phases are `direction`, `proof`, `interaction`, and `delivery`. Each producer session works in its own `<workspace>/<phase>/` directory. Later phases receive links to prior approved artifacts and notes as read-only handoffs. After each `run`, inspect the artifacts yourself, then record a human gate with `review <state.json> <approve|reject> <artifact-paths-json> <reviewer-notes> <evidence>`. Artifact paths are relative to the current phase directory (for example `study-1.png`, not `direction/study-1.png`) and must be nonempty regular files without symlinks or path traversal. An approval requires 1–20 existing files; rejection may use `[]`. Notes/evidence are required strings, but the CLI only hashes listed files—it does not view pixels or determine whether the written evidence is true. Only `awaiting_review` is reviewable; failed, interrupted, or uncertain run outcomes are not approval states and must not be retried or approved automatically.

Example syntax only; replace paths and notes with real artifacts and a review you actually performed:

```sh
node tools/opencode-observer/supervisor-cli.mjs review "$STATE" approve \
  '["study-1.png","study-2.png"]' \
  "Inspected both full-size design studies." \
  "Opened both rendered files directly and compared them with the brief."
```

Each trial allows up to four sequential phase sessions within one shared 1,200-second wall-clock budget from its first `run`; human review time counts. Each `run` requests shutdown of the session it started. If shutdown cannot be confirmed, the process keeps the global lock at `~/.cache/opencode-observer/supervisor.lock` fail-closed. A retained lock is not cleared automatically—inspect the state and session before taking action; do not delete the lock to force a retry. The CLI records state but does not create a pixel-review certificate or self-approve a phase. See [Verification](verification.md) for the distinction between process checks and product review.

## Optional design and component tools

Install or invoke only a tool that fits the chosen project. These examples do not initialize projects, log in, or accept terms automatically.

### OpenCode, 21st.dev, HeroUI, and Context7

| Tool | Opt-in command | Requirements and boundary |
| --- | --- | --- |
| OpenCode v2 | `npm install --global @opencode/cli@latest` | Node/npm; verify with `opencode --version`. Current upstream v2 command, not v1. |
| 21st.dev CLI | `npx @21st-dev/cli@1.18.0 search "color picker"` | Node/npm. Official CLI docs list `@21st-dev/cli` (binary `21st`). Optional pinned global install: `npm install --global @21st-dev/cli@1.18.0`. This example searches; `21st login` is separate and is not required by this instruction. A 2026-11-01 read-only search returned three color-picker candidates, reported Free, AI generation off and 0 credits, with two source-retrieval uses remaining at that time. Those limits/terms can change; search metadata is not component adoption. |
| HeroUI CLI | `npx heroui-cli@3.2.0 --help` | Node.js 22.22.0+ and pnpm 12+. If pnpm is absent, optional install: `npm install --global pnpm@12`. Optional global CLI install: `npm install --global heroui-cli@3.2.0`. `heroui install` changes the current project's dependencies; run it only after choosing HeroUI and reviewing the target project. |
| Context7 CLI | `npx ctx7@latest library React "the documentation question"` | Node/npm. Then use the returned library ID with `npx ctx7@latest docs <libraryId> "the documentation question"`. No global install or account is required by these commands. |

Sources: [21st CLI](https://help.21st.dev/cli), [HeroUI CLI](https://github.com/heroui-inc/heroui-cli), [Context7 CLI](https://github.com/upstash/context7). Package versions and remote registry contents change; confirm before pinning them in a project.

### Hugging Face Hub CLI and MCP

The Hub CLI is included in `huggingface_hub`; install it in the virtual environment above and verify with `hf --help`. The official docs also provide a standalone installer. Public Hub browsing does not generally require authentication. **Do not run `hf auth login` unless you deliberately need a gated/private resource or write action.** This package's image helper does not use the Hub CLI or a token.

For the official remote MCP server, visit [Hugging Face MCP settings](https://huggingface.co/settings/mcp), select your client, and use the client-specific configuration it generates. The documented endpoint is `https://huggingface.co/mcp`; setup may require you to authenticate with Hugging Face and approve access in your client. This guide does not log you in or authorize tools. Review enabled capabilities before use; Hub MCP may expose write/jobs/community tools in addition to search. See [official setup docs](https://huggingface.co/docs/hub/en/hf-mcp-server).

### Playwright MCP, UI Skills MCP, and browser setup

Start the official Playwright MCP package with Node/npm:

```sh
npx @playwright/mcp@latest
```

Configure that command in the receiving MCP client using its current local-stdio schema. This starts the server; it does not by itself prove the browser works. If Chromium binaries are missing, the official Playwright CLI provides these separate, opt-in commands:

```sh
npx playwright install chromium
# Linux: also install required OS packages when appropriate
npx playwright install --with-deps chromium
```

The second command may need elevated OS package permissions. MCP package and browser installation are different steps; browser install details depend on the selected browser/platform. See [Playwright MCP](https://github.com/microsoft/playwright-mcp) and [browser installation docs](https://playwright.dev/docs/browsers).

UI Skills publishes the public MCP endpoint `https://www.ui-skills.com/mcp` with `list_skills` and `get_skill`. For Claude Code only, the documented remote-server registration form is:

```sh
claude mcp add --transport http ui-skills https://www.ui-skills.com/mcp
```

UI Skills' endpoint page does not document auth details. Do not assume other clients share Claude Code's command/config format. See [UI Skills MCP](https://www.ui-skills.com/mcp).

### Optional video utilities

Only install FFmpeg when the task needs local video inspection/encoding. Examples (package versions and system dependencies vary):

```sh
# macOS with Homebrew
brew install ffmpeg

# Debian/Ubuntu
sudo apt-get install ffmpeg
```

Both packages normally provide `ffmpeg` and `ffprobe`; verify with `ffmpeg -version` and `ffprobe -version`. On Windows, use the download links from [FFmpeg's official download page](https://ffmpeg.org/download.html) and follow the chosen build's setup instructions; no Windows package-manager recipe was verified here. Installing FFmpeg does not install a video-generation model/provider. See [creative media limits](tools-and-provenance.md).

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
