# SVG craft inside frontend-craft

When the focal object, a spot illustration, an icon set, a logo mark, a diagram or an animated vector is the thing a visitor looks at, build it with the `svg-craft` skill (Skill tool, or read `~/.claude/skills/svg-craft/SKILL.md`). It is the vector counterpart of the asset rules in SKILL.md section 3.

## How the two skills divide work
- **frontend-craft decides**: the visitor's job, the concept, which asset must exist, where it sits, how large, light/dark, what it must do (static, hover, scroll, reduced motion).
- **svg-craft produces and verifies**: choose one style pack or generator, author, `lint.mjs`, `render.mjs --sheet` (+ `--mono`, `--frames`, `--reduced`), LOOK, fix, `optimize.mjs`, deliver with the embed method.

## Non-negotiables carried over
1. Look at the rendered PNG at presentation size AND at the smallest real size (16-32 px for marks). Lint green is not visual acceptance.
2. Compare against the intended finish; if a repair misses twice, switch construction (another pack, a seeded generator, a different object) instead of piling paths.
3. Same style pack for a whole set; never mix palettes or stroke systems.
4. Animated SVG: default style = resolved state; `prefers-reduced-motion` must show a finished picture; inspect the frame strip.
5. Report what was rendered and what was not (dark mode, 16 px, reduced motion, Figma import).

## Routing cheat sheet
| Asset | svg-craft route |
|---|---|
| Hero object / premium isometric | `packs/illustration/illustration-isometric-mono` (kit `iso.mjs`) or `packs/isometric/*.md` |
| Editorial / zine feel | `illustration-halftone-line` (compiler `halftone.mjs`) |
| Playful product spots | `illustration-flat`, `-outlined-cartoon`, `-ink-sketch`, `-one-line`, `-bold-pop` |
| Badge / emblem | `illustration-vintage-emblem` |
| Diagram | `packs/diagram/svg-diagram` (has `svg-lint`) |
| Motion | `packs/animation/*` + `science-kit/petri-grow.gen.mjs` as a worked pattern |
| Logo / icon | `packs/logo/LOGO.md` |
| Biology / lab subjects | `science-kit/` |

## Figma hand-off
`figma.createNodeFromSvg(svg)` needs `viewBox` + explicit `width/height`; `currentColor` imports as black; CSS animation, `<style>` and filters are dropped. Flatten and re-colour before importing, rebuild motion as variants + Smart Animate.
