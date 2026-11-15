---
name: frontend-craft
description: >-
  Entry point for frontend work in any framework (plain HTML, React, Next.js, Vue, Svelte, Astro,
  Tailwind) that routes each task to the skill that does it best and enforces a browser gate before
  finishing. Landing pages and multi-page sites get a dealt art direction that changes from build
  to build (bento, glass, riso, terminal, poster, cinematic and more), two scroll set pieces per
  page, a React Bits component, licensed photographs and a motion kit; platforms and app screens
  get a product-UI direction, HeroUI/shadcn controls and Emil's motion rules. The check fails flat
  pages and AI tells and runs impeccable's detector. Use whenever you build, redesign, restyle or
  polish a landing page, website, multi-page site, portfolio, shop, event, SaaS, platform or app
  interface, add animations or scroll effects, review a page, or when the user says a page looks
  basic, flat, generic, templated, the same as before or "AI-made".
hooks:
  Stop:
    - hooks:
        - type: command
          command: 'for f in ${CLAUDE_SKILL_DIR:+"$CLAUDE_SKILL_DIR/scripts/gate.mjs"} ${CLAUDE_PLUGIN_ROOT:+"$CLAUDE_PLUGIN_ROOT/skills/frontend-craft/scripts/gate.mjs"} "$HOME/.claude/skills/frontend-craft/scripts/gate.mjs" "$HOME/.agents/skills/frontend-craft/scripts/gate.mjs"; do if [ -f "$f" ]; then exec node "$f" --hook claude; fi; done; exit 0'
          timeout: 300
---

# frontend-craft

The user gives the subject; you supply the design judgment through the skills this one routes to, and you finish only when a browser gate passes. Never answer a visual request from memory: run the routed skill's scripts. `<skill>` is this folder; sibling skills sit next to it (`<skill>/../<name>`). Needs Node 22+ and Chrome, Chromium or Edge.

## Route first

| Task | Do |
|---|---|
| Website or landing page (company, product, shop, cafe, hotel, studio, event, portfolio, SaaS, AI tool, game) or a redesign of one | **The run** below with a website kind |
| A site with several pages (home, menu, about, contact...) | **The run** with `--kind site --pages /,/menu,/about`: each page gets its own two set pieces and the check runs on every page |
| The user asks for a quiet, sober or classic small-business site (a "sobria", "minimal", "sin animaciones" request) | `design-taste-frontend`'s own run, to its `GATE: PASS` |
| Platform, app screen, dashboard, admin | The run with `--kind app`: a product-UI direction (bento, glass, terminal, swiss), no scroll set pieces, HeroUI/shadcn controls, Emil's motion rules; `ui-ux-pro-max` search for UX rules |
| Docs | The run with `--kind docs` (no direction; restraint) |
| Add or fix motion in existing UI | `craft-motion`, with `animate`, `choreograph` and `animation-performance` |
| Review a page without editing | `craft-review`, plus `impeccable` (critique, audit, and `impeccable detect <url>`) |
| A component the page needs (menu, gallery, slider, text effect, command palette) | `references/components.md`: React Bits, HeroUI, shadcn, 21st.dev |
| UI that must survive bad data | `break-ui` |
| Icon, logo, illustration, diagram | `svg-craft` |
| End of a session with design corrections | `craft-learn` |

Bundled tools run from their own folder (`<skill>/../<name>`): `ui-ux-pro-max` search is `python3 <its folder>/scripts/search.py "<query>" --design-system`; `impeccable` is `<its folder>/scripts/impeccable <verb>` (`impeccable.cmd` on Windows), which downloads its engine once; `design-taste-frontend/scripts/photos.mjs` supplies licensed photographs (the brief prints the commands).

Order when advice conflicts: the user, then accessibility, then the subject (its place, materials and photographs), then the deal (direction, type, set pieces), then `impeccable` and the Emil skills, then defaults. Another skill's house rules (a place page that must stay still, words never over a photograph) do not apply to a dealt website.

## The run

