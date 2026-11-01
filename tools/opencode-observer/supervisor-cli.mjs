import { api } from './api.mjs';
import { redact } from './observer.mjs';
import { createRunner } from './runner.mjs';
import { createSupervisor } from './supervisor.mjs';

const usage = 'Usage:\n  node tools/opencode-observer/supervisor-cli.mjs init <state.json> <workspace> <trial-id> <model-id> <effort> <user-brief>\n  node tools/opencode-observer/supervisor-cli.mjs run <state.json>\n  node tools/opencode-observer/supervisor-cli.mjs status <state.json>\n  node tools/opencode-observer/supervisor-cli.mjs review <state.json> <approve|reject> <artifact-paths-json> <reviewer-notes> <evidence>';

async function main(args) {
  const [command, statePath, ...rest] = args;
  if (!command || !statePath || !['init', 'run', 'status', 'review'].includes(command)) throw new Error(usage);
  const supervisor = createSupervisor({ api, runnerFactory: () => createRunner(api), statePath });
  if (command === 'init') {
    const [workspace, trial_id, model_id, effort, user_brief] = rest;
    if (!user_brief) throw new Error(usage);
    return supervisor.init({ workspace, trial_id, model_id, effort, user_brief });
  }
  if (command === 'run') return supervisor.run();
  if (command === 'status') return supervisor.status();
  const [decision, artifactsJson, reviewer_notes, evidence] = rest;
  let artifacts;
  try { artifacts = JSON.parse(artifactsJson); } catch { throw new Error('artifact-paths-json must be a JSON array of relative project paths'); }
  return supervisor.review({ decision, artifacts, reviewer_notes, evidence });
}

try {
  const result = await main(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${redact(error.message, 600)}\n`);
  process.exitCode = 1;
}
