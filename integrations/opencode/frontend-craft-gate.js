// frontend-craft gate for OpenCode (plugin API v2). When a session goes idle while an armed build in
// the working directory still has FAILs, it sends the fix list back into the same session.
// The gate script decides; it allows the stop after its block budget, so this never loops forever.
//
// Install: copy this file to ~/.config/opencode/plugins/. OpenCode loads every plugin in that folder;
// do not also list it in opencode.json (a configured plugin path must be a directory).
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

const sessionOf = (event) => event?.properties?.sessionID ?? event?.data?.sessionID ?? event?.sessionID ?? null;

export default {
  id: 'frontend-craft-gate',
  setup(ctx) {
    const directory = ctx.location?.directory ?? process.cwd();
    const controller = new AbortController();
    const busy = new Set();

    const onIdle = async (sessionID) => {
      const script = gateScript(directory);
      if (!script || busy.has(sessionID)) return;
      busy.add(sessionID);
      try {
        const out = await runGate(script, directory);
        if (!out) return;
        const verdict = JSON.parse(out);
        if (verdict.decision !== 'block') return;
        await ctx.session.prompt({ sessionID, text: verdict.reason });
      } catch {
        // a broken gate must never break the session
      } finally {
        busy.delete(sessionID);
      }
    };

    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
          if (event?.type !== 'session.idle') continue;
          const sessionID = sessionOf(event);
          if (sessionID) void onIdle(sessionID);
        }
      } catch {
        // subscription closed
      }
    })();

    return () => controller.abort();
  },
};
