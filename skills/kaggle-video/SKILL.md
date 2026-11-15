---
name: kaggle-video
description: >-
  Generate image-to-video clips for free on Kaggle's GPUs (T4, 30 GPU hours a week) with Wan 2.2 TI2V-5B
  (Apache-2.0): wind in plants, water, steam, light moving, a slow camera move. It runs a private Kaggle script
  kernel through the kaggle CLI and downloads the clip; frontend-craft's video.mjs makes it a web loop. Use when a
  hero loop needs scene motion that a parallax loop cannot give, when the Hugging Face free quota is spent, or when
  asked to make a video for free on Kaggle. Not for people talking, lip sync, text inside the video or clips
  longer than about 5 s.
---

# Kaggle video

A free GPU route for hero loops. Kaggle gives a phone-verified account 30 GPU hours a week on T4 GPUs. This skill
pushes one private script kernel that loads Wan 2.2 TI2V-5B, animates your still, and writes `clip.mp4`; then
frontend-craft turns the clip into a loop. Nothing is paid; every run spends GPU hours of the account.

`<skill>` is this folder. The script needs Node 22+, ffmpeg and the kaggle CLI.

## 0. Preflight

```bash
node <skill>/scripts/kaggle-video.mjs --doctor
```

It prints whether the CLI works, the Kaggle user and the GPU hours left this week. Missing pieces:

- the CLI: `pipx install kaggle` (or `python3 -m pip install --user kaggle`), then `kaggle auth login`, or an API
  token from kaggle.com/settings in `~/.kaggle`; never print or commit the token;
- GPU kernels need a phone-verified account (kaggle.com/settings).

Stop if fewer GPU hours are left than the run needs (table below).

## 1. The still and the prompt

- The still is the best picture of the subject: the client's photograph, or one made as in frontend-craft's
  `../frontend-craft/references/hero-video.md` ("The still comes first"). 16:9 for a full-width hero.
- The prompt is one paragraph about motion the place really has, then the camera: "The camera slowly dollies
  forward. Bougainvillea blossoms sway in a warm breeze, leaf shadows drift across the whitewashed walls."
  Photorealistic, natural motion. No people, no text: the negative prompt already refuses them.
- The still and prompt are stored inside a private kernel on Kaggle. Ask before sending a client's private
  photograph.

## 2. Run

```bash
node <skill>/scripts/kaggle-video.mjs run .craft/video/still.png --prompt "<motion>" --out .craft/video/kaggle
```

It writes the kernel to `<out>/kernel/`, pushes it, polls every 30 s and downloads `clip.mp4` and `run.json` (the
time per step and the GPU used). `--no-wait` returns after the push; `wait` picks it up later; `status` prints
the state. A failed run says why from `run.json`; read it before running again, never retry in a loop.

| Setting | Default | Notes |
|---|---|---|
| `--size` | `832x480` | Multiples of 32. `1280x704` is the model's own size: sharper, about three times the time |
| `--frames` | `81` (3.4 s at 24 fps) | 4k+1: 49, 81, 121 (5 s) |
| `--steps`, `--guidance`, `--shift` | 30, 5, 5 | Fewer steps lose detail; guidance 1 halves the time but follows the prompt less |
| `--seed` | 42 | Another seed for another take |
| `--slug` | `fc-hero-loop` | One private kernel; each push is a new version |

## 3. Look, then loop

Build a contact sheet and read it before using the clip:

```bash
ffmpeg -i .craft/video/kaggle/clip.mp4 -vf "select='not(mod(n\,12))',scale=420:-1,tile=4x2" -frames:v 1 .craft/video/kaggle/sheet.png
```

Refuse melting shapes, warped walls, invented people or text. Then:

```bash
node <frontend-craft>/scripts/video.mjs .craft/video/kaggle/clip.mp4 --out assets/hero --fade 0.8
```

The model starts from the still but does not come back to it, so the loop closes with a crossfade (`--fade 0.8`
for flowing motion; `--seam pingpong` only for a sway). Two takes from the same still can be joined:
`video.mjs take1.mp4 take2.mp4`.

## Limits

- One clip at a time; T4s are slow: the measured time is in `references/runs.md`.
- The kernel's code is private but stored by Kaggle, with the still inside it.
- Kaggle's official MCP server (`https://www.kaggle.com/mcp`) can also save and run notebooks; this skill uses the
  CLI because it works the same in every agent and needs no extra login.
