// Library parts: candidates for each part of a page from three libraries (21st.dev's community components through
// its CLI, cult-ui's shadcn registry, React Bits' curated pieces), and the log of what was searched and taken.
// Pure: the CLI (scripts/components.mjs) does the I/O. The check reads the log so a page cannot skip the search.

export const MIN_JOBS = 3;
export const LIBRARY_KINDS = ['landing', 'site', 'product', 'portfolio', 'event', 'venue', 'brand', 'campaign', 'app'];

/** Glow, gradient, shader and cursor decoration: listed last and marked, never offered as the answer to a job. */
const DECORATION = /\b(aurora|particles?|galaxy|hyperspeed|orbs?|silk|iridescen\w*|liquid[- ]?(chrome|metal)|plasma|beams?|lightning|dark[- ]?veil|ballpit|splash[- ]?cursor|blob\w*|ghost[- ]?cursor|target[- ]?cursor|click[- ]?spark|gradient|shiny|glow\w*|neon|shaders?|cosmic|meteors?|sparkles?|magnetic|fractal|halo|warp|distorted)\b/i;
const CULT_REFUSED = /^(gradient-heading|border-beam.*|cosmic-button|bg-animated-.*|canvas-fractal-grid|hero-liquid-metal|ai-blob-warp|merging-bubbles|shader-lens-blur|distorted-glass|metal-button|halo-.*)$/;
const STOP = new Set(['the', 'and', 'with', 'for', 'that', 'this', 'from', 'into', 'your', 'una', 'del', 'los', 'las', 'con', 'para', 'por', 'que']);

export function tokens(s) {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t))
    .map((t) => (t.length > 5 ? t.replace(/(ings?|ed|es|s)$/, '') : t));
}

/** Share of the job's words found in the text (0-1). */
export function score(job, text) {
  const q = [...new Set(tokens(job))];
  if (!q.length) return 0;
  const t = new Set(tokens(text));
  const near = (w) => [...t].some((x) => Math.min(x.length, w.length) >= 5 && (x.startsWith(w) || w.startsWith(x)));
  return q.filter((w) => t.has(w) || near(w)).length / q.length;
}

/** A library piece must share about a third of the job's words to be offered. */
export const MIN_SCORE = 0.3;

export const isDecoration = (c) => DECORATION.test(`${c.name} ${c.id} ${c.why ?? ''}`);

function ranked(list, job, limit, extra = () => 0) {
  return list.map((c) => ({ ...c, score: score(job, `${c.name} ${c.why}`) + extra(c) }))
    .filter((c) => c.score >= MIN_SCORE)
    .sort((a, b) => Number(isDecoration(a)) - Number(isDecoration(b)) || b.score - a.score)
    .slice(0, limit)
    .map((c) => ({ ...c, decoration: isDecoration(c) }));
}

/** React Bits: the curated catalogue (library/components.json); a piece that fits the direction ranks first. */
export function matchReactBits(catalogue, job, { direction = null, limit = 4 } = {}) {
  const list = (catalogue?.components ?? []).map((c) => ({
    source: 'react-bits', id: c.id, name: c.id, why: `${c.job}. ${c.description ?? ''}`.trim(),
    page: c.add.jsCss,
    install: `npx shadcn@latest add ${c.add.tsTailwind}`, fits: c.fits ?? [],
  }));
  return ranked(list, job, limit, (c) => (direction && c.fits.includes(direction) ? 0.25 : 0));
}

/** cult-ui: its shadcn registry index (registry.json); demos and the refused decoration are left out. */
export function matchCult(registry, job, { limit = 4 } = {}) {
  const list = (registry?.items ?? [])
    .filter((i) => i?.name && !/-demo$/.test(i.name) && !CULT_REFUSED.test(i.name))
    .map((i) => ({ source: 'cult-ui', id: i.name, name: i.title || i.name, why: i.description ?? '', page: `https://www.cult-ui.com/docs/components/${i.name}`, install: `npx shadcn@latest add https://www.cult-ui.com/r/${i.name}.json` }));
  return ranked(list, job, limit);
}

