# Set pieces

Scroll scenes from `kit/set-pieces.css`, driven by the kit's `data-scrub` (it writes `--p`, 0 to 1, on its element, reaching 1 when the element's centre is at 40% of the screen; the CSS reads it as `--q`). Your own scroll drawing (a route, a line, a count) uses `--p` too, never the whole pass: the check fails motion still running as its element leaves (`scrub-late`). Every piece shows its finished state without JavaScript and under reduced motion, and moves only transform, opacity, clip-path and filter. Load `set-pieces.css` after `craft.css` and `layouts.css`.

A pinned piece (`data-pin` on the section, `data-scrub="pinned"` inside) holds the screen for `--pin-length` (default 260svh; 180 to 240svh is enough for most). Use at most one pinned scene per screen and two pinned scenes per page. Replace the sample words and pictures with the subject's own.

## iris

The next section's ground opens through a circle. Put it where the page changes ground (bg to ink or accent).

```html
<section class="sp-iris" data-pin style="--pin-length: 200svh">
  <div>
    <div class="sp-iris__open" data-scrub="pinned" style="--sp-ground: var(--c-accent); --sp-on: var(--c-accent-ink)">
      <h2 class="craft-display">Roasted on Thursdays, gone by Sunday</h2>
      <p>One line that says what happens here.</p>
    </div>
  </div>
</section>
```

## type-pass

One line set huge crosses the screen as the reader scrolls. The line is decorative (`aria-hidden`); the section keeps a real heading. Add `sp-type-pass__line--back` to a second line to run it the other way.

```html
<section class="sp-type-pass" data-scrub>
  <p class="sp-type-pass__line" aria-hidden="true">Mesa de los Santos · 1,600 m</p>
  <h2>Where the beans grow</h2>
  <p>…</p>
</section>
```

## zoom

A full-bleed photograph opens from an inset, rounded frame and settles from a close crop. Give the figure the full width of the page (outside the gutter).

```html
<figure class="sp-zoom" data-scrub>
  <img src="assets/bar.webp" alt="Espresso running into a small cup at the bar" width="2400" height="1600">
</figure>
```

## curtain

A photograph parts in two and uncovers the words under it. Both halves are the same picture; the second one has an empty alt.

```html
<section class="sp-curtain" data-pin style="--pin-length: 200svh">
  <div class="sp-curtain__stage" data-scrub="pinned">
    <div class="sp-curtain__under">
      <h2 class="craft-display">Open at seven</h2>
      <p>…</p>
    </div>
    <img class="sp-curtain__half sp-curtain__half--l" src="assets/door.webp" alt="The shop's door at dawn" width="2400" height="1600">
    <img class="sp-curtain__half sp-curtain__half--r" src="assets/door.webp" alt="" width="2400" height="1600">
  </div>
</section>
```

## fan

A pile of photographs fans out into a spread around a short heading. Set each card's end position with `--x`, `--y` (percent of its own size) and `--r`. Below 640 px it becomes a two-column grid.

```html
<section class="sp-fan" data-pin style="--pin-length: 220svh">
  <div class="sp-fan__stage" data-scrub="pinned">
    <h2 class="craft-display">Four origins this month</h2>
    <img class="sp-fan__card" style="--x: -125%; --y: -20%; --r: -10deg" src="assets/a.webp" alt="…" width="800" height="1000">
    <img class="sp-fan__card" style="--x: 120%; --y: -28%; --r: 8deg" src="assets/b.webp" alt="…" width="800" height="1000">
    <img class="sp-fan__card" style="--x: -95%; --y: 45%; --r: 6deg" src="assets/c.webp" alt="…" width="800" height="1000">
    <img class="sp-fan__card" style="--x: 105%; --y: 50%; --r: -7deg" src="assets/d.webp" alt="…" width="800" height="1000">
  </div>
</section>
```

## letters

A heading assembles from scattered letters. One span per character (spaces included), the real text in `aria-label`. Put `sp-letters-host` on the section so scattered letters never widen the page. In React: `{[...text].map((c, i) => <span key={i} aria-hidden="true">{c}</span>)}`.

```html
<section class="sp-letters-host">
  <h2 class="sp-letters craft-display" data-scrub aria-label="Tostado aquí">
    <span aria-hidden="true">T</span><span aria-hidden="true">o</span><span aria-hidden="true">s</span>…
  </h2>
</section>
```

## develop

A photograph comes up from grey and soft to full colour, like a print in a tray.

```html
<figure class="sp-develop" data-scrub>
  <img src="assets/beans.webp" alt="Green beans in a cupped hand" width="1600" height="1200">
</figure>
```

## tilt

A picture or panel rises from a tilted plane into place.

