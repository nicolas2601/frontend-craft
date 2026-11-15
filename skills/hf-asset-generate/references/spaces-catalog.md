# Spaces catalog (from `dynamic_space discover`, 2026-10-06)

Status column: VERIFIED = invoked successfully in this setup. SCHEMA = `view_parameters` read, not invoked. LISTED = only seen in discover.

## Direct tool

| Tool | Params | Status |
|---|---|---|
| `gr1_z_image_turbo_generate` | prompt, resolution (enum, e.g. `1536x864 ( 16:9 )`), steps=8, seed=42, random_seed=true, shift=3 | VERIFIED |

## Image generation

| Space / tool_name | Key params | Status |
|---|---|---|
| `mcp-tools/FLUX.1-Krea-dev` / `FLUX_1_Krea_dev_infer` | prompt, width=768, height=768, num_inference_steps=24, guidance_scale=4.5, seed, randomize_seed | VERIFIED (1024x1024) |
| `mcp-tools/Qwen-Image` / `Qwen_Image_generate_image` | prompt (required), aspect_ratio (1:1,16:9,9:16,4:3,3:4,3:2,2:3), guidance_scale=4, negative_prompt, num_inference_steps=16 | SCHEMA |
| `mcp-tools/Qwen-Image-Fast` | same family, fewer steps | LISTED |
| `evalstate/flux1_schnell` | quick tests | LISTED |
| `prithivMLmods/Qwen-Image-2.1-LoRAs-PnP` | `infer` tool, LoRAs incl. 4-step Turbo, base64 I/O | LISTED |

## Editing

| Space | Use | Status |
|---|---|---|
| `mcp-tools/FLUX.1-Kontext-Dev` | edit by instruction | LISTED |
| `prithivMLmods/Flux.2-Klein-Edit-Ultra-Fast` | 4-step edit, base64 array input | LISTED |
| `prithivMLmods/Qwen-Image-Edit-2509-LoRAs-Fast` | anime, multi-angle, relight LoRAs | LISTED |
| `akhaliq/Qwen-Image-Edit-2511-LoRAs-Fast` | angles, photo-to-anime, style transfer | LISTED |
| `mcp-tools/Qwen-Image-Edit-Angles` | camera rotate/pan/tilt/zoom | LISTED |
| `prithivMLmods/Photo-Mate-i2i` | watermark/object removal, upscale, restore | LISTED |
| `fffiloni/InstantIR` | restore low-quality images | LISTED |
| `fffiloni/diffusers-image-outpaint` / `diffusers_image_outpaint_infer` | image (URL), width=720, height=1280, alignment (Middle/Left/Right/Top/Bottom), prompt_input, num_inference_steps=8, overlap_percentage=10, resize_option (Full/50%/33%/25%/Custom) | SCHEMA |

## Segmentation / cutout

| Space | Status |
|---|---|
| `not-lain/background-removal` / `background_removal_fn` (image URL; returns transparent PNG + original) | BROKEN: all invokes 404 on POST (3 attempts, incl. public URL) |
| `prithivMLmods/SAM3-Demo` (masks) | LISTED, untested |

## Video and audio

| Space | Key params | Status |
|---|---|---|
| `zerogpu-aoti/wan2-2-fp8da-aoti-faster` / `wan2_2_fp8da_aoti_faster_generate_video` | input_image (URL), prompt, duration_seconds=3.5, steps=6, seed; 24 fps; returns .mp4 | SCHEMA |
| `mcp-tools/wan-2-2-first-last-frame` / `wan_2_2_first_last_frame_generate_video` | start_image_pil, end_image_pil (URLs), prompt, duration_seconds=2.1, steps=8, seed, randomize_seed; returns .mp4 848x480 at 16 fps | VERIFIED 2026-11-14: same URL as start and end gives a loop; the end frame drifts (24 dB from the start), so close the seam with frontend-craft `scripts/video.mjs` (crossfade after interpolation, 39 dB) |
| `ResembleAI/Chatterbox` | text to speech, optional reference audio | LISTED |
| `mcp-tools/DeepSeek-OCR-experimental` | OCR | LISTED |

## Discovering more

```
hf_fs {operations:[{cmd:"search", args:["hf://spaces","<query>","--kind","mcp","--limit","8"]}]}
```

`--kind mcp` restricts to MCP-enabled Spaces. Check `updated_at`: a Space not updated for months may be dead (see the background-removal failure).
