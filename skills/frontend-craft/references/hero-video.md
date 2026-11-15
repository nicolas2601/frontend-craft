# Hero loops (video)

The kit's scenes (`scenes.md`) draw abstract living objects in WebGL. A real subject in real light needs video. Examples: a courtyard in afternoon sun, steam over a cup, cloth in the wind, a product turning on a plinth.

A hero loop is one clip in the first screen:

- long enough not to read as a GIF: 8 to 15 seconds from a still (parallax) or from joined clips, 3 to 6 from a single clip;
- muted, with no cuts;
- visibly alive: the camera drifts or the scene moves (wind, water, light), not a still that twitches;
- looping with no visible seam.

It takes the place of the dealt scene. The check accepts a first-screen loop that played instead of `deal-scene`. Say why under `# Signature`.

Not a hero loop:

- a decorative background behind body text;
- stock people smiling at laptops;
- a one-way camera move that jumps back at the seam (the parallax moves below are periodic and loop exactly);
- text or a logo inside the frames (set those in HTML).

## The still comes first

Every route starts from the best picture of the subject: the client's photograph when there is one. A generated still is a photograph of the place as it is, never a postcard of it:

- prompt as a photographer's note, one paragraph: `Photograph, <time of day> light, <the place>, <its materials: whitewashed lime walls, terracotta roof tiles, ochre sandstone floor>, <its plants or objects>, <lens: 24 mm, eye level>, <composition: where the subject sits, what is left calm for the headline>, natural colour, sharp focus, no people, no shadows of people, no text, no logos.`;
- make three or four with different seeds and keep the best; look at each full size for melted shapes, people, a photographer's shadow, lettering, a warped horizon;
- leave calm ground where the headline will sit (sky, a plain wall), on the side the layout puts it.

## Five free routes

| Route | Tools | Cost | Good for |
|---|---|---|---|
| Parallax from the still | `scripts/parallax.mjs`: a depth map on the CPU, then a slow periodic camera move | $0, on this machine, no quota, any length | The default for places, rooms, landscapes, products on a set. Camera motion only: nothing in the scene moves |
| Generated motion | Hugging Face MCP: Z-Image Turbo (the still), Qwen-Image-Edit-Angles (the same still with the camera moved), Wan 2.2 first-last-frame (A to B, then B to A) | $0 on a free account, but its ZeroGPU quota allows only a few runs a day: one loop needs 1 edit and 2 video runs | Wind in plants, water, steam, light moving across a wall |
| Generated motion on Kaggle | The `kaggle-video` skill: Wan 2.2 TI2V-5B (Apache-2.0) in a private Kaggle kernel on a T4 | $0 with a phone-verified Kaggle account: 30 GPU hours a week, no daily quota | Wind, water, light, a slow camera move, when the Hugging Face quota is spent; one way, so the seam is a crossfade |
| Coded | HTML rendered frame by frame: HyperFrames (`npx hyperframes`) or the bang-motion skill (`scripts/export-frames.mjs`) | $0, local | Kinetic type, product UI, diagrams, brand marks |
| Footage | The client's own clip, or a free-licence stock clip (Pexels, Coverr) noted in `SOURCES.txt` | $0 | Real people and real places the client owns |

Paid generators cost credits: Google Flow (Veo), Higgsfield, fal, Runway, Kling, and Hugging Face PRO for more ZeroGPU time. Use one only when the person asks for it and accepts the cost. Never use one by default.

When the quota runs out (`ZeroGPU quota exceeded`), stop: never retry in a loop and never switch to a paid provider. Build with the parallax loop now; with a Kaggle account, generate the motion there (`kaggle-video`); otherwise say in the report that a generated loop can replace it after the quota resets.

## Route 1: parallax from the still (verified 2026-11-15)

```bash
node <skill>/scripts/parallax.mjs .craft/video/still.png --out assets/hero --seconds 12 --move drift
```

- It estimates depth with Depth Anything V2 Small (Apache-2.0; downloaded once, 99 MB, to `~/.cache/frontend-craft/models`), then moves a virtual camera through the picture: near things shift more than far ones, so the place reads as space, not as a flat zoom.
- Moves: `drift` (a slow sway with a gentle push in; the default), `dolly` (in and back out), `pan` (side to side). `--amount 0.5` is calmer, `1.5` stronger; past that the edges of near objects stretch.
- The move is periodic, so the loop is exact: on the verified 12 s courtyard loop the seam measured 51.1 dB on the rendered frames, the same as any step inside it. Its motion score (mean frame difference one second apart) was 7.4, against 5.6 for the 2.6 s single-clip loop of Route 2.
- It writes `hero.mp4`, `hero.webm` and the poster through `video.mjs` and prints the markup. The verified loop: 944 KB mp4, 537 KB webm, 74 KB poster at 1280x720 (`--crf 27`).
- Needs ffmpeg, and python3 with numpy and onnxruntime for the depth step (`parallax.mjs --doctor`). `--depth map.png` takes a depth map you already have.
- Look at the result like any loop (step 7 of Route 2). Thin things against the sky (branches, wires) may bend at the strongest point of the move: lower `--amount` or pick `dolly`.

