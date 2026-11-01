import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { redact, summarizeSession, summarizeTrace } from '../observer.mjs';
import { createRunner } from '../runner.mjs';

const model = { id: 'cline-pass/minimax-m3.1-flash', providerID: 'cline-pass' };
const session = { id: 'ses_test', title: 'Demo', location: { directory: '/tmp/project' }, model, time: { created: 1, updated: 5 }, tokens: { input: 12 }, cost: 0.1 };
const tool = (id, name, input, status = 'completed') => ({ type: 'tool', id, name, time: { created: 1, ran: 2, completed: 3 }, state: { status, input, content: [{ type: 'text', text: 'SECRET OUTPUT' }] } });
const message = content => ({ id: 'msg_test', type: 'assistant', time: { created: 1 }, model, content });

test('redacts credential patterns before clipping, without exposing thoughts', () => {
  const text = redact('Authorization: Bearer abc123xyz api_key=secret123 sk-1234567890abcdef');
  assert.doesNotMatch(text, /abc123xyz|secret123|sk-1234567890abcdef/);
});

test('session output is a whitelist, never arbitrary metadata or credentials', () => {
  const result = summarizeSession({ ...session, model: { ...model, headers: { apiKey: 'unsafe' } }, tokens: { input: 12, token: 'unsafe' }, time: { created: 1, apiKey: 'unsafe' }, permissions: { password: 'unsafe' }, metadata: { apiKey: 'unsafe' } });
  assert.equal(result.id, 'ses_test');
  assert.equal(result.directory, '/tmp/project');
  assert.doesNotMatch(JSON.stringify(result), /unsafe|permissions|apiKey/);
});

test('trace reports observable actions and errors, not inputs, outputs or hidden reasoning', () => {
  const page = { data: [message([
    { type: 'reasoning', text: 'HIDDEN THOUGHTS' },
    { type: 'text', text: 'Visible result' },
    tool('a', 'read', { filePath: '/tmp/project/file.ts', token: 'SECRET INPUT' }),
    tool('b', 'bash', { command: 'npm test' }, 'error'),
  ])], cursor: { next: 'opaque-cursor' } };
  const result = summarizeTrace(session, page, { active: false });
  const text = JSON.stringify(result);
  assert.doesNotMatch(text, /HIDDEN THOUGHTS|SECRET OUTPUT|SECRET INPUT|npm test|Visible result/);
  assert.equal(result.tools.length, 2);
  assert.equal(result.tools[1].status, 'error');
  assert.equal(result.tools[1].category_hint, 'verification');
  assert.equal(result.cursor.next, 'opaque-cursor');
  assert.match(result.scope, /sample/i);
  assert.equal(result.visual_quality_verified, false);
});

test('visible summaries are opt-in and credentials are masked', () => {
  const page = { data: [message([{ type: 'text', text: 'Plan: api_key=secret123' }])], cursor: {} };
  const result = summarizeTrace(session, page, { include_text: true });
  assert.match(result.visible_text[0], /Plan:/);
  assert.doesNotMatch(JSON.stringify(result), /secret123/);
});

test('repetition is a review hint, not proof of failure', () => {
  const input = { filePath: '/tmp/a' };
  const result = summarizeTrace(session, { data: [message([tool('1', 'read', input), tool('2', 'read', input), tool('3', 'read', input)])], cursor: {} }, {});
  assert.ok(result.signals.some(s => /repeat/i.test(s)));
  assert.ok(result.signals.some(s => /sample/i.test(s)));
});

const fakeApi = () => {
  const calls = [];
  const api = async (operation, params, body) => {
    calls.push({ operation, params, body });
    if (operation === 'model.list') return { data: [{ ...model, modelID: model.id, enabled: true, variants: [{ id: 'low' }] }] };
    if (operation === 'session.active') return { data: {} };
    if (operation === 'session.create') return { data: { id: 'ses_owned' } };
    return { data: { id: 'queued' } };
  };
  return { api, calls };
};

