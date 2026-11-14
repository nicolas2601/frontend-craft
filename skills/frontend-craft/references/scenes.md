# Hero scenes

A premium first screen usually carries one living object: a product turning in light, liquid metal, ink parting over a photograph, a field that answers the pointer. The kit draws four of them in plain WebGL (`kit/motion/scene.js`, shaders in `kit/motion/shaders.js`), in the page's own colours (`--c-accent`, `--c-ink`, `--c-bg`), with no library and nothing to download.

| Scene | What it is | Good for |
|---|---|---|
| `chrome` | Metaballs of liquid chrome that merge and drift; one follows the pointer. A dark studio with soft boxes and one accent strip reflects in them. | Products, tech, fashion, anything with a material surface |
| `iridescent` | A twisted ring with a thin-film colour that shifts with the angle of view; pearl, not rainbow. | Beauty, colour, wellness, glass and soft-pop directions |
| `ink` | The hero photograph printed in two inks (the darker and lighter of ink and ground); true colour opens around the pointer and the ink breathes. | Any subject with a strong photograph: food, places, craft, editorial |
| `dots` | A halftone field of dots that swells with noise and around the pointer, in ink with the accent near the pointer. | Data, developer tools, music, poster and swiss directions |

## Markup

```html
<!-- chrome, iridescent, dots: the canvas is drawn inside the element -->
<div class="craft-scene" data-scene="chrome" aria-hidden="true"></div>

<!-- ink: the img is the texture and the fallback; keep its alt -->
<div class="craft-scene" data-scene="ink">
  <img src="assets/hero.webp" alt="The bar at seven, before opening" width="1600" height="1000">
</div>
```

Load `surfaces.css` and call the kit's `init(document)`. Give `.craft-scene` a size (it has `min-height: 60svh`; set height or grid placement in your layout). An optional `img` inside chrome, iridescent or dots is a poster: shown without JavaScript and when WebGL is missing.

## Rules

- One scene per page, in the first screen (on a site: the home page). It is the signature image, so give it real room: half the first screen or more.
- Type sits beside it or on top of a calm part of it, on solid ground or a scrim; never body copy over the busy part.
- Real facts as HTML over the scene beat decorative labels: "214 g", "36 h of fermentation", "Since 1987".
- Use the photograph's own host for `ink` (same origin), or the texture cannot be read and the scene stays a poster.
- It pauses when off screen or in a hidden tab, renders one still frame under reduced motion, caps the pixel ratio at 1.5 and cleans up on `init` cleanup. Do not add your own rAF loop around it.
- Not a decorative background: no aurora, particle haze or glow orbs behind text. The scene is an object the page is about.

## When the brief deals a scene you cannot use

A scene is dealt with the direction. If the subject truly has no use for it (a legal firm and liquid chrome), re-deal with `--pin scene=<other>` from the direction's list and say why in the concept's `# Signature`.
