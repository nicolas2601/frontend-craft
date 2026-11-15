---
name: svg-craft
description: Author, animate and verify SVG assets (illustrations, isometric scenes, icons, logos, diagrams, animated SVG, scientific figures) with deterministic kits, a render-and-look loop, lint and safe SVGO. Use for any request to draw, design or animate a vector graphic, or when frontend-craft needs an SVG focal asset.
---

# svg-craft

One entry point for vector work. It routes to vendored packs (MIT, credits in `packs/*/LICENSE-*`), adds our own tools and a mandatory verification loop. Nothing here needs an account, network or paid model. Reading a pack is not the same as using it: run the kit, render, and look at the PNG.

## 1. Pick the route (read ONLY the pack you need)

| Need | Route | Entry file |
|---|---|---|
| Spot illustration / hero art in a named style (flat, halftone, one-line, ink-sketch, isometric-mono, teal-spot, vintage-emblem, bold-pop, line-interior, two-colour-brush, grainy-gouache, framed-panel, outlined-cartoon) | style pack with its own kit, linter and renderer | `packs/illustration/<style>/PACK.md` (+ `scripts/`, `examples/`) |
| Premium isometric object / hero asset, or interactive explainer figure | guide only (kit lives in github.com/wheresryan22/anatomy, 40 MB, clone on demand) | `packs/isometric/anatomy-asset.md`, `anatomy-interactive.md` |
| Diagram (architecture, flow, sequence, state) | lint-backed diagram pack | `packs/diagram/svg-diagram/PACK.md`, `packs/diagram/archify.md` |
| Animated SVG (draw-on, morph, motion path, loaders, SMIL/CSS/GSAP) | animation recipes | `packs/animation/svg-animation-iart/PACK.md`, `svg-animations.supermemory.md`, `ui-skills/rossark-motion.md` (living characters), `ui-skills/gooey-blob.md` |
| Logo mark, icon, brand glyph | our protocol | `packs/logo/LOGO.md` |
| Generative pattern, chart, grid, fractal, particles | Python generators | `packs/generative/svg-art/PACK.md` |
| Science figure (petri dish, colony, cell wall, molecule, bench scene) | our science kit | `science-kit/README.md` |

Style packs are mutually exclusive: choose ONE per set and never mix their palettes or line weights. A new set = same pack, same kit, same `style.json`.

## 2. Brief (30 seconds, no questionnaire)
Where does it live (hero, 16 px favicon, deck, README, Figma)? Light, dark or both? Animated? Palette = project `DESIGN.md` / tokens, else the pack's own. State the assumption and go.

## 3. Author
- Prefer a generator script (seeded, deterministic, diffable) over freehand `d=""` paths. Put scripts next to the output, not inside this skill.
- One `viewBox`, no hard `width/height`, ids prefixed per file (`pg-`, `bn-`) so two SVGs can share a page.
- Colour: tokens or a short ramp; use `currentColor` for the ink so the asset follows light/dark. No pure `#000`.
- Text inside logos or figures that must not reflow: convert to paths (Figma / Inkscape / opentype.js). Otherwise give a generic fallback in `font-family`.
- Accessible by default: `role="img"` + `<title id>` + `<desc id>` + `aria-labelledby`; `aria-hidden="true"` only if decorative.
- Animation: the DEFAULT style is the resolved/final state; keyframes start from the initial state. `@media (prefers-reduced-motion: reduce){*{animation:none!important}}` then shows the finished picture. SVG shapes need `transform-box: fill-box; transform-origin: center`.

## 4. Verify (mandatory, in this order)
```bash
T=<this skill>/tools                           # node >= 20
[ -d "$T/node_modules" ] || npm ci --prefix "$T"   # once per install: svgo and playwright-core (no browser download)
node $T/lint.mjs asset.svg                    # structure, ids, refs, a11y, fonts, safety, motion, budget; geometry: overlapping labels, text cut by the edge, leaders that end in nothing
node $T/render.mjs asset.svg --out r --sizes 512,64,32,16 --bg both --sheet     # then READ r/asset.sheet.png
node $T/render.mjs asset.svg --out r --sizes 128,32,16 --bg light --mono --sheet   # silhouette test for marks
node $T/render.mjs anim.svg --out r --sizes 600 --bg dark --frames 0,1,2,3.5,7     # frame strip for motion
node $T/render.mjs anim.svg --out r --sizes 500 --reduced                          # the reduced-motion state
node $T/a11y-fix.mjs gen.svg --title "..." --desc "..."   # generators (svg-art, charts) emit no role/desc; or --decorative
python3 $T/text2path.py --font F.ttf --text "PENICILINA" --size 21   # JSON {d,width}: outline label/logo text (needs fonttools)
node $T/optimize.mjs asset.svg [--animated]   # SVGO with title/role/hidden-by-default protected; then lint + render the .min.svg again
```
Reading a PNG is the check; a green lint is not. Look for: wrong occlusion order, clipped strokes, a mark that turns to mush at 16 px, ink invisible on dark, text reflow, the reduced-motion state showing something half-finished. Fix the cause, re-render the same views, keep the better candidate. Style packs also have their own `scripts/lint.mjs` and `render.mjs`; run those too (set `CHROME_PATH=/usr/bin/chromium`).

## 5. Deliver
Files + how to embed (`<img>` keeps SMIL/CSS animation but blocks page CSS/JS; inline allows both) + size + what you actually rendered and looked at + what you did not check. For Figma: `figma.createNodeFromSvg` needs `viewBox` plus `width/height`, imports `currentColor` as black and ignores CSS animation, filters and `<style>`; flatten first.

## Anti-slop for vector work
Reject: stock blob + gradient mesh, emoji standing in for icons, floating sparkle filler, 3 identical feature icons from one generic set, an enlarged icon used as a hero, strokes of mixed weights without a system, unlabeled figures that need a caption to make sense. Specifics and failure log: `GOTCHAS.md`.
