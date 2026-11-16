# Section recipes

Finished sections in the kit (`kit/motion/recipes.js`, `product3d.js`, `map.js`, styles in `kit/recipes.css`). Each
reads as a finished section without JavaScript and under reduced motion, runs only near the screen, and takes the
page's tokens. Choose one by the story the section tells; a page rarely needs more than three. Load
`<kit>/recipes.css` after the other kit stylesheets (the starter page does).

## The premium layer: one motion system for the whole page

What award-winning pages share (references/studio.md): smooth scroll, headings that rise line by line, pictures that
unveil and settle, a ground that changes with the section, pictures that lean in on hover. Expo-out, about a second.
The starter page loads it (`craft/premium.css`, Lenis in the import map, `data-smooth` on `<html>`). Use what the page
needs; under reduced motion everything is simply there, and without JavaScript nothing is hidden.

| Attribute | On | What it does |
|---|---|---|
| `data-smooth` | `<html>` | Lenis smooth scroll with inertia, anchor links included (`"lenis"` in the import map, or `init(document, { libs: { lenis: () => import('lenis') } })`) |
| `data-lines` | a heading, a lede | Rises line by line, each word from behind a mask; small connecting words (`<small>`) fade in with their line. In a section with `data-ground` it waits for the section's colour |
| `data-unveil` (`up`, `down`, `left`, `right`) | a frame holding an img or video | Opens from that edge while the picture settles from a slight zoom; pairs with `data-parallax="0.06"`-`"0.22"` for depth |
| `data-ground="#hex"` (and `data-ink="#hex"`) | a section | The page's ground eases to this colour while the section holds the middle of the screen; the section's words take its ink. Keep words clear of the section's edges |
| `data-hover="zoom"` / `"line"` | a frame / a link | The picture leans in; the link draws its underline |
| `data-nav` | the header | A floating bar in the colours of the section under it (`data-nav-ground` / `data-nav-ink` on a section over a photograph); it steps away while the visitor reads down and returns on the way up. On a phone its links open as a full screen from `<button class="nav__toggle" aria-expanded="false" aria-controls="<links id>">`; a `.btn.nav__cta` inside the links shows there. Without JavaScript the links stay a row |

```html
<section class="story" data-ground="#F1E9DC" aria-label="La historia">
  <p class="r-lede" data-lines>Fabián cumplió diez años en Colombia en 2025 y empezó a servir café de Santander…</p>
  <figure data-unveil data-parallax="0.08"><img src="assets/img/portrait.webp" alt="..." width="1233" height="1764" loading="lazy"></figure>
</section>
```

## statement: a headline composed line by line

Each line its own span, offset with `--indent`, small connecting words in `<small>`: the poster scale of the
references. Pair with `data-lines`. With accented capitals keep the leading at 0.9 or more, or the accents of one
line touch the line above.

```html
<h2 class="r-statement" data-lines>
  <span>Del cañón</span>
  <span style="--indent: 1.4em"><small>a la</small> taza</span>
</h2>
```

## lede: an editorial paragraph set large

`<p class="r-lede" data-lines>`: the story in two or three sentences, in the display face at about 2.5 rem. Replaces
a small paragraph under a heading.

## collage: the client's pictures with tension

Three to six pictures at different sizes, offset, overlapping, slightly turned, unveiling and moving at different
depths; one large word may cross them (`r-collage__word`). For an origin, a process, the people, the place.

```html
<div class="r-collage">
  <figure class="r-collage__item" data-unveil data-parallax="0.06"><img src="..." alt="..." width="1044" height="1392" loading="lazy"><figcaption>Cereza madura</figcaption></figure>
  <figure class="r-collage__item" data-unveil data-parallax="0.14"><img ...></figure>
  <figure class="r-collage__item" data-unveil data-parallax="0.22"><img ...></figure>
</div>
```

`--ratio`, `--rot` and `--focus` on an item override its place in the pattern. On a phone it becomes two staggered
columns.

## dive: fly forward into the hero picture

The first screen is the subject's best photograph or loop at full bleed; scrolling flies the camera into it toward a
focal point while the words step aside; at its closest the picture scrolls off with the section (no fade to a flat
ground, which would leave an empty screen). The moment for a place (into the
shopfront, the window, the sign) or a product (into its detail).

```html
<section class="r-dive" data-dive="0.75" aria-label="...">
  <div class="r-dive__stage">
    <div class="r-dive__media"><img src="assets/img/hero.webp" alt="..." width="1600" height="1000" style="--focus: 36% 36%" fetchpriority="high"></div>
    <div class="r-dive__scrim"></div>
    <div class="r-dive__copy">
      <h1 class="craft-display" data-enter>...</h1>
      <p data-enter>...</p>
      <div class="actions" data-enter><a class="btn" href="..." data-press>...</a></div>
    </div>
  </div>
</section>
```

