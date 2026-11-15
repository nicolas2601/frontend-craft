# Surfaces

Material utilities from `kit/surfaces.css`. Load it after `craft.css` and `layouts.css`. Each one has a fallback: glass goes solid without `backdrop-filter`, motion stops under `prefers-reduced-motion`, and view transitions turn off under reduced motion.

## glass

A translucent panel with a blur, a saturated backdrop and a 1px highlight edge. Use it over a photograph or a colour field, where the blur has something to act on.

```html
<section class="pad" style="position: relative; isolation: isolate">
  <img src="assets/hall.webp" alt="The roaster's hall at dusk" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:-1">
  <div class="craft-glass">
    <h2 class="craft-display">Horneamos de noche</h2>
    <p>Entramos a las once y el primer pan sale a las cinco.</p>
  </div>
</section>
```

Set `--glass-tint` (the panel's colour) and `--glass-blur` on a parent to change it. `craft-glass--strong` is a denser tint for body copy on a busy photograph.

- Use: a headline or a short line over a photograph, a map, a colour field with depth.
- Do not: put glass over a flat ground (there is nothing to blur, so it reads as a grey box), put body copy on weak glass, or stack glass on glass.

## bento

`craft-bento` adds the tile spans (`t-2x2`, `t-wide`, `t-tall`) and a press/hover feel on top of the kit's `.bento` grid. Use the same class list as `layouts.css`.

```html
<div class="bento craft-bento">
  <article class="dominant"><h3>Masa madre</h3><p>…</p></article>
  <article class="tall t-tall"><h3>Centeno</h3><p>…</p></article>
  <article class="wide t-wide"><h3>Croissant</h3><p>…</p></article>
</div>
```

Tiles lift 3px on hover (only with a fine pointer) with `200ms cubic-bezier(0.23, 1, 0.32, 1)`, and scale to 0.98 while pressed. Tiles that are links or buttons get the full feel; plain text tiles get the same lift, which is fine.

- Use: one page with several equal-weight facts or products.
- Do not: nest bento grids, or use a bento as the only navigation.

## riso

A two-ink print look for one photograph: the image goes grey, the accent colour multiplies over it, the accent sits a little off register, and a grain layer goes over the top. Put the class on a wrapper that holds only the image, so the overlay does not cover a caption.

```html
<div class="craft-riso">
  <img src="assets/bread.webp" alt="A loaf split open on a wooden board" width="1200" height="800">
</div>
```

Set `--riso-shift` (default 3px) for the misregistration. Keep the alt text: the treatment is visual only.

- Use: a photograph in an editorial or poster-like section, a single image as an accent.
- Do not: treat a photograph whose true colour is the sale (a place, a dish, a product); the deal never gives riso to those subjects and the check fails it (`photo-recoloured`).

## mono

`craft-mono` is a monospace block: pre-wrapped, scrollable sideways, on a surface. Add `craft-mono--term` for a terminal with a blinking caret. The caret uses `steps()` and stops under reduced motion.

```html
<div class="craft-mono craft-mono--term" role="status">
pedido 0412  masa madre 1 kg  horneado 06:10
</div>
```

- Use: receipts, logs, a status line, a spec sheet, a command.
- Do not: set running body copy in mono, or add the caret to decorative labels.

## view transitions

Multi-page sites (each page is its own document) get a cross-document transition from one rule, `@view-transition { navigation: auto; }`, which both pages must load. `surfaces.css` sets a root crossfade with a short slide (250ms out, 320ms in, ease-out) and a shared-element pattern.

On the page that leaves and on the page that arrives, give the shared element the same name:

```html
<figure class="vt-hero" style="--vt-name: hero">
  <img src="assets/hall.webp" alt="The roaster's hall at dusk">
</figure>
```

Each name must appear once per page. `::view-transition-group(hero)` sets the duration of that element (380ms). Under reduced motion every transition is turned off, so navigation is an instant swap.

This is cross-document (MPA) only. A single-page app (one document that swaps its content) must use `document.startViewTransition(() => update())` instead; the CSS `@view-transition` rule does nothing there.

## texture

A quiet material under a section's content, so a flat ground reads as made: `<section class="craft-texture" data-texture="paper">`. The layer sits behind the content, uses the section's own colours (`currentColor`, the palette), never moves, and stays at low opacity (`--texture-opacity`).

| `data-texture` | Fits | Wrong for |
|---|---|---|
| `paper` | heritage, print, craft, food on a light ground | glass UI, clinical, tech |
| `grain` | any flat or two-colour ground that looks digital | text-heavy reading sections at high opacity |
| `glow` | warm or modern brands; two of the palette's colours with grain | a third colour, glowing orbs, anything on a dark tech hero |
| `dots` | data, developer tools, science | heritage, hospitality, food |
| `grid` | architecture, engineering, precise subjects | warm hospitality, food |
| `fluted` | spa, wellness, calm luxury, behind a short statement | dense body text |

One texture per page at most, on one or two sections, never under the hero photograph. Check contrast after adding it. Other grounds from the "less flat" list (contour lines, halftone, dithered images, single-hue landscapes, cloud sky, pixel mosaics, ASCII) are built for a subject that has them (a map, a print shop, a game, a developer tool) with `svg-craft` or canvas, never as decoration; anything that moves needs a reduced-motion state.

## Rules

- Each material is one idea per surface: glass or riso, not both on one photo.
- Check contrast after adding a surface: the checker reads text colour against the real background.
- Do not add decorative WebGL or canvas backgrounds to a surface.
- Do not use a rotating circular text badge; the kit has no piece for one, and it is a cliché.
