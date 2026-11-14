# Hero loops (video)

The kit's scenes (`scenes.md`) draw abstract living objects in WebGL. A real subject in real light needs video. Examples: a hammock in a courtyard, steam over a cup, cloth in the wind, a product turning on a plinth.

A hero loop is one short clip in the first screen:

- 2 to 6 seconds long;
- muted, with no cuts and a locked camera;
- looping with no visible seam.

It takes the place of the dealt scene. The check accepts a first-screen loop that played instead of `deal-scene`. Say why under `# Signature`.

Not a hero loop:

- a decorative background behind body text;
- stock people smiling at laptops;
- a camera move (the seam jumps);
- text or a logo inside the frames (set those in HTML).

## Three free routes

| Route | Tools | Cost | Good for |
|---|---|---|---|
| Generated from a still | Hugging Face MCP server: Z-Image Turbo for the still, Wan 2.2 for the motion | $0 on a free account (shared ZeroGPU quota) | Places, products, food, materials, weather, light |
| Coded | HTML rendered frame by frame: HyperFrames (`npx hyperframes`) or the bang-motion skill (`scripts/export-frames.mjs`) | $0, local | Kinetic type, product UI, diagrams, brand marks |
| Footage | The client's own clip, or a free-licence stock clip (Pexels, Coverr) noted in `SOURCES.txt` | $0 | Real people and real places the client owns |

Paid generators cost credits: Google Flow (Veo), Higgsfield, fal, Runway, Kling. Use one only when the person asks for it and accepts the cost. Never use one by default.

## Route 1, step by step (verified 2026-11-14)

1. **Check the connection.** Call `hf_whoami` to confirm it is authenticated. Free accounts share the ZeroGPU quota. On a quota or queue error, wait or switch Space; never retry in a loop.
2. **Make the still.** Call `gr1_z_image_turbo_generate` with `resolution: "1280x720 ( 16:9 )"`, `random_seed: false` and a fixed `seed`. Alternatively, use the client's photograph at a public URL.
   - The prompt is one dense paragraph: subject, place, light, lens, "no people, no text".
   - The tool returns an `Image URL`.
3. **Animate it.** Call `dynamic_space` with:
   - `operation: "invoke"`;
   - `space_name: "mcp-tools/wan-2-2-first-last-frame"`;
   - `tool_name: "wan_2_2_first_last_frame_generate_video"`.

   Parameters: `start_image_pil` and `end_image_pil` are both the still's URL; `duration_seconds: 3`, `steps: 8`, `randomize_seed: false`, `seed`.

   Because both ends are the same frame, the clip comes back to where it started. The prompt starts with "static locked-off camera." and then names one or two small motions that return: a sway, flickering leaf light, rising steam, a slow turn.

   It returns an mp4 URL: 848x480 at 16 fps, about 3 s.
4. **Download at once.** The URLs are temporary: `curl -fsS -o .craft/video/raw.mp4 "<url>"`. Download the still too.
5. **Encode.** Run `node <skill>/scripts/video.mjs .craft/video/raw.mp4 --out assets/hero`. It writes `hero.mp4`, `hero.webm` and `hero-poster.webp`, and prints the markup below.
6. **Look at it.** Build a contact sheet and read it:

   ```
   ffmpeg -i assets/hero.mp4 -vf "select='not(mod(n\,15))',scale=480:-1,tile=6x1" -frames:v 1 .craft/video/sheet.png
   ```

   If you see melting shapes, extra fingers, warped lettering or a drifting horizon, regenerate with another seed or a smaller motion.

**One-way alternative:** `zerogpu-aoti/wan2-2-fp8da-aoti-faster` takes `input_image` and returns 3.5 s at 24 fps, but the end frame does not match the start. Loop it with `--seam pingpong` for slow sways, or accept a short crossfade ghost.

**Why the crossfade:** Wan does not return the exact start frame at the end. On the verified clip, the last and first frames differed by 24 dB, against about 37 dB between neighbouring frames, so the raw clip pops on every loop. The default seam in video.mjs closes that to 39 dB, within a normal frame step. It is a 0.4 s crossfade, applied after the clip is converted to 30 fps.

## scripts/video.mjs

`node video.mjs <clip> [options]`. It needs ffmpeg and ffprobe; `node video.mjs --doctor` lists what is missing.

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

**Budget.** Each format should stay at 1.5 MB or less; the script warns above that. The verified 2.6 s loop at 1280x720 came to 563 KB as mp4, 406 KB as webm and 105 KB for the poster.

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
| Hugging Face MCP server | Route 1 | Claude Code: `claude mcp add hf-mcp-server -t http "https://huggingface.co/mcp?login"`. Other clients: copy the snippet from huggingface.co/settings/mcp. See the steps below. |
| HyperFrames | Route 2 | `npx hyperframes init <dir>` (Node 22 + ffmpeg); its CLI sends usage telemetry; its own skills are `hyperframes` and `hyperframes-cli` |
| bang-motion | Route 2 | Claude Code: `/plugin marketplace add bangtutorial/bang-motion`, then `/plugin install bang-motion@bang-motion`. Any agent: `git clone https://github.com/bangtutorial/bang-motion` into the skills folder. Rendering to MP4 needs Node, puppeteer and ffmpeg. |
| Remotion | Route 2, React teams | `npx create-video@latest`; free for individuals and companies of up to three people, a company licence above that |

Setting up the Hugging Face MCP server:

1. Log in with a free account; the server is ready once `hf_whoami` answers.
2. In huggingface.co/settings/mcp, turn on **Dynamic Spaces**.
3. Add `mcp-tools/Z-Image-Turbo` as a Space, so `gr1_z_image_turbo_generate` appears.
