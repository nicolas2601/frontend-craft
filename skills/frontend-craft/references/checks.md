# What the check catches and how to fix it

`check.mjs` loads the page in headless Chrome three times: normal (1440x900, then 1280, 768 and 390x844), with `prefers-reduced-motion: reduce`, and with JavaScript off. FAIL blocks; WARN is advice. Each line it prints already names the element and a fix; this file explains the causes.

| id | Level | Means | Usual cause and fix |
|---|---|---|---|
| `h1-count` | FAIL | Not exactly one visible h1 | Logo or section titles marked h1; keep one, use h2 for sections |
| `meta-title`, `meta-lang`, `meta-viewport` | FAIL | Document basics missing | Set `<title>`, `<html lang>`, the viewport meta |
| `zoom-blocked` | FAIL | `user-scalable=no` or `maximum-scale=1` | Remove both; fix input zoom with 16 px inputs instead |
| `img-broken`, `network` | FAIL | A file 404s or fails | An invented or hotlinked URL; use supplied files or build the visual |
| `img-alt` | FAIL | `img` without `alt` | `alt="what it shows"`, or `alt=""` if decorative |
| `font-display-system` | FAIL | The h1 renders in a system font | Fonts not loaded or headings not using `var(--f-display)` / `.craft-display` |
| `font-display-missing` | FAIL | The h1 names a family no `@font-face` provides | The font link or next/font import is missing or misspelled |
| `deal-font` | FAIL | The h1 family is not the dealt display family | You swapped the pairing; use the dealt one or `--redeal` |
| `deal-palette` | FAIL | The first screen's main field is not a dealt color | A hard-coded hex; use `var(--c-bg)`, `--c-surface`, `--c-ink` or `--c-accent` |
| `tell-default-editorial` | FAIL | Cream ground + serif headline with an italic word + terracotta + mono labels (3 of 4) | The look every model falls back to; follow the deal, drop the italic word and the eyebrows |
| `overflow` | FAIL | Horizontal scroll at some width | Fixed widths, long words, `100vw` with a scrollbar, flex children without `min-width: 0` |
| `text-small` | FAIL | Text under 12 px | Use `--t-xs` at least |
| `contrast` | FAIL | Text under WCAG AA (4.5:1, or 3:1 at 24 px+) | Muted text on surface tints, text on accent without `--c-accent-ink`, opacity on text |
| `target-tiny` | FAIL | A control under 24 px at 390 | Icon buttons without padding; give 44x44 px |
| `transition-all` | FAIL | `transition: all` (or Tailwind `transition-all`) | List the properties |
| `content-invisible` | FAIL | Text never becomes visible after scrolling the whole page | A reveal that never fires, or an element hidden by CSS with no script to show it |
| `reduced-invisible` | FAIL | With reduced motion, text stays hidden | Custom animations that only reach the visible state by animating |
| `nojs-invisible` | FAIL | Without JavaScript, text is hidden | Hidden initial states not scoped to `html.craft-js` |
| `motion-entrance` | FAIL | Nothing on the first screen animates in (persuade kinds) | Add `data-enter` / `data-words` |
| `motion-scroll-story` | FAIL | Nothing responds to scroll position (persuade kinds) | Add the dealt scroll story: `scroll-words` in a pin, `stack`, `rail` or `scrub` |
| `white-flash` | FAIL | A dark page paints white first | `html { background: var(--c-bg) }` must load with the first CSS (tokens.css has it) |
| `console` | FAIL | Console errors or uncaught exceptions | Fix them; hydration warnings count |
| `copy-placeholder`, `copy-emoji` | FAIL | Lorem ipsum, `[Product]`, TODO, emoji | Write the copy; use an SVG icon instead of emoji |
| `copy-cliche` | WARN, FAIL at 3+ | Stock marketing phrases | Say what it does for whom, with a noun, a number or a place |
| `copy-generic-cta` | WARN | "Get Started", "Learn More", "Saber más" | Verb + object |
| `font-default` | WARN | Display font is Inter, Roboto, Poppins, Montserrat... | Use the dealt pairing |
| `tell-purple-gradient`, `tell-glow-orbs`, `tell-equal-cards`, `tell-eyebrows` | WARN | Other generated-default patterns | Flat dealt fields; unequal sizes; at most two eyebrow labels |
| `target-small` | WARN | Controls under 44 px on touch | Pad them |
| `ease-in`, `vh-unit` | WARN | Entrance with ease-in; `100vh` | `var(--ease-out)`; `100svh` |
| `nojs-empty` | WARN | The page is empty without JavaScript | Prerender or SSR the marketing page |
| `meta-description`, `deal-accent` | WARN | No description; accent unused | Add one sentence; give the primary action `var(--c-accent)` |

The motion line under the findings reports what was measured: elements animating on load, scroll-linked elements, one-time reveals and pinned scenes. Measured, not guessed: if a library animates without changing computed styles the check cannot see it.

Screenshots: `1440-early.png` (about 0.3 s after load, catches white flashes and late fonts), `1440.png`, `390.png`, and `1440-01.png` onward down the page. Open them; the check cannot judge taste.
