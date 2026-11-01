import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSupervisor } from '../supervisor.mjs';

const phases = ['direction', 'proof', 'interaction', 'delivery'];
const model = 'cline-pass/minimax-m3.1-flash';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'supervisor-test-'));
  const workspace = join(root, 'workspace');
  await mkdir(workspace);
  const statePath = join(root, 'state.json');
  const lockPath = join(root, 'supervisor.lock');
  const files = new Map(), runs = [];
  let now = 1_000_000;
  const api = async (operation, params) => {
    if (operation === 'session.get') return { data: { id: params.sessionID, outcome: 'success', time: { idle: 4, busy: 3 } } };
    return { data: {} };
  };
  const runnerFactory = () => ({
    start: async args => { files.set('task', args.task); files.set('timeout', args.timeout_seconds); runs.push(args); return { session_id: `ses_stage_${runs.length}`, submission: 'queued' }; },
    observe: () => ({ done: true }),
    cancel: async () => ({ stop_requested: true }),
    shutdown: async () => {},
  });
  const supervisor = createSupervisor({ api, runnerFactory, statePath, lockPath, clock: () => now, sleep: async ms => { now += ms; } });
  await supervisor.init({ workspace, trial_id: 'trial-1', user_brief: 'Build a bike shop', model_id: model, effort: 'low' });
  t.after(() => rm(root, { recursive: true, force: true }));
  return { root, workspace, statePath, lockPath, files, runs, supervisor, advance: ms => { now += ms; } };
}

async function approveCurrent(supervisor, workspace, phase, name = `${phase}.html`) {
  await mkdir(join(workspace, phase), { recursive: true });
  await writeFile(join(workspace, phase, name), `<main>${phase}</main>`);
  return supervisor.review({ decision: 'approve', artifacts: [name], reviewer_notes: `Reviewed rendered ${phase}`, evidence: `Pixel review for ${phase}` });
}

test('four reviewed gates advance in isolated folders and pass approved handoffs', async t => {
  const { supervisor, workspace, files, runs, statePath } = await fixture(t);
  for (const phase of phases) {
    const run = await supervisor.run();
    assert.equal(run.phase, phase);
    assert.match(files.get('task'), /SUPERVISED TASK/);
    assert.match(files.get('task'), /Build a bike shop/);
    assert.equal(runs.at(-1).directory, join(workspace, phase));
    if (phase === 'proof') {
      assert.match(files.get('task'), /\.\.\/direction\/direction\.html/);
      assert.match(files.get('task'), /Reviewed rendered direction/);
    }
    await approveCurrent(supervisor, workspace, phase);
  }
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  assert.equal(state.user_brief, 'Build a bike shop');
  assert.equal(state.status, 'complete');
  assert.equal(state.phases.direction.approval.decision, 'approve');
  assert.notEqual(state.phases.direction.supervised_task, state.user_brief);
});

test('missing artifacts and rejected decisions stop promotion', async t => {
  const { supervisor, workspace } = await fixture(t);
  await supervisor.run();
  await assert.rejects(supervisor.review({ decision: 'approve', artifacts: ['missing.html'], reviewer_notes: 'Reviewed', evidence: 'Pixel review' }), /missing/i);
  await mkdir(join(workspace, 'direction'), { recursive: true });
  await writeFile(join(workspace, 'direction', 'direction.html'), '<main>direction</main>');
  await supervisor.review({ decision: 'reject', artifacts: ['direction.html'], reviewer_notes: 'Not sufficiently distinct', evidence: 'Compared rendered studies' });
  await assert.rejects(supervisor.run(), /rejected|stopped/i);
});

test('rejection can stop a phase without requiring artifacts', async t => {
  const { supervisor } = await fixture(t);
  await supervisor.run();
  const status = await supervisor.review({ decision: 'reject', artifacts: [], reviewer_notes: 'No usable output to inspect', evidence: 'Rendered output was absent' });
  assert.equal(status.status, 'rejected');
  assert.deepEqual(status.phases.direction.approval.sources, []);
});

test('approval records become stale after any approved artifact changes', async t => {
  const { supervisor, workspace } = await fixture(t);
  await supervisor.run();
  await approveCurrent(supervisor, workspace, 'direction');
  await writeFile(join(workspace, 'direction', 'direction.html'), '<main>changed after review</main>');
  const status = await supervisor.status();
  assert.equal(status.phases.direction.status, 'stale');
  await assert.rejects(supervisor.run(), /stale/i);
});

