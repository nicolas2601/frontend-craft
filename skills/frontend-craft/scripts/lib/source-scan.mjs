// Does the project's own source use a name? Used to tell a library piece that was built into the page from one that
// was only written into the concept. Walks the project folder, skipping dependencies, builds and the kit.
import fs from 'node:fs';
import path from 'node:path';

const SOURCE = /\.(html?|[cm]?[jt]sx?|vue|svelte|astro|css)$/i;
const SKIP = new Set(['node_modules', '.git', '.craft', 'dist', 'build', 'out', '.next', '.astro', '.svelte-kit', '.vercel', '.taste-skill', 'coverage']);
const MAX_FILES = 3000;
const MAX_BYTES = 600_000;

/** The first source file (relative path) under root that contains `name` as a word, or null. Never throws. */
export function findInSource(root, name, { kitDir = null } = {}) {
  if (!root || !name) return null;
  const word = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  const kit = kitDir ? path.resolve(root, kitDir) : null;
  const stack = [path.resolve(root)];
  let seen = 0;
  while (stack.length && seen < MAX_FILES) {
    const dir = stack.pop();
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!SKIP.has(e.name) && full !== kit) stack.push(full);
      } else if (SOURCE.test(e.name)) {
        seen += 1;
        try {
          if (fs.statSync(full).size <= MAX_BYTES && word.test(fs.readFileSync(full, 'utf8'))) return path.relative(root, full);
        } catch { /* unreadable: skip */ }
      }
    }
  }
  return null;
}

/** What the check needs about the project's library parts: the search log and whether the dealt piece is in the source. */
export function loadParts(projectDir, deal, readJson) {
  if (!deal) return null;
  const log = readJson(path.join(projectDir, '.craft', 'components.json'), { searches: [], picks: [] });
  const id = deal.motion?.component?.id;
  return { ...log, component: id ?? null, componentIn: id ? findInSource(projectDir, id, { kitDir: deal.kitDir }) : null };
}
