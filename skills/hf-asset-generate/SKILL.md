---
name: hf-asset-generate
description: >-
  Generate web/dev assets (hero images, product shots, textures, backgrounds, OG images,
  edits, short image-to-video clips, TTS) for free through the Hugging Face MCP server
  (`hf-mcp-server`): Z-Image Turbo, FLUX.1 Krea, Qwen-Image, Kontext/Qwen edit, Wan 2.2,
  Chatterbox. Free alternative to higgsfield-generate / higgsfield-product-photoshoot.
  Use when: "generate an image/asset/hero/banner/texture", "product photo", "edit this
  image", "extend/outpaint", "animate this image", "make a voiceover", "assets for the
  landing page", or when Higgsfield is unavailable or the user wants $0 cost.
  NOT for: face/identity consistency (Soul ID), branded ad video (Marketing Studio),
  3D/GLB, virality scoring, 4K cinematic video. Those have no HF equivalent.
allowed-tools: mcp__hf-mcp-server__gr1_z_image_turbo_generate, mcp__hf-mcp-server__dynamic_space, mcp__hf-mcp-server__hf_whoami, mcp__hf-mcp-server__hf_fs, Bash, Read, Write
---

# HF Asset Generate

Free Higgsfield-style asset pipeline over the Hugging Face MCP. Three tool surfaces:

| Tool | Use |
|---|---|
| `gr1_z_image_turbo_generate` | Default fast image. Direct call, 33 resolutions up to 2048x1152. |
| `dynamic_space` (`discover` / `view_parameters` / `invoke`) | Every other model: Krea, Qwen-Image, edit, outpaint, video, TTS. |
| `hf_fs search hf://spaces <query> --kind mcp` | Find Spaces not in the curated list. |

## Step 0 - Preflight

1. Call `hf_whoami`. Note `is_pro` and `credential.expires_at`. Expired token: ask the user to reconnect the MCP and stop.
2. Free accounts get a small daily ZeroGPU quota shared by every Space. On `ZeroGPU quota exceeded`, stop until it resets: no retry loop, no paid provider. Plan runs first: a hero loop needs 1 still, 1 edit, 2 videos.
3. Never trust the curated list blindly. Run `dynamic_space discover` once per session; Spaces change.

## Step 1 - Pick the model (intent, not keyword)

| Need | Model | Why |
|---|---|---|
| Fast draft, general, any ratio | Z-Image Turbo (direct tool) | 8 steps, 16:9 up to 2048x1152 |
| Photoreal product / lifestyle / fashion | `mcp-tools/FLUX.1-Krea-dev` | Natural look, built for product + e-commerce |
| Text inside the image (poster, sign) | `mcp-tools/Qwen-Image` (or `-Fast`) | Best text placement of the set. Still verify spelling |
| Edit existing image by instruction | `mcp-tools/FLUX.1-Kontext-Dev`, `prithivMLmods/Flux.2-Klein-Edit-Ultra-Fast` | Restyle, swap, relight |
| Extend canvas (room for headline) | `fffiloni/diffusers-image-outpaint` | Fixes "empty space" requests |
| Restore / upscale | `prithivMLmods/Photo-Mate-i2i`, `fffiloni/InstantIR` | |
| Image to video (about 3.5s) | `zerogpu-aoti/wan2-2-fp8da-aoti-faster` | 24 fps, needs a start image URL |
| The same scene with the camera moved (a second keyframe) | `mcp-tools/Qwen-Image-Edit-Angles` | `move_forward`, rotate and tilt controls; base model Apache-2.0 |
| Video between two keyframes | `mcp-tools/wan-2-2-first-last-frame` | Start and end image; a loop is A to B, then B to A |
| Voiceover | `ResembleAI/Chatterbox` | Optional reference audio |

Full parameter notes and verified status: `references/spaces-catalog.md`.

## Step 2 - Build the prompt

Never send a one-liner. Load `references/prompt-recipes.md`, pick the mode (hero, product_shot, lifestyle, texture, og_image, icon_set, restyle), fill the template. Rules:

- Krea prompt: about 60-70 words, photography vocabulary (lens, light, material).
- Qwen-Image: under 200 words; put required text in quotes with its position.
- Z-Image: one dense paragraph, no negative prompt field.
- Do NOT ask for "empty space for text" via the prompt. Verified failure: Z-Image paints a flat solid block with a hard edge. Generate the full scene, then outpaint or crop.
- Never put logos, brand marks or small text in the prompt. Add them in HTML/SVG.

## Step 3 - Invoke

```
dynamic_space {operation:"invoke", space_name:"mcp-tools/FLUX.1-Krea-dev",
  tool_name:"FLUX_1_Krea_dev_infer",
  parameters:{prompt:"...", width:1024, height:1024, num_inference_steps:24, guidance_scale:4.5}}
```

Always `view_parameters` first for a Space not documented in the catalog. `parameters` takes an object or a JSON string.

## Step 4 - Persist (mandatory)

Output URLs are ephemeral Gradio links. Download immediately:

```bash
mkdir -p public/assets/<topic> && curl -fsS -o public/assets/<topic>/<name>.webp "<Image URL>"
file public/assets/<topic>/<name>.webp   # confirm real dimensions
```

Verified: the Krea URL returned HTTP 200 and a valid 1024x1024 WebP. Then convert if needed: `magick in.webp -quality 82 out.jpg`.

## Step 5 - Deliver

One line per asset: path, model, size, seed. Record the seed in the filename or a sidecar `assets.json` so it can be reproduced. State known flaws plainly (see Gotchas).

## Chaining (Higgsfield workflows equivalent)

- Hero with text room: Krea/Z-Image full scene, then outpaint to widen, then HTML overlay.
- Product cutout: generate on plain backdrop, then background removal (see Gotchas, currently broken), then place on any CSS background.
- Hero loop with real motion: still A, still B from `Qwen-Image-Edit-Angles` (`move_forward: 5`), then `wan-2-2-first-last-frame` A to B and B to A (`duration_seconds: 5`), then `node <frontend-craft>/scripts/video.mjs ab.mp4 ba.mp4 --out assets/hero`. A as both ends moves little.
- No quota: `node <frontend-craft>/scripts/parallax.mjs still.png --out assets/hero --seconds 12`, an exact parallax loop on the CPU. Steps: `../frontend-craft/references/hero-video.md`.
- Variations: same prompt, new seed. Keep the style block identical across the set.

## Gotchas (verified 2026-10-06)

- `not-lain/background-removal`: every invoke returned `Error POSTing to endpoint: Not Found`, including with a plain public image URL. The Space is listed but its endpoint is dead from this MCP. Fallback: Kontext prompt "remove the background, plain white", or install `rembg` locally (not installed on this machine at last check).
- Z-Image Turbo: "negative space for text" produced a flat cream panel with a hard seam.
- Krea default size is 768x768; pass width/height explicitly.
- The quota is per account: after `ZeroGPU quota exceeded` every Space refuses (2026-11-15). PRO raises it; a cost, only on request.
- A still can carry a photographer's shadow despite "no people": add "no shadows of people" and look at it full size.
- Image-in Spaces want a public URL. Previously generated Space URLs work as input for most; local files need hosting or `upload_file_to_gradio` when present.

## Not available on HF (say so, do not fake)

Soul ID / character consistency, Marketing Studio ads, Virality Predictor, image-to-3D, native 4K cinematic video, GPT Image 2 quality typography. Route these to Higgsfield or the Gemini/Nano Banana skill when the user needs them.