## Route 2: generated motion, step by step

1. **Check the connection.** Call `hf_whoami` to confirm it is authenticated. On a quota or queue error, stop (above).
2. **Make the still A.** Call `gr1_z_image_turbo_generate` with `resolution: "1280x720 ( 16:9 )"`, `random_seed: false`, a fixed `seed` and the prompt from "The still comes first". Or use the client's photograph at a public URL. The tool returns an `Image URL`.
3. **Make the still B (two keyframes give real motion).** Call `dynamic_space` with `operation: "invoke"`, `space_name: "mcp-tools/Qwen-Image-Edit-Angles"`, `tool_name: "Qwen_Image_Edit_Angles_infer_camera_edit"`: the image is A's URL, `move_forward: 5` (a short dolly in), `width: 1280`, `height: 720`, `randomize_seed: false`, a fixed `seed`, `num_inference_steps: 4`. Check B shows the same place, nothing invented.
4. **Animate A to B, then B to A.** Call `dynamic_space` with `operation: "invoke"`, `space_name: "mcp-tools/wan-2-2-first-last-frame"`, `tool_name: "wan_2_2_first_last_frame_generate_video"`, twice:
   - `start_image_pil` A, `end_image_pil` B; then `start_image_pil` B, `end_image_pil` A;
   - `duration_seconds: 5`, `steps: 8`, `randomize_seed: false`, `seed`;
   - the prompt names the motion the place has: "slow dolly in, bougainvillea sways in the breeze, sunlight moves across the wall".
   Each returns an mp4 URL (848x480 at 16 fps).

   With no quota for B, one clip with the same still as both ends (A to A, `duration_seconds: 3`, prompt starting "static locked-off camera.") still loops, but moves little.
5. **Download at once.** The URLs are temporary: `curl -fsS -o .craft/video/ab.mp4 "<url>"` (and `ba.mp4`, and both stills).
6. **Encode and join.** `node <skill>/scripts/video.mjs .craft/video/ab.mp4 .craft/video/ba.mp4 --out assets/hero`: the clips are joined in order (the second drops the frame it shares with the first), brought to 30 fps, and the seam back to A is crossfaded. It prints the markup below.
7. **Look at it.** Build a contact sheet and read it:

   ```
   ffmpeg -i assets/hero.mp4 -vf "select='not(mod(n\,30))',scale=480:-1,tile=6x2" -frames:v 1 .craft/video/sheet.png
   ```

   If you see melting shapes, extra fingers, warped lettering or a drifting horizon, regenerate with another seed or a smaller motion.

The two-keyframe route was written from the Spaces' parameters; its first end-to-end run was blocked by the free quota (2026-11-15). The A to A clip was verified on 2026-11-14.

**One-way alternative:** `zerogpu-aoti/wan2-2-fp8da-aoti-faster` takes `input_image` and returns 3.5 s at 24 fps, but the end frame does not match the start. Loop it with `--seam pingpong` for slow sways, or accept a short crossfade ghost.

**Why the crossfade:** Wan does not return the exact start frame at the end (24 dB between the last and first frame on the verified clip), so the raw clip pops on every loop. After the 0.4 s crossfade, the encoded seam measured 32.6 dB against 32.4 dB for the step just before it: no larger than a normal frame step. Every encoded loop also has a small refresh at the codec's keyframes, the seam included; the same step inside the clip measures the same.

## scripts/video.mjs

`node video.mjs <clip> [more clips] [options]`. Several clips are joined in order before the seam. It needs ffmpeg and ffprobe; `node video.mjs --doctor` lists what is missing. `parallax.mjs` takes `--seconds`, `--move`, `--amount`, `--width`, `--crf` (27) and `--depth`, and encodes through the same script.

| Option | Default | What it does |
|---|---|---|
| `--out` | `assets/hero` | Base name for `.mp4`, `.webm` and `-poster.webp` |
| `--seam` | `crossfade` | `crossfade` dissolves the tail into the head. `pingpong` plays forward then back (sways only; never smoke, water or anything that flows one way). `none` is for a clip that already loops. |
| `--fade` | `0.4` | Crossfade length in seconds |
| `--width`, `--aspect` | `1280`, `16:9` | Output size; `--aspect source` keeps the clip's own shape; `4:5` for a tall hero |
| `--fps` | `30` | Motion-interpolated up from 16 or 24 fps |
| `--start`, `--end` | whole clip | Trim before looping |
| `--grain` | `0` | Film grain (4 to 8) to hide the softness of an upscaled clip |
| `--crf` | `24` | H.264 quality (lower is larger); the webm uses this plus 12 |

