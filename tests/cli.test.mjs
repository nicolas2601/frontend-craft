// The scripts as agents call them: through a symlinked install, from arbitrary folders.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.join(ROOT, 'skills', 'frontend-craft');

function linkedSkill() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-link-'));
  const link = path.join(dir, 'frontend-craft');
  fs.symlinkSync(SKILL, link);
  return { dir, link };
}

const node = (args, cwd, env = {}) => spawnSync(process.execPath, args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } });

test('scripts run when called through a symlinked skill folder', () => {
  const { dir, link } = linkedSkill();
  const list = node([path.join(link, 'scripts', 'start.mjs'), '--list'], dir);
  assert.equal(list.status, 0, list.stderr);
  assert.match(list.stdout, /^kinds: landing/m);
  const gate = node([path.join(link, 'scripts', 'gate.mjs')], dir);
  assert.match(gate.stdout, /nothing armed/);
  const check = node([path.join(link, 'scripts', 'check.mjs')], dir);
  assert.equal(check.status, 2);
  assert.match(check.stderr, /nothing to check/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('start.mjs deals into a fresh folder and writes a page for plain HTML', () => {
  const { dir, link } = linkedSkill();
  const project = path.join(dir, 'site');
  fs.mkdirSync(project);
  const res = node([path.join(link, 'scripts', 'start.mjs'), '--kind', 'event', '--moods', 'music,festive', '--seed', '3'], project, { XDG_STATE_HOME: dir });
  assert.equal(res.status, 0, res.stderr);
  for (const f of ['.craft/deal.json', '.craft/brief.md', '.craft/gate.json', 'craft/tokens.css', 'craft/layouts.css', 'craft/blueprint.html', 'index.html']) {
    assert.ok(fs.existsSync(path.join(project, f)), f);
  }
  assert.match(fs.readFileSync(path.join(project, 'index.html'), 'utf8'), /href="craft\/layouts\.css"/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('start.mjs deals websites an art direction, set pieces, photographs and a concept step', () => {
  const { dir, link } = linkedSkill();
  const project = path.join(dir, 'site');
  fs.mkdirSync(project);
  const site = node([path.join(link, 'scripts', 'start.mjs'), '--kind', 'landing', '--moods', 'warm,coffee', '--risk', 'wild', '--seed', '11'], project, { XDG_STATE_HOME: dir });
  assert.equal(site.status, 0, site.stderr);
  const deal = JSON.parse(fs.readFileSync(path.join(project, '.craft', 'deal.json'), 'utf8'));
  assert.ok(deal.direction?.id, 'a direction is dealt');
  assert.equal(deal.motion.setPieces.length, 2);
  assert.ok(fs.existsSync(path.join(project, 'craft', 'set-pieces.css')), 'the set pieces ship with the kit');
  assert.match(site.stdout, new RegExp(`## Direction: ${deal.direction.id}`));
  assert.match(site.stdout, /\.craft\/concept\.md/);
  assert.match(site.stdout, /photos\.mjs search/);
  assert.match(site.stdout, /Set piece: \*\*/);
  const bad = node([path.join(link, 'scripts', 'start.mjs'), '--kind', 'landing', '--risk', 'reckless'], project, { XDG_STATE_HOME: dir });
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /unknown --risk/);
  const app = node([path.join(link, 'scripts', 'start.mjs'), '--kind', 'app', '--moods', 'calm,precise', '--seed', '5', '--redeal'], project, { XDG_STATE_HOME: dir });
  assert.equal(app.status, 0, app.stderr);
  assert.doesNotMatch(app.stdout, /## Direction:/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('start.mjs refuses to build inside the skill repository', () => {
  const inside = fs.mkdtempSync(path.join(ROOT, 'tmp-inside-'));
  const res = node([path.join(SKILL, 'scripts', 'start.mjs'), '--kind', 'landing'], inside);
  fs.rmSync(inside, { recursive: true, force: true });
  assert.equal(res.status, 2);
  assert.match(res.stderr, /inside the skill's own folder/);
});

test('the plugin hook points web-page prompts at frontend-craft and stays silent otherwise', () => {
  const hook = path.join(ROOT, 'hooks', 'route.mjs');
  const ask = (prompt) => spawnSync(process.execPath, [hook], { input: JSON.stringify({ prompt }), encoding: 'utf8' }).stdout;
  for (const p of ['haz una landing page para una cafetería', 'portfolio site for a photographer', 'landing for a server monitoring tool']) {
    assert.match(ask(p), /frontend-craft skill/, p);
  }
  for (const p of ['fix the failing migration', 'write a web scraper for prices']) assert.equal(ask(p), '', p);
});
