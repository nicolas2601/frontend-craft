# Changelog

## 2.4.0 - 2026-11-14

Hero loops: a real subject in real light gets a short, seamless, muted video in the first screen, made for free.

### Why
The premium sites studied for 2.3 (dinamosites and the award sites it collects) open on a living object, and
for a place, a dish or a product that object is footage, not a shader. Generated video was only reachable
through paid tools, and an autoplaying clip brings its own failures: it keeps playing under reduced motion,
cannot be paused, or shows a blank box before it loads.

### Added
- `references/hero-video.md`: three free routes (a still from Z-Image Turbo animated with Wan 2.2
  first-last-frame over the Hugging Face MCP server; coded films with HyperFrames or bang-motion; the client's
  own or free-licence footage), what to install, the markup and the rules. Paid generators only on request.
- `scripts/video.mjs`: a clip becomes a 30 fps loop at the page's size (H.264 mp4, VP9 webm, webp poster),
  with a crossfade, pingpong or no seam; `--doctor` lists missing tools. Wan does not return its start frame
  exactly (24 dB between the last and first frame of the verified clip, against about 37 dB between
  neighbours); the crossfade, applied after the frame-rate change, brings the seam to 39 dB.
- Kit `data-loop`: plays a muted video only on screen and in a visible tab, holds on the poster under reduced
  motion and Save-Data, and pairs with a `data-loop-toggle` button whose pause sticks (WCAG 2.2.2).
  `.craft-loop` in `surfaces.css`.
- Check: `video-reduced` and `video-muted` (FAIL), `video-pause` and `video-poster` (WARN). A hero loop that
  played in the first screen stands in for the dealt scene in `deal-scene`.
- `references/motion.md` documents `data-scene` and `data-loop`; `references/checks.md` gains the scene and
  video rows that 2.3 left out.

### Fixed (found watching a GPT build of the hostal loop)
- `video.mjs` printed the markup with bare file names (`hero.webm`), which 404s when the files sit in
  `assets/`; it now prints the path from the project root (from the site root under `public/`).
- `.craft-riso` filtered only `img`, so a hero loop stayed full colour on a riso page; it now covers `video`,
  and the loop's pause button sits above the riso grain. `hero-video.md` says how a loop takes each
  direction's picture treatment.
- Check: `token-undefined` (FAIL) catches a design token read with no fallback and never defined (the model
  wrote `--s-10` and `--s-20` on a scale that has neither, and the spacing silently became 0).

## 2.3.0 - 2026-11-14

Range: multi-page sites, platforms, a live first screen, library components, and a check that fails the AI tells.

### Why
The first 2.2 build (a sourdough bakery) passed every check and still read as machine-made: English copy for a
Colombian audience, slogan-shaped lines, four numbering systems, a tilted round badge, the hero photograph reused,
a still photograph where premium sites carry a living object, and no component from the libraries already
installed (the 21st.dev skill pointed at a reference that no longer existed).

### Added
- Four directions: bento grid, glass layers, riso print, terminal mono. Directions say where they may be dealt
  (`modes`: persuade, operate) and which hero scenes fit them.
- Five set pieces: `word-track`, `word-swap`, `type-zoom`, `word-mask`, `bento-assemble` (14 in all), and
  `kit/surfaces.css` with glass, bento helpers, riso, mono and cross-document page transitions.
- Hero scenes (`data-scene`, `kit/motion/scene.js`): chrome, iridescent, ink and dots in plain WebGL, in the
  dealt colours; paused off screen, a still frame under reduced motion, a poster without WebGL.
- `--kind site --pages /,/menu,...`: two set pieces per page, never the same piece twice; the check runs on every
  page and judges the direction's breaks across the site.