- `data-dive` is the depth (0.5 a step closer, 1 deep into it). `--focus` is where the camera goes and how the picture
  is framed (object-position): the sign, the door, the cup. Never crop the source file; pick the focus.
- A video works the same (`<video data-loop ...>` in `.r-dive__media`).
- After the kit nav it sits under the sticky bar on its own.

## journey: a horizontal story while scrolling down

A pinned stage: a row of photographs passes from right to left while two lines of type cross in opposite directions.
For an origin story (farm to cup), a process, a route, a timeline. Five to eight photographs of the client's own.

```html
<section class="r-journey" data-journey aria-label="...">
  <div class="r-journey__stage">
    <p class="r-journey__line" data-line="-1">Del trigo de Boyacá</p>
    <ol class="r-journey__track">
      <li><figure><img src="..." alt="..." width="1044" height="1392" loading="lazy"><figcaption>One fact.</figcaption></figure></li>
    </ol>
    <p class="r-journey__line" data-line="1">al horno de la calle 10</p>
    <div class="r-journey__progress"><span></span></div>
  </div>
</section>
```

- `data-line` is the speed and direction of a line (negative: right to left). Both lines in the ink: a grey second line reads as the "one word in another colour" default (`r-journey__line--soft` exists for a quieter line under a busy track, used with a reason). Captions are facts, one line each.
- The section's height is set from the track, so the pass ends with the last photograph.
- Under reduced motion it becomes a swipeable row.

## carousel: a row that snaps

Products, rooms, dishes, work. Arrows with a live "1 / 4" count, drag with the mouse, arrow keys, native swipe;
buttons disable at the ends. Replaces lopsided horizontal-scroll rows and grids of identical cards.

```html
<div class="r-carousel" data-carousel aria-roledescription="carrusel" aria-labelledby="t">
  <div class="r-carousel__head">
    <h2 id="t" class="h-section craft-display">...</h2>
    <div class="r-carousel__nav"><button type="button" data-prev aria-label="Anterior"></button><span class="r-carousel__count" aria-live="polite">1 / 4</span><button type="button" data-next aria-label="Siguiente"></button></div>
  </div>
  <ul class="r-carousel__track" aria-label="...">
    <li class="r-carousel__slide"><figure><img src="..." alt="..." width="960" height="1200" loading="lazy"></figure><h3>...</h3><p>...</p></li>
  </ul>
</div>
```

`--ratio` on the slide sets the picture's ratio (4 / 5 by default).

## sequence: a real clip scrubbed by scroll

Frames of the client's own footage drawn as the reader scrolls (the Apple product-page technique), with steps that
light up in turn. For a process the client filmed: a pour, a roast, an assembly. Make the frames with
`node <skill>/scripts/media.mjs frames clip.mp4 --out assets/seq --fps 18 --width 1280` (it prints this markup).

```html
<section class="r-sequence" data-sequence="assets/seq/manifest.json" style="--seq-length: 320svh">
  <div class="r-sequence__stage"><img class="r-sequence__poster" src="assets/seq/f0001.webp" alt="..." width="1280" height="720"><canvas></canvas></div>
  <div class="r-sequence__steps"><p data-at="0">...</p><p data-at="0.45">...</p><p data-at="0.75">...</p></div>
</section>
```

Keep it under about 6 MB of frames: fewer frames per second, a narrower width or a shorter window.

## product3d: the client's product in 3D

A stand-up bag (a coffee bag, a sachet, a pack): a boxy body with soft edges, side gussets folded in, a crimped heat
seal on top and a flat bottom, printed with the product's own front and back artwork, lit by a small studio, leaning
toward the pointer. It turns with the scroll of its section, or travels a pinned stage chapter by chapter (journey3d,
below). The print decides how it looks: the client's file, or a straight-on crop of their sharpest photograph. Two
photographs of the same pack can be joined (feature matching and a homography, then one feathered seam) when neither
shows all of it; take the reflections and the background out, and say in the report which photographs it came from.

```html
<div class="r-product" data-product3d data-front="assets/img/bag-front.webp" data-size="1 2.3 0.5" data-valve="0.44 0.19" data-finish="gloss" style="--ratio: 4 / 5">
  <img src="assets/img/bag-front.webp" alt="..." width="955" height="2240">
</div>
```