```html
<div class="sp-tilt" data-scrub>
  <img src="assets/menu.webp" alt="The chalkboard menu" width="1600" height="1100">
</div>
```

## split

One half holds still (the words, or one photograph) while the other half scrolls past it. Below 760 px the halves stack.

```html
<section class="sp-split">
  <div class="sp-split__still">
    <h2 class="craft-display">From cherry to cup</h2>
    <p>…</p>
  </div>
  <div class="sp-split__flow">
    <img src="assets/1.webp" alt="…" width="1200" height="900" data-parallax="0.08">
    <img src="assets/2.webp" alt="…" width="1200" height="900">
    <img src="assets/3.webp" alt="…" width="1200" height="900" data-parallax="0.08">
  </div>
</section>
```

## word-track

One long line of huge words crosses the screen as the reader scrolls. Use it as the opening statement of a page, under a real heading. The line is decorative (`aria-hidden`); the heading carries the meaning. Without JavaScript, or under reduced motion, the words wrap and stay on the screen.

```html
<section class="sp-word-track" data-pin style="--pin-length: 240svh">
  <div class="sp-word-track__stage" data-scrub="pinned">
    <h2>Tostado, molido, servido</h2>
    <p class="sp-word-track__line" aria-hidden="true">Masa madre · Horneado · Vitrina · Mesa · Masa madre · Horneado · </p>
  </div>
</section>
```

## word-swap

A sentence whose one slot changes word as the reader scrolls. Set `--n` on the sentence (the number of options) and `--i` on each option (from 0). The full sentence is in a screen-reader-only span; the visible parts are `aria-hidden`. Without JavaScript only the last option shows.

```html
<p class="sp-word-swap" data-scrub style="--n: 3">
  <span class="sp-word-swap__sr">Pan para el desayuno, para compartir o para el domingo.</span>
  <span aria-hidden="true">Pan para </span><span class="sp-word-swap__slot" aria-hidden="true"><span style="--i: 0">el desayuno</span><span style="--i: 1">compartir</span><span style="--i: 2">el domingo</span></span>.
</p>
```

## type-zoom

One short word fills the screen, zooms through and fades out, uncovering the section's content. Aim the zoom at a letter's counter with `--zoom-x` and `--zoom-y` on the stage. Without JavaScript the word is gone and the content is readable.

```html
<section class="sp-type-zoom" data-pin style="--pin-length: 220svh">
  <div class="sp-type-zoom__stage" data-scrub="pinned" style="--zoom-x: 38%; --zoom-y: 46%">
    <div class="sp-type-zoom__content">
      <h2 class="craft-display">Cuarenta horas de fermento</h2>
      <p>Cada hogaza empieza el martes y sale del horno el jueves.</p>
    </div>
    <p class="sp-type-zoom__word" aria-hidden="true">Pan</p>
  </div>
</section>
```

## word-mask

A heading whose lines rise out of their own masks, one after another, as it comes into view. Set `--i` on each line (from 0). A heading can have up to nine lines at the default `--stagger: 0.08`; set a smaller `--stagger` on the heading for longer ones. The heading keeps `aria-label` because its lines are split.

```html
<h2 class="sp-word-mask craft-display" data-scrub aria-label="Lo que sale del horno hoy">
  <span class="sp-word-mask__line" style="--i: 0" aria-hidden="true"><span>Lo que sale</span></span>
  <span class="sp-word-mask__line" style="--i: 1" aria-hidden="true"><span>del horno hoy</span></span>
</h2>
```

## bento-assemble

The tiles of a bento scatter and settle into the grid with the scroll. Each tile is a `sp-bento-assemble__tile` with one size modifier (`__lead` 8 by 2, `__tall` 4 by 2, `__wide` 7, `__small` 5). The scatter comes from the `:nth-child` rules, and tiles keep their content. Below 640 px the grid is one column and the scatter is reduced to a fifth of its distance.

```html
<div class="sp-bento-assemble" data-scrub>
  <article class="sp-bento-assemble__tile sp-bento-assemble__lead"><h3>Masa madre</h3><p>…</p></article>
  <article class="sp-bento-assemble__tile sp-bento-assemble__tall"><h3>Centeno</h3><p>…</p></article>
  <article class="sp-bento-assemble__tile sp-bento-assemble__wide"><h3>Croissant</h3><p>…</p></article>
  <article class="sp-bento-assemble__tile sp-bento-assemble__small"><h3>Café</h3><p>…</p></article>
</div>
```

## Rules

- Never put two kit effects on one element (`data-scrub` and `data-parallax` on the same node: the second one wins and the first stops). Nest them instead.
- `data-words`, `data-scroll-words` and the letters of `sp-letters` must hold static text, not state that re-renders.
- A pinned piece needs real content at its end state: the check fails text that stays invisible at every scroll position.
