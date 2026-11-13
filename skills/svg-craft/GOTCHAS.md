# svg-craft gotchas (all observed in real runs on 2026-11-03)

## SVGO (the "optimize it" step silently breaks things)
- `removeTitle` (in preset-default) deletes `<title>` = the only accessible name. `removeUnknownsAndDefaults` drops `role="img"` and `aria-*`. Both are disabled in `tools/optimize.mjs`.
- `removeHiddenElems` computes styles from `<style>`: a default `opacity:0` + keyframes that reveal it counts as hidden and the element is DELETED (33 of 103 nodes vanished from the petri animation). Disabled for `--animated`.
- Listing `{ name: 'removeXMLNS', active: false }` ENABLES the plugin (the entry form means "add"), so `xmlns` disappears and the file stops being valid standalone. Never add it.
- `--animated` profile also keeps ids, shapes, groups, inline `<style>`; static profile minifies ids. Always re-lint and re-render the `.min.svg`.

## Animation
- Make the default (unanimated) style the FINAL state. Otherwise `prefers-reduced-motion` shows the initial state (bacteria still inside the inhibition halo).
- `getAnimations()` + `setCurrentTime()` is how `render.mjs --frames` samples CSS/SMIL; fill-mode `both` is needed so t=0 shows the first keyframe.
- Stagger with `animation-delay` on the element, not nested groups. Loops need an explicit hold in the keyframes (`0%,8%{...}`), not extra delay.

## Logos and marks
- The same mark with fixed ink fails on dark (ring invisible): use `currentColor` + a `prefers-color-scheme` rule, or ship a dark lockup.
- Detail that reads at 256 px turns to mush at 16 px (dashed ring, 9 small dots). Ship a simplified small variant (fewer, bigger parts, thicker ring) and test `--mono` silhouettes at 16/32 px.
- Wordmarks: never leave live text in a delivered logo.

## Packs
- Nested `SKILL.md` files were renamed `PACK.md` so the harness does not register 20 extra skills (token cost every turn).
- Pack scripts import `playwright`; `packs/node_modules` is a symlink to `tools/node_modules` so they resolve it. A fresh install has no `tools/node_modules`: run `npm ci --prefix tools` first. Set `CHROME_PATH=/usr/bin/chromium` on Linux.
- Isometric-mono: one green ramp is the style (also the colour of a Penicillium colony). A flask built from stacked prisms reads as a cake: use `poly3` cones or accept it. Keep every footprint within +-110 plan units and paint back to front by `x+y`.
- Halftone cards compile to 300-700 kB of dots: use as `<img>` or rasterise to WebP for the web; they pass the pack linter but fail a 60 kB budget on purpose.
- `packs/isometric/*.md` are guides only. The Anatomy kit (40 MB, many tests) is not vendored: `git clone https://github.com/wheresryan22/anatomy` when an interactive isometric explainer is required.

## Process
- A lint can be clean while the picture is wrong (flask hidden behind the laptop; scope pillar behind the stage). Only the rendered PNG shows it.
- Dead loops from edits (`for` that draws five identical boxes) are easy to leave in a generator: delete, re-render, compare.
