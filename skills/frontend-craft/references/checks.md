# What the check catches and how to fix it

`check.mjs` loads the page (every dealt page of a site) in headless Chrome three times: normal (1440x900, then 1280, 768 and 390x844), with `prefers-reduced-motion: reduce`, and with JavaScript off, then runs impeccable's detector on it. FAIL blocks; WARN is advice. Each line it prints already names the element and a fix; this file explains the causes.

| id | Level | Means | Usual cause and fix |
|---|---|---|---|
| `no-direction` | FAIL | A persuasion page was built without a deal | Run `start.mjs` first; `--brand` for an existing identity, `--kit-only` for motion on existing UI, `--no-deal` for reviews |
| `h1-count` | FAIL | Not exactly one visible h1 | Logo or section titles marked h1; keep one, use h2 for sections |
| `meta-title`, `meta-lang`, `meta-viewport` | FAIL | Document basics missing | Set `<title>`, `<html lang>`, the viewport meta |
| `zoom-blocked` | FAIL | `user-scalable=no` or `maximum-scale=1` | Remove both; fix input zoom with 16 px inputs instead |
| `img-broken`, `network` | FAIL | A file 404s or fails | An invented or hotlinked URL; use supplied files or build the visual |
| `img-alt` | FAIL | `img` without `alt` | `alt="what it shows"`, or `alt=""` if decorative |
| `font-display-system` | FAIL | The h1 renders in a system font | Fonts not loaded or headings not using `var(--f-display)` / `.craft-display` |
| `font-display-missing` | FAIL | The h1 names a family no `@font-face` provides | The font link or next/font import is missing or misspelled |
| `deal-font` | FAIL | The h1 family is not the dealt display family | You swapped the pairing; use the dealt one or `--redeal` |
| `deal-palette` | FAIL | The first screen's main field is not one of the look's colours (`design.mjs set`, or a dealt palette in `--deal-look` builds) | A hard-coded hex; use `var(--c-bg)`, `--c-surface`, `--c-ink` or `--c-accent` |
| `tell-default-editorial` | FAIL | Cream ground + serif headline with an italic word + terracotta + mono labels (3 of 4) | The look every model falls back to; follow the deal, drop the italic word and the eyebrows |
| `overflow` | FAIL | Horizontal scroll at some width | Fixed widths, long words, `100vw` with a scrollbar, flex children without `min-width: 0` |
| `text-small` | FAIL | Text under 12 px | Use `--t-xs` at least |
| `contrast` | FAIL | Text under WCAG AA (4.5:1, or 3:1 at 24 px+) | Muted text on surface tints, text on accent without `--c-accent-ink`, opacity on text |
| `target-tiny` | FAIL | A control under 24 px at 390 | Icon buttons without padding; give 44x44 px |
| `transition-all` | FAIL | `transition: all` (or Tailwind `transition-all`) | List the properties |
| `photo-recoloured` | FAIL | A subject sold by its photographs (hospitality, heritage, travel, food, coffee, tea, beauty, wellness, nature, organic, fashion) shows more than a third of its photographs or videos grey, sepia, hue-shifted, under riso or with a blend mode | True colour; take the accent from the hero picture instead (`design.mjs accents <photo>`, then `design.mjs set`) |
| `nav-mobile` | FAIL | At 390 px the header's nav shows fewer links than at 1440 and there is no menu button (`aria-expanded`) | Keep the links as a row (the kit's `.nav` wraps and scrolls them) or add a menu button |
| `control-text-small` | FAIL | A button, field or label under 14 px at 390 | `var(--t-sm)` or larger |
| `marquee-pause` | WARN | A `data-marquee` band with no `data-marquee-toggle` button beside it | Add the button (WCAG 2.2.2) |
| `scrub-late` | FAIL | Scroll-driven motion (a `--p`, an opacity, a clip, a line being drawn) still changing between the element's centre at 35% and at 10% of the screen: it finishes as the reader leaves it | `data-scrub` and `var(--p)` (it reaches 1 at 40%), or map your own progress the same way |
| `token-undefined` | FAIL | A design token (`--s-`, `--t-`, `--c-`, `--r-`, `--f-`) read with no fallback and never defined, such as `--s-20` on a scale that stops at `--s-16`; the property silently drops to 0 or transparent | Use a step the tokens define (the finding lists them) or define it |
| `hero-picture` | FAIL | A subject sold by its photographs shows its picture on under 35% of the first screen at 1440 (30% at 390): a text-only first screen with the photograph below the fold | Put the best photograph or the hero loop in the first screen: beside the headline, under it full width, or behind it with a scrim (`--c-scrim`, `--c-on-scrim`); the photo-first compositions (`photo-full`, `place-coordinates`, `split-stage`, `editorial-spread`) start there |
| `empty-box` | WARN, FAIL at 3 | A card, tile or panel with its own ground, at least 4% of the screen, that is tall and holds almost nothing, or has a void inside it over 40% of its height (a title at the top and one number at the bottom) | Fit the box to its content (no `min-height`, `align-content: start`), or give it what the subject has: a photograph, a short list of facts, a drawn detail |
| `footer-missing`, `footer-thin` | FAIL | No footer, or one with under three links and no way to reach the business | The blueprint's `.site-footer`: the name, contact as links (`tel:`, `mailto:`, WhatsApp, a map), hours or the last facts, the section links, one credits line |
| `magnetic-button` | WARN | A button follows the cursor (`data-magnetic`) | Remove it: `data-press` and a hover colour are the feedback a button needs |
| `look-pending` | FAIL | The colours and type were never chosen: `tokens.css` still holds the neutral stand-ins | Choose them (`references/color-type.md`) and run `design.mjs set` |
| `hallmark/<gate>` | FAIL or WARN | Hallmark's `sloplint` on the page's own files (not the kit). Gates any page should pass fail: middle-dot meta strings, eyebrows and tracked-caps labels, an italic word in a heading, em dashes and stock words in copy, purple gradients, a card in a card, emoji icons, drawn browser windows, invented proof, a fake send, motion without a reduced-motion fallback. Its other gates and reflexes warn | Each line names the gate; `skills/hallmark/references/gates.md` explains it and its fix |
| `parts-unsearched` | FAIL | A website or app built from a deal searched fewer than three of its parts in the component libraries (`.craft/components.json`, written by `components.mjs search`) | Before hand-building the nav, a gallery, a form, a menu, a map or an FAQ, run `components.mjs search "<its job>" --section <id>` and take the best with `pick` (`references/components.md`) |
| `parts-none-taken` | WARN | Parts were searched but nothing was taken | `components.mjs pick` the candidates that fit, or say under `# Components` why each was refused |
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
| `meta-description`, `deal-accent` | WARN | No description; the look's accent unused | Add one sentence; give the primary action `var(--c-accent)` |
| `rich-grounds`, `rich-pictures`, `rich-full-bleed`, `rich-type`, `rich-scenes` | FAIL | Below the dealt direction's floor (websites) | Too few section grounds or photographs, no full-bleed picture, a small h1, motion in fewer than two sections; the brief gives the numbers |
| `deal-set-piece` | FAIL | A dealt set piece is not on the page (on a site: on that page) | Build it from `set-pieces.md` with its `sp-` class |
| `concept-missing`, `concept-thin` | FAIL | `.craft/concept.md` missing, a heading missing, a thin idea, or `# Breaks` names no element | Write the five sections; name each break's element in backticks |
| `deal-break` | FAIL | An element named under `# Breaks` is not on the page | Build the break, or fix the selector |
| `deal-component` | FAIL | The dealt library component is not under `# Components` | Add it (`components.md`) and say where it sits, or name the replacement and why |
| `copy-lang` | FAIL | The copy or `<html lang>` is not the dealt language, or they disagree | Write in the audience's language and declare it |
| `copy-formula` | WARN, FAIL at 2+ | Slogan shapes: antithesis pairs, fragment triplets, "more than just", "made with love", "your ritual" | Replace each with a fact only this business has |
| `slop-numbering` | FAIL | Two or more numbering systems ("01 —" kickers, "01 / 04" counters, numbered captions, bare numerals) | Keep one, or none |
| `slop-repeat-photo` | FAIL | One photograph in two sections | One frame per section; fetch more |
| `slop-stamp` | FAIL | A round badge with a few words, tilted or spinning, or text on a circle | Remove it; set the fact as type |
| `deal-scene`, `scene-off` | FAIL, WARN | The dealt hero scene is not on the page; or it shows its poster because WebGL did not start | `<div class="craft-scene" data-scene="...">` in the first screen (`scenes.md`); a hero loop that played in the first screen also counts (`hero-video.md`) |
| `video-reduced`, `video-muted` | FAIL | A video plays under reduced motion; an autoplaying or looping video has sound | `data-loop` on the video with the kit, no `autoplay` attribute, `muted playsinline` |
| `video-pause`, `video-poster` | WARN | A looping video cannot be paused, or has no poster | A `data-loop-toggle` button next to it (WCAG 2.2.2); `poster=` its first frame (`scripts/video.mjs` writes one) |
| `site-transitions` | WARN | A multi-page site has no page transition | `surfaces.css` (`@view-transition`) plus one `view-transition-name` |
| `impeccable/<rule>` | FAIL (slop, errors), WARN (quality; marquee, oversized-h1, tight tracking, hard shadows) | impeccable's detector on the rendered page | Its fix line; `impeccable detect <url>` reruns it alone. `--no-detector` skips it |

The motion line under the findings reports what was measured: elements animating on load, scroll-linked elements, one-time reveals and pinned scenes. Measured, not guessed: if a library animates without changing computed styles the check cannot see it.

Screenshots: `1440-early.png` (about 0.3 s after load, catches white flashes and late fonts), `1440.png`, `390.png`, and `1440-01.png` onward down the page. Open them; the check cannot judge taste.