test('runner validates provider, effort, project scope and task secrets before creating a session', async () => {
  const { api, calls } = fakeApi();
  const runner = createRunner(api, { resolveDirectory: async x => x, home: '/home/nico' });
  const args = { directory: '/tmp/project', model_id: model.id, effort: 'low', task: 'Run tests', timeout_seconds: 20 };
  await assert.rejects(runner.start({ ...args, model_id: 'openai/gpt-paid' }), /Cline Pass/);
  await assert.rejects(runner.start({ ...args, effort: 'max' }), /effort/i);
  await assert.rejects(runner.start({ ...args, directory: '/home/nico/.ssh' }), /directory/i);
  await assert.rejects(runner.start({ ...args, directory: '/tmp/project/../../home/nico/.ssh' }), /directory/i);
  await assert.rejects(runner.start({ ...args, task: 'api_key=secret123' }), /credential/i);
  assert.ok(calls.every(c => c.operation !== 'session.create'));
  await runner.shutdown();
});

test('API adapter rejects mutating shell and permission-override requests before spawning OpenCode', async () => {
  const { api } = await import('../api.mjs');
  await assert.rejects(api('session.shell', {}, { command: 'unsafe' }), /not allowed/);
  await assert.rejects(api('session.create', {}, { permissions: { '*': 'allow' } }), /not allowed/);
});

test('runner creates a separate session with chosen model/effort, never approves permissions', async () => {
  const { api, calls } = fakeApi();
  const runner = createRunner(api, { resolveDirectory: async x => x, home: '/home/nico' });
  const result = await runner.start({ directory: '/tmp/project', model_id: model.id, effort: 'low', task: 'Run tests', timeout_seconds: 20 });
  assert.equal(result.session_id, 'ses_owned');
  const create = calls.find(c => c.operation === 'session.create');
  assert.deepEqual(create.body.model, { ...model, variant: 'low' });
  assert.equal(create.body.location.directory, '/tmp/project');
  assert.equal(create.body.permissions, undefined);
  const prompt = calls.find(c => c.operation === 'session.prompt').body.text;
  assert.equal(prompt, 'Run tests', 'The runner must not append hidden coaching to the user task');
  assert.ok(calls.every(c => !/permission|switchModel|shell/.test(c.operation)));
  await assert.rejects(runner.cancel('ses_someone_else'), /owned/i);
  await runner.cancel('ses_owned');
  assert.equal(calls.at(-1).operation, 'session.interrupt');
  await runner.shutdown();
});

test('uncertain prompt submission is not retried or silently forgotten', async () => {
  const { api, calls } = fakeApi();
  let submissions = 0;
  const runner = createRunner(async (...args) => {
    if (args[0] === 'session.prompt') { submissions++; throw new Error('network timeout'); }
    return api(...args);
  }, { resolveDirectory: async x => x, home: '/home/nico' });
  const result = await runner.start({ directory: '/tmp/project', model_id: model.id, effort: 'low', task: 'Run tests', timeout_seconds: 20 });
  assert.equal(result.submission, 'uncertain');
  assert.equal(result.session_id, 'ses_owned');
  assert.equal(calls.filter(c => c.operation === 'session.create').length, 1);
  assert.equal(submissions, 1);
  await runner.shutdown();
});

test('provider errors and changed file names are observable without raw error payloads', () => {
  const entry = { ...message([]), error: { name: 'RateLimitError', message: 'api_key=secret123', data: { headers: 'SECRET' } }, snapshot: { files: ['src/app.ts', '.env'] } };
  const result = summarizeTrace(session, { data: [entry], cursor: {} }, {});
  assert.equal(result.provider_errors[0].name, 'RateLimitError');
  assert.deepEqual(result.changed_files, ['src/app.ts']);
  assert.doesNotMatch(JSON.stringify(result), /secret123|SECRET|\.env/);
});

