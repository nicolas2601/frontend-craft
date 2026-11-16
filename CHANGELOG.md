# Changelog

## 4.0.1 - 2026-11-16

Fixes from looking at the 4.0 test build after release.

- `journey`: both lines stay at full ink to the end of the pass. The stage leaves with its section, so the fade only
  left an empty band where the second line had been as the next section came in.
- `map`: the pin is a picture (`role="img"`, named after the place); MapLibre had made it a "button" that did
  nothing when pressed. The zoom buttons are 44 px.
- `carousel`: a disabled arrow is shown with a muted colour and a dashed border instead of opacity alone.
- Nav links are at least 44 px wide ("Visita" was 41 on a phone).

## 4.0.0 - 2026-11-16

The studio run. The model is the design lead: nothing is dealt, the client's own material comes first, every section
is planned before it is built and looked at in motion after, and the check refuses only what is broken.

### Why
A DeepSeek build of a café (Agostino) passed the 3.1 check and still looked half done: a black curtain opening on
three words, an empty stage, a huge "10" beside a word-lit paragraph, a hand-drawn street map, a lopsided product
row, a text "Pause" button under every animation, and the client's TikTok videos never downloaded. Forensics of the
session showed the causes in the skill: five dealt decisions (set pieces, scene, signature, component) that the check
then required whether they fitted or not, quantity rules (two set pieces, scroll scenes in two sections), a check
that read the concept the agent itself wrote (the agent edited it three times to pass), a WCAG rule that pushed a
text button under every loop, and no step for the client's videos. The most installed design skills (Anthropic's
frontend-design, Hallmark, MotionSites, impeccable) work from written judgment, a plan reviewed against the brief,
one orchestrated moment and self-critique on screenshots.

### Changed (breaking)
- `start.mjs` deals nothing by default: it copies the kit and a starter page, writes the studio brief
  (`.craft/brief.md`: the process with every command) and the plan template (`.craft/plan.md`: brief, references,
  direction, storyboard, review), and arms the gate. The dealt run stays behind `--composition`, `--direction`,
  `--deal-direction`, `--deal-look`, `--pin`, `--seed` and `--redeal`.
- SKILL.md rewritten as the studio run (1430 words, from 1879): the bar, the calibration list of generated-page
  defaults, ten steps, short craft rules.
- The pause control for loops and bands is a small round icon in the corner of what it controls (as Apple does), its
  label for screen readers only; never a text button under the animation.
- `parts-unsearched` fails only when no part was searched at all; one or two searches warn.

### Added
- Section recipes in the kit (`kit/motion/recipes.js`, `product3d.js`, `map.js`, `kit/recipes.css`,
  `references/recipes.md`): `dive` (fly into the hero picture), `journey` (a pinned horizontal story), `carousel`,
  `sequence` (the client's clip scrubbed by scroll), `product3d` (the packaged product in 3D from its artwork,
  three.js), `map` (a real map: OpenFreeMap tiles through MapLibre 5, free and keyless), `spec` (facts as a list).
- `scripts/media.mjs`: `social` (the client's own TikTok, Instagram, YouTube videos with yt-dlp), `frames` (webp
  frames and a manifest for the sequence recipe), `sheet` (twelve frames over a clip to look at), `stock` (Pexels and
  Pixabay with free keys, credits written).
- `scripts/look.mjs`: every section photographed as it enters, in its middle and as it leaves (four points of a
  pinned pass), at 1440 and 390, laid out on contact sheets.
- `kit/starter.html`: a wired page shell (head, kit stylesheets, nav, main, footer, init).
- Check rules: `blank-screen` (FAIL: a screen one flat colour over 96.5%, measured from real screenshots down the
  page), `sparse-screen` and `half-empty` (WARN), `svg-boxes` (FAIL: a big drawing made only of boxes, lines and
  labels), `plan-missing` (FAIL: a studio build without a storyboard).
- References: `studio.md` (the bar, the calibration list, moves by trade, the review questions, Figma), `recipes.md`,
  `media.md` (routes, licences, the rules that keep media expensive).
- `setup.mjs` reports yt-dlp and the Awwwards and Figma MCP servers, and installs them where it can.
- `docs/installation.md`: a copy-paste prompt that makes any agent install and verify everything.

