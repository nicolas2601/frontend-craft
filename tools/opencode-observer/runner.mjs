import { realpath, stat } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { redact } from './observer.mjs';
import { sessionID } from './api.mjs';

const within = (directory, root) => directory.startsWith(root + path.sep);

async function realDirectory(directory) {
  const resolved = await realpath(directory), info = await stat(resolved);
  if (!info.isDirectory() || info.uid !== process.getuid()) throw new Error('Project directory must be owned by the current user');
  return resolved;
}

function validDirectory(directory, home) {
  const blocked = ['.ssh', '.config', '.local', '.cache', '.claude', '.claude-gpt', '.codex', '.gnupg', '.aws', '.azure', '.kube'].map(name => path.join(home, name));
  if (!path.isAbsolute(directory) || /[\0\r\n]/.test(directory) || !(within(directory, home) || within(directory, tmpdir())) || blocked.some(root => directory === root || within(directory, root)) || directory.split(path.sep).some(part => ['..', '.git'].includes(part))) throw new Error('Unsafe project directory');
}

async function validate(state, args) {
  if (!/^cline-pass\/[a-z0-9.-]+$/.test(args.model_id ?? '')) throw new Error('Only native Cline Pass models are allowed');
  if (!args.task?.trim() || args.task.length > 8000) throw new Error('Task must contain 1–8000 characters');
  if (redact(args.task, args.task.length * 2) !== args.task) throw new Error('Task appears to contain credentials; remove them');
  if (!Number.isInteger(args.timeout_seconds) || args.timeout_seconds < 10 || args.timeout_seconds > 1200) throw new Error('Timeout must be 10–1200 seconds');
  validDirectory(args.directory, state.home);
  const directory = await state.resolveDirectory(args.directory); validDirectory(directory, state.home);
  const model = (await state.api('model.list')).data.find(m => m.providerID === 'cline-pass' && m.id === args.model_id && m.modelID.startsWith('cline-pass/') && m.enabled && m.status !== 'deprecated');
  if (!model) throw new Error('Model is not enabled in the native Cline Pass catalog');
  if (args.effort !== 'default' && !model.variants.some(v => v.id === args.effort)) throw new Error('Unsupported effort; use opencode_models to choose an available variant');
  return { directory, model: { providerID: 'cline-pass', id: model.id, ...(args.effort === 'default' ? {} : { variant: args.effort }) } };
}

function observe(state, info) {
  const job = state.jobs.get(info.id);
  if (job && (info.outcome || info.time?.busy && info.time?.idle >= info.time.busy)) {
    state.clearTimer(job.timer); job.done = true;
  }
  return job ? { owned_test: true, deadline: job.deadline, stop_requested: job.stopRequested ?? false, stop_unconfirmed: job.stopUnconfirmed ?? false, done: job.done ?? false } : { owned_test: false };
}

async function cancel(state, id) {
  sessionID(id);
  const job = state.jobs.get(id);
  if (!job) throw new Error('Cancellation is restricted to tests owned by this MCP connection');
  await state.api('session.interrupt', { sessionID: id, resume: 'false' });
  state.clearTimer(job.timer); job.stopRequested = true;
  return { session_id: id, stop_requested: true, completion_must_be_checked: true };
}

async function start(state, args) {
  const resolved = await validate(state, args);
  for (const [id, job] of state.jobs) if (!job.done) observe(state, (await state.api('session.get', { sessionID: id })).data);
  if ([...state.jobs.values()].filter(j => !j.done).length >= 2) throw new Error('At most two unfinished observer tests may run concurrently');
  const created = (await state.api('session.create', {}, {
    title: `Observer test: ${args.model_id}`, agent: 'build', model: resolved.model,
    location: { directory: resolved.directory }, metadata: { source: 'opencode-observer' },
  })).data;
  const id = sessionID(created.id), deadline = Date.now() + args.timeout_seconds * 1000;
  const timer = state.setTimer(() => { cancel(state, id).catch(() => { const job = state.jobs.get(id); if (job) job.stopUnconfirmed = true; }); }, args.timeout_seconds * 1000);
  timer.unref?.();
  state.jobs.set(id, { deadline, timer });
  let submission = 'queued';
  try { await state.api('session.prompt', { sessionID: id }, { text: args.task }); }
  catch { submission = 'uncertain'; }
  return { session_id: id, model: resolved.model, directory: resolved.directory, deadline, submission,
    note: submission === 'uncertain' ? 'Do not resubmit automatically; inspect this session first' : 'Accepted, not yet a successful test',
    safety: 'Existing project permissions apply; no auto-approval. This is not a filesystem sandbox.' };
}

export function createRunner(api, options = {}) {
  const state = { api, jobs: new Map(), home: options.home ?? homedir(), resolveDirectory: options.resolveDirectory ?? realDirectory, setTimer: options.setTimer ?? setTimeout, clearTimer: options.clearTimer ?? clearTimeout };
  return {
    start: args => start(state, args), cancel: id => cancel(state, id), observe: info => observe(state, info),
    shutdown: async () => {
      await Promise.allSettled([...state.jobs].filter(([, job]) => !job.done).map(([id]) => cancel(state, id)));
      for (const job of state.jobs.values()) state.clearTimer(job.timer);
    },
  };
}
