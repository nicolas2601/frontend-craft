// The combined Stop hook prints the first gate's block and stays silent when every gate allows.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { firstBlock, gates } from '../skills/frontend-craft/scripts/stop-gates.mjs';

test('both gates are found next to the router, each in its hook dialect', () => {
  const found = gates('codex').map(([script, dialect]) => [script.split('/').slice(-3, -2)[0], dialect]);
  assert.deepEqual(found, [['frontend-craft', 'claude'], ['design-taste-frontend', 'codex']]);
});

test('the first block wins; silence and junk allow', () => {
  const block = (reason) => () => ({ stdout: JSON.stringify({ decision: 'block', reason }) });
  const calls = [];
  const run = (exe, args) => { calls.push(args[0]); return calls.length === 1 ? { stdout: '' } : block('fix the hero')(); };
  assert.deepEqual(firstBlock('{}', 'codex', run), { decision: 'block', reason: 'fix the hero' });
  assert.equal(calls.length, 2);
  assert.equal(firstBlock('{}', 'codex', () => ({ stdout: 'not json' })), null);
  assert.equal(firstBlock('{}', 'claude', () => ({ stdout: JSON.stringify({ decision: 'block' }) })), null);
});
