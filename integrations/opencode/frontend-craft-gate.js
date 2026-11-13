// frontend-craft gate for OpenCode. When a top-level session goes idle while an armed build in the
// working directory still has FAILs, it sends the fix list back into the same session.
// The gate script decides; it allows the stop after its block budget, so this never loops forever.
//
// Install: copy this file to ~/.config/opencode/plugins/ and add "./plugins/frontend-craft-gate.js"
// to the "plugin" array of ~/.config/opencode/opencode.json.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CANDIDATES = [
  process.env.FRONTEND_CRAFT_GATE,
  path.join(os.homedir(), '.agents', 'skills', 'frontend-craft', 'scripts', 'gate.mjs'),
  path.join(os.homedir(), '.claude', 'skills', 'frontend-craft', 'scripts', 'gate.mjs'),
  path.join(os.homedir(), '.config', 'opencode', 'skills', 'frontend-craft', 'scripts', 'gate.mjs'),
].filter(Boolean);

function gateScript(directory) {
  const local = path.join(directory, '.agents', 'skills', 'frontend-craft', 'scripts', 'gate.mjs');
  return [local, ...CANDIDATES].find((p) => existsSync(p)) ?? null;
}

function runGate(script, directory) {
  return new Promise((resolve) => {
    const child = spawn('node', [script, '--hook', 'opencode'], { cwd: directory, stdio: ['pipe', 'pipe', 'ignore'] });
    let out = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), 300000);
    child.stdout.on('data', (d) => { out += d; });
    child.on('close', () => { clearTimeout(timer); resolve(out.trim()); });
    child.on('error', () => { clearTimeout(timer); resolve(''); });
    child.stdin.end(JSON.stringify({ cwd: directory }));
  });
}

export const FrontendCraftGate = async ({ client, directory }) => {
  const busy = new Set();
  return {
    event: async ({ event }) => {
      if (event?.type !== 'session.idle') return;
      const sessionID = event.properties?.sessionID;
      if (!sessionID || busy.has(sessionID)) return;
      const script = gateScript(directory);
      if (!script) return;
      busy.add(sessionID);
      try {
        const info = await client.session.get({ path: { id: sessionID } }).catch(() => null);
        if (info?.data?.parentID) return;
        const out = await runGate(script, directory);
        if (!out) return;
        const verdict = JSON.parse(out);
        if (verdict.decision !== 'block') return;
        // Not awaited: the prompt resolves only after the next turn, and that turn's idle event must reach us.
        client.session.prompt({ path: { id: sessionID }, body: { parts: [{ type: 'text', text: verdict.reason }] } }).catch(() => {});
      } catch {
        // a broken gate must never break the session
      } finally {
        busy.delete(sessionID);
      }
    },
  };
};

export default FrontendCraftGate;
