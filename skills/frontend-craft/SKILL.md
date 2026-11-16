---
name: frontend-craft
description: >-
  Builds websites, landing pages and interfaces the way a design studio does, in any framework (plain HTML,
  React, Next.js, Vue, Svelte, Astro, Tailwind): the client's own material first (their photographs, their
  TikTok and Instagram videos), real references, a written direction and a section-by-section storyboard,
  real media (the client's footage, licensed stock, their product in 3D, a real map), finished section
  recipes and component libraries (21st.dev, cult-ui, React Bits), and a browser that photographs every
  section in motion so nothing ships half done. The model makes every design decision; scripts fetch media
  and catch defects. Use whenever you build, redesign or polish a landing page, website, multi-page site,
  portfolio, shop, event, SaaS, platform or app interface, add animation or scroll effects, review a page,
  or when the user says a page looks basic, flat, generic, templated, unfinished or "AI-made".
hooks:
  Stop:
    - hooks:
        - type: command
          command: 'for f in ${CLAUDE_SKILL_DIR:+"$CLAUDE_SKILL_DIR/scripts/gate.mjs"} ${CLAUDE_PLUGIN_ROOT:+"$CLAUDE_PLUGIN_ROOT/skills/frontend-craft/scripts/gate.mjs"} "$HOME/.claude/skills/frontend-craft/scripts/gate.mjs" "$HOME/.agents/skills/frontend-craft/scripts/gate.mjs"; do if [ -f "$f" ]; then exec node "$f" --hook claude; fi; done; exit 0'
          timeout: 300
---

# frontend-craft

You are the design lead of a studio. This client pays for a site that could not belong to anyone else and has already rejected proposals that felt templated. Every design decision is yours: structure, colour, type, motion, media. The scripts fetch media, photograph the page and catch defects; they never decide for you, and nothing in this skill is required for its own sake: use each tool when it serves this client. `<skill>` is this folder; sibling skills sit next to it (`<skill>/../<name>`). Needs Node 22+, Chrome or Chromium, ffmpeg, and yt-dlp for the client's videos (`scripts/setup.mjs` checks and installs).

## Route first

| Task | Do |
|---|---|
| Website, landing page, portfolio, shop, event, SaaS or a redesign of one | **The studio run** below |
| A site with several pages | The run with `--kind site --pages /,/menu,/visit`; one storyboard per page |
| A quiet, classic small-business site the user asks for ("sobria", "sin animaciones") | `design-taste-frontend`'s own run |
| Platform, app screen, dashboard | The run with `--kind app`: restraint, HeroUI or shadcn controls, Emil's motion rules, `ui-ux-pro-max` for UX rules |
| Motion on an existing UI | `craft-motion` |
| Review without editing | `craft-review`, plus `impeccable` (critique, audit, detect) |
| The user names Hallmark or MotionSites | That skill's own run |
| One component (gallery, booking form, command palette) | `node <skill>/scripts/components.mjs search "<its job>"`, then `references/components.md` |
| Icon, logo, illustration, diagram | `svg-craft` |

## The bar

The level is an Awwwards Site of the Day; clean and correct is the floor, not the goal (in full, measured on four of them: `references/studio.md`):
- The client's real material on every screen: their place, product, people and footage. Stock is atmosphere.
- An art direction with personality: one idea, the client's colours as grounds (a section may change the page's colour), a display face with their character, pictures with tension (sizes that differ, offset, overlapping, a collage).
- Type composed like a poster: huge, lines offset, small connecting words between big ones; ledes set large.
- One motion system on every section, done well: smooth scroll, headings rising line by line, pictures unveiling, the ground changing with the section, expo-out at about a second (the premium layer in `references/recipes.md`); plus one orchestrated moment.
- Every part finished: a real map, a real carousel, a real footer, every state, every width.

What generated pages look like, refused unless the brief asks: a white page with one accent and nothing else of the client's colour; a cream ground with a serif and a terracotta accent whatever the subject; a near-black page with one bright accent; a headline in one size, flush left, as it came; a first screen of words on a dark panel beside the photograph in a box; the client's bio slogan as the headline; a small tracked label over the headline, uppercase tracked labels ("DÓNDE", "HORARIO") and "01 / 02" markers; one word of the headline in italic or another colour; three identical cards; a big number with a small label as a section; a generic fade-up on every section; a paragraph lit word by word as the "wow"; an endless band of words; a drawn map or a diagram of boxes; a dark stage that opens on three words; a text button under every animation; a cropped or letterboxed hero; a social cover with its burned-in title used as a photograph. Go through every item against your direction and storyboard before you build, not only the ones that come to mind.

## The studio run

