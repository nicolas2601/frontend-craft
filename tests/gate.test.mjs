import assert from 'node:assert/strict';
import { test } from 'node:test';
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
