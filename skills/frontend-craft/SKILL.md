---
name: frontend-craft
description: >-
  Entry point for frontend work in any framework (plain HTML, React, Next.js, Vue, Svelte, Astro,
  Tailwind) that routes each task to the skill that does it best and enforces a browser gate before
  finishing. Websites and landing pages get a dealt art direction that differs from build to build
  (grounds, type scale, photo treatment, template breaks), two scroll set pieces, real licensed
  photographs and a motion kit, checked for richness as well as defects; app screens, dashboards
  and docs get dealt tokens and restraint. Use whenever you build, redesign, restyle or polish a
  landing page, website, portfolio, product, shop, cafe, event, SaaS or app interface, add
  animations or scroll effects, review a page, or when the user says a page looks basic, flat,
  generic, templated, the same as before or "AI-made".
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
| The user asks for a quiet, sober or classic small-business site (a "sobria", "minimal", "sin animaciones" request) | `design-taste-frontend`'s own run, to its `GATE: PASS` |
| App screen, dashboard, admin or docs | The run below with `--kind app` or `--kind docs` (no direction, no motion floor; restraint); `ui-ux-pro-max` search for styles and UX rules |
| Add or fix motion in existing UI | `craft-motion`, with `animate`, `choreograph` and `animation-performance` |
| Review a page without editing | `craft-review`, plus `impeccable` (critique, audit) |
| UI that must survive bad data | `break-ui` |
| Icon, logo, illustration, diagram | `svg-craft` |
| End of a session with design corrections | `craft-learn` |

Bundled tools run from their own folder (`<skill>/../<name>`), never from the project: `ui-ux-pro-max` search is `python3 <its folder>/scripts/search.py "<query>" --design-system`; `impeccable` is `<its folder>/scripts/impeccable <verb>` (`impeccable.cmd` on Windows), which downloads its ~23 MB engine once on first run; `design-taste-frontend/scripts/photos.mjs` supplies licensed photographs (the brief prints the commands).

Order when advice conflicts: the user, then accessibility, then the deal (direction, palette, type, set pieces), then `impeccable` and the Emil skills, then defaults. Another skill's house rules (a place page that must stay still, words never over a photograph) do not apply to a dealt website.

## The run

1. **Read the project.** `package.json`, framework, existing `DESIGN.md`, tokens and components. Preserve what exists. If the brand already has colors and fonts, add `--brand` in step 3. A new project goes in a new folder inside the current working directory; run every script from that folder.
2. **Pick the kind and 2-3 moods.** Kinds: landing, product, portfolio, event, venue, brand, campaign, app, docs. Moods: beauty, bold, brutal, calm, coffee, craft, creative, culture, developer, editorial, energetic, fashion, festive, finance, food, fresh, friendly, health, heritage, hospitality, industrial, luxury, minimal, modern, music, nature, nightlife, organic, playful, precise, print, retro, science, sport, tea, tech, travel, warm, wellness, youth.
3. **Deal.** `node <skill>/scripts/start.mjs --kind landing --moods warm,craft,coffee`
   Websites are dealt an **art direction** (grounds, type scale, photo treatment, two template breaks), a palette, a pairing, a composition, motion and **two set pieces**. `--risk bold` (default) takes the direction from outside the subject's usual moods about 40% of the time on purpose; `--risk wild` more, `--risk safe` never. It copies the kit into the project (`src/craft/`, `app/craft/` or `craft/`), writes `tokens.css`, and prints the brief (also `.craft/brief.md`). The brief is binding: do not swap its direction, palette or type for your preference; `--redeal` gives a new hand.
4. **Concept, then copy.** Write `.craft/concept.md` (Idea, Signature, Rejected: the template is in the brief) before any markup: the one thing only this subject has and the set piece that shows it. Then write the copy (rules below), in the audience's language.
5. **Photographs.** Real photographs carry a website. Use the client's files; otherwise run the brief's `photos.mjs` commands (search, pick, fetch, credits), look at each frame full size, and keep only the ones that fit the direction's treatment.
6. **Build from the blueprint.** `<kit>/blueprint.html` is the dealt composition as a working page. Move its structure into your page or components, replace every `{{...}}`, and apply the direction on top: its grounds, its type scale, its photo treatment and both breaks. Build both set pieces from `references/set-pieces.md` in two different sections. Wire the kit for the framework (table below).
7. **Check.** Start the dev server or build, then once: `node <skill>/scripts/start.mjs --url http://localhost:5173` (or `--root dist`). Then `node <skill>/scripts/check.mjs`. On a website it also measures the direction's floor: distinct section grounds, photograph count, full bleed, headline size, scroll scenes in two sections, the dealt set pieces and the concept.
8. **Fix and look.** Fix every FAIL (each line has its fix; details in `references/checks.md`). Open every screenshot in `.craft/shots/` and compare with the brief: is the direction visible on the first screen, do the set pieces read at 390 px, where is the action. Fix the three weakest things you see. Re-run until `RESULT: PASS`.
9. **Finish passes (websites).** `review-animations` on the set pieces and hover layer, then `impeccable` (critique) on the first screen and the 390 px view. Take the fixes that sharpen the direction; refuse the ones that tame it back to a default (removing the set pieces, flattening the grounds, shrinking the type). Run the check again; it must still pass.
10. **Report** in the format at the end. In Claude Code the Stop hook runs the check for you; elsewhere run `node <skill>/scripts/gate.mjs` and do not stop while it exits 1.

