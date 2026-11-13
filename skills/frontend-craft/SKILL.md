---
name: frontend-craft
description: >-
  Builds websites and interfaces that do not look generated, in any framework (plain HTML, React,
  Next.js, Vue, Svelte, Astro, Tailwind). Deals a direction (palette, type pairing, composition,
  motion) from a curated library instead of picking by taste, ships a dependency-free motion kit
  (word reveals, scroll-lit text, stacking cards, pinned rails, scrub, count-up, marquee, magnetic
  buttons) and a browser check that blocks finishing while defects remain. Use whenever you build,
  redesign, restyle or polish a landing page, website, portfolio, product, event, restaurant or
  brand page, add animations or scroll effects, or when the user says a page looks basic, generic,
  templated or "AI-made".
hooks:
  Stop:
    - hooks:
        - type: command
          command: 'for f in ${CLAUDE_SKILL_DIR:+"$CLAUDE_SKILL_DIR/scripts/gate.mjs"} ${CLAUDE_PLUGIN_ROOT:+"$CLAUDE_PLUGIN_ROOT/skills/frontend-craft/scripts/gate.mjs"} "$HOME/.claude/skills/frontend-craft/scripts/gate.mjs" "$HOME/.agents/skills/frontend-craft/scripts/gate.mjs"; do if [ -f "$f" ]; then exec node "$f" --hook claude; fi; done; exit 0'
          timeout: 300
---

# frontend-craft

The user gives the subject. You do not pick colors, fonts or layout by taste: you **deal** them, build with the **kit**, and you are done when the **check** passes. Other design skills loaded in the session may advise on details; for a new page the deal decides colors, type and composition. `<skill>` is this folder. Needs Node 22+ and Chrome, Chromium or Edge.

**First command, before you write any markup:** `node <skill>/scripts/start.mjs --kind <kind> --moods <2-3 moods>` from the project folder (step 3 explains the flags). Without a deal the check fails with `no-direction`.

## Route first

| Task | Do |
|---|---|
| New page, site or redesign with a visual goal | The run below |
| Add or fix motion in existing UI | `craft-motion` skill |
| Review a page without editing | `craft-review` skill |
| End of a session with design corrections | `craft-learn` skill |
| Icon, logo, illustration, diagram | `svg-craft` skill |
| App, dashboard or docs | The run with `--kind app` or `--kind docs` (no motion floor; restraint) |

## The run

1. **Read the project.** `package.json`, framework, existing `DESIGN.md`, tokens and components. Preserve what exists. If the brand already has colors and fonts, add `--brand` in step 3. A new project goes in a new folder inside the current working directory; run every script from that folder.
2. **Pick the kind and 2-3 moods.** Kinds: landing, product, portfolio, event, venue, brand, campaign, app, docs. Moods: beauty, bold, brutal, calm, coffee, craft, creative, culture, developer, editorial, energetic, fashion, festive, finance, food, fresh, friendly, health, heritage, hospitality, industrial, luxury, minimal, modern, music, nature, nightlife, organic, playful, precise, print, retro, science, sport, tea, tech, travel, warm, wellness, youth.
3. **Deal.** `node <skill>/scripts/start.mjs --kind landing --moods warm,craft,coffee`
   It copies the kit into the project (`src/craft/`, `app/craft/` or `craft/`; override with `--kit`), writes the dealt `tokens.css`, and prints the brief (also in `.craft/brief.md`). The brief is binding: its palette, pairing, composition and motion are the design. Do not swap them for your own preference; `--redeal` gives a new hand.
