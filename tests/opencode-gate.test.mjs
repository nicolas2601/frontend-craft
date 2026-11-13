// The OpenCode plugin sends a gate's block back into the session, for the website engine's gate too.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TASTE_GATE = path.join(ROOT, 'skills', 'design-taste-frontend', 'scripts', 'gate.mjs');
const CRAFT_GATE = path.join(ROOT, 'skills', 'frontend-craft', 'scripts', 'gate.mjs');

async function idleOnce(directory) {
  const { default: plugin } = await import(`${path.join(ROOT, 'integrations', 'opencode', 'frontend-craft-gate.js')}?t=${Date.now()}`);
  const prompts = [];
  let finish;
  const done = new Promise((resolve) => { finish = resolve; });
  const ctx = {
    location: { directory },
    event: {
      subscribe: async function* subscribe({ signal }) {
        yield { type: 'session.idle', properties: { sessionID: 's1' } };
        await new Promise((resolve) => signal.addEventListener('abort', resolve));
      },
    },
    session: { prompt: async (p) => { prompts.push(p); finish(); } },
  };
  const stop = plugin.setup(ctx);
  let timer;
  await Promise.race([done, new Promise((resolve) => { timer = setTimeout(resolve, 60000); })]);
  clearTimeout(timer);
  stop();
  return prompts;
}

test('a website build armed by design-taste-frontend blocks an idle OpenCode session', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-oc-'));
  const arm = spawnSync(process.execPath, [TASTE_GATE, '--start', 'index.html', '--kind', 'place', '--category', 'coffee', '--primary', 'Get directions'], { cwd: dir, encoding: 'utf8' });
  assert.equal(arm.status, 0, arm.stderr);
  process.env.TASTE_GATE = TASTE_GATE;
  process.env.FRONTEND_CRAFT_GATE = CRAFT_GATE;
  const prompts = await idleOnce(dir);
  fs.rmSync(dir, { recursive: true, force: true });
  assert.equal(prompts.length, 1);
  assert.equal(prompts[0].sessionID, 's1');
  assert.match(prompts[0].text, /tasteskill gate/);
});
