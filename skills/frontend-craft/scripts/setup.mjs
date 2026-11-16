#!/usr/bin/env node
/*
  What frontend-craft needs on this machine, and how to get it. Free tools only; nothing secret is written.

    node <skill>/scripts/setup.mjs             report: Node, a browser, ffmpeg, Python (and numpy + onnxruntime), playwright-cli, the 21st.dev CLI,
                                               the sibling skills, the MotionSites library, the MCP servers
    node <skill>/scripts/setup.mjs --install   also install what is missing and can be installed without sudo: playwright-cli and the
                                               21st.dev CLI (npm -g), the MotionSites library (git clone into ~/.cache at a pinned commit)
                                               and, in Claude Code, the Playwright and Hugging Face MCP servers. `21st login` stays yours.
    node <skill>/scripts/setup.mjs --json      the report as JSON

  ffmpeg, Python and a browser come from the system's package manager; the report prints the command.
*/
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findChrome } from './lib/chrome.mjs';
import { CACHE, PIN, UPSTREAM, findMotionsites } from './lib/motionsites.mjs';
import { isMain, parseArgs } from './lib/state.mjs';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/** The skills frontend-craft routes to; they must sit next to it. */
export const SIBLINGS = ['design-taste-frontend', 'impeccable', 'emil-design-eng', 'review-animations', 'craft-motion', 'craft-review', 'craft-learn', 'svg-craft', 'ui-ux-pro-max', 'hf-asset-generate', 'kaggle-video', 'hallmark', 'playwright-cli'];
const MIN_NODE = 22;
export const MCP = {
  playwright: { test: /^(?:plugin:[^:\s]+:)?playwright:/m, add: ['mcp', 'add', 'playwright', '-s', 'user', '--', 'npx', '-y', '@playwright/mcp@latest'] },
  'hf-mcp-server': { test: /hf-mcp-server|huggingface\.co\/mcp/, add: ['mcp', 'add', 'hf-mcp-server', '-s', 'user', '-t', 'http', 'https://huggingface.co/mcp?login'] },
};
const SYSTEM = {
  ffmpeg: 'Arch: sudo pacman -S ffmpeg · Debian/Ubuntu: sudo apt install ffmpeg · macOS: brew install ffmpeg · Windows: winget install Gyan.FFmpeg',
  python3: 'Arch: sudo pacman -S python · Debian/Ubuntu: sudo apt install python3 · macOS: brew install python · Windows: winget install Python.Python.3.12',
  depth: 'python3 -m pip install --user numpy onnxruntime (blocked pip: a venv, or Arch sudo pacman -S python-numpy python-onnxruntime-cpu)',
  browser: 'any Chrome, Chromium or Edge (or set CHROME_PATH); `npx playwright install chromium` also works',
};
const OTHER_HARNESSES = [
  'Codex (~/.codex/config.toml): [mcp_servers.playwright] command = "npx", args = ["-y", "@playwright/mcp@latest"]',
  'OpenCode (opencode.json): "mcp": { "playwright": { "type": "local", "command": ["npx", "-y", "@playwright/mcp@latest"] }, "hf": { "type": "remote", "url": "https://huggingface.co/mcp?login" } }',
  'Hugging Face in any client: copy the snippet from huggingface.co/settings/mcp, then turn on Dynamic Spaces and add mcp-tools/Z-Image-Turbo there (references/hero-video.md)',
];

const defaultRun = (cmd, args) => { try { return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 60000 }); } catch { return null; } };

/** What is here and what is missing. `run` is injected so the report is testable. */
export function report({ run = defaultRun, skillsDir = path.dirname(SKILL), chrome = findChrome, library = () => findMotionsites(SKILL) } = {}) {
  const major = Number(process.versions.node.split('.')[0]);
  let browser = null;
  try { browser = chrome(); } catch { browser = null; }
  const claude = run('claude', ['--version']) !== null;
  const mcpList = claude ? run('claude', ['mcp', 'list']) ?? '' : '';
  return {
    node: { ok: major >= MIN_NODE, version: process.versions.node },
    browser: { ok: !!browser, path: browser },
    ffmpeg: { ok: run('ffmpeg', ['-version']) !== null },
    python3: { ok: run('python3', ['--version']) !== null },
    depth: { ok: run('python3', ['-c', 'import numpy, onnxruntime']) !== null },
    playwrightCli: { ok: run('playwright-cli', ['--version']) !== null },
    cli21st: { ok: run('21st', ['help']) !== null, login: /logged in/i.test(run('21st', ['whoami']) ?? '') },
    motionsites: { ok: !!library(), path: library() },
    siblings: Object.fromEntries(SIBLINGS.map((s) => [s, fs.existsSync(path.join(skillsDir, s, 'SKILL.md'))])),
    claude,
    mcp: claude ? Object.fromEntries(Object.entries(MCP).map(([k, v]) => [k, v.test.test(mcpList)])) : null,
  };
}

