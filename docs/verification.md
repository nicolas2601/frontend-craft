# Verification

Report observed evidence, not a claim that following this skill guarantees a polished result. A successful test command proves only the assertions exercised by that test. A generated asset, model response, package install, or skill-discovery result is not a rendered UI review.

## Repository checks

From the repository root:

```sh
npm run doctor
npm run check
npm test
```

`doctor` reports executable availability only and is read-only; it cannot establish MCP connectivity, permissions, quotas, or successful use. `check` validates the bundled skill and syntax-checks observer JavaScript. `test` runs the observer and Python unit suites; install the observer dependencies first with `npm ci --prefix tools/opencode-observer`. Optional `npm run pack:skill` validates and writes `dist/frontend-craft.skill`; it is packaging, not design verification.

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

The Python unit suite uses mocked responses; it does not contact Hugging Face or establish live availability, quota, or output rights. The observer unit suite does not call a model. Run checks from a trusted checkout and state their actual exit codes. Do not copy verification output containing sensitive runtime data into a public issue or commit.

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
