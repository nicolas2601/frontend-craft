# Verification

Report observed evidence, not a claim that following this skill guarantees a polished result. A successful test command proves only the assertions exercised by that test. A generated asset, model response, package install, agent listing, or skill-discovery result is not a rendered UI review.

## Repository checks

From the repository root:

```sh
npm run doctor
npm run check
npm test
```

- `npm run doctor` reports executable availability only and is read-only. It cannot establish MCP connectivity, permissions, quotas, or successful use.
- `npm run check` runs three things in order: `scripts/verify.py` (skill structure, links and fixture), `scripts/verify_agents.py` (agents, below), and `node --check` on the observer's JavaScript files.
- `npm test` runs the observer unit suite, the repository's `tests/` suite, and the skill's own `skills/frontend-craft/tests/` suite. Install the observer dependencies first with `npm ci --prefix tools/opencode-observer`.
- `npm run pack:skill` validates and writes `dist/frontend-craft.skill`. It is packaging, not design verification.

Run checks from a trusted checkout and state their actual exit codes. Do not copy verification output containing sensitive runtime data into a public issue or commit.

## Agent definition checks

`python -I -B scripts/verify_agents.py` runs as part of `npm run check`. It validates `agents/frontend-craft/`:

- exactly the ten expected `fc-*.md` files, with no extra files;
- each file has frontmatter, a `name` equal to its file name, and a `description`;
- no emoji in the definitions;
- each definition states the STATUS/EVIDENCE return contract;
- read-only reviewer agents do not hold write tools;
- the skill's `agent-roster.md` names all ten agents;
- every agent that holds `mcp__playwright__*` denies `browser_run_code_unsafe` and `browser_file_upload`;
- `agents/NOTICE.md` carries the MIT notice and the pinned upstream commit.

These checks prove the files are well formed. They do not prove that a client loaded them, that the model followed them, or that their output is correct. Confirm discovery in your client's own listing, then exercise one agent on a bounded task.

## svg-craft tools

The svg-craft tools in `skills/svg-craft/tools/` are not wired into a root npm script. After `npm ci` in that directory, run each tool as the vendored skill documents (`SKILL.md` and `GOTCHAS.md`). This file does not restate their arguments. Rendering needs `CHROME_PATH`. Treat lint, render, optimize and a11y-fix output as evidence about the SVG file, not as a judgment of its artistic quality.

## Local automated checks

Run the observer tests in its package directory:

```sh
cd tools/opencode-observer
npm test
```

Run the bundled image-helper tests from the repository root:

```sh
python -I -B -m unittest discover -s skills/frontend-craft/tests -v
```

The Python unit suite uses mocked responses; it does not contact Hugging Face or establish live availability, quota, or output rights. The observer unit suite does not call a model.

## Optional live observer smoke test

`node tools/opencode-observer/test/live-smoke.mjs` checks MCP wiring and read-only OpenCode status/model/session behavior; it writes a local `verification.json` report. The additional `--run-test` flag starts one small Cline Pass inference in a fresh temporary directory and waits for its bounded connectivity response; it can consume quota and writes `verification-live.json`. Inspect current provider terms, credentials, model availability, and the script before opting in. Ordinary `npm test` does not invoke this inference.

The live smoke test does not implement a design task or verify aesthetics. Its expected model and effort are fixture-specific and can become stale. If availability differs, report the result as blocked/inconclusive rather than silently changing providers, paying, or broadening access.

## Reviewing a frontend result

For work using the skill, record at least:

1. The brief and material project constraints, keeping the user's brief unchanged in any evaluation manifest.
2. The chosen visual direction and the concrete references or artifacts used to justify it.
3. The actual project checks run and their exit status.
4. Rendered evidence at relevant desktop and mobile dimensions, plus interaction states reached (keyboard, touch, focus, error/empty/loading where applicable).
5. What remains untested, inaccessible, synthetic, provider-dependent, or uncertain.

Inspect the implemented page in its real project and browser/device context. A static screenshot does not verify keyboard operation, state changes, responsive behavior, performance, or screen-reader semantics. A single browser viewport does not establish device coverage. Do not claim accessibility conformance from a checklist alone.

For supervised trials, `node tools/opencode-observer/supervisor-cli.mjs` provides positional `init`, `run`, `status`, and `review` commands. Use a state file outside the existing trial workspace. Each producer works in its phase subdirectory; later sessions receive prior approved artifacts and reviewer notes as read-only handoffs. The process may start a Cline Pass model and write files under existing permissions; it is not a sandbox. Only `awaiting_review` is reviewable. Failed, interrupted, or uncertain outcomes are not approval states; do not retry or promote them automatically. Each review needs actual human inspection of the phase's files. The CLI validates artifact paths and records hashes/notes/evidence, but it does not render or inspect pixels and cannot validate whether evidence text is true. A JSON `approve` value is not an aesthetic certificate. Include review time in the shared 1,200-second budget. Each run requests shutdown; if the session stop cannot be confirmed, the global lock is retained fail-closed and should not be deleted to force a retry. Acceptance gates constrain evaluation decisions, not agent filesystem permissions. See [Installation](installation.md) for invocation syntax and [Tools and provenance](tools-and-provenance.md) for the procedure's limits.

## Checks not yet listed here

Further checks may be added to the repository. A command that is not listed on this page or in `package.json` is not available; do not assume it exists.
