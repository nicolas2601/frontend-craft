#!/usr/bin/env node
// Structural checks for every skill in skills/: frontmatter, budgets, links and data that must match the library.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KINDS, loadLibrary, moodsOf } from '../skills/frontend-craft/scripts/lib/deal.mjs';
import { checkAll, readManifest } from './vendor.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = path.join(ROOT, 'skills');
const OWN = ['frontend-craft', 'craft-motion', 'craft-review', 'craft-learn', 'hf-asset-generate'];
const OWN_PACKS = ['svg-craft'];
const BODY_WORDS = { 'frontend-craft': 1900, default: 900 };
const ALLOWED_KEYS = new Set(['name', 'description', 'hooks', 'license', 'metadata', 'allowed-tools']);
const errors = [];
const fail = (skill, msg) => errors.push(`${skill}: ${msg}`);

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const keys = [...m[1].matchAll(/^([a-z-]+):/gm)].map((x) => x[1]);
  const name = m[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  const folded = m[1].match(/^description:\s*>-?\n((?:\s{2,}.+\n?)+)/m);
  const inline = m[1].match(/^description:\s*(?!>)(.+)$/m);
  const description = (folded ? folded[1].replace(/\s+/g, ' ') : inline?.[1] ?? '').trim();
  return { keys, name, description, body: m[2] };
}

function checkSkill(name) {
  const dir = path.join(SKILLS, name);
  const file = path.join(dir, 'SKILL.md');
  if (!fs.existsSync(file)) return fail(name, 'missing SKILL.md');
  const text = fs.readFileSync(file, 'utf8');
  const fm = frontmatter(text);
  if (!fm) return fail(name, 'no YAML frontmatter');
  if (fm.name !== name) fail(name, `name "${fm.name}" does not match the folder`);
  if (!/^[a-z0-9-]{1,64}$/.test(fm.name ?? '')) fail(name, 'name must be lowercase letters, digits and hyphens, at most 64');
  if (fm.description.length < 120 || fm.description.length > 1024) fail(name, `description is ${fm.description.length} chars (120-1024)`);
  if (!/\bUse (when|whenever)\b/.test(fm.description)) fail(name, 'description must say when to use it ("Use when ...")');
  for (const k of fm.keys) if (!ALLOWED_KEYS.has(k)) fail(name, `unexpected frontmatter key "${k}"`);
  const words = fm.body.split(/\s+/).filter(Boolean).length;
  const budget = BODY_WORDS[name] ?? BODY_WORDS.default;
  if (words > budget) fail(name, `body has ${words} words (budget ${budget})`);
  if (fs.existsSync(path.join(dir, 'README.md'))) fail(name, 'a skill folder must not carry a README.md');
  if (!fs.existsSync(path.join(dir, 'agents', 'openai.yaml'))) fail(name, 'missing agents/openai.yaml');
  for (const [, link] of text.matchAll(/`((?:references|scripts|kit|library)\/[\w./-]+)`/g)) {
    if (!fs.existsSync(path.join(dir, link))) fail(name, `points at ${link}, which does not exist`);
  }
  if (/\bNico\b|\bagencia\b/i.test(text)) fail(name, 'personal names or internal terms in a public skill');
  return words;
}

function checkVocabulary() {
  const text = fs.readFileSync(path.join(SKILLS, 'frontend-craft', 'SKILL.md'), 'utf8');
  const lib = loadLibrary();
  const moodLine = text.match(/Moods: ([a-z, ]+)\./)?.[1].split(',').map((s) => s.trim()) ?? [];
  const kindLine = text.match(/Kinds: ([a-z, ]+)\./)?.[1].split(',').map((s) => s.trim()) ?? [];
  const moods = moodsOf(lib);
  if (moodLine.join() !== moods.join()) fail('frontend-craft', `mood list in SKILL.md differs from the library: ${moods.join(', ')}`);
  if (kindLine.join() !== KINDS.join()) fail('frontend-craft', `kind list in SKILL.md differs from deal.mjs: ${KINDS.join(', ')}`);
}

/** Bundled skills: unchanged from their pinned upstream, licensed, and nothing in skills/ unaccounted for. */
function checkBundled() {
  const vendor = readManifest();
  for (const problem of checkAll(vendor)) fail('vendor', problem);
  const known = new Set([...OWN, ...OWN_PACKS, ...vendor.skills.map((s) => s.name)]);
  for (const entry of fs.readdirSync(SKILLS, { withFileTypes: true })) {
    if (entry.isDirectory() && !known.has(entry.name)) fail(entry.name, 'not an own skill and not listed in vendor.json');
  }
  for (const { name, repo } of vendor.skills) {
    if (!vendor.repos[repo]?.license) fail(name, `no license recorded for ${repo}`);
    if (!fs.readdirSync(path.join(SKILLS, name)).some((f) => /^(LICENSE|NOTICE)/.test(f))) fail(name, 'bundled without its license file');
  }
  return vendor.skills.length;
}

const report = OWN.map((s) => `${s}: ${checkSkill(s) ?? '?'} words`);
checkVocabulary();
const bundled = checkBundled();
if (errors.length) {
  console.error(errors.map((e) => `FAIL ${e}`).join('\n'));
  process.exit(1);
}
console.log(`verify: ${OWN.length} own skills OK, ${bundled} bundled skills match vendor.json\n${report.join('\n')}`);