### Fixed
- `design.mjs` derived a muted text colour that failed contrast on the surface ground; it now holds 4.5:1 on both.
- `design.mjs` warns on text faces impeccable's detector calls overused (Inter, Geist, Instrument Sans...).
- The pinned statement in the blueprints is set large enough not to leave an empty stage.
- The critic brief reads the plan and the look sheets and judges against the studio bar.

## 3.1.0 - 2026-11-16

The libraries are searched, not mentioned. Every part of a page is looked up in 21st.dev, cult-ui and React Bits before
it is hand-built, the check holds it, and MotionSites joins as a library of reference designs.

### Why
The DeepSeek build used only the React Bits piece the brief forced; 21st.dev, cult-ui and shadcn were never searched
because no step printed a command and no check asked. Four parallel reviews of the process (integration reach, a
literal dry run, the DeepSeek build, consistency) confirmed that integrations which are only mentioned get skipped.

### Added
- `scripts/components.mjs`: `search "<job>" --section <id>` asks 21st.dev (CLI), cult-ui (registry) and React Bits
  (curated) at once, with previews, decoration marked and listed last; `pick <source>:<id>` saves the source to
  `.craft/parts/` (keys scrubbed) and logs the choice; `show`.
- Check rules: `parts-unsearched` (FAIL until three parts were searched), `parts-none-taken` (WARN),
  `deal-component-unused` (FAIL when the dealt component appears in none of the project's source files),
  `tool-missing` (WARN when impeccable or Hallmark is absent).
- MotionSites (Motionsites-AI/claude-skill) as a library: `setup.mjs --install` clones it at a pinned commit; the brief
  names the closest of its 40 designs, its technique recipes and, off photo-led subjects, its media shelf;
  `references/motionsites.md` says what to take and what the check refuses. Its examples and media stay
  (c) MotionSites and are not in this repository.
- `setup.mjs` reports and installs the 21st.dev CLI and the MotionSites library.

### Changed
- SKILL.md: the parts search in step 6, the MotionSites designs in step 4, a precedence that names the libraries read
  as candidates, no eyebrows or tracked caps at all (Hallmark fails them), never violet. The kit wiring is shorter
  (the blueprint is wired).
- The 15 blueprints load all five kit stylesheets; their font comment points at `design.mjs set`.
- The concept template adds `# Look`, and its `# Breaks` example no longer shows selectors a model copies.
- `start.mjs --palette-from` no longer writes over a look the model chose; it points at `design.mjs accents`.
- `design.mjs set` warns on Instrument Serif as the display face (11 of MotionSites' 40 designs use it).
- `check.json` says `detector: ran` or `off` instead of null; `gate.mjs --help` prints its usage.

## 3.0.0 - 2026-11-15

The model designs. Structure, art direction, colours and faces are the model's choices, made with candidates in front
of it and checked by scripts; Hallmark joins the bundle.

### Why
The DeepSeek build of the Barichara hostel showed that a random deal imposes decisions a designer would not take (a
bento grid for a guesthouse, a wildcard palette), and that the model followed them without judgment. The owner wants
sober pages (white, black, one colour with life) and a model that decides with the skills, not a dealer.

### Changed (breaking)
- `start.mjs` prints the compositions and art directions that fit the subject and starts only with `--composition`
  and `--direction`. Set pieces, motion and the component are still dealt from the chosen direction.
  `--deal-look --deal-direction` keep the old behaviour for tests and quick drafts.
- Palette and type are no longer dealt. `tokens.css` starts on neutral stand-ins and the check fails
  (`look-pending`) until the model runs `design.mjs set`.

### Added
- `scripts/design.mjs`: `set` checks and writes the model's look (contrast, the sober method: a white or near-white
  ground, a near-black ink, one accent with chroma; refuses cream grounds, brown or navy ink, violet, neon, warns on
  framework-default accents and the headline faces every generated page uses; fonts checked against Google Fonts);
  `theme <slug>` takes a Hallmark theme whole; `accents <photo>` lists the colours in the subject's picture.
- `references/color-type.md`: how to choose the palette, how much of each colour, how to pair faces, how to read
  ui-ux-pro-max as candidates (its design system proposed Liquid Glass and navy for a colonial guesthouse).
- Hallmark (nutlope/hallmark, MIT) bundled: its sloplint runs inside the check on the page's own files (universal
  tells fail, its house conventions and the kit's files warn), its fifty themes are a look the model may take, its
  755-photo library is offered in the brief, its hero-first and finish reviews join the run, and `/hallmark` routes
  to its own run.
- The kit: `overflow-x: clip` on html and body, disabled states, labels in sentence case.
- README rewritten as a professional install and use guide, with the design flow and prompts to start with.

## 2.6.0 - 2026-11-15

Hero loops that are long and visibly alive, the three integrations the 2.5 research recommended, and OpenCode
set up like Claude Code.

### Why
The 2.4 hero loop was 2.6 s with almost no motion: the same still as first and last frame makes Wan return to the
start, so it barely moves. The free Hugging Face quota also ran out after one still and one edit attempt, so a route
that needs several GPU runs cannot be the only one.

### Fixed (from the DeepSeek build of the Barichara hostel)
The page passed the check and still read as a template: the deal gave a hostel the `bento-dominant` composition, so
the first screen was a headline over a grid with the patio below the fold and a tall tile holding one number; every
blueprint put `data-magnetic` on its main button and ended in a one-line footer placeholder; rail panels, chapter
cards and bento tiles were big fixed boxes with `align-content: space-between`, which leaves voids. Nothing measured
any of it.
- Check: `hero-picture` fails a photo-led subject whose picture covers under 35% of the first screen at 1440 (30% at
  390); `empty-box` warns on a tall box that holds almost nothing or has a void over 40% of its height (fails at
  three); `footer-missing` and `footer-thin` fail a footer with under three links and no contact; `magnetic-button`
  warns. The DeepSeek page now fails on the first three.
- Deal: photo-led subjects are dealt only photo-first compositions; `magnetic` is no longer dealt by any composition
  or direction.
- New composition `photo-full`: the photograph or loop full bleed with the headline on a scrim, then the facts
  beside a second photograph, a mosaic of five, how to get there. Tokens gain `--c-scrim` and `--c-on-scrim`,
  always the darker and lighter of ground and ink.
- Blueprints: a real `.site-footer` (name, contact links, hours, section links, credits), pictures in bento tiles,
  rail panels and chapters, tiles that start at the top instead of spreading their content apart.
- The design critic's brief now looks for blank areas, one-line sections, the footer and gimmicks.
- `kaggle-video`: image-to-video with Wan 2.2 TI2V-5B on Kaggle's free T4s, as a private script kernel.

### Added
- `scripts/parallax.mjs`: a hero loop from one still with no GPU and no quota. Depth Anything V2 Small (Apache-2.0)
  estimates depth on the CPU (`scripts/lib/depth.py`, numpy + onnxruntime; the model downloads once), then a slow
  periodic camera move (`drift`, `dolly`, `pan`) renders an exact loop of 4 to 30 s. Verified on the Barichara
  courtyard: 12 s, seam equal to any inner step (51.1 dB on the rendered frames), motion score 7.4 against 5.6
  for the 2.4 loop, 944 KB mp4 at 1280x720.
- `video.mjs` joins several clips in order before the seam (A to B, then B to A), dropping the frame they share.
- `references/hero-video.md`: four routes (parallax, generated motion from two keyframes with Qwen-Image-Edit-Angles
  and Wan 2.2 first-last-frame, coded, footage), a still-photograph prompt that leaves calm ground for the headline,
  what to do when the quota runs out, and the seam numbers measured again (the 2.4 crossfade seam is 32.6 dB against
  a 32.4 dB neighbouring step; the doc said 39). `hf-asset-generate` follows.
- `setup.mjs` reports numpy + onnxruntime.
- Cult UI in `references/components.md`: the pieces worth a look by job, and the glow and shader pieces to refuse.
- svg-craft `lint.mjs` measures geometry, after anatomy's audit: labels that overlap, text cut by the viewBox (an
  error) and leaders that end in empty space.
