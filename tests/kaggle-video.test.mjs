// kaggle-video: the kernel folder it pushes and how it reads the kaggle CLI, with the CLI faked.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MODEL, doctor, kernelFiles, options, parse, statusOf, username } from '../skills/kaggle-video/scripts/kaggle-video.mjs';

const o = (extra = []) => options(parse(['status', ...extra]));

test('options default to a 832x480, 81-frame Wan 2.2 TI2V-5B run and refuse sizes the model cannot take', () => {
  const d = o();
  assert.deepEqual([d.width, d.height, d.frames, d.steps, d.model, d.slug], [832, 480, 81, 30, MODEL, 'fc-hero-loop']);
  assert.throws(() => o(['--size', '800x450']), /multiples of 32/);
  assert.throws(() => o(['--frames', '80']), /4k\+1/);
  assert.throws(() => o(['--slug', 'Bad Slug']), /--slug/);
  assert.throws(() => options(parse(['run', 'missing.png', '--prompt', 'x'])), /no still/);
});

test('the kernel is a private GPU script with internet, and carries the still and settings in its code', () => {
  const files = kernelFiles({ ...o(), prompt: 'a breeze in the bougainvillea' }, 'someone', 'SU1BR0U=', 'CFG="__CFG_B64__"\nIMG="__IMAGE_B64__"\n');
  const meta = JSON.parse(files['kernel-metadata.json']);
  assert.deepEqual([meta.id, meta.kernel_type, meta.is_private, meta.enable_gpu, meta.enable_internet, meta.machine_shape, meta.code_file],
    ['someone/fc-hero-loop', 'script', true, true, true, 'NvidiaTeslaT4', 'run.py']);
  const cfg = JSON.parse(Buffer.from(/CFG="([^"]+)"/.exec(files['run.py'])[1], 'base64').toString());
  assert.equal(cfg.prompt, 'a breeze in the bougainvillea');
  assert.deepEqual([cfg.width, cfg.height, cfg.frames, cfg.flow_shift, cfg.model], [832, 480, 81, 5, MODEL]);
  assert.match(files['run.py'], /IMG="SU1BR0U="/);
  const real = kernelFiles({ ...o(), prompt: 'x' }, 'someone', 'SU1BR0U=')['run.py'];
  assert.ok(!real.includes('__CFG_B64__') && !real.includes('__IMAGE_B64__'), 'every placeholder of the real kernel is filled');
  assert.throws(() => kernelFiles({ ...o(), prompt: 'x' }, 'u', 'A', '"__CFG_B64__" "__CFG_B64__" "__IMAGE_B64__"'), /exactly once/);
});

test('the CLI is read for the user, the run status and the GPU hours left', () => {
  const run = (args) => ({
    '--version': 'Kaggle CLI 2.2.4',
    'config view': 'Configuration values\n- username: nicorghost\n- auth_method: ACCESS_TOKEN',
    quota: 'resource  used   remaining  total\n--------\nGPU       2.50h  27.50h     30.00h  2026-11-21T00:00:00\n',
  }[args.join(' ')] ?? '');
  assert.equal(username(run), 'nicorghost');
  assert.deepEqual(doctor(run), { kaggle: true, user: 'nicorghost', gpuHoursLeft: 27.5, ffmpeg: doctor(run).ffmpeg });
  assert.equal(statusOf('someone/fc-hero-loop has status "KernelWorkerStatus.RUNNING"'), 'running');
  assert.equal(statusOf('someone/fc-hero-loop has status "complete"'), 'complete');
  assert.throws(() => username(() => '- username: None'), /kaggle auth login/);
});
