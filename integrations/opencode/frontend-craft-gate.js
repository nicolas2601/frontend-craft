// frontend-craft gates for OpenCode (plugin API v2). When a session goes idle while an armed build in
// the working directory still has FAILs, it sends the fix list back into the same session. Two gates run:
// frontend-craft's (apps, docs, fallback websites) and design-taste-frontend's (websites). Each one decides for
// its own build and allows the stop after its block budget, so this never loops forever.
//
// Install: copy this file to ~/.config/opencode/plugins/. OpenCode loads every plugin in that folder;
// do not also list it in opencode.json (a configured plugin path must be a directory).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SKILL_DIRS = [
  path.join(os.homedir(), '.agents', 'skills'),
  path.join(os.homedir(), '.claude', 'skills'),
  path.join(os.homedir(), '.config', 'opencode', 'skills'),
];

// host: the hook dialect each gate speaks; both answer {"decision":"block","reason":...} or nothing.
const GATES = [
  { skill: 'frontend-craft', host: 'opencode', env: process.env.FRONTEND_CRAFT_GATE },
  { skill: 'design-taste-frontend', host: 'codex', env: process.env.TASTE_GATE },
];

function gateScript(directory, skill, env) {
  const local = [path.join(directory, '.agents', 'skills'), path.join(directory, '.opencode', 'skills'), path.join(directory, '.claude', 'skills')];
  const paths = [env, ...[...local, ...SKILL_DIRS].map((dir) => path.join(dir, skill, 'scripts', 'gate.mjs'))].filter(Boolean);
  return paths.find((p) => existsSync(p)) ?? null;
}

function runGate(script, host, directory, sessionID) {
  return new Promise((resolve) => {
    const child = spawn('node', [script, '--hook', host], { cwd: directory, stdio: ['pipe', 'pipe', 'ignore'] });
    let out = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), 600000);
    child.stdout.on('data', (d) => { out += d; });
    child.on('close', () => { clearTimeout(timer); resolve(out.trim()); });
    child.on('error', () => { clearTimeout(timer); resolve(''); });
    child.stdin.end(JSON.stringify({ cwd: directory, session_id: sessionID }));
  });
}

/** The first gate that blocks wins; a gate that is missing, silent or broken allows. */
async function blockReason(directory, sessionID) {
  for (const gate of GATES) {
    const script = gateScript(directory, gate.skill, gate.env);
    if (!script) continue;
    const out = await runGate(script, gate.host, directory, sessionID);
    if (!out) continue;
    try {
      const verdict = JSON.parse(out);
      if (verdict.decision === 'block' && verdict.reason) return verdict.reason;
    } catch {
      // not a verdict
    }
  }
  return null;
}

const sessionOf = (event) => event?.properties?.sessionID ?? event?.data?.sessionID ?? event?.sessionID ?? null;

export default {
  id: 'frontend-craft-gate',
  setup(ctx) {
    const directory = ctx.location?.directory ?? process.cwd();
    const controller = new AbortController();
    const busy = new Set();

    const onIdle = async (sessionID) => {
      if (busy.has(sessionID)) return;
      busy.add(sessionID);
      try {
        const reason = await blockReason(directory, sessionID);
        if (reason) await ctx.session.prompt({ sessionID, text: reason });
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
