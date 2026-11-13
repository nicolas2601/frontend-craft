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
  const res = node([path.join(link, 'scripts', 'start.mjs'), '--kind', 'event', '--fallback', '--moods', 'music,festive', '--seed', '3'], project, { XDG_STATE_HOME: dir });
  assert.equal(res.status, 0, res.stderr);
  for (const f of ['.craft/deal.json', '.craft/brief.md', '.craft/gate.json', 'craft/tokens.css', 'craft/layouts.css', 'craft/blueprint.html', 'index.html']) {
    assert.ok(fs.existsSync(path.join(project, f)), f);
  }
  assert.match(fs.readFileSync(path.join(project, 'index.html'), 'utf8'), /href="craft\/layouts\.css"/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('start.mjs sends website kinds to design-taste-frontend and keeps app and docs', () => {
  const { dir, link } = linkedSkill();
  const project = path.join(dir, 'site');
  fs.mkdirSync(project);
  const site = node([path.join(link, 'scripts', 'start.mjs'), '--kind', 'landing', '--moods', 'warm,coffee'], project, { XDG_STATE_HOME: dir });
  assert.equal(site.status, 2);
  assert.match(site.stderr, /design-taste-frontend skill/);
  assert.match(site.stderr, /--fallback/);
  assert.ok(!fs.existsSync(path.join(project, '.craft', 'deal.json')), 'a refused website kind deals nothing');
  const app = node([path.join(link, 'scripts', 'start.mjs'), '--kind', 'app', '--moods', 'calm,precise', '--seed', '5'], project, { XDG_STATE_HOME: dir });
  assert.equal(app.status, 0, app.stderr);
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
