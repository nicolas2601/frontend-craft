#!/usr/bin/env node
/*
  Run the eval cases through a real agent CLI and score them with the gate.

    node scripts/eval.mjs --case cafe-bucaramanga [--model cline-pass/deepseek-v4.1-flash] [--rounds 3]
    node scripts/eval.mjs --all --agent-cmd "opencode run --standalone --agent frontend --auto --format json"
    node scripts/eval.mjs --case devtool-next --model haiku --model-flag --model --no-title --resume-flag --resume \
      --agent-cmd "claude -p --output-format json --permission-mode acceptEdits --allowedTools Bash,Read,Write,Edit,Glob,Grep,Skill"
    node scripts/eval.mjs --case sushi-svelte --no-title --resume-value latest \
      --agent-cmd "gemini --approval-mode yolo -p" --continue-cmd "gemini --approval-mode yolo --resume latest -p"

  Per case: a fresh folder under ~/.cache/frontend-craft/evals (or --workdir; never tmpfs, installs are large), the prompt sent once, then up to --rounds follow-ups carrying the gate's
  FAIL list (the same loop a Stop hook gives Claude Code). A project's dev server is started by the
  runner so the check can see it. Results go to evals/results/<date>-<case>.json.
*/
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCheck } from '../skills/frontend-craft/scripts/check.mjs';
import { findGate } from '../skills/frontend-craft/scripts/gate.mjs';
import { parseArgs, readJson, writeJson } from '../skills/frontend-craft/scripts/lib/state.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AGENT_TIMEOUT_MS = 40 * 60 * 1000;

function sh(cmd, args, { cwd, timeout = AGENT_TIMEOUT_MS } = {}) {
  return new Promise((resolve) => {
    // PWD must match cwd: some CLIs (OpenCode) take their working directory from PWD, not from the process cwd.
    const child = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PWD: cwd } });
    let out = '';
    let err = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), timeout);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, out, err }); });
  });
}

/** Start the project's dev script and resolve with its local URL, or null. */
function startDev(cwd) {
  const pkgFile = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgFile)) return Promise.resolve(null);
  const pkg = readJson(pkgFile, {});
  if (!pkg.scripts?.dev) return Promise.resolve(null);
  return new Promise((resolve) => {
    const child = spawn('npm', ['run', 'dev'], { cwd, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    const stop = () => { try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already gone */ } };
    const timer = setTimeout(() => resolve({ url: null, stop }), 90000);
    const onData = (d) => {
      const m = String(d).replace(/\x1b\[[0-9;]*m/g, '').match(/https?:\/\/(localhost|127\.0\.0\.1):\d+\/?/);
      if (m) { clearTimeout(timer); resolve({ url: m[0], stop }); }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', () => { clearTimeout(timer); resolve({ url: null, stop }); });
  });
}

/** OpenCode prints "sessionID", Claude Code "session_id", Codex "thread_id". */
function sessionIdOf(output) {
  return output.match(/"sessionID"\s*:\s*"(ses[^"]+)"/)?.[1]
    ?? output.match(/"session_id"\s*:\s*"([0-9a-f-]{36})"/)?.[1]
    ?? output.match(/"thread_id"\s*:\s*"([^"]+)"/)?.[1] ?? null;
}

/** The folder itself, or the one subfolder holding a package.json or index.html. */
function projectIn(dir) {
  const has = (d) => ['package.json', 'index.html'].some((f) => fs.existsSync(path.join(d, f)));
  if (has(dir)) return dir;
  const subs = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules');
  return subs.map((e) => path.join(dir, e.name)).find(has) ?? dir;
}

function dropDeps(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.name === 'node_modules' || e.name === '.next') fs.rmSync(full, { recursive: true, force: true });
    else if (full.split(path.sep).length - dir.split(path.sep).length < 2) dropDeps(full);
  }
}

/** Find something checkable in the folder the agent produced. */
async function locateTarget(dir) {
  const gateFile = findGate(dir);
  const projectDir = gateFile ? path.dirname(path.dirname(gateFile)) : projectIn(dir);
  const gate = gateFile ? readJson(gateFile, {}) : null;
  const dev = await startDev(projectDir);
  if (dev?.url) return { projectDir, gate, target: { url: dev.url }, stop: dev.stop };
  dev?.stop();
  const html = ['index.html', 'public/index.html'].map((f) => path.join(projectDir, f)).find((f) => fs.existsSync(f));
  if (html) return { projectDir, gate, target: { root: path.dirname(html), page: 'index.html' }, stop: () => {} };
  return { projectDir, gate, target: null, stop: () => {} };
}

