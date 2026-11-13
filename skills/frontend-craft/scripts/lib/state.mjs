// The project's .craft/ folder: deal, brief, gate state and screenshots.
import fs from 'node:fs';
import path from 'node:path';

export const DIR = '.craft';

export function craftDir(cwd = process.cwd()) {
  return path.join(cwd, DIR);
}

export function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

/** Parse --flag value / --flag=value / --bool into an object. */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const [key, inline] = a.slice(2).split(/=(.*)/s);
    if (inline !== undefined) out[key] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[key] = argv[++i];
    else out[key] = true;
  }
  return out;
}

/** Resolve what to check: --url, --root (a built folder) or --file (an html file). */
export function resolveTarget(args, gate) {
  if (args.url) return { url: String(args.url) };
  if (args.root && args.file) {
    const root = path.resolve(String(args.root));
    return { root, page: path.relative(root, path.resolve(String(args.file))).split(path.sep).join('/') };
  }
  if (args.root) return { root: path.resolve(String(args.root)) };
  if (args.file) {
    const file = path.resolve(String(args.file));
    return { root: path.dirname(file), page: path.basename(file) };
  }
  if (gate?.target) return gate.target;
  return null;
}