/** 21st.dev: the JSON of `21st search --type c --json`. Its own ranking is kept; decoration goes last. */
export function parse21st(json, { limit = 5 } = {}) {
  const list = (Array.isArray(json) ? json : json?.results ?? []).filter((x) => (x.type ?? 'component') === 'component')
    .map((x) => ({ source: '21st', id: String(x.id), name: x.name, why: x.description ?? '', page: x.url, preview: x.previewUrl, video: x.videoUrl, author: x.author, install: scrubKey(x.installCommand ?? '') }));
  return list.map((c) => ({ ...c, decoration: isDecoration(c) }))
    .sort((a, b) => Number(a.decoration) - Number(b.decoration)).slice(0, limit);
}

/** Never let a key reach a file or the terminal: an api_key value becomes the variable it came from. */
export function scrubKey(text) {
  return String(text).replace(/(api_key=)(?!\$API_KEY_21ST)[^"'&\s\\]+/gi, '$1$API_KEY_21ST').replace(/(API_KEY_21ST["']?\s*[=:]\s*["']?)(?![$<])[^"'\s,}\\]+/g, '$1<redacted>');
}

export function parseRef(ref) {
  const m = /^(21st|cult-ui|react-bits):(.+)$/.exec(String(ref ?? '').trim());
  return m ? { source: m[1], id: m[2] } : null;
}

export const emptyLog = () => ({ searches: [], picks: [] });

export function addSearch(log, { job, section = null, at, results = [], notes = [] }) {
  const base = log ?? emptyLog();
  return { ...base, searches: [...base.searches, { job, section, at, notes, results: results.map((r) => ({ ref: `${r.source}:${r.id}`, name: r.name, decoration: !!r.decoration })) }] };
}

export function addPick(log, { section, ref, name, why, at, file = null }) {
  const base = log ?? emptyLog();
  return { ...base, picks: [...base.picks.filter((p) => !(p.section === section && p.ref === ref)), { section, ref, name, why, at, file }] };
}

export const searchedJobs = (log) => new Set((log?.searches ?? []).map((s) => String(s.job).trim().toLowerCase())).size;

const finding = (level, id, msg, fix) => ({ level, id, msg, fix });

/** The check's view: a website or app built from a deal must have searched the libraries for its parts before
 * hand-building them, and built the dealt piece into its source. `parts` comes from source-scan.mjs loadParts: the
 * log, the dealt component's id and the first source file that names it (null: none). Passed only with a deal. */
export function partsRules({ kind, parts }) {
  if (!parts || !LIBRARY_KINDS.includes(kind)) return [];
  const out = [];
  if (parts.component && parts.componentIn === null) {
    out.push(finding('FAIL', 'deal-component-unused', `the dealt component ${parts.component} appears in none of the project's source files`,
      `build it into the page (npx shadcn add, or port its source and keep a credit comment naming ${parts.component}); a different library piece only with the reason under # Components`));
  }
  const jobs = searchedJobs(parts);
  if (jobs < MIN_JOBS) {
    out.push(finding('WARN', 'parts-unsearched', `${jobs} part(s) of the page were looked up in the component libraries; at least ${MIN_JOBS} (the nav, a gallery, a booking or order form, a menu or price list, a map, an FAQ...)`,
      'before you hand-build a part, run node <skill>/scripts/components.mjs search "<its job>" --section <id> (21st.dev, cult-ui, React Bits), open the candidates and take the best with components.mjs pick'));
  } else if (!(parts.picks ?? []).length) {
    out.push(finding('WARN', 'parts-none-taken', `${jobs} parts searched, none taken`, 'take the candidates that fit with components.mjs pick, or say under # Components in .craft/concept.md why each one was refused'));
  }
  return out;
}