test('artifact paths reject traversal, symlinks, and missing files', async t => {
  const { supervisor, workspace, root } = await fixture(t);
  await supervisor.run();
  await writeFile(join(root, 'outside.html'), 'outside');
  await mkdir(join(workspace, 'direction'), { recursive: true });
  await symlink(join(root, 'outside.html'), join(workspace, 'direction', 'escape.html'));
  for (const artifacts of [['../../outside.html'], ['escape.html'], ['/etc/passwd']]) {
    await assert.rejects(supervisor.review({ decision: 'approve', artifacts, reviewer_notes: 'Reviewed', evidence: 'Pixel review' }), /path|symlink|artifact/i);
  }
});

test('review evidence and phase ordering are required for approval', async t => {
  const { supervisor, workspace } = await fixture(t);
  await assert.rejects(supervisor.review({ decision: 'approve', artifacts: ['direction.html'], reviewer_notes: 'Looks good', evidence: 'pixel' }), /awaiting|phase/i);
  await supervisor.run();
  await mkdir(join(workspace, 'direction'), { recursive: true });
  await writeFile(join(workspace, 'direction', 'direction.html'), 'rendered output');
  await assert.rejects(supervisor.review({ decision: 'approve', artifacts: ['direction.html'], reviewer_notes: '', evidence: '' }), /review|evidence/i);
});

test('cumulative deadline includes review time and never resets between phases', async t => {
  const { supervisor, workspace, advance, files } = await fixture(t);
  await supervisor.run();
  await approveCurrent(supervisor, workspace, 'direction');
  advance(901_000);
  const status = await supervisor.status();
  assert.equal(status.budget.remaining_seconds, 299);
  await supervisor.run();
  assert.ok(files.get('timeout') <= 100);
  await approveCurrent(supervisor, workspace, 'proof');
  advance(300_000);
  assert.equal((await supervisor.status()).budget.remaining_seconds, 0);
  await assert.rejects(supervisor.run(), /budget|deadline/i);
});

test('review after the shared deadline cannot approve or promote a phase', async t => {
  const { supervisor, workspace, advance } = await fixture(t);
  await supervisor.run();
  await mkdir(join(workspace, 'direction'), { recursive: true });
  await writeFile(join(workspace, 'direction', 'direction.html'), 'rendered direction');
  advance(1_200_000);
  await assert.rejects(supervisor.review({ decision: 'approve', artifacts: ['direction.html'], reviewer_notes: 'Reviewed', evidence: 'Pixel comparison' }), /budget|deadline/i);
  assert.equal((await supervisor.status()).status, 'budget_exhausted');
});

test('uncertain submission is shut down and retains the global lock if stop is unknown', async t => {
  const { supervisor, lockPath, root, workspace } = await fixture(t);
  let starts = 0, shutdowns = 0;
  supervisor.setRunnerFactory(() => ({ start: async () => { starts++; return { session_id: 'ses_uncertain', submission: 'uncertain' }; }, observe: () => ({ done: false }), cancel: async () => {}, shutdown: async () => { shutdowns++; } }));
  const result = await supervisor.run();
  assert.equal(result.status, 'uncertain');
  await assert.rejects(supervisor.run(), /uncertain|active/i);
  assert.equal(starts, 1);
  assert.equal(shutdowns, 1);
  await assert.doesNotReject(readFile(lockPath, 'utf8'));
  const other = createSupervisor({ api: async () => ({ data: {} }), runnerFactory: () => ({}), statePath: join(root, 'other.json'), lockPath });
  await other.init({ workspace, trial_id: 'other', user_brief: 'Another trial', model_id: model, effort: 'low' });
  await assert.rejects(other.run(), /active|lock/i);
});

test('a persisted running state and an occupied global lock both block another run', async t => {
  const { supervisor, statePath, root } = await fixture(t);
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  state.status = 'running';
  await writeFile(statePath, JSON.stringify(state));
  await assert.rejects(supervisor.run(), /running/i);
  state.status = 'ready';
  await writeFile(statePath, JSON.stringify(state));
  await writeFile(join(root, 'supervisor.lock'), 'another process');
  await assert.rejects(supervisor.run(), /active|lock/i);
});

test('unknown active phase states and state files inside the project are rejected', async t => {
  const { supervisor, statePath, workspace, root } = await fixture(t);
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  state.status = 'active';
  state.phases.direction.status = 'running';
  await writeFile(statePath, JSON.stringify(state));
  await assert.rejects(supervisor.run(), /active/i);
  const nested = createSupervisor({ api: async () => ({ data: {} }), runnerFactory: () => ({}), statePath: join(workspace, 'state.json'), lockPath: join(root, 'nested.lock') });
  await assert.rejects(nested.init({ workspace, trial_id: 'nested', user_brief: 'Brief', model_id: model, effort: 'low' }), /outside/i);
});

