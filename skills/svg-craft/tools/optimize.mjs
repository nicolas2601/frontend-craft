#!/usr/bin/env node
// svg-craft optimize: SVGO with two profiles.
//   static   (default): aggressive cleanup for icons / logos / illustrations that do not animate.
//   animated (--animated): keeps ids, classes, shapes and groups that CSS / SMIL / JS target.
// Usage: node optimize.mjs in.svg [-o out.svg] [--animated] [--keep-size]
import { optimize } from 'svgo';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('-'));
if (!input) { console.error('usage: optimize.mjs in.svg [-o out.svg] [--animated] [--keep-size]'); process.exit(2); }
const oi = args.indexOf('-o');
const outPath = oi >= 0 ? resolve(args[oi + 1]) : resolve(input).replace(/\.svg$/i, '.min.svg');
const animated = args.includes('--animated');
const src = readFileSync(resolve(input), 'utf8');

// Defaults that SVGO ships and that silently break accessible / animated assets (all learned from real failures):
//  - removeTitle      deletes <title>: the only accessible name of the graphic
//  - removeUnknownsAndDefaults drops role="img" and aria-* unless told otherwise
//  - removeHiddenElems  deletes elements whose *stylesheet* opacity/display is 0, even though a keyframe shows them later
const keepA11y = { removeViewBox: false, removeTitle: false, removeDesc: false, removeUnknownsAndDefaults: { keepRoleAttr: true, keepAriaAttrs: true, keepDataAttrs: true } };
const staticOverrides = { ...keepA11y, cleanupIds: { minify: true, preserve: [] } };
const animatedOverrides = {
  ...keepA11y,
  removeHiddenElems: false,    // see above: opacity:0 default + keyframes is a valid pattern
  cleanupIds: false,          // ids are animation / gradient / mask targets
  mergePaths: false,           // sub-paths are animated individually
  convertShapeToPath: false,   // <circle>/<rect> carry animatable attributes (r, cx, width ...)
  collapseGroups: false,       // <g> are transform / opacity handles
  removeUselessStrokeAndFill: false,
  inlineStyles: false,         // keep <style> blocks and class selectors intact
  minifyStyles: false,
  moveElemsAttrsToGroup: false,
  moveGroupAttrsToElems: false,
  convertTransform: false,
};
const result = optimize(src, {
  path: input,
  multipass: true,
  plugins: [
    { name: 'preset-default', params: { overrides: animated ? animatedOverrides : staticOverrides } },
    ...(args.includes('--keep-size') ? [] : [{ name: 'removeDimensions' }]),
  ],
  js2svg: { pretty: false },
});
writeFileSync(outPath, result.data);
const a = Buffer.byteLength(src), b = Buffer.byteLength(result.data);
console.log(JSON.stringify({ out: outPath, profile: animated ? 'animated' : 'static', beforeKB: +(a / 1024).toFixed(1), afterKB: +(b / 1024).toFixed(1), saved: `${Math.round((1 - b / a) * 100)}%` }));
