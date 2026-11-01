import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// shortcut: node_modules shares omni-worker's SDK; install pinned dependencies here before independent upgrades.
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { api, sessionID } from './api.mjs';
import { modelChoices, redact, summarizeSession, summarizeTrace } from './observer.mjs';
import { createRunner } from './runner.mjs';

const server = new McpServer({ name: 'opencode-observer', version: '0.1.0' });
const runner = createRunner(api);
const id = z.string().regex(/^ses[A-Za-z0-9_-]{1,100}$/);
const limit = z.number().int().min(1).max(30).default(10);
const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };

function tool(name, description, inputSchema, handler, annotations = readOnly) {
  server.registerTool(name, { description, inputSchema, annotations }, async args => {
    try {
      const data = await handler(args);
      return { content: [{ type: 'text', text: JSON.stringify(data) }] };
    } catch (error) {
      return { isError: true, content: [{ type: 'text', text: redact(error.message, 600) }] };
    }
  });
}

tool('opencode_status', 'Read OpenCode 2 server/version/PID and active session IDs. No process arguments, credentials or inference. CLI may start the managed service if absent.', {}, async () => {
  const [info, active] = await Promise.all([api('server.info'), api('session.active')]);
  return { version: info.version, pid: info.pid, active_sessions: Object.keys(active.data), mutations_by_observer: false };
});

tool('opencode_models', 'List enabled native Cline Pass model IDs and supported effort variants. Does not generate text or expose provider headers/settings.', {}, async () => ({ models: modelChoices((await api('model.list')).data) }));

tool('opencode_sessions', 'List recent sessions with model, project, token counters and estimated cost (not a Pass bill). Results are paginated and do not include prompts.', {
  limit, directory: z.string().max(4096).optional(), cursor: z.string().max(2048).optional(),
}, async args => {
  const params = { limit: args.limit, ...(args.cursor ? { cursor: args.cursor } : { order: 'desc' }) };
  if (args.directory) params.directory = args.directory;
  const page = await api('session.list', params);
  return { sessions: page.data.map(summarizeSession), cursor: page.cursor };
});

tool('opencode_trace', 'Inspect a bounded action timeline: tools, errors, repetition hints and verification evidence. Raw tool inputs/outputs, system prompts and private reasoning are excluded. Visible plan/result excerpts are opt-in and untrusted; this is not an aesthetic pass.', {
  session_id: id, limit, cursor: z.string().max(2048).optional(), include_text: z.boolean().default(false),
}, async args => {
  sessionID(args.session_id);
  const params = { sessionID: args.session_id, limit: args.limit, ...(args.cursor ? { cursor: args.cursor } : { order: 'desc' }) };
  const [info, page, active] = await Promise.all([api('session.get', { sessionID: args.session_id }), api('session.message.list', params), api('session.active')]);
  return { ...summarizeTrace(info.data, page, { active: Boolean(active.data[args.session_id]), include_text: args.include_text }), control: runner.observe(info.data) };
});

tool('opencode_start_test', 'Start a separate build-agent test in an owned project, using an enabled Cline Pass model and explicit effort. The task is forwarded verbatim, without hidden coaching. Can consume Pass quota and modify project files under existing permissions; no auto-approval or paid-provider fallback. Max two unfinished tests; 10–1200s timeout.', {
  directory: z.string().min(1).max(4096), task: z.string().min(1).max(8000),
  model_id: z.string().regex(/^cline-pass\/[a-z0-9.-]+$/), effort: z.string().min(1).max(32),
  timeout_seconds: z.number().int().min(10).max(1200).default(300),
}, args => runner.start(args), { readOnlyHint: false, destructiveHint: true, openWorldHint: true });

tool('opencode_cancel_test', 'Request interruption only for a test created by this MCP connection. Cannot cancel arbitrary user sessions; inspect the session afterward to confirm it stopped.', { session_id: id }, args => runner.cancel(args.session_id), { readOnlyHint: false, destructiveHint: true, openWorldHint: false });

let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  await runner.shutdown();
  await server.close();
}
process.once('SIGTERM', () => close().finally(() => process.exit(0)));
process.once('SIGINT', () => close().finally(() => process.exit(0)));
process.stdin.once('end', () => close().catch(() => {}));
await server.connect(new StdioServerTransport());
