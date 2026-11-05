# science-kit

Reusable generators for biology / medicine / lab imagery. Every script is deterministic (seeded) and writes an SVG you then lint and look at (see `../SKILL.md` section 4).

| File | What | Notes |
|---|---|---|
| `petri-grow.gen.mjs` | Animated petri dish: colony grows, inhibition halo opens, bacteria inside fade, lid lifts | `node petri-grow.gen.mjs out.svg [--loop]`; CSS only; final state is the default style so reduced motion is correct |
| `bench-iso.gen.mjs` | Microbiology bench in isometric-mono (scope, flask, tubes, incubator, laptop, petri stack, books, mug) | uses `packs/illustration/illustration-isometric-mono/scripts/iso.mjs` |
| `examples/halftone-petri.src.svg` | Halftone-line source (compile with the pack's `halftone.mjs`) | `node packs/illustration/illustration-halftone-line/scripts/halftone.mjs src.svg out.svg --prefix hp-` |
| `examples/penicilina-mark*.svg` | Logo mark + small-size variant | see `packs/logo/LOGO.md` |

Ideas the kit already proved (used in the Figma Penicilina build): perspective ellipses (ry = 0.3 rx) for dishes, radial-gradient spheres with a small specular ellipse for cells and atoms, back-to-front painter's order for projected molecules, dashed ring = inhibition zone, one hue per entity (bacteria vermilion, mold teal, agar amber).
| `pen-penicilina.gen.mjs` | Photoreal-style clicker pen: translucent amber resin + liquid core, chrome, pearl, knurled grip, outlined label text | layered cues listed in the file header; example output in `examples/penicilina-pen.svg` |
