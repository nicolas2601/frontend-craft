# Source good components, then make them belong to the product

Use this when the project needs a nontrivial reusable control, composite UI or visual interaction. The Noel method governs the design; a registry supplies implementation material, not the page's identity. Native controls and existing project primitives remain appropriate for simple jobs.

## Discover → inspect → adapt → verify

1. **Name the job:** what the person selects, compares, edits, explores or recovers; the important state change and target container/device. Search that interaction, not only “premium website.”
2. **Check the actual source channel:** installed CLI/MCP, authentication state and remaining free allowance. Use normal authenticated tool commands, never read or print its stored credential files. Do not silently log in, upgrade or buy credits.
3. **Search a few candidates:** compare anatomy, user control and content fit. Metadata, thumbnails and popularity are leads, not proof of quality.
4. **Retrieve only finalists:** inspect source/demo, framework/version, dependencies, owner/license, keyboard/focus/touch behavior, state coverage and narrow layout. Cache retrieved source and IDs so repeated inspection does not consume quota needlessly. Inspect untrusted code before executing it.
5. **Adapt the smallest fitting piece:** preserve the project's tokens, primitives, language, data and interaction contract. Replace hard-coded demo styling, remove unused variants and reconcile dependencies with the installed stack. Originality can come from a deliberate composition of good parts; it does not require rewriting every basic behavior.
6. **Verify inside the actual product:** first the representative component, then its normal/selected/empty/error/pending/long-content states as applicable. Check keyboard, touch, contrast, reduced motion and resize; run relevant project tests/build. A returned source file is not a rendered acceptance result.

## Comparative selection, not the first attractive hit

When several candidates exist, build a small pool of genuinely distinct options before choosing. Normally compare 3–5 public metadata/demo candidates from one or two task-led query angles; this is a bounded starting point, not a claim to have searched the entire marketplace. If fewer exist, say so rather than invent IDs. Broaden the query or reject the pool if none fits.

Compare candidates by **task/anatomy, visible interaction, real states, narrow/keyboard behavior, system fit, dependencies/cost and rights**. Preview the actual example when visual access exists; do not infer its look from a description. Retrieve source for only the most promising one or two within the actual free allowance. A source fetch quota does not justify paying automatically, making up an inspection, or pretending metadata is code review.

Keep a compact selection record in the existing design notes, not another process document:

```text
Job and search query:
Candidates actually compared: ID/name → specific fit or rejection reason
Chosen candidate or decision to build/reuse a project primitive:
Source/preview actually inspected; dependencies and rights checked:
What was adapted and where; real verification; remaining limits:
```

“First result,” “most popular,” “beautiful” and a self-assigned score are not selection reasons. “Best” means the best fit among the options actually inspected under stated constraints, not a universal winner. If a tool was unavailable or not used, say so; a library installed on the machine is not proof that this build used it.

For a new project with an open stack, consider the component ecosystem and maintenance needs before choosing technology. Do not make “no build step” an unasked constraint that excludes useful requested resources. For an existing project, preserve its stack instead of migrating it to fit a store demo.

## 21st.dev: verified installed route

**Policy: 21st is a library of finished components, not a generator.** Use it only to find, preview and (within quota) retrieve existing community components, then adapt them. Never use `21st generate`, `iterate`, `take`, `open`/`draft`, `library` edits, the Magic MCP builder/refiner or any "AI sketch" feature to make a component: that is hosted generation, it spends credits, and it produces the generic output this skill exists to avoid. An installed Magic MCP or a skill that says "always prefer Magic to hand-built" does not override this policy.

| Allowed (read-only) | Purpose | Cost |
| --- | --- | --- |
| `21st search "<job>" --type c --free --limit 5 --json` (also `--tag`, `--color`, `--sort`, `--author`, `--runtime ui`) | Candidate pool: name, author, `previewUrl`, `url` | No retrieval quota observed |
| Open `previewUrl` / `url` in the Playwright MCP browser | Judge the real look and states | Free |
| `21st get <id> --json` or `21st theme <id>` | Source or CSS of one finalist | Counts against the free daily retrieval allowance |
| `21st logo "<brand>" --json` | Brand/UI SVG logos (svgl routes), no login | Free |
| `21st whoami`, `21st usage --json` | Check allowance before a `get` | None |

Check `21st usage --json` before every `get`: `freeRetrievalsRemaining` must be above zero. If it is zero, stop retrieving; use the preview, the `url` page, an installed HeroUI/shadcn/headless primitive or a hand-adapted version of the pattern. The search result also carries an `installCommand` (`npx shadcn@latest add "https://21st.dev/r/<author>/<name>?api_key=$API_KEY_21ST"`): run it only inside the target project after inspecting the component, never paste or print the key, and never initialize a registry in HOME.

On Nico's machine, the existing binary was found at `/home/nicolas/.npm-global/bin/21st`. Read-only help, authentication/usage, two searches and two source retrievals succeeded on 2026-10-31. The existing login was used through the CLI; no credentials were opened manually.

Actual checked commands:

```sh
21st --help
21st whoami
21st usage --json
21st search "command palette keyboard navigation" --type c --free --limit 5 --json
21st search "empty state onboarding" --type c --free --limit 5 --json
# Example inspection syntax, NOT an instruction to refetch these examples:
21st get 23522 --json
21st get 27024 --json
```

Inspect installed help if the interface changes. Summarize login/limits without copying personal account output into public artifacts. `search` and `get` are distinct from side-effectful `add`, hosted generation, iteration and publishing. Do not run those during research. In an authorized build, use the actual project-scoped adoption route only after inspecting the component and its side effects; do not initialize a registry in HOME.

