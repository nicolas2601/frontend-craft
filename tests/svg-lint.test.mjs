// svg-craft lint, geometry pass: overlapping labels, text cut by the viewBox, leaders that end in nothing.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { test } from 'node:test';

const LINT = path.resolve('skills/svg-craft/tools/lint.mjs');
const lint = (name) => {
  try {
    return { code: 0, report: JSON.parse(execFileSync('node', [LINT, `tests/fixtures/svg/${name}`, '--json'], { encoding: 'utf8' })) };
  } catch (err) {
    return { code: err.status, report: JSON.parse(err.stdout) };
  }
};

test('a labelled diagram whose leaders end on dots and shapes is clean', () => {
  const { code, report } = lint('diagram-good.svg');
  assert.equal(code, 0);
  assert.deepEqual([report.info.labelOverlaps, report.info.textCut, report.info.looseEnds], [0, 0, 0]);
  assert.deepEqual(report.warns, []);
});

test('overlapping labels, a label past the edge and a leader into empty space are reported', () => {
  const { code, report } = lint('diagram-bad.svg');
  assert.equal(code, 1, 'text cut by the viewBox is an error');
  assert.match(report.errors.join('\n'), /text cut by the viewBox edge: <text> "Courtyard"/);
  assert.match(report.warns.join('\n'), /1 label pair\(s\) overlap: <text> "Kitchen garden" and <text> "Store room"/);
  assert.match(report.warns.join('\n'), /1 leader\(s\) end in empty space.*<path> at 120,60/);
});