1. **Read the project.** `package.json`, framework, existing `DESIGN.md`, tokens and components. Preserve what exists. If the brand already has colors and fonts, add `--brand` in step 3. A new project goes in a new folder inside the current working directory; run every script from that folder.
2. **Pick the kind, 2-3 moods and the language.** Kinds: landing, site, product, portfolio, event, venue, brand, campaign, app, docs. Site is several pages; app is a platform or product UI. The language is the one the user wrote in and the audience reads (`es`, `en`, `pt-BR`). Moods: beauty, bold, brutal, calm, coffee, craft, creative, culture, developer, editorial, energetic, fashion, festive, finance, food, fresh, friendly, health, heritage, hospitality, industrial, luxury, minimal, modern, music, nature, nightlife, organic, playful, precise, print, retro, science, sport, tea, tech, travel, warm, wellness, youth.
3. **Deal.** `node <skill>/scripts/start.mjs --kind landing --moods warm,craft,coffee --lang es` (a site: `--kind site --pages /,/menu,/visit`)
   Websites are dealt an **art direction** (grounds, type scale, photo treatment, two template breaks), a palette, a pairing, a composition, motion, **two set pieces per page** and **one library component** (React Bits). `--risk bold` (default) sometimes deals a direction from outside the subject's moods: it changes layout, type and motion, never the subject's colours (`--risk wild` more often, `safe` never). It copies the kit into the project (`src/craft/`, `app/craft/` or `craft/`), writes `tokens.css`, and prints the brief (also `.craft/brief.md`). The brief is binding: do not swap its direction, palette or type for your preference; `--redeal` gives a new hand.
