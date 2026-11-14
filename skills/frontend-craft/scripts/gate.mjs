#!/usr/bin/env node
/*
  frontend-craft gate: you are not done while the armed build has FAILs.

    node <skill>/scripts/gate.mjs                 # check the armed target; exit 1 while any FAIL remains
    node <skill>/scripts/gate.mjs --hook claude   # Claude Code / Codex Stop hook (JSON on stdout)
    node <skill>/scripts/gate.mjs --off "why"     # disarm: the user stopped the build or changed the task

  start.mjs arms the gate in .craft/gate.json. The hook never traps an agent: after MAX_BLOCKS blocks
  for one build, or a repeat stop on the same unchanged failures, it lets the agent stop and report.
*/
import fs from 'node:fs';
import path from 'node:path';
import { formatReport, runCheck } from './check.mjs';
import { isMain, parseArgs, readJson, writeJson } from './lib/state.mjs';

export const MAX_BLOCKS = 4;

/** Find an armed .craft/gate.json in dir or one level below (an app made in a subfolder). */
export function findGate(dir) {
  const direct = path.join(dir, '.craft', 'gate.json');
  if (fs.existsSync(direct)) return direct;
  for (const sub of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!sub.isDirectory() || sub.name.startsWith('.') || sub.name === 'node_modules') continue;
    const nested = path.join(dir, sub.name, '.craft', 'gate.json');
    if (fs.existsSync(nested)) return nested;
  }
  return null;
}

function readStdin() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return {}; }
}

/**
 * Decide whether a stop is allowed. Pure apart from the check it is given.
 * @returns {Promise<{ allow: boolean, reason?: string, state: object }>}
 */
export async function decide({ state, stopHookActive, check }) {
  if (!state?.armed || state.off) return { allow: true, state };
  if ((state.blocks ?? 0) >= MAX_BLOCKS) return { allow: true, state: { ...state, gaveUp: true } };
  if (!state.target) {
    if (state.askedTarget) return { allow: true, state };
    return { allow: false, state: { ...state, askedTarget: true, blocks: (state.blocks ?? 0) + 1 },
      reason: 'frontend-craft gate: the build has no target to check. Start the dev server and run start.mjs --url <url> (or --root <build folder>), then run gate.mjs. If you are stopping to ask the user something, stop again.' };
  }
  let report;
  try {
    report = await check(state);
  } catch (err) {
    if (state.unreachable) return { allow: true, state };
    return { allow: false, state: { ...state, unreachable: true, blocks: (state.blocks ?? 0) + 1 },
      reason: `frontend-craft gate: could not check ${state.target.url ?? state.target.root}: ${err.message}. Start it, rebuild, or re-arm with start.mjs --url/--root.` };
  }
  const fails = report.findings.filter((x) => x.level === 'FAIL');
  const fingerprint = fails.map((x) => x.id).sort().join(',');
  const next = { ...state, unreachable: false, lastRun: report.at, lastFails: fingerprint };
  if (!fails.length) return { allow: true, state: { ...next, passedAt: report.at } };
  if (stopHookActive && state.lastFails === fingerprint && (state.blocks ?? 0) >= 2) {
    return { allow: true, state: { ...next, gaveUp: true } };
  }
  const list = fails.map((x) => `- ${x.id}: ${x.msg}\n  fix: ${x.fix}`).join('\n');
  return {
    allow: false,
    state: { ...next, blocks: (state.blocks ?? 0) + 1 },
    reason: `frontend-craft gate: ${fails.length} FAIL on ${report.url}. You are not done.\n${list}\nFix them, run the check again and look at the screenshots in .craft/shots/. If you cannot fix one, say exactly why in your final message.`,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = args.hook ? readStdin() : {};
  const file = findGate(input.cwd ?? process.cwd());
  if (!file) {
    if (!args.hook) console.log('gate: nothing armed here (run start.mjs first).');
    process.exit(0);
  }
  const state = readJson(file, {});
  const out = path.dirname(file);
  const project = path.dirname(out);

  if (args.off) {
    writeJson(file, { ...state, off: true, offReason: String(args.off), offAt: new Date().toISOString() });
    console.log('gate: disarmed.');
    return;
  }
  const deal = readJson(path.join(out, 'deal.json'));
  const conceptFile = path.join(out, 'concept.md');
  const concept = fs.existsSync(conceptFile) ? fs.readFileSync(conceptFile, 'utf8') : null;
  const check = (st) => runCheck({ target: st.target, kind: st.kind ?? deal?.kind ?? 'landing', deal: deal?.brand ? null : deal, concept, out, requireDeal: !st.kitOnly && !deal?.brand });

  if (!args.hook) {
    process.chdir(project);
    const report = await check(state);
    console.log(formatReport(report));
    writeJson(file, { ...state, lastRun: report.at, passedAt: report.findings.some((x) => x.level === 'FAIL') ? state.passedAt : report.at });
    process.exit(report.findings.some((x) => x.level === 'FAIL') ? 1 : 0);
  }

  const result = await decide({ state, stopHookActive: !!input.stop_hook_active, check });
  writeJson(file, result.state);
  if (!result.allow) process.stdout.write(JSON.stringify({ decision: 'block', reason: result.reason }));
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    console.error(`gate: ${err.message}`);
    process.exit(process.argv.includes('--hook') ? 0 : 2);
  });
}
