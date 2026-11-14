import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { MAX_BLOCKS, decide } from '../skills/frontend-craft/scripts/gate.mjs';

const armed = { armed: true, kind: 'landing', target: { url: 'http://127.0.0.1:5173/' }, blocks: 0 };
const report = (fails) => async () => ({
  url: 'http://127.0.0.1:5173/', at: 'now',
  findings: fails.map((id) => ({ level: 'FAIL', id, msg: id, fix: 'fix it' })),
});

test('nothing armed or disarmed: allow', async () => {
  assert.equal((await decide({ state: null, check: report([]) })).allow, true);
  assert.equal((await decide({ state: { ...armed, off: true }, check: report(['x']) })).allow, true);
});

test('FAILs block with the list and count the block', async () => {
  const r = await decide({ state: armed, check: report(['overflow', 'console']) });
  assert.equal(r.allow, false);
  assert.match(r.reason, /2 FAIL/);
  assert.match(r.reason, /overflow/);
  assert.equal(r.state.blocks, 1);
});

test('a pass allows and records it', async () => {
  const r = await decide({ state: { ...armed, blocks: 2 }, check: report([]) });
  assert.equal(r.allow, true);
  assert.equal(r.state.passedAt, 'now');
});

test('never traps: block budget and repeated identical stops are let through', async () => {
  assert.equal((await decide({ state: { ...armed, blocks: MAX_BLOCKS }, check: report(['x']) })).allow, true);
  const stuck = { ...armed, blocks: 2, lastFails: 'console,overflow' };
  assert.equal((await decide({ state: stuck, stopHookActive: true, check: report(['overflow', 'console']) })).allow, true);
  assert.equal((await decide({ state: stuck, stopHookActive: true, check: report(['overflow']) })).allow, false);
});

test('no target or an unreachable server blocks once, then allows', async () => {
  const noTarget = await decide({ state: { ...armed, target: null }, check: report([]) });
  assert.equal(noTarget.allow, false);
  assert.equal((await decide({ state: noTarget.state, check: report([]) })).allow, true);
  const down = async () => { throw new Error('ECONNREFUSED'); };
  const first = await decide({ state: armed, check: down });
  assert.equal(first.allow, false);
  assert.equal((await decide({ state: first.state, check: down })).allow, true);
});

test('CLI and Stop hook pass the project concept to the checker', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-gate-concept-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const out = path.join(dir, '.craft');
  fs.mkdirSync(out);
  const concept = '# Idea\nSlow bread.\n# Signature\nSplit.\n# Rejected\nCards.';
  fs.writeFileSync(path.join(out, 'concept.md'), concept);
  const checker = `export async function runCheck(options) {
    if (options.concept !== ${JSON.stringify(concept)}) throw new Error('Project concept was not forwarded');
    return { findings: [], at: 'checked' };
  } export const formatReport = () => 'CONCEPT_OK';`;
  const preload = `import { registerHooks } from 'node:module';
    registerHooks({resolve(specifier, context, next) {
      if (specifier === './check.mjs') return {url: ${JSON.stringify('data:text/javascript,' + encodeURIComponent(checker))}, shortCircuit: true};
      return next(specifier, context);
    }});`;
  const gate = new URL('../skills/frontend-craft/scripts/gate.mjs', import.meta.url).pathname;
  for (const args of [[], ['--hook', 'claude']]) {
    fs.writeFileSync(path.join(out, 'gate.json'), JSON.stringify(armed));
    const result = spawnSync(process.execPath, ['--import', 'data:text/javascript,' + encodeURIComponent(preload), gate, ...args], {
      cwd: dir, input: JSON.stringify({ cwd: dir }), encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), args.length ? '' : 'CONCEPT_OK');
    assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'gate.json'), 'utf8')).passedAt, 'checked');
  }
});
