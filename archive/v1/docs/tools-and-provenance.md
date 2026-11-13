# Tools and provenance

Frontend Craft's core is the bundled skills and their references. Optional tools can supply specific evidence or implementation capability, but do not replace product judgment. The host's current project instructions, privacy rules, package versions, and installed design system take precedence.

The tool inventory with install commands is in the [README](../README.md#tool-inventory). This page explains where each piece of material came from and how strongly each install source was checked.

## Verification labels

Each install source in the README carries one label. A label describes how the **install source** was checked, not whether the tool works on your machine.

- **OFFICIAL-DOC** - the command, URL or schema was read from the vendor's documentation or the project's own repository during the 2026-11-05 pass.
- **REPO** - taken from this repository's existing docs, scripts or tests. It was not re-fetched in that pass, or was observed on the authoring machine. Observations there do not transfer to other machines.
- **SESSION** - provided by the authoring session (for example by an MCP server's own instructions). The source was not verified.
- **UNVERIFIED** - no reliable source was found, or the check was not done in this pass. Do not install from it without checking.

Installing a package, adding a server entry, or getting a successful search result is not the same as verifying the source. Confirm the current version and terms before pinning anything in a project.

## Included material

| Material | Provenance and use | Boundary |
| --- | --- | --- |
| `skills/frontend-craft/` | Adaptation and staged map around the complete Noel Santiago playbook supplied by the user, plus selected public references and skill texts cited in the bundle. | The source playbook has no independent redistribution license identified. See [rights](rights-and-redistribution.md). References are interpretive guidance, not standards or empirical proof. |
| `skills/svg-craft/` | Vendored SVG skill: illustration, diagram, animation, logo, generative and science packs, plus its own tools (`lint`, `render`, `optimize`, `a11y-fix`, `text2path.py`). | Bundled packs carry their own MIT license files. The anatomy kit (about 40 MB) is not bundled. Tool behavior depends on Chrome or Chromium and, for text conversion, fonttools. |
| `agents/frontend-craft/` | Ten `fc-*` subagent definitions written for frontend stages. Their roles are informed by agency-agents roles under the MIT license. | Adaptations, not copies of the upstream files. Attribution, pinned upstream commit and the license text are in [agents/NOTICE.md](../agents/NOTICE.md). Claude Code subagent format only. |
| `tools/opencode-observer/` | Local stdio MCP adapter around the OpenCode v2 CLI/API, implemented in this repository using MCP SDK 1.32.1 and Zod 4.6.7. Its dependency lockfile is included for reproducible installation with `npm ci`. | Not a general-purpose OpenCode client, not a private-reasoning reader, and not a sandbox. The server's command adapter is specific to the OpenCode v2 API. |
| `skills/frontend-craft/scripts/hf_zerogpu_asset.py` | Standard-library helper for one public, anonymous Hugging Face ZeroGPU image route. | Historical live test is evidence only for that route at that time; quotas, uptime, output rights, and API behavior can change. It is not a video pipeline. |
| `skills/frontend-craft/modules/hf-video/` | Optional video-generation workflow notes for provider/model route distinctions. | Native generation, interpolation, capability, and quota differ by provider. Use public synthetic material only unless the data owner and provider terms explicitly allow more. |

The observer's read-only tools summarize rather than return raw prompts or tool inputs/outputs. Trace text is opt-in and bounded; regex redaction is best-effort, not a guarantee that every secret is removed. The server also offers a separate-run tool. That tool forwards the task as supplied, uses an enabled Cline Pass model, can spend quota, and may modify files under existing agent permissions. Its directory validation reduces accidental targeting of sensitive locations but is not OS-level isolation or a sandbox. Do not submit credentials, private client data, or instructions you would not want forwarded to the agent.

## Optional integrations and what was verified

These are integration choices, not required dependencies. Confirm current versions and provider terms before adopting them. The full list with commands is in the [README](../README.md#tool-inventory).

| Integration | Intended use | Provenance/status (2026-11-05 pass unless noted) |
| --- | --- | --- |
| [Claude Code](https://code.claude.com/docs/en/setup) | Host for the subagents, `.mcp.json` servers and skills. | OFFICIAL-DOC: setup, system requirements, and MCP scope docs (`.mcp.json` `mcpServers`, `claude mcp add` syntax) were read. Its subagent docs confirm the directories and recursive scan. |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) | Browser interaction and rendered verification through an MCP client. | OFFICIAL-DOC: repository README read; start command `npx @playwright/mcp@latest`; Node 18+. This package does not bundle the server or a browser. |
| [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Performance traces, Lighthouse, console and network inspection. | OFFICIAL-DOC: README read; current stable Chrome required; usage statistics on by default (`--no-usage-statistics` opts out). |
| [Figma MCP](https://github.com/figma/mcp-server-guide) | Read and write Figma designs from an MCP client. | OFFICIAL-DOC: remote endpoint `https://mcp.figma.com/mcp` (streamable HTTP, remote-only in `server.json`). Plan limits and the exact sign-in prompt were not verified. |
| [UI Skills MCP](https://www.ui-skills.com/mcp) | Retrieve a small number of task-relevant design and interaction guides. | OFFICIAL-DOC: endpoint and tools (`list_skills`, `get_skill`) read. No client snippet or authentication detail on the page. Guides are third-party interpretations. |
| [shadcn MCP](https://ui.shadcn.com/docs/mcp) | Discover and install registry items into a project. | OFFICIAL-DOC: setup command `pnpm dlx shadcn@latest mcp init --client claude` and generic `npx shadcn@latest mcp` read. Node version not stated on the page. |
| [Hugging Face MCP](https://huggingface.co/docs/hub/en/hf-mcp-server) | Hub discovery, documentation search, Spaces, and optional Jobs/sandboxes. | OFFICIAL-DOC: endpoint `https://huggingface.co/mcp` and the generated-config workflow read. The package's image helper uses its own anonymous HTTP path, not an MCP credential. |
| [hf CLI](https://huggingface.co/docs/huggingface_hub/guides/cli) | Hub browsing and downloads from a terminal. | OFFICIAL-DOC: `pip install -U "huggingface_hub"` and standalone installer read. Login is required for private, gated or write actions. |
| [OpenCode](https://opencode.ai/v2/docs) + this observer | Inspect bounded run evidence; optionally start a separate test. | OFFICIAL-DOC: v2 install commands (anomalyco/opencode README) and MCP schema (`mcp.servers`, `type` `local`/`remote`) read. The observer expects v2, not a guessed v1 invocation. |
| [21st.dev CLI](https://help.21st.dev/cli) | Optional registry and component discovery. | OFFICIAL-DOC: package `@21st-dev/cli`, binary `21st`, login and quota notes read. A read-only search is not proof a component was selected or adopted. Magic MCP setup is not documented. |
| [HeroUI CLI](https://github.com/heroui-inc/heroui-cli) | Optional HeroUI component reference and package workflow. | OFFICIAL-DOC: README read; Node.js 22.22+ stated. pnpm 12+ is taken from REPO notes, not from this README. The package does not require HeroUI or force its primitives into an incompatible project. |
| [Context7](https://github.com/upstash/context7) | Retrieve current library and framework documentation. | OFFICIAL-DOC: README read (`npx ctx7 setup`; MCP endpoint `https://mcp.context7.com/mcp`; API key recommended, not required). The `ctx7 library` lookup ran successfully. |
| [Awwwards MCP](https://github.com/INSANE0777/Awwwards-mcp) | Design-reference discovery and page analysis. | OFFICIAL-DOC: third-party MIT project's README read (`npx -y awwwards-mcp`; Node 22.13+). Not verified as an Awwwards product. Daily listings use scraping of public pages; annual tools use an official public JSON:API. Check the rights notes before reuse. |
| [Lazyweb MCP](https://www.lazyweb.com/mcp-install) | Screenshot, flow and experiment research. | UNVERIFIED for the hosted route, which was not fetched directly. The install page was read: its curl command embeds agent-generated arguments and pipes to bash. Not recommended without reading the installer first. |
| Design screenshots / reference catalogs (`design-screenshots` MCP) | Find visual references, then inspect sources and adapt a specific mechanism. | SESSION: source and capture rights were not established. Prefer public references with clear provenance; do not redistribute captures without permission. |
| Google Flow MCP (`google-flow`) | Image and video generation in a user-local setup. | SESSION: user-local; source not verified. Provider terms and quotas must be checked separately. |
| Pinterest | Reference browsing only. | Policy, not a tool source: no public API is used. Use your own logged-in browser session; no login bypass or scraping. See [inspiration research](../skills/frontend-craft/references/inspiration-research.md). |
| `ffmpeg` / `ffprobe` | Optional video inspection or encoding where the task needs it. | REPO: installation doc commands; the FFmpeg download page was not re-fetched in this pass. |

The public installation paths above need not match the connectors available in the original authoring session. No blanket integration availability is promised. The selected component or asset must be inspected in the rendered product; a package import or registry result alone is not proof of use or quality.

## Supervised evaluation, not a benchmark claim

The intended comparison procedure is supervised and bounded: four stages (direction with two distinct full-size visual studies and real references; asset/component proof; desktop/mobile interaction; delivery), five sequential product scenarios, and a fresh session per stage up to four sessions per product. A trial has a shared 1,200-second wall-clock limit including review. These are workflow limits, not a claim that every run has completed or that outputs are comparable across models, harnesses, or products. Acceptance gates withhold acceptance/promotion; they do not sandbox execution, standardize taste, or prove objective visual quality. Read [Verification](verification.md) for evidence and reporting boundaries.