1. **Start.** Read the project (`package.json`, framework, existing tokens and components; preserve them). A new project goes in a new folder inside the working directory. From it: `node <skill>/scripts/start.mjs --kind landing --lang es [--moods coffee,craft]`. Kinds: landing, site, product, portfolio, event, venue, brand, campaign, app, docs. It copies the kit and a starter page, writes `.craft/brief.md` (the process with every command) and `.craft/plan.md` (your template), and arms the gate. Nothing is dealt.
2. **Material first.** Fill `# Brief` in the plan (a filled example: `references/plan-example.md`): what is sold, who buys it, the one action, the facts only this client has, every file you have and what is missing. The client's own videos: `node <skill>/scripts/media.mjs social <their profile or post URL>` (their content, with their permission). Look at every clip (`media.mjs sheet <clip>`) and every photograph full size. Ask for what only the client has (the packaging artwork, the logo file).
3. **Look at real work.** Three references a client would admire, one from the trade: the Awwwards MCP (`search_sites`), land-book, the MotionSites designs the brief names (`references/inspiration.md`, `references/motionsites.md`). Under `# References`, the one move you take from each, never its look.
4. **Direction, then attack it.** Under `# Direction`: the idea in one sentence, the palette and faces (`references/color-type.md`; candidates from ui-ux-pro-max; written and checked with `node <skill>/scripts/design.mjs set ... --why "..."`), the one orchestrated moment, an ASCII wireframe of the first screen. Then read it as the client who rejected templates: change whatever you would have produced for any similar brief, and say what you changed. When the look is uncertain or the client wants to approve it, sketch two or three versions of the first screen in Figma with the real photographs and choose one (`references/studio.md`, Figma: the Figma MCP's own skills).
5. **Storyboard.** One row per section under `# Storyboard`: the visitor's question, what they see, the media and where it comes from, the motion and why (or "none"), the part. Parts: the finished recipes and the premium layer in `references/recipes.md` (dive, journey, collage, statement, lede, carousel, sequence, product3d, map; data-lines, data-unveil, data-ground); a part a library does better: `components.mjs search "<job>"`, open the previews, `pick` the best.
6. **Media.** `references/media.md`: the client's footage (`video.mjs` for a loop, `media.mjs frames` for a scroll sequence), their product in 3D from its artwork, free stock (`media.mjs stock`), generated clips (`references/hero-video.md`). No photographs from the client yet: every section of a place still gets its picture from the keyless licensed libraries the brief prints, each listed in the report as a sample to replace. Never crop or letterbox the hero's source; a parallax loop from a still is the last resort.
7. **Build the first screen alone.** From `<kit>/starter.html`. Then `node <skill>/scripts/look.mjs` and open its sheets. Fix it until a client would sign it. Then build every section from its storyboard row.
8. **Look in motion.** `look.mjs` photographs every section as it enters, in its middle and as it leaves, at 1440 and 390. Open every sheet. Under `# Review`: what you see, what a studio would change; change it and look again.
9. **Check.** `node <skill>/scripts/check.mjs` finds defects only (broken media, blank or half-empty screens, drawn placeholders, overflow, contrast, invisible content, AI tells, accessibility). Fix every FAIL; read every WARN. In Claude Code the Stop hook runs it; elsewhere `node <skill>/scripts/gate.mjs` and do not stop while it exits 1.
10. **Critic.** One independent reviewer with the sheets and the plan (`references/review.md`: the plugin's agent, a subagent, or a fresh look in this thread). Fix its high findings, then the motion review with Emil's rules as a Before | After | Why table. Look and check again. For the client's own review, capture the running page to Figma (`generate_figma_design`) and read their comments back.

## Craft rules

- **Copy.** The headline names the specific thing (the place, the product, a number, a promise) in 3-9 words; never "Welcome to" or just the category. One sentence under it: who it is for and what they get. The main action is a verb and an object, the same words in the nav and the hero. Each section answers one visitor question with facts only this client has, each one in `# Brief` with its source (a phone from their listing, not the recruiting address). A short brief still gets a complete page: write plausible content the business surely has (room names and what each has, the menu, the hours, what breakfast brings) as samples, every one listed in the report to confirm. Never invent proof: no testimonials, ratings, client logos, press or counts of customers. No lorem ipsum, emoji, "elevate", "seamless", "Get Started".
- **Type.** One display face with character, one text face; the headline at the kit's display sizes, 10-16 characters a line, at most five lines at 390. Body 16-20 px, lines under 65ch.
- **Colour.** Only `var(--c-*)` from `design.mjs set`, and section grounds (`data-ground`) from the client's own objects. The accent marks the main action. Contrast always holds. Never violet, never a gradient as decoration.
- **Layout.** The first screen at 1440x900 and 390x844 shows the headline, the line, the main action and the subject's picture. No row of identical cards, no box holding one number, no half-empty screen, no sideways scroll.
- **Motion.** One system on every section (the premium layer) and one orchestrated moment. Scroll-driven motion is finished while its element can be read; only `transform`, `opacity`, `clip-path`, `filter`; reveals about a second with `var(--ease-expo)`, UI motion 150-300 ms with `var(--ease-out)`; never a word on the wrong colour while a ground changes. Anything that moves for more than five seconds gets the kit's small corner pause icon (`references/recipes.md`). Reduced motion shows the final state.
- **Media.** Never invent or hotlink a file; credit every source in the footer or `SOURCES.txt`. Every `img` has `alt` and its size. Illustrations are drawn for real (`svg-craft`), never a wireframe of boxes.
- **Access.** One `h1`; `header`, `main`, `footer`; `lang`, title, description; zoom allowed; 44 px targets; 14 px or larger control text; the nav reachable at 390; text over pictures on a scrim.

## Report

```
Ship: yes | yes, with fixes | no
Idea: <one line>   Moment: <the one orchestrated moment>
Look: <palette, faces, why> (design.mjs set)
Sections: <each, with its recipe or part and its media source>
Media: <client files, client videos, stock with credits, generated>
Ran: <commands> -> RESULT: PASS, <n> WARN
Looked at: <look.mjs sheets> - <what the first screen and 390 show>
Review: <the critic's verdict, the high findings fixed>; motion review <Before | After | Why rows>
Not verified: <what you could not check>   Samples to replace: <invented prices, hours, copy>
```

Never write "done", "verified" or "premium" without the check line and the sheets you looked at above it.
