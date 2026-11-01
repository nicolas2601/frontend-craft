# Tools and provenance

Frontend Craft's core is the bundled skill and its references. Optional tools can supply specific evidence or implementation capability, but do not replace product judgment. The host's current project instructions, privacy rules, package versions, and installed design system take precedence.

## Included material

| Material | Provenance and use | Boundary |
| --- | --- | --- |
| `skills/frontend-craft/` | Adaptation and staged map around the complete Noel Santiago playbook supplied by the user, plus selected public references and skill texts cited in the bundle. | The source playbook has no independent redistribution license identified. See [rights](rights-and-redistribution.md). References are interpretive guidance, not standards or empirical proof. |
| `tools/opencode-observer/` | Local stdio MCP adapter around the OpenCode v2 CLI/API, implemented in this repository using MCP SDK 1.32.1 and Zod 4.6.7. Its dependency lockfile is included for reproducible installation with `npm ci`. | Not a general-purpose OpenCode client, not a private-reasoning reader, and not a sandbox. The server's command adapter is specific to the OpenCode v2 API. |
| `skills/frontend-craft/scripts/hf_zerogpu_asset.py` | Standard-library helper for one public, anonymous Hugging Face ZeroGPU image route. | Historical live test is evidence only for that route at that time; quotas, uptime, output rights, and API behavior can change. It is not a video pipeline. |
| `skills/frontend-craft/modules/hf-video/` | Optional video-generation workflow notes for provider/model route distinctions. | Native generation, interpolation, capability, and quota differ by provider. Use public synthetic material only unless the data owner and provider terms explicitly allow more. |

The observer's read-only tools summarize rather than return raw prompts or tool inputs/outputs. Trace text is opt-in and bounded; regex redaction is best-effort, not a guarantee that every secret is removed. The server also offers a separate-run tool. That tool forwards the task as supplied, uses an enabled Cline Pass model, can spend quota, and may modify files under existing agent permissions. Its directory validation reduces accidental targeting of sensitive locations but is not OS-level isolation or a sandbox. Do not submit credentials, private client data, or instructions you would not want forwarded to the agent.

## Optional integrations and what was verified

These are integration choices, not required dependencies. Confirm current versions and provider terms before adopting them.

| Integration | Intended use | Provenance/status |
| --- | --- | --- |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) | Browser interaction and rendered verification through an MCP client. | Upstream repository and current documentation were consulted. This package does not bundle the server or a browser. |
| [UI Skills MCP](https://www.ui-skills.com/mcp) | Retrieve a small number of task-relevant design/interaction guides. | Public MCP endpoint documented by UI Skills; not every client or session has it configured. Guides are third-party interpretations. |
| [Hugging Face MCP](https://huggingface.co/mcp) | Hub discovery and eligible Spaces tasks. | Official Hub documentation was consulted; client setup and authentication differ. The package's image helper uses its own anonymous HTTP path, not an MCP credential. |
| [OpenCode](https://opencode.ai/docs/) + this observer | Inspect bounded run evidence; optionally start a separate test. | OpenCode v2.1.2 MCP config documentation and upstream CLI installation source were checked. Its `mcp.servers` format is distinct from Claude Code's `mcpServers` format. The observer expects v2, not a guessed v1 invocation. |
| [Claude Code MCP](https://code.claude.com/docs/en/mcp) | Register the observer as a local stdio MCP server in `.mcp.json`. | The current official `mcpServers` schema was consulted on 2026-11-01. Do not assume this config shape applies to other clients. |
| [21st.dev CLI](https://help.21st.dev/cli) | Optional registry/component discovery. | Official CLI docs and metadata checked for version 1.18.0, MIT, Node.js 18+. A read-only search is not proof a component was selected or adopted; current source-retrieval quota was limited. |
| [HeroUI CLI](https://github.com/heroui-inc/heroui-cli) | Optional HeroUI registry/component workflow. | Metadata checked for version 3.2.0, MIT, Node.js 22.22+ and pnpm 12+. This package does not require HeroUI or force its primitives into an incompatible project. |
| [Context7 CLI](https://github.com/upstash/context7) | Retrieve current library/framework documentation. | Metadata checked for version 0.4.5, MIT, Node.js 18+. Use for actual docs lookup, not as proof of implementation. |
| Design screenshots / reference catalogs | Find visual references, then inspect sources and adapt a specific mechanism. | Provider-managed source and redistribution rights were not independently established for the design-screenshots connector. Prefer public references with clear provenance; do not redistribute captures without permission. |
| `ffmpeg` / `ffprobe` | Optional video inspection or encoding where the task actually needs it. | Present in the original working environment; no portable version or installation is bundled. |

The public installation paths above need not match the connectors available in the original authoring session. No blanket integration availability is promised. The selected component or asset must be inspected in the rendered product; a package import or registry result alone is not proof of use or quality.

## Supervised evaluation, not a benchmark claim

The intended comparison procedure is supervised and bounded: four stages (direction with two distinct full-size visual studies and real references; asset/component proof; desktop/mobile interaction; delivery), five sequential product scenarios, and a fresh session per stage up to four sessions per product. A trial has a shared 1,200-second wall-clock limit including review. These are workflow limits, not a claim that every run has completed or that outputs are comparable across models, harnesses, or products. Acceptance gates withhold acceptance/promotion; they do not sandbox execution, standardize taste, or prove objective visual quality. Read [Verification](verification.md) for evidence and reporting boundaries.
