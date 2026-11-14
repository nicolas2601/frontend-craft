#!/usr/bin/env node
// UserPromptSubmit hook: when a prompt asks for a web page, site or its motion, remind the model to use
// the frontend-craft run. Silent otherwise. Never blocks.
import fs from 'node:fs';

const WEB = /\b(landing|website|web ?site|web ?page|home ?page|portfolio|hero section|redesign|restyle|p[aá]gina|sitio|web|landing page|portafolio|redise[ñn]|animaci[oó]n|animaciones|animations?|scroll effects?)\b/i;
const NOT_UI = /\b(scrap(e|ing|er)|crawl(er|ing)?|api only)\b/i;

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { /* no input */ }
const prompt = String(input.prompt ?? '');

if (WEB.test(prompt) && !NOT_UI.test(prompt)) {
  const context = 'frontend-craft: this is web page work. Load the frontend-craft skill and follow its run: '
    + 'start.mjs (with --lang, and --kind site --pages for several pages, --kind app for a platform) deals an art direction, palette, '
    + 'type, composition, two scroll set pieces per page and a React Bits component; write .craft/concept.md, fetch real photographs '
    + 'with the photos.mjs commands in the brief, build from the blueprint, then check.mjs (it runs impeccable detect) until RESULT: PASS, '
    + 'then the impeccable critique/audit and Emil motion review. A quiet, sober site the user asks for builds with design-taste-frontend. '
    + 'For motion on an existing page use craft-motion; for a review, craft-review.';
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context } }));
}