4. **Concept, then copy.** Write `.craft/concept.md` (Idea, Signature, Rejected, Breaks, Components; template in the brief) before any markup. Then write the copy (rules below) in the dealt language. Optional: two Awwwards references for structural moves.
5. **Photographs and colour.** Real photographs carry a website. Use the client's files; otherwise run the brief's `photos.mjs` commands (search, pick, fetch, credits) and look at each frame full size. A subject sold by its photographs (a place, food, travel, beauty) shows them in true colour and takes its palette from its hero picture: `start.mjs --palette-from <file>` (the brief lists other accents in it).
6. **Build from the blueprint.** `<kit>/blueprint.html` is the dealt composition as a working page. Move its structure into your page, replace every `{{...}}`, and apply the direction on top: grounds, type scale, photo treatment and both breaks. Build both set pieces (`references/set-pieces.md`) in two different sections, put the dealt hero scene in the first screen (`references/scenes.md`; real subjects get a loop, `references/hero-video.md`), add the dealt component (`references/components.md`), use library controls rather than hand-rolled ones, and take materials (glass, bento, riso, mono, page transitions) from `references/surfaces.md`. Wire the kit (table below).
7. **Check.** Start the dev server or build, then once: `node <skill>/scripts/start.mjs --url http://localhost:5173 --lang <same>` (or `--root dist`). Then `node <skill>/scripts/check.mjs` (every dealt page of a site). It also measures the direction's floor and the AI tells, and runs `impeccable detect`.
8. **Fix and look.** Fix every FAIL (`references/checks.md`). Open every screenshot in `.craft/shots/`, then look yourself with `playwright-cli` (or a browser tool) at 1440, 390 and 320 px, scrolling and with reduced motion: is the subject seen first, do the set pieces read at 390 px, where is the action. Fix the three weakest. Re-run until `RESULT: PASS`.
9. **Design review.** Two independent reviewers in parallel, a design critic and a motion and mobile auditor (`references/review.md`: the plugin's agents, subagents with its briefs, or one after the other). Fix every high finding; the subject outranks the deal, and a fix that only tames the page to a default is refused. Then `impeccable` polish and the Emil motion review as a Before | After | Why table. Run the check again; it must still pass.
10. **Report** in the format at the end. In Claude Code the Stop hook runs the check for you; elsewhere run `node <skill>/scripts/gate.mjs` and do not stop while it exits 1.

## Copy rules

- Headline: 3-9 words that name the specific thing (product, place, number, promise). Never "Welcome to", never just the category.
- Line under it: one sentence of at most 22 words: who it is for and what they get.
- Primary action: verb + object, 2-4 words ("Reserve a bag"). The same label in the nav and the hero.
- Each section heading answers one visitor question: what is it, why trust it, what does it cost, where and when, how do I start.
- No testimonials, ratings, client logos or press quotes unless supplied. Menu items, prices and hours may be realistic samples; list them in the report as samples to replace.
- Facts over slogans: every section says something only this business has (a time, a street, a name, a number, how it is made). Slogan shapes fail ("A little X. A lot of Y.", "Tear it. Toast it. Share it.", "more than just", "made with love").
- One numbering system at most; no small uppercase eyebrow above every heading; no round tilted badge.
- Banned: lorem ipsum, emoji, "elevate", "unlock", "seamless", "cutting-edge", "next level", "Get Started", "Learn More" (and their Spanish forms). The check flags more.

## House rules

**Type.** Headlines use `.craft-display` (dealt family, weight, tracking, leading). Hero headline at `--t-display` or `--t-mega`, max-width 10-16ch, at most 5 lines at 390 px, no broken words. Body 16-20 px (`--t-base`, `--t-lg`), lines under 65ch, line-height 1.5-1.6. At most 3 text sizes per screen besides the headline. No italic accent word in the headline. At most 2 small all-caps labels on the whole page.

**Color.** Only `var(--c-*)`; never a new hex value. Large fields use bg, surface, ink or accent (an ink field takes `--c-bg` text). The accent marks the primary action and at most one other thing per screen. No gradients beyond two dealt colors, no glow blobs, no purple unless dealt.

**Layout.** The first screen at 1440x900 and 390x844 shows the headline, the line, the primary action and the composition's first-screen visual. Spacing from `--s-*`; sections use `padding-block: var(--section)` and `padding-inline: var(--gutter)`. Never a row of 3+ identical cards, nor a big card holding one number: one dominant item, unequal sizes, or a list. The footer is the blueprint's `.site-footer`, filled for real. No horizontal scroll at any width: `min-width: 0` on grid and flex children.

**Motion.** Websites must have:
- an entrance: `data-enter` on 3-6 first-screen elements in reading order, or `data-words` on the h1 plus `data-enter` on the rest; finished by about 1.5 s;
- the two dealt set pieces (`sp-*` classes, `references/set-pieces.md`) in two different sections, plus the dealt signature and supports;
- `data-press` on every button and button-like link.
At most 2 moving effects in one viewport and one pinned or scrubbed scene per screen; scroll-driven motion uses `var(--p)` and is finished while its element can be read. Your own CSS motion animates only `transform`, `opacity`, `clip-path` and `filter`, 150-300 ms for UI, `var(--ease-out)`; never `transition: all`, never `ease-in` on entrances, never `scale(0)`. Things the user does often (nav links, tabs, inputs) get at most a 150 ms color or opacity change. Kit attributes and options: `references/motion.md`.

**Media.** Never invent or hotlink image or video URLs. Use supplied files, the licensed frames the brief's `photos.mjs` commands fetch (with credits), or Unsplash/Pexels stand-ins with a `SOURCES.txt`; say in the report which are samples. Build illustrations in SVG or canvas (`svg-craft`), never as empty boxes. Every `img` has `alt` and `width`/`height` or `aspect-ratio`.

**Access.** One `h1`; `header`, `main`, `footer`; `lang`, `title`, meta description, a viewport meta that allows zoom; targets of 44x44 px; control and label text 14 px or more; the navigation reachable at 390 px (visible links or a menu button); text over images gets a scrim. Focus rings and reduced motion come with the kit; do not remove them.

## Wiring the kit

Load `tokens.css`, then `craft.css`, then `layouts.css`, then `set-pieces.css`, then `surfaces.css`, then your styles. Call `init(document)` once after the DOM exists; it returns a cleanup. Add `<script>document.documentElement.classList.add('craft-js')</script>` in `<head>` so first-screen elements do not flash before the kit runs.

| Stack | Wiring |
|---|---|
| HTML | `<link>` the CSS files; `<script type="module">import { init } from './craft/craft-motion.js'; init(document);</script>` before `</body>` |
| React, Next.js, Vue, Svelte, Astro, Tailwind v4 | `references/frameworks.md`: import the CSS once, call `init(document)` after mount (Next.js: a `'use client'` component keyed on the pathname), map the tokens into `@theme inline` |

Elements with `data-words`, `data-scroll-words`, `data-count` or `data-scramble` hold static text.

## Report

```
Ship: yes | yes, with fixes | no
Direction: <direction> (wildcard: yes|no) / <palette> / <type> / <composition> / set pieces <a>, <b> / component <id> (dealt, seed <n>)
Idea: <the concept's idea in one line>
Pages: <each page and its set pieces> (sites only)
Review: <critic and auditor verdicts, the high findings fixed>
Motion review: <Before | After | Why rows, or "none needed">
Ran: <commands> -> RESULT: PASS, <n> WARN
Looked at: <screenshot files> - <one sentence on what the first screen and 390 px show>
Not verified: <what you could not check>
Samples to replace: <invented menu items, prices, hours, numbers>
```

Never write "done", "verified" or "premium" without the check output above it.
