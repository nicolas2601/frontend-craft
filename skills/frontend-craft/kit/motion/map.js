// A real map, never a drawn one: data-map shows the place on OpenStreetMap vector tiles from OpenFreeMap (free, no
// key, no request limits; credit "OpenFreeMap, OpenMapTiles, OpenStreetMap" stays visible) through MapLibre GL.
// Needs MapLibre GL 5: in a bundled project `npm i maplibre-gl@5`, import 'maplibre-gl/dist/maplibre-gl.css' once
// and pass init(document, { libs: { maplibre: () => import('maplibre-gl') } }); in plain HTML its script and
// stylesheet from the CDN (references/recipes.md). Version 6 is ESM-only and its worker cannot load cross-origin.
// Without it, or without WebGL, the element's own children (an address and a directions link) stay.
//   data-lat, data-lng (required), data-zoom="16", data-style="positron|bright|liberty|dark|fiord" (default from
//   the page ground: dark grounds get "dark"), data-label="Panadería Riomar"
const STYLES = new Set(['positron', 'bright', 'liberty', 'dark', 'fiord']);
const STYLE_URL = 'https://tiles.openfreemap.org/styles/';

function isDarkGround(el) {
  const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
  let node = el;
  let rgb = m;
  while ((!rgb || Number(rgb[3] ?? 1) === 0) && node.parentElement) {
    node = node.parentElement;
    rgb = getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
  }
  if (!rgb) return false;
  const [r, g, b] = rgb.slice(0, 3).map(Number);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 110;
}

const MAPLIBRE_SPEC = 'maplibre-gl';

async function maplibre(ctx) {
  if (ctx.libs.maplibre) { const mod = await ctx.libs.maplibre(); return mod.default ?? mod; }
  if (window.maplibregl) return window.maplibregl;
  const mod = await import(/* @vite-ignore */ MAPLIBRE_SPEC); // an import map names it in plain HTML
  return mod.default ?? mod;
}

export function map(el, ctx) {
  const lat = Number.parseFloat(el.dataset.lat);
  const lng = Number.parseFloat(el.dataset.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('data-map needs data-lat and data-lng');
  let alive = true;
  let instance = null;
  const start = async () => {
    const gl = await maplibre(ctx);
    if (!alive) return;
    const chosen = STYLES.has(el.dataset.style) ? el.dataset.style : isDarkGround(el) ? 'dark' : 'positron';
    const holder = document.createElement('div');
    holder.className = 'r-map__canvas';
    el.prepend(holder);
    instance = new gl.Map({
      container: holder,
      style: STYLE_URL + chosen,
      center: [lng, lat],
      zoom: Number.parseFloat(el.dataset.zoom ?? '16'),
      pitch: ctx.reduced ? 0 : Number.parseFloat(el.dataset.pitch ?? '0'),
      cooperativeGestures: true,
      attributionControl: { compact: true },
      fadeDuration: ctx.reduced ? 0 : 300,
    });
    instance.addControl(new gl.NavigationControl({ showCompass: false }), 'top-right');
    const pin = document.createElement('div');
    pin.className = 'r-map__pin';
    pin.innerHTML = `<span class="r-map__dot"></span>${el.dataset.label ? `<span class="r-map__label"></span>` : ''}`;
    if (el.dataset.label) pin.querySelector('.r-map__label').textContent = el.dataset.label;
    // MapLibre makes a marker without a role a "button"; this pin does nothing when pressed, so it is a picture.
    pin.setAttribute('role', 'img');
    pin.setAttribute('aria-label', el.dataset.label || 'Location');
    new gl.Marker({ element: pin, anchor: 'left', offset: [-9, 0] }).setLngLat([lng, lat]).addTo(instance);
    instance.once('load', () => {
      el.setAttribute('data-map-on', '');
      // The credit stays one tap away (and in the footer), never a panel over the map on a phone.
      el.querySelector('.maplibregl-ctrl-attrib.maplibregl-compact-show')?.classList.remove('maplibregl-compact-show');
    });
  };
  ctx.once(el, () => {
    start().catch((err) => { el.setAttribute('data-map-off', ''); console.warn('[craft] data-map stays an address:', err?.message ?? err); });
  }, { margin: '50% 0px' });
  return () => { alive = false; instance?.remove(); el.querySelector('.r-map__canvas')?.remove(); el.removeAttribute('data-map-on'); };
}