4. **Write the copy before markup** (rules below), in the audience's language.
5. **Build from the blueprint.** `<kit>/blueprint.html` is the dealt composition as a working page: layout, scale, pinned scenes and kit attributes already wired. Wire the kit for the framework (table below), move the blueprint's structure into your page or components, replace every `{{...}}` (the check fails on any left), and build every `.visual` for real. Keep its skeleton and scale; restyle details. Put the dealt signature and supports where the brief says. Follow the house rules.
6. **Check.** Start the dev server or build, then once: `node <skill>/scripts/start.mjs --url http://localhost:5173` (or `--root dist`). Then `node <skill>/scripts/check.mjs`.
7. **Fix and look.** Fix every FAIL (each line has its fix; details in `references/checks.md`). Open every screenshot it lists in `.craft/shots/` and compare with the brief: what dominates, what is cropped at 390 px, where the action is. Fix the three weakest things you see. Re-run until `RESULT: PASS`.
8. **Report** in the format at the end. In Claude Code the Stop hook runs the check for you; elsewhere run `node <skill>/scripts/gate.mjs` and do not stop while it exits 1.

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

**Motion.** Persuade kinds (all but app and docs) must have:
- an entrance: `data-enter` on 3-6 first-screen elements in reading order, or `data-words` on the h1 plus `data-enter` on the rest; finished by about 1.5 s;
- the dealt signature plus 1-2 supports, at least one of them scroll-linked (`scroll-words`, `stack`, `rail`, `scrub`);
- `data-press` on every button and button-like link.
At most 4 moving effects in one viewport and one pinned or scrubbed scene per screen. Your own CSS motion animates only `transform` and `opacity`, 150-300 ms for UI, `var(--ease-out)`; never `transition: all`, never `ease-in` on entrances, never `scale(0)`. Things the user does often (nav links, tabs, inputs) get at most a 150 ms color or opacity change. Kit attributes and options: `references/motion.md`.

**Media.** Never invent or hotlink image or video URLs. Use supplied files; or download licensed stand-ins (Unsplash, Pexels) into the project with a `SOURCES.txt` naming photographer, page URL and license, and say in the report they are samples; otherwise build the visual in CSS, SVG or canvas (`svg-craft` for illustration). Every `img` has `alt` and `width`/`height` or `aspect-ratio`.

**Access.** One `h1`; `header`, `main`, `footer`; `lang`, `title`, meta description, a viewport meta that allows zoom; targets of 44x44 px; text over images gets a scrim. Focus rings and reduced motion come with the kit; do not remove them.

## Wiring the kit

Load `tokens.css`, then `craft.css`, then `layouts.css`, then your styles. Call `init(document)` once after the DOM exists; it returns a cleanup. Add `<script>document.documentElement.classList.add('craft-js')</script>` in `<head>` so first-screen elements do not flash before the kit runs.

| Stack | Wiring |
|---|---|
| HTML | `<link>` both CSS files; `<script type="module">import { init } from './craft/craft-motion.js'; init(document);</script>` before `</body>` |
| React + Vite | import both CSS files in `main.tsx`; in `App`: `useEffect(() => init(document), [])` |
| Next.js (App Router) | import both CSS files in `app/layout.tsx`; a `'use client'` `CraftMotion` component with `useEffect(() => init(document), [pathname])` rendered in the layout; use the printed `next/font` snippet on `<html>` |
| Vue | `onMounted(() => { stop = init(document) })`, `onBeforeUnmount(() => stop())` |
| Svelte | `onMount(() => init(document))` |
| Astro | `<script>import { init } from '../craft/craft-motion.js'; init(document);</script>` in the layout |
| Tailwind v4 | after the imports: `@theme inline { --color-bg: var(--c-bg); --color-ink: var(--c-ink); --color-accent: var(--c-accent); --font-display: var(--f-display); --font-sans: var(--f-text); }` |

Elements with `data-words`, `data-scroll-words`, `data-count` or `data-scramble` must hold static text, not state that re-renders. Full examples per framework: `references/frameworks.md`.

## Report

```
Ship: yes | yes, with fixes | no
Direction: <palette> / <type> / <composition> / <signature> (dealt, seed <n>)
Ran: <commands> -> RESULT: PASS, <n> WARN
Looked at: <screenshot files> - <one sentence on what the first screen and 390 px show>
Not verified: <what you could not check>
Samples to replace: <invented menu items, prices, hours, numbers>
```

Never write "done", "verified" or "premium" without the check output above it.
