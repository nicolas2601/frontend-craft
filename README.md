# Frontend Craft

Frontend Craft is a portable, staged design-and-implementation kit for turning a short product brief into a distinctive, working frontend. It combines a user-supplied design playbook, practical guidance on visual direction, components, interaction, mobile behavior, assets and evidence-based review, a set of specialist Claude Code subagents, and an SVG illustration toolkit.

It is guidance, not an autonomous benchmark or an aesthetic-quality certificate. A skill or agent being installed does not mean a model has loaded it, tools are available, a design has been rendered, or a result has passed review. The brief and the host project's constraints remain authoritative.

## What is included

- `skills/frontend-craft/` - the complete skill and its staged references. Install the whole directory; do not copy only `SKILL.md`.
- Motion recipes inside the skill (`references/motion-*.md`): 58 techniques adapted from the MIT part of MotionSites Web Builder, with notice in `motion-license.md`. Its example prompts and media shelf are copyrighted and not included.
- `skills/svg-craft/` - a vendored SVG skill (illustration packs, diagrams, animation, logos, generative and science kits) with its own tools in `tools/`. Its anatomy kit (about 40 MB) is not bundled.
- `agents/frontend-craft/` - ten specialist subagents (`fc-*.md`) adapted for frontend work from the MIT-licensed agency-agents project. Attribution is in [agents/NOTICE.md](agents/NOTICE.md).
- `tools/opencode-observer/` - an optional local MCP server for inspecting bounded OpenCode session activity and, when explicitly invoked, starting a separate build-agent test.
- `docs/` - installation, the tool inventory (this file's table is the single list), verification, and rights guidance.
- `examples/` - credential-free configuration fragments for Claude Code and OpenCode.

The core skill runs without the subagents, the observer, svg-craft, or any particular UI library, model, registry, or asset provider. See [Installation](docs/installation.md).

## Core workflow

Understand the product and project; choose a specific visual direction; prove it with a focused artifact; build the actual experience; inspect rendered behavior at relevant sizes; correct concrete failures; and report what was and was not verified. For product-design tasks, use the staged process and rejection criteria in the skill references rather than treating a checklist or a model response as proof.

## Quick local checks

```sh
npm run doctor
npm run check
npm test
# Optional: create dist/frontend-craft.skill
npm run pack:skill
```

`npm run check` validates the skill, the agent definitions and `agents/NOTICE.md` (`scripts/verify_agents.py`), and syntax-checks the observer. `npm test` needs the observer dependencies first: `npm ci --prefix tools/opencode-observer`. The doctor reports executable availability only; it does not prove MCP connectivity, permissions, quota, or successful use. See [Verification](docs/verification.md).

## Tool inventory

This table is the single list of tools this kit mentions. Each entry says what it does here, how to obtain it, what it costs or requires, and how the install source was checked. Use the labels in [Tools and provenance](docs/tools-and-provenance.md#verification-labels):

- **OFFICIAL-DOC** - fetched from the vendor's documentation or the project's repository on 2026-11-05.
- **REPO** - taken from this repository's existing docs or scripts; not re-fetched in that pass.
- **SESSION** - provided by the authoring session; the source was not verified.
- **UNVERIFIED** - no reliable source was found. Do not install from it without checking.

Nothing here is installed, logged in, or configured for you. Commands are opt-in examples.

### Required

| Tool | Role in frontend-craft | How to obtain | Needs account/cost | Verified how |
| --- | --- | --- | --- | --- |
| Node.js and npm/npx | Runs the observer, svg-craft tools, `npx`-launched MCP servers and HeroUI/shadcn/Context7 CLIs. | [nodejs.org/en/download](https://nodejs.org/en/download); check `node --version` and `npm --version`. Versions: 22+ for the npm Claude Code install, 22.13+ for awwwards-mcp, 22.22+ for HeroUI CLI. | Free. | OFFICIAL-DOC: Claude Code setup, awwwards-mcp and HeroUI CLI READMEs. Observer runs on Node 18+ per its own dependencies (REPO). |
| Python 3 | Standard-library image helper, repository unit tests, and svg-craft `text2path.py`. | [python.org/downloads](https://www.python.org/downloads/); check `python3 --version`. No `pip install` for the helper. | Free. | REPO (installation doc). Official page not re-fetched. |
| fonttools (Python) | Only for svg-craft `tools/text2path.py`. | Inside a virtual environment: `python3 -m pip install fonttools`. | Free. | UNVERIFIED for this pass; standard PyPI package name, not fetched. |
| git | Repository and branch workflow. | [git-scm.com/downloads](https://git-scm.com/downloads); `git --version`. Some Claude Code features need git 2.31+. | Free. | OFFICIAL-DOC: Claude Code setup page (git 2.31+ for some features). Download page not re-fetched. |
| GitHub CLI (`gh`) | Optional repository and PR operations for the private repository. | [cli.github.com](https://cli.github.com/); sign in only yourself, with `gh auth login`. | GitHub account. | UNVERIFIED for this pass (official site, not fetched). |
| Claude Code | Host for the subagents, `.mcp.json` servers and skill loading. Subagents need a client with subagent support; Claude Code provides it. | macOS/Linux/WSL: `curl -fsSL https://claude.ai/install.sh \| bash`. Windows PowerShell: `irm https://claude.ai/install.ps1 \| iex`. Homebrew: `brew install --cask claude-code`. npm: `npm install -g @anthropic-ai/claude-code` (Node 22+). | Paid Claude plan or Console/API account. The free claude.ai plan has no Claude Code access. | OFFICIAL-DOC: code.claude.com/docs/en/setup, fetched 2026-11-05. |
| frontend-craft skill | The staged design method and its references. | Copy the whole `skills/frontend-craft/` folder to the client's skill directory. See [installation](docs/installation.md#install-the-skill). | Free. | REPO. Client discovery paths were not re-verified in this pass. |
| frontend-craft subagents (`fc-*`) | Ten specialist roles; the orchestration contract is in the skill's `agent-roster.md`. | Copy `agents/frontend-craft/` into `~/.claude/agents/` or `<project>/.claude/agents/`. See [installation](docs/installation.md#install-the-subagents). | Free. | OFFICIAL-DOC: Claude Code subagent docs (recursive scan, name/description frontmatter, hot reload). Other clients use other formats and are not covered. |

### Strongly recommended

| Tool | Role in frontend-craft | How to obtain | Needs account/cost | Verified how |
| --- | --- | --- | --- | --- |
| Playwright MCP (`@playwright/mcp`) and browsers | Rendered checks: screenshots at desktop and mobile widths, keyboard and touch interaction, console errors. | Claude Code: `claude mcp add playwright npx @playwright/mcp@latest`. Browsers: `npx playwright install chromium` (on Linux, add `--with-deps` only when appropriate). | Free. | OFFICIAL-DOC: github.com/microsoft/playwright-mcp README (fetched). Browser install line from REPO; playwright.dev not re-fetched. |
| Chrome DevTools MCP (`chrome-devtools-mcp`) | Performance traces, Lighthouse audits, network and console inspection. Needs current stable Chrome; the browser starts on first use. | Config: `command` `npx`, args `["-y", "chrome-devtools-mcp@latest"]`. Claude Code plugin route from the project README: `/plugin marketplace add ChromeDevTools/chrome-devtools-mcp`, then `/plugin install chrome-devtools-mcp@chrome-devtools-plugins`. Usage statistics are on by default; `--no-usage-statistics` turns them off. | Free; a local Chrome is required. | OFFICIAL-DOC: github.com/ChromeDevTools/chrome-devtools-mcp README (fetched). |
| Figma MCP (official remote server) | Read Figma designs into code, write to Figma, Code Connect. | Claude Code: `claude mcp add --transport http figma https://mcp.figma.com/mcp`. Other clients: the same HTTP endpoint in their own schema. Any sign-in is handled by the client; the exact flow was not verified. | Figma account. Plan, seat and rate limits were not verified. | OFFICIAL-DOC: github.com/figma/mcp-server-guide README and server.json (fetched). Skill names `figma-use` (required before `use_figma`), `figma-generate-design`, `figma-design-to-code` come from the server's own instructions (SESSION). |
| UI Skills MCP | Retrieves a small number of design and interaction guides (`list_skills`, `get_skill`). | Endpoint `https://www.ui-skills.com/mcp`. Claude Code: `claude mcp add --transport http ui-skills https://www.ui-skills.com/mcp`. The UI Skills page shows no client snippet. | No account or key documented; cost not stated. | OFFICIAL-DOC: ui-skills.com/mcp (fetched; endpoint and tools). The Claude command form follows the Claude Code docs. |
| shadcn MCP and CLI | Lists and inspects registry items and installs them into a project with a valid `components.json`. | Claude Code: `pnpm dlx shadcn@latest mcp init --client claude`. Generic: `npx shadcn@latest mcp` (`mcpServers` entry). Never initialize `components.json` in HOME. | Free for the public shadcn registry. | OFFICIAL-DOC: ui.shadcn.com/docs/mcp (fetched). |
| Context7 CLI (`ctx7`) and MCP | Current library and framework documentation before answering API questions. | CLI: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <libraryId> "<question>"`. MCP: `npx ctx7 setup` or the endpoint `https://mcp.context7.com/mcp`. | Free; an API key is recommended for higher limits, not required. | OFFICIAL-DOC: github.com/upstash/context7 README (fetched). The `ctx7 library` lookup was run successfully on 2026-11-05. |
| svg-craft tools | Lint, render, optimize and a11y-fix SVG files; `text2path.py` converts text to paths. | `cd skills/svg-craft/tools && npm ci`. Set `CHROME_PATH` to a Chrome or Chromium binary for rendering. `text2path.py` also needs Python 3 and fonttools. | Free. | REPO: vendored `package.json` (playwright-core, svgo) and lockfile. Commands were not executed in this pass. |
| Hugging Face MCP | Hub search, Hub documentation search, Spaces, and (if enabled) Jobs and sandboxes. | Generate the client-specific config at [huggingface.co/settings/mcp](https://huggingface.co/settings/mcp) (endpoint `https://huggingface.co/mcp`). Enable only the tools you need. | Hugging Face account to generate the config. Jobs can consume paid compute. | OFFICIAL-DOC: huggingface.co/docs/hub/en/hf-mcp-server (fetched). |
| Bundled anonymous image helper | Image concepts through one public ZeroGPU Space, without a token. | No install: `python3 -I -B skills/frontend-craft/scripts/hf_zerogpu_asset.py --prompt "..." --output-dir <empty-dir>`. Send only non-sensitive, synthetic briefs. | No token. The public Space's uptime and quota can change. | REPO: script, mocked unit tests, and a historical live check recorded in the existing installation doc. |

### Optional

| Tool | Role in frontend-craft | How to obtain | Needs account/cost | Verified how |
| --- | --- | --- | --- | --- |
| OpenCode v2 CLI | Runs the observer's supervised product trials; also an alternative host for the MCP examples. | `curl -fsSL https://opencode.ai/v2/install \| bash`, or `npm i -g @opencode/cli@latest`, or `brew install anomalyco/tap/opencode-v2`. Verify with `opencode --version`. | Free CLI; model runs need a provider. | OFFICIAL-DOC: github.com/anomalyco/opencode README install commands and opencode.ai/v2 docs links (fetched). The observer targets v2 only. |
| Cline Pass subscription | Model provider used by the observer's `run` command. Not bundled. | Subscribe with the provider, then configure OpenCode with it yourself. | Paid subscription per the team brief; current terms not verified. | UNVERIFIED for this pass. |
| 21st.dev CLI (`21st`) | Search and retrieve **existing** community components (retrieval only; generation features are not used by this kit). | `npm i -g @21st-dev/cli` or `npx @21st-dev/cli search "<query>"`. `21st login` opens the browser. Retrieval has a daily quota. | Free tier: no search quota reported (`freeSearchesPerDay` was null), source retrieval capped at 2 per day (`21st usage --json`); AI generation needs credits and is out of scope. | OFFICIAL-DOC: help.21st.dev/cli (fetched). Read-only session checks (`whoami`, `usage`, `search`, `logo`) were run on 2026-10-31 and 2026-11-05 (REPO); on 2026-11-05 the daily retrieval allowance was already 0. |
| 21st Magic MCP (`magic-mcp-21st` skill) | **Not used by this kit.** Hosted component generation; excluded because the method sources existing components instead of generating them. | No current setup command found in the docs. The `@21st-dev/magic` package is superseded and proxies to the 21st MCP endpoint. | Account and credits. | UNVERIFIED for setup. The skill is SESSION-provided. |
| HeroUI CLI (`heroui-cli`) | Looks up HeroUI component APIs and docs; manages HeroUI packages in a project. | `npx heroui-cli@latest --help`, or `npm install -g heroui-cli`. Read-only: `info`, `doc`, `list`, `doctor`. `init`, `install`, `upgrade`, `uninstall`, `design-md` and `agents-md` change files or dependencies. | Free. Needs Node 22.22+ and pnpm 12+ (pnpm from REPO). | OFFICIAL-DOC: github.com/heroui-inc/heroui-cli README (fetched; Node 22.22+). pnpm 12+ is not stated in that README. |
| Awwwards MCP (`awwwards-mcp`) | Design-reference discovery and page analysis (search sites, design DNA, motion and structure evidence). | Claude Code: `claude mcp add awwwards -- npx -y awwwards-mcp`. Node 22.13+. `AWWWARDS_MCP_PROFILE=core` exposes 13 tools. Browser tools need Playwright with Chromium; motion recording needs `ffmpeg-static`. | No API key or account. Third-party project, MIT. Daily listings use scraping of public pages; the three annual tools use an official public JSON:API. | OFFICIAL-DOC: github.com/INSANE0777/Awwwards-mcp README (fetched). Not verified as an Awwwards product. Read its rights terms before reusing captured material. |
| Lazyweb MCP | Screenshot, flow and experiment research for web products. | Hosted route reported on the vendor product page as `claude mcp add --transport http lazyweb https://www.lazyweb.com/mcp` (OAuth). Not fetched directly. Local installer: `curl -fsSL https://www.lazyweb.com/install.sh \| bash` is **not recommended blind**. Download it, read it, then decide. | Account and quotas; cost not verified. | UNVERIFIED for the hosted command. The install page was fetched: its command embeds agent-generated context arguments and pipes straight to bash. |
| design-screenshots MCP | Searches a screenshot collection for visual references. | Session-provided. | Unknown. | SESSION: source not verified; capture rights not established. |
| Google Flow MCP (`google-flow`) | Image and video generation through a user-local Flow setup. | Session-provided and user-local. | Google account; quotas and tiers not verified. | SESSION: source not verified; output terms not checked. |
| Pinterest (reference browsing) | Mood and visual reference discovery. There is no public API used here. | Use the Playwright MCP browser on **your own logged-in session** to look at pages you can already see. No login bypass, no scraping, no bulk saving. See [inspiration research](skills/frontend-craft/references/inspiration-research.md). | Your Pinterest account. | Policy from the team brief; not a tool source. The linked reference file is added by the skill sync. |
| ffmpeg and ffprobe | Local video inspection and encoding when a task needs it. | macOS: `brew install ffmpeg`. Debian/Ubuntu: `sudo apt-get install ffmpeg`. Windows: [ffmpeg.org/download.html](https://ffmpeg.org/download.html). Verify with `ffmpeg -version` and `ffprobe -version`. | Free. | REPO (installation doc). The FFmpeg download page was not re-fetched. |
| Figma desktop or web app | Where Figma files live and are edited; required for the Figma MCP to act on a file. | [figma.com](https://www.figma.com/). | Figma account; plan limits not verified. | UNVERIFIED for plan limits. |
| opencode-observer (this repo) | Local MCP adapter for bounded OpenCode session inspection and supervised trials. | `npm ci --prefix tools/opencode-observer`; register `tools/opencode-observer/index.mjs` as stdio. See [installation](docs/installation.md#optional-opencode-observer). | Free; trial runs consume model quota. | REPO: unit tests and `npm run check` (no model call). |

## Configuration

Claude Code reads project MCP servers from `.mcp.json` in the project root under `mcpServers`. Its documented entries are `command`/`args`/`env` for stdio servers and `type` (`http`, `sse` or `ws`) with `url` and `headers` for remote servers (OFFICIAL-DOC, fetched 2026-11-05). `claude mcp add` without `--scope project` writes to your local Claude configuration rather than the project file; use `--scope project` if the entry should be shared. Interactive sessions ask before using project servers. Do not read or copy another person's Claude configuration to fill these in.

OpenCode v2 uses a different schema. Servers go under `mcp.servers`, keyed by name. Local servers use `"type": "local"` with a `command` array and optional `environment`; remote servers use `"type": "remote"` with `url` and optional `headers`. Substitute secrets with `{env:NAME}`; shell-style `$NAME` is not expanded in JSON (OFFICIAL-DOC, opencode.ai/v2/docs/mcp-servers, fetched 2026-11-05). The OpenCode example in `examples/` is a different file from the Claude Code one: do not merge them.

Per-server notes:

- **Playwright, Chrome DevTools**: stdio via `npx`. The examples pin `@latest` on purpose; pin a version for reproducible projects.
- **Figma, UI Skills, Hugging Face**: remote HTTP. Authorize only the capabilities you need; the Hugging Face settings page can enable Jobs and sandboxes.
- **shadcn**: stdio via `npx shadcn@latest mcp`. It needs a valid `components.json` in the target project before installs.
- **Context7**: an optional API key improves limits. Put the key in the environment, never in a committed file.
- **Awwwards**: check the rights notes in [rights and redistribution](docs/rights-and-redistribution.md) before reusing captured material.
- **Lazyweb**: read the installer before running it; the hosted route needs its own sign-in.
- **Observer**: the example uses a placeholder path; replace it with your clone's absolute path in your own config.

## Subagents and other clients

The ten `fc-*` agents are Claude Code subagent definitions. Only the main session spawns agents; the orchestration contract is in the skill reference `agent-roster.md`. OpenCode and other clients use different agent formats; this repository does not convert them, and no OpenCode agent format has been verified here.

## Boundaries

- Optional providers may require accounts, quotas, or paid access. Check the current terms and cost before using them; free-first guidance is not a guarantee of free availability.
- The observer can start a model-backed run that consumes provider quota and can modify files in its chosen project directory. It is not a filesystem sandbox. Review the task and changes.
- Reference screenshots, third-party skills and agents, source playbooks, generated assets, and client materials do not acquire redistribution rights by being mentioned here. See [rights and redistribution](docs/rights-and-redistribution.md).
- Do not copy private project checkouts, screenshots, or raw data into this repository or distribute them as examples.