async function scoreRound(dir, kind) {
  const found = await locateTarget(dir);
  if (!found.target) return { found, report: null };
  const deal = readJson(path.join(found.projectDir, '.craft', 'deal.json'));
  try {
    const report = await runCheck({ target: found.target, kind, deal: deal?.brand ? null : deal, out: path.join(found.projectDir, '.craft'), requireDeal: true });
    return { found, report, deal };
  } finally {
    found.stop();
  }
}

async function runCase(c, args) {
  const base = String(args['agent-cmd'] ?? 'opencode run --standalone --agent frontend --auto --format json').split(' ');
  const model = args.model ? [String(args['model-flag'] ?? '-m'), String(args.model)] : [];
  const rounds = Number(args.rounds ?? 3);
  const base0 = String(args.workdir ?? path.join(os.homedir(), '.cache', 'frontend-craft', 'evals'));
  fs.mkdirSync(base0, { recursive: true });
  const dir = fs.mkdtempSync(path.join(base0, `${c.id}-`));
  const log = [];
  console.log(`[${c.id}] ${dir}`);
  const title = args['no-title'] ? [] : ['--title', `fc-eval-${c.id}`];
  let res = await sh(base[0], [...base.slice(1), ...model, ...title, c.prompt], { cwd: dir });
  // --resume-value fixes the id for CLIs that resume by position (Gemini: --resume latest).
  const session = args['resume-value'] ? String(args['resume-value']) : sessionIdOf(res.out);
  log.push({ round: 0, code: res.code, session });
  let scored = await scoreRound(dir, c.kind);
  for (let r = 1; r <= rounds && session; r += 1) {
    const fails = scored.report?.findings.filter((x) => x.level === 'FAIL') ?? [{ id: 'no-target', msg: 'no page found', fix: 'build the page and run start.mjs --url' }];
    log.push({ round: r - 1, fails: fails.map((x) => x.id), motion: scored.report?.motion });
    console.log(`[${c.id}] round ${r - 1}: ${fails.length} FAIL ${fails.map((x) => x.id).join(', ')}`);
    if (!fails.length) break;
    const followUp = `The frontend-craft gate found ${fails.length} FAIL:\n${fails.map((x) => `- ${x.id}: ${x.msg}\n  fix: ${x.fix}`).join('\n')}\nFix them, run the check, look at the screenshots, then report.`;
    // --continue-cmd "<cli args with {session}>" lets each CLI place its resume flag where it needs it.
    const next = args['continue-cmd']
      ? String(args['continue-cmd']).split(' ').map((t) => t.replace('{session}', session))
      : [...base, ...model, String(args['resume-flag'] ?? '--session'), session];
    res = await sh(next[0], [...next.slice(1), followUp], { cwd: dir });
    scored = await scoreRound(dir, c.kind);
  }
  const fails = scored.report?.findings.filter((x) => x.level === 'FAIL') ?? null;
  const result = {
    case: c.id, prompt: c.prompt, model: args.model ?? 'default', dir, session,
    armedByAgent: !!scored.found.gate, deal: scored.deal ? { palette: scored.deal.palette?.id, type: scored.deal.type?.id, composition: scored.deal.composition?.id, signature: scored.deal.motion?.signature?.id } : null,
    // Passing the gate without following a deal is not a pass: the design came from the model's defaults.
    pass: fails !== null && fails.length === 0 && !!scored.found.gate && !!scored.deal,
    fails: [...(fails?.map((x) => x.id) ?? ['no-target']), ...(scored.deal ? [] : ['no-deal'])],
    warns: scored.report?.findings.filter((x) => x.level === 'WARN').map((x) => x.id) ?? [], motion: scored.report?.motion ?? null,
    shots: scored.report?.shots ?? [], rounds: log,
  };
  writeJson(path.join(ROOT, 'evals', 'results', `${new Date().toISOString().slice(0, 10)}-${c.id}.json`), result);
  if (!args['keep-deps']) dropDeps(dir);
  console.log(`[${c.id}] ${result.pass ? 'PASS' : 'FAIL'} ${result.fails.join(', ')}`);
  return result;
}

const args = parseArgs(process.argv.slice(2));
const { cases } = readJson(path.join(ROOT, 'evals', 'cases.json'));
const selected = args.all ? cases : cases.filter((c) => String(args.case ?? '').split(',').includes(c.id));
if (!selected.length) {
  console.error(`eval: pick --case <${cases.map((c) => c.id).join('|')}> or --all`);
  process.exit(2);
}
for (const c of selected) await runCase(c, args);