- `library/landing-patterns.json`, generated by `scripts/sync-landing.mjs` from ui-ux-pro-max's `landing.csv` (order
  and main-action placement only, never its colours or effects): the brief prints the reading order a visitor
  expects for the page's kind (a guesthouse: full-bleed hero, one value line, proof, the action).
- OpenCode: `integrations/opencode/agents/` gains the two reviewers as subagents (generated from `review.md`, file
  edits denied), the `frontend` agent follows the 2.5 run (subject first, palette from the hero picture, both
  reviewers), and `docs/installation.md` lists the MCP servers (Playwright, Hugging Face, Awwwards) and
  playwright-cli.

## 2.5.0 - 2026-11-15

Design judgment: the subject decides colour, photographs and composition; motion finishes while it can be read;
phones keep their navigation; two independent reviewers look at every build; the repo installs everything it uses.

### Why
A GPT build of a heritage hostel in Barichara passed the 2.4 check and still looked machine-made: a hot pink riso
palette, every photograph tinted pink, a product-interface composition for a guesthouse, a route line that finished
drawing as it left the screen, no menu on the phone and 12 px controls. Two auditors traced each one to the skill:
the bold deal took the palette from a wildcard direction's moods, the brief told the model to "commit to it, do not
soften it back", `data-scrub` ran over the whole pass, the kit hid the nav under 760 px, and the review step
protected the deal against fixes.