**Budget.** Each format should stay at 1.5 MB or less; the script warns above that. The verified 2.6 s loop at 1280x720 came to 563 KB as mp4, 406 KB as webm and 105 KB for the poster; a 12 s loop needs `--crf 27` to stay under it.

**Sharpness.** A 480p clip upscaled to 1280 is soft:

- at full bleed, add `--grain 6` so it reads as film;
- or give it half of the first screen;
- never stretch it to 1920.

## Markup

```html
<div class="craft-loop">
  <video data-loop muted playsinline preload="metadata" poster="assets/hero-poster.webp" width="1280" height="720" aria-hidden="true">
    <source src="assets/hero.webm" type="video/webm">
    <source src="assets/hero.mp4" type="video/mp4">
  </video>
  <button type="button" data-loop-toggle aria-pressed="false">Pause</button>
</div>
```

Load `surfaces.css` and call the kit's `init(document)`. Leave out the `autoplay` attribute; the kit handles playback:

- it plays the loop only while it is on screen and the tab is visible;
- under reduced motion or Save-Data, it holds on the poster until the person presses the button;
- a pause the person chooses sticks.

**The button.** It is required: motion that lasts more than five seconds must be pausable (WCAG 2.2.2). Write its label in the page's language ("Pausar"). The kit sets `aria-pressed`, so the label stays the same.

**The direction's picture treatment.** The loop is a photograph that moves, so it takes the same treatment as the page's photographs. Riso: `class="craft-loop craft-riso"` (the grey filter, the second ink and the grain cover the video; the button stays above them). Duotone or mono: the same `filter` and `mix-blend-mode` the direction gives its images, on the `video`. A full-colour loop on a page whose photographs are all treated reads as stock footage pasted in.

**aria-hidden.** Keep it on a decorative loop. If the clip carries meaning, remove it and put a text alternative next to the clip, either as a caption or as `role="img"` with `aria-label` on the wrapper.

**Without the kit:** use an IntersectionObserver to play and pause, check `matchMedia('(prefers-reduced-motion: reduce)')`, and keep the same button.

## What the check says

| Rule | Level | When |
|---|---|---|
| `video-reduced` | FAIL | A video still plays under reduced motion |
| `video-muted` | FAIL | An autoplaying or looping video has sound |
| `video-pause` | WARN | A looping video has no `data-loop-toggle` and no controls |
| `video-poster` | WARN | A looping video has no poster |

## What to install

| Tool | For | Install |
|---|---|---|
| ffmpeg + ffprobe | `video.mjs`, contact sheets, HyperFrames | Arch `sudo pacman -S ffmpeg`, Debian/Ubuntu `sudo apt install ffmpeg`, macOS `brew install ffmpeg`, Windows `winget install Gyan.FFmpeg` |
| numpy + onnxruntime (python) | Route 1, the depth step | `python3 -m pip install --user numpy onnxruntime`; where pip --user is blocked, a venv, or Arch `sudo pacman -S python-numpy python-onnxruntime-cpu` |
| Hugging Face MCP server | Route 2 | Claude Code: `claude mcp add hf-mcp-server -t http "https://huggingface.co/mcp?login"`. Other clients: copy the snippet from huggingface.co/settings/mcp. See the steps below. |
| HyperFrames | Route 3 | `npx hyperframes init <dir>` (Node 22 + ffmpeg); its CLI sends usage telemetry; its own skills are `hyperframes` and `hyperframes-cli` |
| bang-motion | Route 3 | Claude Code: `/plugin marketplace add bangtutorial/bang-motion`, then `/plugin install bang-motion@bang-motion`. Any agent: `git clone https://github.com/bangtutorial/bang-motion` into the skills folder. Rendering to MP4 needs Node, puppeteer and ffmpeg. |
| Remotion | Route 3, React teams | `npx create-video@latest`; free for individuals and companies of up to three people, a company licence above that |

Setting up the Hugging Face MCP server:

1. Log in with a free account; the server is ready once `hf_whoami` answers.
2. In huggingface.co/settings/mcp, turn on **Dynamic Spaces**.
3. Add `mcp-tools/Z-Image-Turbo` as a Space, so `gr1_z_image_turbo_generate` appears.
4. Free accounts get a small daily ZeroGPU quota shared by every Space: plan one loop (1 edit, 2 video runs) per day, and keep the parallax loop as the fallback.
