# Section recipes

Finished sections in the kit (`kit/motion/recipes.js`, `product3d.js`, `map.js`, styles in `kit/recipes.css`). Each
reads as a finished section without JavaScript and under reduced motion, runs only near the screen, and takes the
page's tokens. Choose one by the story the section tells; a page rarely needs more than three. Load
`<kit>/recipes.css` after the other kit stylesheets (the starter page does).

## dive: fly forward into the hero picture

The first screen is the subject's best photograph or loop at full bleed; scrolling flies the camera into it toward a
focal point while the words step aside, then dissolves into the next section. The moment for a place (into the
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
- After the kit nav it sits under the sticky bar on its own. `--next-ground` on the section sets the colour it
  dissolves into (the next section's ground).

## journey: a horizontal story while scrolling down

A pinned stage: a row of photographs passes from right to left while two lines of type cross in opposite directions.
For an origin story (farm to cup), a process, a route, a timeline. Five to eight photographs of the client's own.

```html
<section class="r-journey" data-journey aria-label="...">
  <div class="r-journey__stage">
    <p class="r-journey__line" data-line="-1">Del Cañón del Chicamocha</p>
    <ol class="r-journey__track">
      <li><figure><img src="..." alt="..." width="1044" height="1392" loading="lazy"><figcaption>One fact.</figcaption></figure></li>
    </ol>
    <p class="r-journey__line" data-line="1">a la Carrera 29</p>
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

A soft pillow pouch (a coffee bag, a sachet, a pack) printed with the product's own front and back artwork, lit by a
small studio, swaying with the scroll and leaning toward the pointer. It needs the straight-on artwork: the client's
print file, or a perspective-corrected crop of a sharp photograph (`magick in.jpg -distort Perspective '<4 corners>'`).
A blurry or tilted texture looks cheap: ask the client for the file.

```html
<div class="r-product" data-product3d data-front="assets/img/bag-front.jpg" data-back="assets/img/bag-back.jpg" data-size="1 1.62 0.34" style="--ratio: 4 / 5">
  <img src="assets/img/bag-front.jpg" alt="..." width="600" height="970">
</div>
```

- `data-size` is width, height and depth of the pack; `data-spin` the turn per pass (0.24 keeps the front in view),
  `data-from` the starting angle.
- It needs three.js. Plain HTML: `<script type="importmap">{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js" } }</script>`.
  A bundled project: `npm i three` and `init(document, { libs: { three: () => import('three') } })`.
- Without WebGL or three.js the image stays.

## map: a real map, never a drawn one

The place on OpenStreetMap vector tiles from OpenFreeMap (free, no key, no limits) through MapLibre GL 5, with a pin
on the door, cooperative gestures (it never traps the page's scroll) and the credit visible. The address and a
directions link stay inside it as the fallback.

```html
<div class="r-map" data-map data-lat="7.1203256" data-lng="-73.1133486" data-zoom="16.4" data-label="Agostino">
  <p>Agostino Coffee, Cra 29 #41-76, Sotomayor, Bucaramanga.</p>
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
  <div><dt>Teléfono</dt><dd><a href="tel:+573006613219">300 661 3219</a></dd></div>
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