### Changed
- Deal: a wildcard direction changes layout, type and motion, never the palette, which always comes from the
  subject's moods; subjects sold by their photographs (`PHOTO_LED`: hospitality, heritage, travel, food, coffee,
  tea, beauty, wellness, nature, organic, fashion) are never dealt a direction that recolours them (`recolours` in
  `directions.json`: riso-print, split-duotone). Compositions can need a kind of subject (`needs`): interface-hero
  only for software, object-center only for a product. A photo-led subject keeps its own type register too, and a
  heritage or luxury subject may set a serif on its warm pale ground (still refused for a cafe).
- Kit: `data-scrub` writes `--p` from the element's top 10% into the screen to its centre at 40%, so a line, a mask or
  a reveal is finished while it can be read (`--travel` keeps the whole pass); set pieces read it as `--q`. The
  `.nav` links stay on phones as a row that scrolls sideways. `data-marquee` is capped at 120 px/s and takes a
  `data-marquee-toggle` pause button (`.craft-pause` in `craft.css`). `surfaces.css` gains six quiet textures
  (`.craft-texture`: paper, grain, glow, dots, grid, fluted) with a table of the subjects each fits.
- The brief no longer tells the model to defend a wildcard; the run puts the subject above the deal.
- `place-coordinates` leads with the place's photograph; a map only from real coordinates.

### Added
- `start.mjs --palette-from <picture> [--accent n]`: the palette taken from the subject's own photograph (OKLab
  k-means for the grounds and ink, hue bins for accents), every role shifted in OKLCH lightness until it passes
  WCAG contrast; the brief lists the other accents in the picture. A Barichara courtyard gives a lime-wash ground,
  timber ink and a sandstone ochre accent.
- Check: `scrub-late` (scroll-driven motion still running between the element's centre at 35% and 10% of the
  screen), `photo-recoloured` (a photo-led subject shown grey, sepia, hue-shifted or under riso), `nav-mobile`,
  `control-text-small` (FAIL) and `marquee-pause` (WARN).
- Design review: `references/review.md` holds two briefs, a design critic (impeccable critique, audit and detect
  against the subject) and a motion and mobile auditor (scroll timing, 320-390 px, reduced motion, Emil's rules).
  The plugin ships them as agents (`agents/`, generated by `scripts/review-agents.mjs`); other harnesses paste the
  briefs into subagents. Step 9 of the run spawns both in parallel.
- `references/inspiration.md`: which gallery to look at for each part of the page (Awwwards MCP, supahero,
  navbar.gallery, pricingpages, socialproofexamples, awesome-design-md as a structure reference), which ones block
  scripts, and what award-listed hotels do; the brief sends the model there before the concept.
- `playwright-cli` is bundled (microsoft/playwright-cli, Apache-2.0) and named in the run for looking at the page
  at 1440, 390 and 320 px. Bundled skills moved to their upstream HEAD (impeccable 2b86d9c).
- `hf-asset-generate` (own) is bundled: free images, edits, clips and voice over the Hugging Face MCP server.
- `scripts/setup.mjs`: what the machine has (Node, a browser, ffmpeg, Python, playwright-cli, the sibling skills,
  the MCP servers) and, with `--install`, the user-level installs; the plugin's `.mcp.json` adds the Playwright and
  Hugging Face MCP servers.

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
