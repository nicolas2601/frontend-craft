// setup.mjs: the machine report and the user-level install plan, with every command faked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { SIBLINGS, installPlan, report } from '../skills/frontend-craft/scripts/setup.mjs';

const skillsWith = (names) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-setup-'));
  for (const n of names) { fs.mkdirSync(path.join(dir, n)); fs.writeFileSync(path.join(dir, n, 'SKILL.md'), '---\nname: x\n---\n'); }
  return dir;
};

test('a bare machine gets playwright-cli and both MCP servers planned, never a sudo command', () => {
  const run = (cmd, args) => (cmd === 'claude' && args[0] === '--version' ? '2.1.0' : cmd === 'claude' ? 'github: npx gh - ok\n' : null);
  const r = report({ run, skillsDir: skillsWith(['impeccable']), chrome: () => null, library: () => null });
  assert.equal(r.browser.ok, false);
  assert.equal(r.siblings.impeccable, true);
  assert.equal(r.siblings['design-taste-frontend'], false);
  assert.deepEqual(r.mcp, { playwright: false, 'hf-mcp-server': false });
  assert.deepEqual(r.cli21st, { ok: false, login: false });
  const plan = installPlan(r, { cacheExists: () => false });
  assert.deepEqual(plan.map(([cmd, a]) => `${cmd} ${a.slice(0, 3).join(' ')}`), ['npm install -g @playwright/cli@latest', 'npm install -g @21st-dev/cli@latest',
    'git clone --quiet https://github.com/Motionsites-AI/claude-skill', 'git -C ' + plan[3][1][1] + ' -c', 'claude mcp add playwright', 'claude mcp add hf-mcp-server']);
  assert.ok(plan[3][1].includes('faa30d512e3973e58675c72101a7ef42ed37ae83'), 'the library is checked out at the pinned commit');
  assert.ok(plan.every(([cmd]) => cmd !== 'sudo'));
});

test('a ready machine plans nothing; plugin-scoped servers count', () => {
  const list = 'plugin:frontend-craft:playwright: npx -y @playwright/mcp@latest - ok\nhf-mcp-server: https://huggingface.co/mcp?login (HTTP) - ok\n';
  const run = (cmd, args) => (cmd === 'claude' && args[0] === 'mcp' ? list : 'v1');
  const r = report({ run: (cmd, args) => (cmd === '21st' && args[0] === 'whoami' ? 'Logged in as someone.' : run(cmd, args)), skillsDir: skillsWith(SIBLINGS), chrome: () => '/usr/bin/chromium', library: () => '/x/motionsites-web-builder' });
  assert.deepEqual(r.cli21st, { ok: true, login: true });
  assert.ok(Object.values(r.siblings).every(Boolean));
  assert.deepEqual(installPlan(r), []);
});