/** The commands --install runs: only user-level installs, never sudo. */
export function installPlan(r, { cacheExists = () => fs.existsSync(CACHE) } = {}) {
  const plan = [];
  if (!r.playwrightCli.ok) plan.push(['npm', ['install', '-g', '@playwright/cli@latest']]);
  if (!r.cli21st?.ok) plan.push(['npm', ['install', '-g', '@21st-dev/cli@latest']]);
  if (!r.motionsites?.ok && !cacheExists()) plan.push(['git', ['clone', '--quiet', UPSTREAM, CACHE]], ['git', ['-C', CACHE, '-c', 'advice.detachedHead=false', 'checkout', '--quiet', PIN]]);
  if (r.claude) for (const [k, v] of Object.entries(MCP)) if (!r.mcp?.[k]) plan.push(['claude', v.add]);
  return plan;
}

function text(r) {
  const mark = (ok) => (ok ? 'ok  ' : 'MISS');
  const lines = [
    `${mark(r.node.ok)} Node ${r.node.version} (22 or later)`,
    `${mark(r.browser.ok)} browser ${r.browser.path ?? `- ${SYSTEM.browser}`}`,
    `${mark(r.ffmpeg.ok)} ffmpeg${r.ffmpeg.ok ? '' : ` - ${SYSTEM.ffmpeg}`} (hero loops, palettes from a photograph)`,
    `${mark(r.python3.ok)} python3${r.python3.ok ? '' : ` - ${SYSTEM.python3}`} (ui-ux-pro-max search)`,
    `${mark(r.depth.ok)} numpy + onnxruntime${r.depth.ok ? '' : ` - ${SYSTEM.depth}`} (parallax hero loops from a still)`,
    `${mark(r.playwrightCli.ok)} playwright-cli${r.playwrightCli.ok ? '' : ' - npm install -g @playwright/cli@latest (or --install)'} (looking at the page, the reviewers)`,
    `${mark(r.cli21st.ok && r.cli21st.login)} 21st.dev CLI${!r.cli21st.ok ? ' - npm install -g @21st-dev/cli@latest (or --install), then 21st login' : r.cli21st.login ? '' : ' - run 21st login once (browser sign-in, free)'} (library parts: components.mjs search)`,
    `${mark(r.motionsites.ok)} MotionSites library${r.motionsites.ok ? ` ${r.motionsites.path}` : ' - --install clones it into ~/.cache/frontend-craft/libraries (optional)'} (reference designs, media shelf)`,
    ...Object.entries(r.siblings).map(([s, ok]) => `${mark(ok)} skill ${s}${ok ? '' : ' - install every skill of the repo as siblings: npx skills@latest add nicolas2601/frontend-craft --all'}`),
  ];
  if (r.mcp) lines.push(...Object.entries(r.mcp).map(([k, ok]) => `${mark(ok)} MCP ${k}${ok ? '' : ' - --install adds it to Claude Code'}`));
  else lines.push('---- Claude Code not found; other harnesses:', ...OTHER_HARNESSES.map((l) => `     ${l}`));
  return lines.join('\n');
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  let r = report();
  if (args.install) {
    for (const [cmd, a] of installPlan(r)) {
      console.log(`$ ${cmd} ${a.join(' ')}`);
      try { execFileSync(cmd, a, { stdio: 'inherit' }); } catch (err) { console.error(`  failed: ${err.message.split('\n')[0]}`); }
    }
    r = report();
  }
  console.log(args.json ? JSON.stringify(r, null, 2) : text(r));
  const missing = !r.node.ok || !r.browser.ok || Object.values(r.siblings).includes(false);
  process.exit(missing ? 1 : 0);
}