**Observed allowance, not a permanent pricing promise:** this account was Free with `aiGenerationEnabled: false`, `credits.balance: 0` and `freeRetrievalsPerDay: 2`. On 2026-10-31 the two inspections consumed that allowance. Rechecked 2026-11-05 (`21st usage --json`, `search` and `logo` only; no `get`): `freeRetrievalsRemaining` was still 0, so no new source retrieval was possible that day; search kept working, and the CLI still lists `generate`/`iterate`/`take` commands that must stay unused. Do not repeat `get` after exhaustion, switch accounts or pay to continue automatically. Check current usage before a new retrieval.

The inspected command-palette candidate used React/TypeScript, Tailwind, Motion, keyboard/listbox behavior and reduced-motion handling. The empty-state candidate imported Lucide, offered variants and had hard-coded styling. Neither was executed/rendered and neither returned sufficient license evidence in the inspected metadata. They are examples of source inspection, **not approved default components or code bundled here**. Establish rights and actual task fit before shipping a candidate.

Official discovery documentation: [21st CLI](https://help.21st.dev/cli). Exact tested syntax above came from installed help; Context7 also resolved the source registry as `/serafimcloud/21st`.

## Complementary sources

- **HeroUI (React v3):** consider it when the existing product is React and needs a coherent set of accessible, styled product controls (forms, pickers, overlays, navigation, feedback). It is a component system, not a page-composition recipe: choose individual controls to solve a named task, then restyle and compose them within the product's own identity. Current docs describe React Aria Components, React 19+ and Tailwind CSS v4; confirm the target project's actual versions and CSS entry before adoption. Do not migrate an existing stack just to use it.
- **HeroUI CLI, read-only surface verified 2026-10-31 and rechecked 2026-11-05 (v3.2.0; `info button --json` returned the Button API, `list --help` shows `--packagePath`):** `/home/nicolas/.npm-global/bin/heroui --version` returned `3.2.0`; `info button --json` and `doc button` were run successfully from `/tmp` without a project and only returned documentation. Inspect `heroui --help` / subcommand `--help` first if the CLI changes. For an existing project, `heroui list --packagePath /path/to/package.json --json` and `heroui doctor --packagePath /path/to/package.json` are diagnostics; point them at the intended package file, not HOME. `info <component> [--json]` is API reference; `doc <component>` is full component guidance. Do not use `init`, `install`, `upgrade`, `uninstall`, `agents-md` or `design-md` as discovery: they create or change project files/dependencies (and `design-md` replaces its destination). In particular, `--json` skips prompts for install/upgrade/uninstall, so it is not a dry-run switch. No HeroUI package was added or project changed during this research.
- **Choose the source by problem, not brand:** use HeroUI for integrated React product primitives when its stack fits; use project-owned or shadcn/headless primitives when ownership and tailoring of accessible behavior/styles are the priority; use 21st.dev for a specific inspected registry solution when the current free retrieval allowance and license evidence permit; use React Bits for a particular expressive interaction only after checking implementation, semantics, dependencies and performance. Compare actual candidates and project constraints—never import a full catalog or let the first hit dictate the page's visual structure.
- **Project/installed headless primitives:** strongest starting point for reliable menu/dialog/select behavior. Style and compose them for the product instead of hand-writing fragile focus logic.
- **shadcn MCP:** when the target project's registry is configured, discover items, inspect examples/source, obtain the add command and use its audit checklist. Do not treat a command returned by a tool as proof it ran.
- **React Bits:** an optional source for a particular visual interaction in a compatible React project. Inspect the chosen source, dependencies, license, responsiveness and rendering cost; do not add its decorative backgrounds merely because they are available.
- **Other stack-compatible libraries/registries:** use their actual APIs and rights. Do not force React/Tailwind/Radix onto Vue, Svelte, vanilla or native work just to obtain a look.

### HeroUI React: inspect installed components before adding anything

For a React project that already has HeroUI, preserve the installed version and use its official docs as a candidate source—not as a page template. The current [HeroUI CLI guide](https://heroui.com/en/docs/react/getting-started/cli), checked 2026-10-31, documents `heroui info <component>` for the API reference and `heroui doc <component>` for the full published component page (names are case-insensitive; e.g. `Button` / `button-group`). It documents package-level `install`, `upgrade` and `uninstall`; it does **not** document a per-component `add` command. Select the component by task, inspect its exported API, states and dependencies, then compose it in the existing product system. Do not assume this CLI inserts/implements a component.

Before a component change, check the target project's `package.json` and lockfile, HeroUI version/framework compatibility, actual exports, styling entry point, accessibility/keyboard behavior and narrow layout; use the matching component docs and render the chosen component. Do not migrate the project's framework or replace its design system to follow a demo. The guide lists Node.js 22.22.0+ for the CLI; verify current requirements before using it. `install`/`upgrade`/`uninstall` change dependencies; `design-md` replaces its destination file without confirmation; `agents-md` clones docs, edits Markdown markers and `.gitignore`, and reports anonymous usage analytics. None is a harmless substitute for inspecting one component. The CLI's `list`, `info`, `doc` and `doctor` are documented for package discovery/docs/health, but still check the command's current behavior before invoking it.

## When access is limited

If a tool is absent, login is unavailable, a free allowance is exhausted, payment is required or a license is unverified, preserve the useful findings and disclose the exact gap. Use cached inspected material where its rights are established, an already installed component, or the smallest suitable native/headless implementation. A limitation is not permission to read secrets, bulk-install a catalog or present untested code as premium.