- `data-size` is width, height and depth (a tall coffee bag is about `1 2.3 0.5`); `data-spin` the turn per pass
  (0.24 keeps the front in view), `data-from` the starting angle.
- `data-valve="u v"` puts a degassing valve where the bag has one (u across, v from the top); leave it out when the
  front has none. `data-finish`: `matte` (paper), `gloss` (film), `foil` (metallised).
- It needs three.js. Plain HTML: `<script type="importmap">{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js" } }</script>`.
  A bundled project: `npm i three` and `init(document, { libs: { three: () => import('three') } })`.
- Without WebGL or three.js the image stays.

## journey3d: the product travels while its story passes beside it

A pinned stage holds the product in 3D; as the visitor scrolls, chapters of its story pass on alternate sides and the
product moves to the other side, turning to show its gussets, one full turn before the last chapter. Use it for the
one product a page is about (the bag of the house, the edition with the club's crest), with four or five chapters of
real facts: its origin, its history, what is in it, where to get it. On a phone the product stays under the bar,
swaying toward each chapter's side, and the words rise over its foot on the section's ground. Under reduced motion
the stage is not pinned and the chapters read in order.

```html
<section class="r-journey3d" id="leopardo" data-ground="#22392B" data-ink="#F1E9DC" aria-labelledby="bag-title">
  <div class="r-journey3d__stage">
    <div class="r-product" data-product3d data-front="assets/img/bag-front.webp" data-size="1 2.3 0.5" data-finish="gloss"
         data-path="0 0.02 -0.02; 0.5 0 0.1; -0.5 0 -0.12; 0.5 0 0.08; -0.5 0 1.02">
      <img src="assets/img/bag-front.webp" alt="..." width="955" height="2240">
    </div>
  </div>
  <div class="r-journey3d__chapters">
    <div class="r-journey3d__chapter" data-side="intro"><div><h2 id="bag-title">…</h2><p>…</p></div></div>
    <article class="r-journey3d__chapter" data-side="left"><div><h3><span class="r-journey3d__when">1730</span>Colombia</h3><p>…</p></div></article>
    <article class="r-journey3d__chapter" data-side="right">…</article>
  </div>
</section>
```

- `data-path` has one pose per chapter, `x y turn`: x and y in half-widths and half-heights of the stage (0.5 is a
  quarter of the screen to the right), the turn in turns. Put the words on the other side from the product.
- `data-path-narrow` sets the phone poses when the default (under the bar, swaying) does not fit.

## map: a real map, never a drawn one

The place on OpenStreetMap vector tiles from OpenFreeMap (free, no key, no limits) through MapLibre GL 5, with a pin
on the door, cooperative gestures (it never traps the page's scroll) and the credit visible. The address and a
directions link stay inside it as the fallback.

```html
<div class="r-map" data-map data-lat="4.5981" data-lng="-74.0760" data-zoom="16.4" data-label="Riomar">
  <p>Panadería Riomar, Calle 10 #4-21, Bogotá.</p>
</div>
```

- Plain HTML: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.1/dist/maplibre-gl.css">`
  and `<script src="https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.1/dist/maplibre-gl.js" defer></script>`. A bundled
  project: `npm i maplibre-gl@5`, import its CSS, `init(document, { libs: { maplibre: () => import('maplibre-gl') } })`.
- `data-style`: positron (light, the default on a light ground), dark (the default on a dark ground), bright,
  liberty, fiord. Coordinates: from the client's Google Maps link.
- Credit in the footer: "Mapa: OpenFreeMap, © OpenMapTiles, datos de © colaboradores de OpenStreetMap".

## spec: facts as a quiet list

Hours, address, editions, sizes, what is included: a two-column list instead of cards or a big number.

```html
<dl class="r-spec">
  <div><dt>Horario</dt><dd>Todos los días, 8:00 a 20:00</dd></div>
  <div><dt>Teléfono</dt><dd><a href="tel:+576015550142">601 555 0142</a></dd></div>
</dl>
```

## The pause control

Anything that moves on its own for more than five seconds (a loop, a band) keeps a way to pause it (WCAG 2.2.2). The
kit draws `data-loop-toggle` and `data-marquee-toggle` as a small round icon in the corner of what they control; the
label is for screen readers only:

```html
<button type="button" data-loop-toggle aria-pressed="false"><span class="craft-sr">Pausar el video</span></button>
```

## Type effects

The kit's set pieces (`references/set-pieces.md`) remain for type: a statement that zooms, words that swap, a mask
reveal. Use one only where the words are the moment; never as a default on every section.