test('phase timeout is recorded as deadline interruption, never as natural completion', async t => {
  const root = await mkdtemp(join(tmpdir(), 'supervisor-deadline-'));
  const workspace = join(root, 'workspace');
  await mkdir(workspace);
  let now = 1000, cancelled = false, polls = 0;
  const supervisor = createSupervisor({
    statePath: join(root, 'state.json'), lockPath: join(root, 'lock'), clock: () => now,
    sleep: async ms => { now += ms; }, pollMs: 100_000,
    api: async () => { polls++; return { data: cancelled ? { id: 'ses_deadline', outcome: 'stopped' } : { id: 'ses_deadline', time: { busy: 1 } } }; },
    runnerFactory: () => ({ start: async () => ({ session_id: 'ses_deadline', submission: 'queued' }), observe: info => ({ done: Boolean(info.outcome) }), cancel: async () => { cancelled = true; }, shutdown: async () => {} }),
  });
  t.after(() => rm(root, { recursive: true, force: true }));
  await supervisor.init({ workspace, trial_id: 'deadline', user_brief: 'Build a shop', model_id: model, effort: 'low' });
  const result = await supervisor.run();
  assert.equal(result.status, 'deadline_interrupted');
  assert.equal(cancelled, true);
  assert.ok(polls >= 2, 'run must confirm the stop after requesting interruption');
  assert.equal((await supervisor.status()).status, 'deadline_interrupted');
});

test('deadline without confirmed stop remains uncertain and cannot be retried', async t => {
  const root = await mkdtemp(join(tmpdir(), 'supervisor-unconfirmed-'));
  const workspace = join(root, 'workspace');
  await mkdir(workspace);
  let now = 1000;
  const supervisor = createSupervisor({
    statePath: join(root, 'state.json'), lockPath: join(root, 'lock'), clock: () => now,
    sleep: async ms => { now += ms; }, pollMs: 100_000,
    api: async () => ({ data: { id: 'ses_unconfirmed', time: { busy: 1 } } }),
    runnerFactory: () => ({ start: async () => ({ session_id: 'ses_unconfirmed', submission: 'queued' }), observe: () => ({ done: false }), cancel: async () => {}, shutdown: async () => {} }),
  });
  t.after(() => rm(root, { recursive: true, force: true }));
  await supervisor.init({ workspace, trial_id: 'unconfirmed', user_brief: 'Build a shop', model_id: model, effort: 'low' });
  const result = await supervisor.run();
  assert.equal(result.status, 'uncertain');
  assert.equal((await supervisor.status()).phases.direction.deadline_interruption.confirmed, false);
  await assert.rejects(supervisor.run(), /uncertain|active|lock/i);
});

test('error and interrupted outcomes are preserved and cannot enter review', async t => {
  for (const outcome of ['error', 'interrupted']) {
    const root = await mkdtemp(join(tmpdir(), 'supervisor-outcome-'));
    const workspace = join(root, 'workspace');
    await mkdir(workspace);
    const supervisor = createSupervisor({
      statePath: join(root, 'state.json'), lockPath: join(root, 'lock'),
      api: async () => ({ data: { id: 'ses_outcome', outcome } }),
      runnerFactory: () => ({ start: async () => ({ session_id: 'ses_outcome', submission: 'queued' }), observe: info => ({ done: Boolean(info.outcome) }), shutdown: async () => {} }),
    });
    t.after(() => rm(root, { recursive: true, force: true }));
    await supervisor.init({ workspace, trial_id: outcome, user_brief: 'Brief', model_id: model, effort: 'low' });
    const result = await supervisor.run();
    assert.equal(result.status, 'phase_failed');
    assert.equal(result.outcome, outcome);
    await assert.rejects(supervisor.review({ decision: 'approve', artifacts: ['direction.html'], reviewer_notes: 'Reviewed', evidence: 'Pixels' }), /review|phase/i);
  }
});

test('a clock starting at zero still consumes the shared wall-time budget', async t => {
  const root = await mkdtemp(join(tmpdir(), 'supervisor-zero-clock-'));
  const workspace = join(root, 'workspace');
  await mkdir(workspace);
  let now = 0;
  const supervisor = createSupervisor({
    statePath: join(root, 'state.json'), lockPath: join(root, 'lock'), clock: () => now,
    api: async () => ({ data: { id: 'ses_zero', outcome: 'success' } }),
    runnerFactory: () => ({ start: async () => ({ session_id: 'ses_zero', submission: 'queued' }), observe: () => ({ done: true }), shutdown: async () => {} }),
  });
  t.after(() => rm(root, { recursive: true, force: true }));
  await supervisor.init({ workspace, trial_id: 'zero', user_brief: 'Brief', model_id: model, effort: 'low' });
  await supervisor.run();
  now = 1_200_000;
  assert.equal((await supervisor.status()).budget.remaining_seconds, 0);
  await assert.rejects(supervisor.review({ decision: 'approve', artifacts: ['direction.html'], reviewer_notes: 'Reviewed', evidence: 'Pixels' }), /budget|deadline/i);
});