- `--kind app` gets a product-UI direction (no set pieces, HeroUI/shadcn controls, Emil's motion rules).
- `library/components.json`: 43 curated React Bits components generated from the registry by
  `scripts/sync-components.mjs`; every build is dealt one that fits its direction. `references/components.md`
  covers React Bits, HeroUI, shadcn and 21st.dev (search and preview only).
- `--lang`: the check fails a page written or declared in another language (`copy-lang`).
- New rules: `copy-formula`, `slop-numbering`, `slop-repeat-photo`, `slop-stamp`, `site-transitions`,
  `deal-break`, `deal-component`, `deal-scene`. The concept gains `# Breaks` (the element of each break) and
  `# Components`.
- impeccable's detector runs inside the check on every page (telemetry off); its slop rules fail unless the
  direction or the deal asks for them.
- Set pieces, components and scenes used by the last builds are dealt again only when nothing else fits.

### Fixed
- `data-parallax` measured the element with its own shift applied, so it jittered and the check missed it.
- The gate did not pass `concept.md` to the check from the Stop hook.
- CLI tests wrote deal history into the skill folder through a symlink; `history.json` is no longer tracked.

## 2.2.0 - 2026-11-13

Websites get a dealt art direction, scroll set pieces and real photographs, and fail the check for being flat.

### Why
Two models given the same cafe prompt, both routed through `design-taste-frontend` in 2.1, built nearly the same
still page: that engine prints a fixed hero for a place page, deals cafes only light warm palettes and one pool of
photographs, and its checker fails any effect or scroll-linked motion on a place, shop or service page
(docs/evals.md, docs/architecture.md).

### Added
- `library/directions.json`: 12 art directions (night poster, editorial magazine, colour block, cinematic chapters,
  collage, Swiss grid, kinetic type, origin route, brutal, soft pop, gallery rail, split duotone), each with its
  grounds, headline floor, photo treatment, two template breaks and candidate set pieces.
- `start.mjs --risk safe|bold|wild`: how often the direction comes from outside the subject's moods (0%, 40%, 80%);
  a subject matching fewer than three directions still draws from three; the last four directions never repeat.
- `kit/set-pieces.css` and `references/set-pieces.md`: nine scroll scenes on `data-scrub` (iris, type-pass, zoom,
  curtain, fan, letters, develop, tilt, split), finished without JavaScript and under reduced motion.
- The brief: the direction, a `.craft/concept.md` template (Idea, Signature, Rejected), the `photos.mjs` commands
  for licensed photographs, and the two dealt set pieces.
- The check's richness floor on a dealt website: `rich-grounds`, `rich-pictures`, `rich-full-bleed`, `rich-type`,
  `rich-scenes`, `deal-set-piece`, `concept-missing`, `concept-thin`. The report prints photographs, full bleed,
  sections and set pieces found.
- Tests: deal divergence (two independent deals share a direction under 20% of the time), richness rules, and an
  end-to-end page holding all nine set pieces through the check in Chrome.

### Changed
- `frontend-craft` builds every website again; `design-taste-frontend` supplies the photographs and builds only a
  quiet site the user asks for. `start.mjs` no longer refuses website kinds (`--fallback` is gone). The prompt hook,
  the OpenCode agent, README and docs route the same way.
- The check samples scroll-linked motion across the whole page (up to ten pairs) and counts the sections it moves in.

### Removed
- `skills/frontend-craft/craft/`: a stray copy of the kit and a dealt `tokens.css` committed inside the skill.
- `skills/frontend-craft/history.json` from version control (it was still tracked).

## 2.1.0 - 2026-11-13

Websites now build with a bundled engine that has a real visual layer; frontend-craft becomes the router.

### Added
- Bundled skills, unchanged from upstream at pinned commits (`vendor.json`, `THIRD_PARTY_NOTICES.md`):
  `design-taste-frontend` (taste-skill 2.5.1, MIT), `impeccable` (Apache-2.0), fifteen Emil Kowalski skills (MIT),
  `ui-ux-pro-max` (MIT), `ui-animation` (MIT), each with its assets, scripts, references and licence file.
- `scripts/vendor.mjs`: restore, `--update` to upstream HEAD, `--check`; `npm run verify` fails when a bundled
  skill differs by one byte from its pinned commit or lacks its licence.
- `stop-gates.mjs`: one Stop hook that runs both gates (Codex `config.toml` example in docs/installation.md).
- The OpenCode plugin runs the website gate as well as frontend-craft's.

### Changed
- `frontend-craft` routes: websites to `design-taste-frontend` then the `review-animations` and `impeccable`
  finish passes; apps, dashboards and docs to its own run. `start.mjs` refuses a website kind while the engine is
  installed (`--fallback` overrides). The prompt hook and the OpenCode agent route the same way.
- README and docs rewritten around the router.

### Removed
- `examples/roastery` and its screenshots: the page passed the check but was visually flat.
- `skills/frontend-craft/history.json` from version control (deal history is user state).

## 2.0.0 - 2026-11-13

Rebuilt from a reference library into an executable system that weak and strong models can follow.

### Added
- `start.mjs`: deals palette, type pairing, composition and motion from a curated library by kind and mood, with cross-project history; copies the kit, writes `tokens.css` and a direction brief, arms the gate. Flags: `--redeal`, `--pin`, `--brand`, `--kit-only`, `--list`.
- Motion kit: 15 data-attribute effects (enter, words, reveal, mask, scroll-words, scrub, parallax, stack, rail, progress, count, scramble, marquee, magnetic, spotlight) plus `craft.css` tokens and base. No dependencies; any framework.
- `check.mjs`: headless Chrome check at 1440/1280/768/390, reduced motion and JavaScript off; about thirty rules; screenshots.
- `gate.mjs`: Stop hook for Claude Code and Codex, CLI exit codes elsewhere; OpenCode plugin in `integrations/opencode/`.
- Skills `craft-motion`, `craft-review`, `craft-learn`.
- Library: 24 palettes (WCAG AA tested), 24 Google Fonts pairings, 14 compositions, 14 motion signatures.
- Claude Code plugin and marketplace manifests; `agents/openai.yaml` per skill.
- Tests (node:test), structural verifier, pack script and an eval runner that drives a real agent CLI.
- Composition blueprints (`blueprints/`, `kit/layouts.css`): every composition ships a working page skeleton; `start.mjs` copies it and writes it as `index.html` for plain HTML. `npm run test:blueprints` renders all fourteen through the check.
- Claude Code plugin `UserPromptSubmit` hook that routes web-page prompts to the run.
- Checks: hero action inside the first screen (`fold-action-*`), colored italic accent words (`tell-italic-accent`), rendered size of SVG text, unfilled `{{...}}` markers.

### Fixed (found by running real agents)
- Scripts exited silently when called through a symlinked install.
- The deal matched type and palette to the brief but not to each other.
- Motion under-counted (unit-sized values) and sticky navs counted as pinned scenes.
- The OpenCode gate plugin now uses plugin API v2.
- The eval runner passes `PWD` with `cwd`, works on disk instead of tmpfs and requires a followed deal for a pass.

### Changed
- `frontend-craft/SKILL.md` is a 1,200-word run with numeric house rules instead of a 39-file reference set.

### Moved
- v1 skill, its ten subagents, Python tooling and docs to `archive/v1/`.
