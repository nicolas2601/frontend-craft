# Motion kit reference

Every effect is a data attribute. `init(document)` starts them all and returns a cleanup. Under `prefers-reduced-motion: reduce` each effect shows its final state and nothing moves. Without JavaScript all content stays visible (hidden states apply only under `html.craft-js`).

## Entrances (first screen, once)

| Attribute | Does | Options |
|---|---|---|
| `data-enter` | Fades, rises 16 px and unblurs. Elements run in document order, 90 ms apart, 750 ms each. | `data-enter="3"` forces the order slot |
| `data-words` | Splits the text into words that blur in 45 ms apart. Screen readers get the whole sentence once. | `data-words="view"` waits until it scrolls into view |

Use one entrance per first screen: nav, headline, line, action, visual. Done by about 1.5 s.

## Reveals (in view, once)

| Attribute | Does | Options |
|---|---|---|
| `data-reveal` | Fades and rises 24 px when 12% into the viewport | `data-reveal="stagger"` animates the children 70 ms apart |
| `data-mask` | Clip-path wipe, 900 ms | `up` (default), `down`, `left`, `right` |

Reveals are supports, never the scroll story: fade-ins alone fail the check.

## Scroll stories (linked to scroll position, reversible)

| Attribute | Does | Structure |
|---|---|---|
| `data-pin` | A tall section whose first child sticks for `--pin-length` (default 260svh) | `<section data-pin><div>…</div></section>` |
| `data-scroll-words` | Words light from 16% to full opacity as the reader scrolls | inside a pin: `data-scroll-words="pinned"` |
| `data-scrub` | Writes `--p` from 0 to 1 while the element crosses the viewport | `data-scrub="pinned"` follows the nearest `data-pin`; `data-scrub-reduced="0.5"` sets the reduced-motion value (default 1) |
| `data-stack` | Children stick and shrink 6% as the next one covers them | `--stack-top` (12svh), `--stack-gap` (1.25rem) |
| `data-rail` | A pinned row that moves sideways while the page scrolls down | `<section data-rail><div data-rail-track>panels</div></section>`; at 640 px and below it becomes a native swipe row with snap |
| `data-parallax` | Drifts at a fraction of scroll speed, capped at 160 px | `0.05` to `0.3`; negative moves the other way |
| `data-progress` | Scales a bar from 0 to 1 across the page | a fixed 2-4 px bar |

`--p` recipes (put them in your CSS, the element keeps its own styles):

```css
.lid    { transform: rotate(calc(var(--p) * -110deg)); transform-origin: 0 100%; }
.fill   { scale: var(--p) 1; transform-origin: 0 50%; }
.zoom   { scale: calc(1 + var(--p) * 0.35); }
.shift  { translate: calc((var(--p) - 0.5) * -30vw) 0; }
.fade   { opacity: calc(1 - var(--p) * 1.4); }
```

## Text and numbers

| Attribute | Does | Notes |
|---|---|---|
| `data-count` | Counts from 0 to the number already written, 1.4 s, when in view | keeps the page's format: `1.280`, `1,280.50`, `12,5 %`, `+40k` |
| `data-scramble` | Letters resolve from noise when in view | `data-scramble="hover"`; short text without child elements |
| `data-marquee` | An endless band, pauses off screen and on hover | `data-marquee="60"` px per second; `--marquee-gap` |

## Pointer (fine pointers that hover only)

| Attribute | Does | Options |
|---|---|---|
| `data-magnetic` | The element leans toward the cursor within 40 px and springs back | strength `0.1`-`0.6` (default 0.3); use on one primary action |
| `data-spotlight` | A soft accent light follows the cursor over a surface | `--spot-size` (420px) |
| `data-press` | `scale(0.97)` on press, 140 ms (CSS only) | every button |
| `data-lift` | Rises 3 px with a shadow on hover (CSS only) | cards that are links |

## The contract for motion you write yourself

- Job first: feedback, continuity, explanation, direct manipulation or delight. No job, no motion.
- `transform`, `opacity`, `clip-path` and `filter` only. Never animate width, height, top, left or margins.
- UI feedback 150-300 ms with `var(--ease-out)`; entrances up to 750 ms; rare hero moments up to 1.2 s. Exits are shorter than entrances.
- Stagger 30-90 ms. Never `ease-in` on something that enters. Never `scale(0)`: start at 0.9-0.97.
- Scroll effects read position in `requestAnimationFrame`, never in a raw scroll handler.
- Reduced motion keeps opacity and color changes and drops movement.
- If the project already uses Motion (motion.dev) or GSAP, keep the same timings and rules in that library instead of mixing it with the kit on the same element.
