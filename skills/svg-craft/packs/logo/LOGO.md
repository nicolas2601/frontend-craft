# Logo / mark protocol (replaces the generic rknall flow; its text is kept next to this file for reference)

A mark is a decision under constraint, not a pretty picture. Output: SVG files that survive 16 px, one ink, dark mode and print.

## 1. Brief in four lines
Name and what it does; one concrete object or behaviour from the real subject (not a category cliche: a bacterium and a halo for Penicilina, not a pill); where it appears (favicon, app icon, nav, print); tone. If the closest competitor could use the same idea unchanged, discard it.

## 2. Concepts as geometry, not adjectives
Draw 3 concepts on a 64 x 64 grid with a 4 px safe margin using circles, arcs, rects and at most one custom path. Name each concept by its mechanism ("halo: empty ring around a core"). Render all three side by side at 256 and 32 px before choosing.

## 3. Hard gates (run `tools/render.mjs --sheet`, `--mono`, then LOOK)
1. Reads at 32 px and still identifiable at 16 px (else build `mark-small.svg`: fewer and thicker parts).
2. Silhouette test (`--mono`) keeps the idea.
3. Works on light AND dark: ink via `currentColor`, plus `prefers-color-scheme`, or an inverted lockup file.
4. At most 2 brand colours + ink; no gradients unless the brand needs them (they die in print).
5. No live text; wordmark converted to paths; optical alignment checked with a grid overlay.
6. `<title>` + `<desc>`; `tools/lint.mjs` clean.

## 4. Deliverable set
`mark.svg` (adaptive), `mark-small.svg` (<= 24 px), `mark-mono.svg` (single ink), `lockup-horizontal.svg` / `lockup-stacked.svg` if a wordmark exists, favicon sizes rendered by `render.mjs`, and a one-paragraph rationale naming the mechanism. Say which sizes and backgrounds you actually looked at.

## 5. Worked example
`science-kit/examples/penicilina-mark.svg` and `penicilina-mark-small.svg`: core + dashed halo + ring of bacteria that keep their distance; the sheet exposed an invisible ring on dark and mush at 16 px, both fixed as above.
