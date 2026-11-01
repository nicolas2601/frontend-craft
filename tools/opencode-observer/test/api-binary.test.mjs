import test from 'node:test';
import assert from 'node:assert/strict';
import { opencodeBinary } from '../api.mjs';

test('portable installation uses PATH or an explicit host-owned executable override', () => {
  assert.equal(opencodeBinary({}), 'opencode');
  assert.equal(opencodeBinary({ OPENCODE_BIN: '/opt/opencode/bin/opencode' }), '/opt/opencode/bin/opencode');
});
