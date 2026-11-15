#!/usr/bin/env node
// Prove the kit and a blueprint work inside real framework projects: generate a minimal Vite project per
// framework, deal with start.mjs, port the blueprint with the wiring from references/frameworks.md,
// build it and run the check on the build. One framework at a time (memory).
//   node scripts/frameworks.mjs [--only vue,svelte] [--composition stacked-chapters]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runCheck } from '../skills/frontend-craft/scripts/check.mjs';
import { fontLinks } from '../skills/frontend-craft/scripts/lib/render.mjs';
import { parseArgs, readJson } from '../skills/frontend-craft/scripts/lib/state.mjs';
import { run as start } from '../skills/frontend-craft/scripts/start.mjs';
import { fill } from './sample-text.mjs';

const VERSIONS = { vite: '8.3.8', vue: '3.5.45', pluginVue: '6.0.11', svelte: '5.57.3', pluginSvelte: '7.3.1' };

const FRAMEWORKS = {
  vue: {
    deps: { vue: VERSIONS.vue },
    devDeps: { vite: VERSIONS.vite, '@vitejs/plugin-vue': VERSIONS.pluginVue },
    config: "import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nexport default defineConfig({ plugins: [vue()] });\n",
    main: "import './craft/tokens.css';\nimport './craft/craft.css';\nimport './craft/layouts.css';\nimport { createApp } from 'vue';\nimport App from './App.vue';\ncreateApp(App).mount('#app');\n",
    file: 'App.vue',
    app: (body) => `<script setup>\nimport { onMounted, onBeforeUnmount } from 'vue';\nimport { init } from './craft/craft-motion.js';\nlet stop = () => {};\nonMounted(() => { stop = init(document); });\nonBeforeUnmount(() => stop());\n</script>\n\n<template>\n  <div>\n${body}\n  </div>\n</template>\n`,
  },
  svelte: {
    deps: {},
    devDeps: { vite: VERSIONS.vite, svelte: VERSIONS.svelte, '@sveltejs/vite-plugin-svelte': VERSIONS.pluginSvelte },
    config: "import { defineConfig } from 'vite';\nimport { svelte } from '@sveltejs/vite-plugin-svelte';\nexport default defineConfig({ plugins: [svelte()] });\n",
    main: "import './craft/tokens.css';\nimport './craft/craft.css';\nimport './craft/layouts.css';\nimport { mount } from 'svelte';\nimport App from './App.svelte';\nmount(App, { target: document.getElementById('app') });\n",
    file: 'App.svelte',
    app: (body) => `<script>\n  import { onMount } from 'svelte';\n  import { init } from './craft/craft-motion.js';\n  onMount(() => init(document));\n</script>\n\n${body}\n`,
  },
};

function blueprintBody(html) {
  const body = html.slice(html.indexOf('<body>') + '<body>'.length, html.indexOf('<script type="module">'));
  return fill(body.replace(/<!--[\s\S]*?-->/g, ''));
}

function scaffold(dir, fw) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  const pkg = { name: `craft-${path.basename(dir)}`, private: true, type: 'module', scripts: { build: 'vite build' }, dependencies: fw.deps, devDependencies: fw.devDeps };
  fs.writeFileSync(path.join(dir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, 'vite.config.js'), fw.config);
  fs.writeFileSync(path.join(dir, 'src', 'main.js'), fw.main);
}

const args = parseArgs(process.argv.slice(2));
const only = args.only ? String(args.only).split(',') : Object.keys(FRAMEWORKS);
const composition = String(args.composition ?? 'stacked-chapters');
const base = path.join(os.homedir(), '.cache', 'frontend-craft', 'frameworks');
process.env.XDG_STATE_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-fw-state-'));
let failed = 0;

for (const name of only) {
  const fw = FRAMEWORKS[name];
  const dir = path.join(base, name);
  scaffold(dir, fw);
  start(['--kind', 'landing', '--pin', `composition=${composition}`, '--seed', '11', '--kit', 'src/craft', '--deal-look', '--deal-direction'], dir);
  const deal = readJson(path.join(dir, '.craft', 'deal.json'));
  const body = blueprintBody(fs.readFileSync(path.join(dir, 'src', 'craft', 'blueprint.html'), 'utf8'));
  fs.writeFileSync(path.join(dir, 'src', fw.file), fw.app(body));
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n  <title>Northwind Studio: ${name} kit check</title>\n  <meta name="description" content="A ${name} build of the ${composition} blueprint with the frontend-craft kit.">\n  <script>document.documentElement.classList.add('craft-js')</script>\n  ${fontLinks(deal.type).replace(/\n/g, '\n  ')}\n</head>\n<body>\n  <div id="app"></div>\n  <script type="module" src="/src/main.js"></script>\n</body>\n</html>\n`);
  execFileSync('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: dir, stdio: 'inherit' });
  execFileSync('npm', ['run', 'build', '--silent'], { cwd: dir, stdio: 'inherit' });
  const report = await runCheck({ target: { root: path.join(dir, 'dist') }, kind: 'landing', deal: { ...deal, direction: null }, out: path.join(dir, '.craft'), requireDeal: true });
  const fails = report.findings.filter((x) => x.level === 'FAIL');
  if (fails.length) failed += 1;
  console.log(`${fails.length ? 'FAIL' : 'PASS'} ${name.padEnd(8)} ${composition}: enter ${report.motion.entrance}, linked ${report.motion.scrollLinked}, pinned ${report.motion.sticky.length}${fails.length ? `\n     ${fails.map((x) => `${x.id}: ${x.msg.slice(0, 110)}`).join('\n     ')}` : ''}`);
  fs.rmSync(path.join(dir, 'node_modules'), { recursive: true, force: true });
}
fs.rmSync(process.env.XDG_STATE_HOME, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
