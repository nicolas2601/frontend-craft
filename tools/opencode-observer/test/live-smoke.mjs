import assert from 'node:assert/strict';
import { mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// --run-test explicitly permits one small Cline Pass inference; ordinary unit tests never do.
const root = fileURLToPath(new URL('../', import.meta.url));
const client = new Client({ name: 'observer-smoke', version: '1.0.0' });
const transport = new StdioClientTransport({ command: process.execPath, args: [join(root, 'index.mjs')], stderr: 'pipe' });
const report = { protocol: false, read_only_checks: {}, live_test: null };
async function call(name, args = {}) {
  const response = await client.callTool({ name, arguments: args });
  if (response.isError) throw new Error(response.content[0].text);
  return JSON.parse(response.content[0].text);
}

try {
  await client.connect(transport);
  const listed = await client.listTools(); assert.equal(listed.tools.length, 6);
  assert.equal(listed.tools.find(t => t.name === 'opencode_start_test').annotations.readOnlyHint, false);
  report.protocol = true;
  const status = await call('opencode_status'); assert.match(status.version, /^2\./);
  const models = await call('opencode_models');
  assert.ok(models.models.some(m => m.model_id === 'cline-pass/minimax-m3.1-flash' && m.efforts.includes('low')));
  const page = await call('opencode_sessions', { limit: 2 });
  report.read_only_checks = { version: status.version, server_pid: status.pid, tools: listed.tools.map(t => t.name), pass_models: models.models.length, sessions: page.sessions.length };
  if (page.sessions.length) {
    const trace = await call('opencode_trace', { session_id: page.sessions[0].id, limit: 3 });
    assert.equal(trace.visual_quality_verified, false); assert.equal(trace.visible_text, undefined);
    report.read_only_checks.existing_trace = { sampled_messages: trace.sampled_messages, tools: trace.tools.length, signals: trace.signals };
  }
  const unowned = await client.callTool({ name: 'opencode_cancel_test', arguments: { session_id: 'ses_not_owned' } });
  assert.equal(unowned.isError, true);
  if (process.argv.includes('--run-test')) {
    const directory = await mkdtemp(join(tmpdir(), 'opencode-observer-live-'));
    const started = await call('opencode_start_test', {
      directory, model_id: 'cline-pass/minimax-m3.1-flash', effort: 'low', timeout_seconds: 90,
      task: 'Connectivity test only. Do not use tools or change files. In at most four short lines publish a brief plan, then OBSERVER_RUN_OK, then state that only connectivity was tested.',
    });
    assert.equal(started.submission, 'queued');
    const deadline = Date.now() + 110_000;
    let trace;
    while (Date.now() < deadline) {
      trace = await call('opencode_trace', { session_id: started.session_id, limit: 10, include_text: true });
      if (!trace.active && trace.visible_text.join('\n').includes('OBSERVER_RUN_OK')) break;
      if (trace.provider_errors.length || trace.control.stop_requested || trace.control.stop_unconfirmed) break;
      await delay(2000);
    }
    assert.match(trace.visible_text.join('\n'), /OBSERVER_RUN_OK/);
    assert.equal(trace.tools.length, 0);
    assert.deepEqual(trace.session.model, { id: 'cline-pass/minimax-m3.1-flash', providerID: 'cline-pass', variant: 'low' });
    assert.equal(trace.control.owned_test, true);
    report.live_test = { session_id: started.session_id, model: trace.session.model, reply: trace.visible_text, private_reasoning_returned: false, tool_calls: trace.tools.length, tokens: trace.session.tokens, estimated_cost_usd: trace.session.estimated_cost_usd, workspace_files: await readdir(directory), workspace: directory };
  }
  await writeFile(join(root, process.argv.includes('--run-test') ? 'verification-live.json' : 'verification.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  console.log(JSON.stringify(report, null, 2));
} finally { await client.close(); }
