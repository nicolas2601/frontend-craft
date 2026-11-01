import { spawn } from 'node:child_process';
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync, statSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

const OPERATIONS = new Set(['server.info', 'session.list', 'session.active', 'session.get', 'session.message.list', 'model.list', 'session.create', 'session.prompt', 'session.interrupt']);
const PARAMS = new Set(['sessionID', 'limit', 'order', 'cursor', 'directory', 'resume']);
const MAX_BYTES = 4 * 1024 * 1024;
const BINARY = opencodeBinary();

export function opencodeBinary(env = process.env) {
  return env.OPENCODE_BIN || 'opencode';
}

export function sessionID(value) {
  if (typeof value !== 'string' || !/^ses[A-Za-z0-9_-]{1,100}$/.test(value)) throw new Error('Invalid session ID');
  return value;
}

function argumentsFor(operation, params, body) {
  if (!OPERATIONS.has(operation)) throw new Error('Operation is not allowed');
  const args = ['api', operation];
  for (const [key, value] of Object.entries(params)) {
    if (!PARAMS.has(key)) throw new Error('Parameter is not allowed');
    if (key === 'sessionID') sessionID(value);
    args.push('--param', `${key}=${value}`);
  }
  if (body !== undefined) {
    const allowed = operation === 'session.create' ? ['title', 'agent', 'model', 'location', 'metadata'] : operation === 'session.prompt' ? ['text'] : [];
    if (Object.keys(body).some(key => !allowed.includes(key))) throw new Error('Body field is not allowed');
    args.push('--data', JSON.stringify(body));
  }
  return args;
}

export async function api(operation, params = {}, body) {
  const args = argumentsFor(operation, params, body);
  const directory = mkdtempSync(join(tmpdir(), 'opencode-observer-api-'));
  const output = join(directory, 'response.json');
  const fd = openSync(output, 'wx', 0o600);
  try {
    // OpenCode 2.2.5 can truncate large piped JSON; a regular stdout file preserves it.
    await new Promise((resolve, reject) => {
      const child = spawn(BINARY, args, { cwd: homedir(), stdio: ['ignore', fd, 'ignore'] });
      let failure;
      const stop = message => { failure ??= message; child.kill('SIGTERM'); };
      const timeout = setTimeout(() => stop('OpenCode API timeout; mutation outcome may be unknown'), 20_000);
      const force = setTimeout(() => child.kill('SIGKILL'), 23_000);
      const sizeCheck = setInterval(() => { if (statSync(output).size > MAX_BYTES) stop('Response too large; request a smaller page'); }, 100);
      child.once('error', () => { failure = 'Cannot launch OpenCode'; });
      child.once('close', code => {
        clearTimeout(timeout); clearTimeout(force); clearInterval(sizeCheck);
        failure || code !== 0 ? reject(new Error(failure ?? `OpenCode API exited with code ${code}`)) : resolve();
      });
    });
    if (statSync(output).size > MAX_BYTES) throw new Error('Response too large; request a smaller page');
    let result;
    try { result = JSON.parse(readFileSync(output, 'utf8')); } catch { throw new Error('OpenCode returned invalid JSON; no automatic retry'); }
    if (result?.error) throw new Error('OpenCode rejected the API request; no automatic retry');
    return result;
  } finally {
    closeSync(fd);
    rmSync(directory, { recursive: true, force: true });
  }
}
