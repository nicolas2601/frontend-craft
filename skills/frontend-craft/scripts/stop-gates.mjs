#!/usr/bin/env node
/*
  One Stop hook for both finish gates: frontend-craft's (apps, docs, fallback websites) and
  design-taste-frontend's (websites). For harnesses that take one hook command, such as Codex:

    node <skill>/scripts/stop-gates.mjs --host codex      (stdin: the hook JSON)

  Runs each gate that is installed next to this skill (or in a known skills folder) and prints the
  first block, in the {"decision":"block","reason":...} shape Claude Code and Codex read. Prints
  nothing to allow. Each gate allows by itself after its block budget, so this never traps an agent.
*/
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMain } from './lib/state.mjs';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOME = process.env.HOME ?? process.env.USERPROFILE ?? '';
const ROOTS = [path.join(SKILL, '..'), ...['.agents', '.claude', path.join('.config', 'opencode')].map((d) => path.join(HOME, d, 'skills'))];
const TIMEOUT_MS = 590000;

export function gateFor(skill) {
  return ROOTS.map((root) => path.join(root, skill, 'scripts', 'gate.mjs')).find((p) => fs.existsSync(p)) ?? null;
}

/** [script, hook dialect] for each installed gate, frontend-craft's first. */
export function gates(host) {
  return [
    [gateFor('frontend-craft') ?? path.join(SKILL, 'scripts', 'gate.mjs'), 'claude'],
    [gateFor('design-taste-frontend'), host === 'codex' ? 'codex' : 'claude'],
  ].filter(([script]) => script);
}

export function firstBlock(input, host, run = spawnSync) {
  for (const [script, dialect] of gates(host)) {
    const res = run(process.execPath, [script, '--hook', dialect], { input, encoding: 'utf8', timeout: TIMEOUT_MS });
    try {
      const verdict = JSON.parse(String(res.stdout ?? '').trim() || 'null');
      if (verdict?.decision === 'block' && verdict.reason) return { decision: 'block', reason: verdict.reason };
    } catch {
      // a gate that prints something else allows
    }
  }
  return null;
}

if (isMain(import.meta.url)) {
  const i = process.argv.indexOf('--host');
  const host = i > 0 ? process.argv[i + 1] : 'claude';
  let input = '';
  try { input = fs.readFileSync(0, 'utf8'); } catch { /* no stdin */ }
  const block = firstBlock(input, host);
  if (block) process.stdout.write(JSON.stringify(block));
  process.exit(0);
}