## Copy rules

- Headline: 3-9 words that name the specific thing (product, place, number, promise). Never "Welcome to", never just the category.
- Line under it: one sentence of at most 22 words: who it is for and what they get.
- Primary action: verb + object, 2-4 words ("Reserve a bag"). The same label in the nav and the hero.
- Each section heading answers one visitor question: what is it, why trust it, what does it cost, where and when, how do I start.
- No testimonials, ratings, client logos or press quotes unless supplied. Menu items, prices and hours may be realistic samples; list them in the report as samples to replace.
- Banned: lorem ipsum, emoji, "elevate", "unlock", "seamless", "cutting-edge", "next level", "Get Started", "Learn More" (and their Spanish forms). The check flags more.

## House rules

**Type.** Headlines use `.craft-display` (dealt family, weight, tracking, leading). Hero headline at `--t-display` or `--t-mega`, max-width 10-16ch, at most 5 lines at 390 px, no broken words. Body 16-20 px (`--t-base`, `--t-lg`), lines under 65ch, line-height 1.5-1.6. At most 3 text sizes per screen besides the headline. No italic accent word in the headline. At most 2 small all-caps labels on the whole page.

**Color.** Only `var(--c-*)`; never a new hex value. Large fields use bg, surface, ink or accent (an ink field takes `--c-bg` text). The accent marks the primary action and at most one other thing per screen. No gradients beyond two dealt colors, no glow blobs, no purple unless dealt.

**Layout.** The first screen at 1440x900 and 390x844 shows the headline, the line, the primary action and the composition's first-screen visual. Spacing from `--s-*`; sections use `padding-block: var(--section)` and `padding-inline: var(--gutter)`. Never a row of 3+ identical cards: one dominant item, unequal sizes, or a list. No horizontal scroll at any width: `min-width: 0` on grid and flex children.

**Motion.** Websites (every kind but app and docs) must have:
- an entrance: `data-enter` on 3-6 first-screen elements in reading order, or `data-words` on the h1 plus `data-enter` on the rest; finished by about 1.5 s;
- the two dealt set pieces (`sp-*` classes, `references/set-pieces.md`) in two different sections, plus the dealt signature and supports;
- `data-press` on every button and button-like link.
At most 4 moving effects in one viewport and one pinned or scrubbed scene per screen. Your own CSS motion animates only `transform`, `opacity`, `clip-path` and `filter`, 150-300 ms for UI, `var(--ease-out)`; never `transition: all`, never `ease-in` on entrances, never `scale(0)`. Things the user does often (nav links, tabs, inputs) get at most a 150 ms color or opacity change. Kit attributes and options: `references/motion.md`.

**Media.** Never invent or hotlink image or video URLs. Use supplied files, or the licensed frames the brief's `photos.mjs` commands fetch into the project (with their credits), or stand-ins downloaded from Unsplash or Pexels with a `SOURCES.txt` (photographer, page URL, license); say in the report which are samples. Build illustrations in SVG or canvas (`svg-craft`), never as empty boxes. Every `img` has `alt` and `width`/`height` or `aspect-ratio`.

**Access.** One `h1`; `header`, `main`, `footer`; `lang`, `title`, meta description, a viewport meta that allows zoom; targets of 44x44 px; text over images gets a scrim. Focus rings and reduced motion come with the kit; do not remove them.

## Wiring the kit

Load `tokens.css`, then `craft.css`, then `layouts.css`, then `set-pieces.css`, then your styles. Call `init(document)` once after the DOM exists; it returns a cleanup. Add `<script>document.documentElement.classList.add('craft-js')</script>` in `<head>` so first-screen elements do not flash before the kit runs.

| Stack | Wiring |
|---|---|
| HTML | `<link>` the CSS files; `<script type="module">import { init } from './craft/craft-motion.js'; init(document);</script>` before `</body>` |
| React + Vite | import the CSS files in `main.tsx`; in `App`: `useEffect(() => init(document), [])` |
| Next.js (App Router) | import the CSS files in `app/layout.tsx`; a `'use client'` `CraftMotion` component with `useEffect(() => init(document), [pathname])` rendered in the layout; use the printed `next/font` snippet on `<html>` |
| Vue | `onMounted(() => { stop = init(document) })`, `onBeforeUnmount(() => stop())` |
| Svelte | `onMount(() => init(document))` |
| Astro | `<script>import { init } from '../craft/craft-motion.js'; init(document);</script>` in the layout |
| Tailwind v4 | after the imports: `@theme inline { --color-bg: var(--c-bg); --color-ink: var(--c-ink); --color-accent: var(--c-accent); --font-display: var(--f-display); --font-sans: var(--f-text); }` |

Elements with `data-words`, `data-scroll-words`, `data-count` or `data-scramble` must hold static text, not state that re-renders. Full examples per framework: `references/frameworks.md`.

## Report

```
Ship: yes | yes, with fixes | no
Direction: <direction> (wildcard: yes|no) / <palette> / <type> / <composition> / set pieces <a>, <b> (dealt, seed <n>)
Idea: <the concept's idea in one line>
Ran: <commands> -> RESULT: PASS, <n> WARN
Looked at: <screenshot files> - <one sentence on what the first screen and 390 px show>
Not verified: <what you could not check>
Samples to replace: <invented menu items, prices, hours, numbers>
```

Never write "done", "verified" or "premium" without the check output above it.