test('a configured alias pointing outside the subscription namespace cannot run', async () => {
  const { api } = fakeApi();
  const runner = createRunner(async (...args) => args[0] === 'model.list' ? { data: [{ ...model, modelID: 'paid/model', enabled: true, variants: [{ id: 'low' }] }] } : api(...args), { resolveDirectory: async x => x, home: '/home/nico' });
  await assert.rejects(runner.start({ directory: '/tmp/project', model_id: model.id, effort: 'low', task: 'Run tests', timeout_seconds: 20 }), /native Cline Pass/);
});

test('a deadline requests interruption of its owned session', async () => {
  const { api, calls } = fakeApi(); let deadline;
  const runner = createRunner(api, { resolveDirectory: async x => x, home: '/home/nico', setTimer: callback => { deadline = callback; return {}; }, clearTimer: () => {} });
  await runner.start({ directory: '/tmp/project', model_id: model.id, effort: 'low', task: 'Run tests', timeout_seconds: 20 });
  deadline(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls.at(-1).operation, 'session.interrupt');
  assert.equal(calls.at(-1).params.sessionID, 'ses_owned');
  await runner.shutdown();
});

test('a twenty-minute build budget remains bounded and keeps its owned interruption timer', async () => {
  const { api, calls } = fakeApi(); let deadline, milliseconds;
  const runner = createRunner(api, {
    resolveDirectory: async x => x, home: '/home/nico',
    setTimer: (callback, ms) => { deadline = callback; milliseconds = ms; return {}; }, clearTimer: () => {},
  });
  const args = { directory: '/tmp/project', model_id: model.id, effort: 'low', task: 'Run tests', timeout_seconds: 1200 };
  try {
    for (const timeout_seconds of [9, 1201, 1200.5]) await assert.rejects(runner.start({ ...args, timeout_seconds }), /Timeout/);
    assert.ok(calls.every(c => c.operation !== 'session.create'));
    await runner.start(args);
    assert.equal(milliseconds, 1_200_000);
    deadline(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(calls.at(-1).operation, 'session.interrupt');
    assert.equal(calls.at(-1).params.sessionID, 'ses_owned');
  } finally { await runner.shutdown(); }
});

test('trace output remains bounded even for many repetition signals', () => {
  const calls = Array.from({ length: 3000 }, (_, i) => tool(String(i), 'read', { group: Math.floor(i / 3) }));
  const result = summarizeTrace(session, { data: [message(calls)], cursor: {} }, {});
  assert.ok(JSON.stringify(result).length <= 16_000);
  assert.ok(result.tools_omitted > 0);
  assert.ok(result.signals_omitted > 0);
});

test('two unfinished tests block another even after a stop request', async () => {
  const { api } = fakeApi(); let created = 0;
  const runner = createRunner(async (operation, params, body) => {
    if (operation === 'session.create') return { data: { id: `ses_owned_${++created}` } };
    if (operation === 'session.get') return { data: { id: params.sessionID, time: { busy: 10 } } };
    return api(operation, params, body);
  }, { resolveDirectory: async x => x, home: '/home/nico' });
  const args = { directory: '/tmp/project', model_id: model.id, effort: 'low', task: 'Run tests', timeout_seconds: 20 };
  try {
    const first = await runner.start(args); await runner.start(args);
    await runner.cancel(first.session_id);
    await assert.rejects(runner.start(args), /two unfinished/);
    assert.equal(created, 2);
  } finally { await runner.shutdown(); }
});

test('real owned directories work and a Unicode prompt is forwarded byte-for-byte', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'observer-verbatim-test-'));
  const { api, calls } = fakeApi(); const runner = createRunner(api);
  const task = 'Utiliza frontend-craft y genera una web para una marca de bicicletas urbanas personalizables.';
  const args = { directory, model_id: model.id, effort: 'low', task, timeout_seconds: 20 };
  try {
    await writeFile(join(directory, 'not-a-directory'), 'fixture');
    await assert.rejects(runner.start({ ...args, directory: join(directory, 'not-a-directory') }), /directory/);
    await runner.start(args);
    assert.equal(calls.find(c => c.operation === 'session.prompt').body.text, task);
  } finally { await runner.shutdown(); await rm(directory, { recursive: true }); }
});
