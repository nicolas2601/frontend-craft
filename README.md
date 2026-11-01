# Frontend Craft

Frontend Craft is a portable, staged design-and-implementation skill for turning a short product brief into a distinctive, working frontend. It combines a user-supplied design playbook with practical guidance on visual direction, component systems, interaction, mobile behavior, assets and evidence-based review.

It is guidance, not an autonomous benchmark or an aesthetic-quality certificate. A skill being installed does not mean a model has loaded it, tools are available, a design has been rendered, or a result has passed review. The brief and the host project's constraints remain authoritative.

## What is included

- `skills/frontend-craft/` — the complete skill and its staged references. Install the whole directory; do not copy only `SKILL.md`.
- `tools/opencode-observer/` — an optional local MCP server for inspecting bounded OpenCode session activity and, when explicitly invoked, starting a separate build-agent test.
- `docs/` — portable installation, tool provenance, verification, and rights guidance.
- `examples/` — credential-free configuration fragments.

The core skill can be used without the optional observer or any particular UI library, model, registry, or asset provider. See [Installation](docs/installation.md) and [Tools and provenance](docs/tools-and-provenance.md).

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

Install observer dependencies once with `npm ci --prefix tools/opencode-observer` before `npm test`. The doctor is a read-only executable inventory; check results do not prove MCP connectivity, permission, quota, or successful use. `pack:skill` writes the optional package artifact. The separate live smoke test can make a model inference and is deliberately opt-in; see [Verification](docs/verification.md). Do not run tests from an untrusted working directory.

## Boundaries

- Optional providers may require accounts, quotas, or paid access. Check the current terms and cost before using them; free-first guidance is not a guarantee of free availability.
- The observer can start a model-backed run that consumes the configured provider quota and can modify files in its chosen project directory. It is not a filesystem sandbox. Review the task and changes.
- Reference screenshots, third-party skills, source playbooks, generated assets, and client materials do not acquire redistribution rights by being mentioned here. See [Rights and redistribution](docs/rights-and-redistribution.md).
- Do not copy private project checkouts, screenshots, or raw data into this repository or distribute them as examples.
