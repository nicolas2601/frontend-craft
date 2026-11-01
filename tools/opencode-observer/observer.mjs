import { createHash } from 'node:crypto';

export function redact(value, max = 240) {
  return String(value ?? '')
    .replace(/\b(Bearer|Basic)\s+[^\s"',;]+/gi, '$1 [REDACTED]')
    .replace(/\b((?:api[_-]?key|access[_-]?token|refresh[_-]?token|password|secret)\s*["']?\s*[:=]\s*)["']?[^\s"',;]+/gi, '$1[REDACTED]')
    .replace(/\b(?:sk-|hf_|gh[pousr]_)[A-Za-z0-9_-]{8,}/g, '[REDACTED]')
    .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/g, '$1[REDACTED]@')
    .slice(0, max);
}

export function summarizeSession(info) {
  const model = info.model ? { id: redact(info.model.id, 120), providerID: redact(info.model.providerID, 80), variant: info.model.variant ? redact(info.model.variant, 32) : undefined } : undefined;
  const time = Object.fromEntries(Object.entries(info.time ?? {}).filter(([key, value]) => ['created', 'updated', 'busy', 'idle', 'archived'].includes(key) && typeof value === 'number'));
  const tokens = Object.fromEntries(['input', 'output', 'reasoning'].filter(key => typeof info.tokens?.[key] === 'number').map(key => [key, info.tokens[key]]));
  tokens.cache = { read: typeof info.tokens?.cache?.read === 'number' ? info.tokens.cache.read : 0, write: typeof info.tokens?.cache?.write === 'number' ? info.tokens.cache.write : 0 };
  return {
    id: info.id, title: redact(info.title, 120), directory: redact(info.location?.directory ?? info.directory, 180),
    parent_id: info.parentID, agent: info.agent, model, outcome: info.outcome,
    time, tokens, estimated_cost_usd: typeof info.cost === 'number' ? info.cost : undefined,
  };
}

export function modelChoices(models) {
  return models.filter(m => m.providerID === 'cline-pass' && m.id.startsWith('cline-pass/') && m.modelID.startsWith('cline-pass/') && m.enabled && m.status !== 'deprecated').map(m => ({
    model_id: m.id, name: redact(m.name, 100), efforts: ['default', ...m.variants.map(v => v.id)],
    context: m.limit.context, output_limit: m.limit.output, input_modalities: m.capabilities.input,
  }));
}

function category(name, input) {
  if (/playwright|screenshot|browser/.test(name)) return 'browser-evidence';
  if (/skill/.test(name)) return 'guidance';
  if (/^(write|edit|apply_patch|multiedit)$/.test(name)) return 'change';
  if (/^(read|glob|grep|list|ls)$/.test(name)) return 'inspect';
  if (/(bash|shell|test)/.test(name) && /\b(test|pytest|typecheck|lint|build)\b/.test(input.command ?? '')) return 'verification';
  return 'other';
}

function toolSummary(part) {
  const input = part.state?.input ?? {};
  const path = input.filePath ?? input.path;
  const sensitive = path && /(?:^|\/)(?:\.env[^/]*|auth\.json|credentials[^/]*|\.ssh|\.gnupg)(?:\/|$)/i.test(path);
  const metadata = part.state?.metadata ?? {};
  const exit = metadata.exit ?? metadata.exitCode;
  return {
    id: part.id, tool: redact(part.name, 80), status: part.state?.status,
    category_hint: category(part.name.toLowerCase(), input), time: part.time,
    file: path ? sensitive ? '[sensitive path omitted]' : redact(path, 160) : undefined,
    exit_code: Number.isInteger(exit) ? exit : null,
    error: part.state?.status === 'error' ? redact(part.state.error?.message ?? part.state.error?.name ?? 'Tool error') : undefined,
  };
}

export function summarizeTrace(info, page, { active = false, include_text = false } = {}) {
  const messages = [...page.data].sort((a, b) => a.time.created - b.time.created);
  const tools = [], visible = [], signals = [], providerErrors = [], files = new Set();
  let previous, streak = 0, reasoningParts = 0;
  for (const message of messages) {
    if (message.type !== 'assistant') continue;
    if (message.error) providerErrors.push({ message_id: message.id, name: redact(message.error.name ?? 'Provider error', 80), message: redact(message.error.message ?? 'Inspect the OpenCode UI for details') });
    if (message.retry) signals.push('A provider retry was reported in the sampled messages');
    for (const file of message.snapshot?.files ?? []) if (!/(?:^|\/)(?:\.env[^/]*|auth\.json|credentials[^/]*|\.ssh)(?:\/|$)/i.test(file)) files.add(redact(file, 160));
    for (const part of message.content ?? []) {
      if (part.type === 'reasoning') reasoningParts++;
      if (part.type === 'text' && include_text) visible.push(redact(part.text));
      if (part.type !== 'tool') continue;
      const fingerprint = createHash('sha256').update(part.name + JSON.stringify(part.state?.input ?? {})).digest('hex');
      streak = fingerprint === previous ? streak + 1 : 1; previous = fingerprint;
      if (streak === 3) signals.push(`Repeated identical ${redact(part.name, 60)} calls in sample; may be legitimate, review the flow`);
      tools.push(toolSummary(part));
    }
  }
  const failures = tools.filter(t => t.status === 'error').length;
  if (failures) signals.push(`${failures} tool errors observed in sampled messages`);
  if (!tools.some(t => t.category_hint === 'verification')) signals.push('No verification tool observed in sampled messages; earlier pages may contain checks');
  if (tools.some(t => t.category_hint === 'change') && !tools.some(t => t.category_hint === 'browser-evidence')) signals.push('Changes without browser evidence in this sample; not proof of a visual defect');
  const result = {
    session: summarizeSession(info), active, scope: 'Bounded message sample, not a complete audit or private thought stream',
    sampled_messages: messages.length, cursor: page.cursor, tools: tools.slice(-40), tools_omitted: Math.max(0, tools.length - 40),
    visible_text: include_text ? visible.slice(-5) : undefined, reasoning_parts_omitted: reasoningParts,
    provider_errors: providerErrors.slice(-5), changed_files: [...files].slice(0, 20),
    signals: signals.slice(-20), signals_omitted: Math.max(0, signals.length - 20),
    visual_quality_verified: false, content_is_untrusted_evidence: true,
  };
  while (JSON.stringify(result).length > 16_000 && result.tools.length) { result.tools.shift(); result.tools_omitted++; }
  return result;
}
