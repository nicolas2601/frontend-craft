---
name: frontend-craft-video
description: Internal frontend-craft module for planning and producing short media through a verified free-only HF route or explicitly chosen local code composition. Distinguishes generative video from animated stills and real 3D; never assumes hosted inference is free.
---

# Internal video production module

Load this file from frontend-craft when the current concept needs a timed media asset. It is an internal module, not proof that the host registered a separate Skill/tool name. Noel's method and the current brief remain primary. Do not add a film to compensate for a repeated page architecture or unfinished components.

## 1. Recover, don't invent, the previous workflow

The existing local `hf-asset-generate` skill/manual documents a Wan image-to-video candidate. Its historical notes explicitly marked that route schema-only/not invoked. The bounded recovery did **not** locate a verified generation manifest for the user's specific earlier degree-project PWA clips. Camera-stream and animated-companion records are not proof of generated video. Do not claim those clips were reproduced or never existed.

Reuse an available asset/prompt catalog where appropriate, but revalidate its current interface, cost and provenance. Do not inherit older blanket “HF is free,” “24 fps,” or “switch model on quota error” instructions. No private or patient image/video may be sent to a public Space without separate explicit authorization; prefer public synthetic or rights-cleared media.

## 2. Choose the deliverable

- **True generative video:** the model creates new temporal content from an image/text condition. Geometry and motion can drift; inspect the result.
- **HF still plus local code composition:** a real video file animated from an HF-generated/owned still or approved sequence. This can be useful for a short presentation, but is not generative image-to-video.
- **Interactive 3D:** a real scene controlled by the visitor. Neither a video nor a raster that looks 3D provides arbitrary orbit/part inspection.

Derive a compact shot brief: purpose, subject, what changes, start/end framing, duration/aspect ratio, material/light continuity, copy space and exclusions. A single meaningful change beats “cinematic motion” with no intended consequence. Keep music/narration optional and rights-checked; no paid audio/generation automatically.

## 3. HF generative route: current contract and honest status

Candidate Space: `zerogpu-aoti/wan2-2-fp8da-aoti-faster`.

Source/app and live public metadata/schema were checked on 2026-10-31. Runtime reported `RUNNING`, `zero-a10g`, host `https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space`, Gradio 6.1.0, API prefix `/gradio_api`, endpoint `/generate_video`. A public read of the schema succeeded without credentials. Recheck before use; metadata is not a guarantee of inference availability.

Live input order for the reviewed Gradio endpoint:

| Input | Reviewed shape/default |
| --- | --- |
| `input_image` | Upload a public synthetic/rights-cleared image first; use the returned server path as FileData |
| `prompt` | Specific intended change, not only a style adjective |
| `steps` | 6 default; schema range 1–30 |
| `negative_prompt` | String; use only supported interface |
| `duration_seconds` | 3.5 default; schema range 0.5–5.0 |
| `guidance_scale`, `guidance_scale_2` | 1 default each |
| `seed` | Integer range 0–2147483647 |
| `randomize_seed` | Boolean; exposed in live API, missing from an earlier MCP wrapper schema |

App source specifies **16 fps**, not the historical manual's 24. Actual duration/fps/dimensions must be probed from the returned file. The reviewed output is an MP4 FileData plus seed, not the image helper's schema. Do not reuse the image endpoint/request contract blindly. The base model's Apache-2.0 metadata does not establish all Space/LoRA/output rights.

### Free-only and inference status

Official [ZeroGPU documentation](https://huggingface.co/docs/hub/spaces-zerogpu) permits limited free anonymous use; paid-tier accounts may automatically consume pre-paid credits after their included quota. Do not invoke an authenticated tool blindly under a free-only requirement. Prefer an explicitly verified anonymous route from the outset, with no token/cookies/account credit path; never switch accounts/routes to evade a failure or quota.

An initial URL-only FileData submission returned an event ID and an SSE error with null detail. Its cause remains unproven. A subsequent user-requested test followed Gradio's documented upload contract and **generated a real Wan MP4**: 832 × 560, 2.0625 seconds, 33 frames, 16 fps, H.264, no audio, seed 2718. ffprobe checks and a full ffmpeg decode passed; first/middle/last frames were opened. The reference was our public synthetic still, not private user media. One inference submission was made in this corrected test, without credentials, cookies, account credits or paid fallback.

This establishes a working reference-image route on the test date, not permanent availability, commercial rights, exact motion fidelity or a text-to-video route. Sampled frames retained the subject with subtle viewpoint/reflection changes; the requested exact ten-degree arc and full temporal quality were not established. Local evidence on this host is under `work/frontend-craft-calibration-20261031/video-reference-upload-check/`; do not assume that directory ships with this module.

### Duration, frames, fps and detail are different controls

The complete app source was read at revision `1ff7432a88d7827eb787ef10c15cbc5c85c841a2`. For **this Space**, not all Wan deployments:

| Quantity | Native contract | What can honestly be increased |
| --- | --- | --- |
| Duration | Input 0.5–5.0 s | Use a longer supported request, not the initial two-second smoke setting |
| Frames | `1 + clamp(round(seconds × 16), 8, 80)` | A 5.0-second request produces 81 frames, 5.0625 s at 16 fps |
| Frame rate | `FIXED_FPS = 16`; no fps input | A different verified native route, or explicitly labeled interpolation afterward |
| Resolution | Longer edge at most 832; square 640; multiples of 16, crop/resize rules | Another verified native route, or explicitly labeled upscale; larger input does not bypass resizing |
| Steps | UI 1–30; Lightning path intended for about 4–8 | Compare within the model's intended regime and inspect; 30 is not established as better than 6 |

An additional anonymous maximum-duration test kept the same public reference, prompt, seed and six steps. It produced **832 × 560, 5.0625 s, 81 frames, 16 fps**, H.264, no audio. ffprobe assertions and full decode passed; five sampled frames were opened. A changed viewpoint reveals additional side/cable details not established by the reference. Do not promise exact geometry, a precise camera angle or product truth from that output. Evidence: `work/frontend-craft-calibration-20261031/video-5s-native-check/` on this host.

For a longer film, plan multiple meaningful shots with continuity and inspect their handoffs. Separate shots, repeated loops, held frames, slow motion and a genuinely longer continuous generation are different deliverables. Do not send an out-of-range duration and pretend a clamped result meets it. A different route needs its own live interface, free-only, privacy and rights checks; never switch to evade a quota/block or assume its larger dimensions establish better quality.

**Bounded alternative audit, source/schema only:** `prithivMLmods/Wan2.2-Fast` exposed the same 16-fps/5-second/832-pixel limits. `Saravutw/WAN2.2_I2V_LIGHTNING_4-8step_custom` exposed a 10-second input and `1 + clamp(round(seconds × 16), 8, 160)` (161 frames at maximum), plus optional last-image conditioning and RIFE-derived 32/64/128-fps exports. Its `quality` parameter controls encoding, not native generated detail. Neither candidate established higher native fps/resolution. No inference was run on either. Anonymous access, maximum-duration feasibility, actual model pin/Lightning configuration and commercial rights remain unverified; source includes runtime-selectable model logic, so a name is not proof of the loaded model. Treat the extra initial frame as a reported formula, not an established defect. Do not advertise this as a tested ten-second or superior-quality route. The audit record is `work/frontend-craft-calibration-20261031/native-video-candidates.json` on this host.

### Tested optional delivery derivative: 60 fps and 2× size

The five-second native output was processed locally with motion-compensated `minterpolate` and Lanczos scaling: **1664 × 1120, 60 fps, 304 frames, 5.066667 s**, H.264, no audio. Probe assertions and full decode passed; five sampled frames were opened. This is a delivery derivative: estimated intermediate frames and more display pixels, **not 60 native generated frames/second, recovered detail or proof of improved aesthetics**. Duration differs by less than one output frame. No paid service, external processing, model download or dependency installation was used.

This exact tested recipe applies to that **81-frame, 16-fps, 832 × 560** input; derive frame count/size from the actual source for other clips. Padding supplies interpolation's endpoint context; the output frame bound removes that tail instead of lengthening the story:

```sh
ffmpeg -hide_banner -loglevel error -n -threads 2 -filter_threads 2 -i INPUT.mp4 \
  -vf "tpad=stop_duration=0.25:stop_mode=clone,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1664:1120:flags=lanczos,format=yuv420p" \
  -frames:v 304 -c:v libx264 -preset medium -crf 16 -threads 2 \
  -movflags +faststart -an OUTPUT.mp4
ffprobe -v error -show_streams -show_format -of json OUTPUT.mp4
```

Inspect intermediate edges, perforations, reflections, occlusion and cuts for ghosts/warping before choosing the derivative over the native file. Sampled sheets do not certify full temporal quality. Merely setting an fps flag or duplicating frames is not motion interpolation. Re-encoding at a lower CRF can limit additional compression loss, not restore lost source information. More steps, seconds, pixels and fps compete with compute, byte/decode budgets and continuity; **choose the smallest output that visibly serves the shot**, not the maximum number in every field. Local evidence: `work/frontend-craft-calibration-20261031/video-5s-60fps-upscaled/`.

### Verified anonymous REST sequence

Recheck live runtime/host/interface and select the no-account-credit route **before** submitting. Use a bounded HTTP client without Authorization, cookies, stored-account discovery, automatic retries or arbitrary redirects. Upload only media whose public submission is authorized.

1. `POST <host>/gradio_api/upload` with `multipart/form-data`, field **`files`**, containing the actual image bytes. Use a generic filename instead of exposing the local path. The response is a list of server paths; validate its shape. A local filesystem path or an arbitrary source URL is not that returned server path.
2. `POST <host>/gradio_api/call/generate_video` with JSON in the reviewed input order. The successful bounded test used:

```json
{"data":[{"path":"<returned_server_path>","meta":{"_type":"gradio.FileData"}},"<specific shot/motion prompt>",6,"distorted geometry, flicker, text, watermark, hands, scene cuts",2.0,1,1,2718,false]}
```

3. Validate the returned `event_id`, then read `GET <host>/gradio_api/call/generate_video/<event_id>` as SSE with a bounded deadline. An event ID is queue acceptance, not success. Stop on `error`; preserve its actual data. A timeout does not prove remote work stopped, so do not submit the same job again blindly.
4. On `complete`, the tested result was `[FileData, seed]`. Validate its HTTPS origin against the preflight host, reject credentials/redirects, bound bytes and validate MP4 signature/type before saving. Probe and decode the file, then inspect representative frames and motion before product acceptance.

This upload contract was checked against [Gradio's official route source](https://github.com/gradio-app/gradio/blob/main/gradio/routes.py) and the successful live test. If the interface changes, inspect it rather than replaying this payload blindly. The previously discovered native wrapper omitted `randomize_seed`; discover its actual parameters instead of inventing a tool name or assuming it is the verified anonymous route.

## 4. Verified higher-resolution generative route: LTX-2.5

The official `Lightricks/LTX-2.5` Space was inspected at revision `c42e4cd512ec0a861024699f031538eb7bf093a7`: complete `app.py`/README, live tool schema and `RUNNING` ZeroGPU metadata. Its two-stage distilled pipeline generates at half size, performs learned spatial latent upsampling, then full-resolution refinement; it is not the local Lanczos derivative. Source fixes **24 fps**, final dimensions on a 64-pixel grid, maximum side 1536, fixed 8 + 3 steps. Normal duration slider is 1–5 seconds; optional auto length has a 15-second ceiling, **not a tested fifteen-second result**. Capability, quota feasibility and visual quality are separate.

### Cost-checked existing-account route, not anonymous by assumption

The installed HF MCP uses an existing authenticated session. Before its one valid generation request, `hf_whoami` confirmed a **non-PRO account without organization memberships**. Current official [ZeroGPU terms](https://huggingface.co/docs/hub/spaces-zerogpu) list five included minutes for Free accounts; automatic prepaid extension applies to PRO/Team/Enterprise. This source uses `size="xlarge"`, consuming 2× quota. Its requested GPU reservation for the chosen 1280 × 832, 121-frame convolutional-decoder test was about 246 quota-seconds. Remaining account quota was not assumed unlimited; the request could still have been refused.

This was a new route selected for greater generative resolution/fps **before any quota error**, not switching identity to evade a failure. Recheck the actual account tier/organization and current terms on each host; do not invoke an authenticated route under free-only rules when spending cannot be excluded. Do not log account IDs, credentials or personal profile output in public artifacts. Never upgrade, add credits or change accounts after a quota/block. Quota resets follow the provider's rolling rule, not an assumed midnight reset.

### Actual tested I2V call

The approved synthetic reference was uploaded to the Space using the same anonymous multipart `files` contract. Its returned **public HTTPS file URL**, not the local path, was supplied to the verified `dynamic_space` tool:

```json
{
  "operation": "invoke",
  "space_name": "Lightricks/LTX-2.5",
  "tool_name": "LTX_2_5_run",
  "parameters": {
    "prompt": "<subject-specific shot and intended change>",
    "image_path": "<uploaded public synthetic image URL>",
    "height": 832,
    "width": 1280,
    "duration_s": 5,
    "seed": 2718,
    "decoder": "conv",
    "auto_len": false,
    "randomize_seed": false,
    "do_enhance": false
  }
}
```

Discover/view the actual tool parameters before future calls. Although the wrapper marked the image optional, omission returned `No value provided for required argument: image_path` and explicit null failed its string schema. Those two input-validation errors preceded the one successful valid I2V call; do not repeatedly vary null/empty input or claim text-to-video was verified. Source supports an image-free path, but this wrapper's T2V handling needs separate verification.

`do_enhance=false` avoided a second remote prompt-enhancer Space; `auto_len=false` avoided reserving for an unknown 15-second worst case. A larger target/auto length may exceed included quota even when a small request fits. The source's I2V framing helper pins the short side to 832 and crops to the selected aspect; inspect crop rather than stretching the reference. No final-frame or exact camera-path condition is exposed in this tested wrapper.

**Measured output:** 1280 × 832, 24 fps, 121 frames, 5.041667 s, H.264, one audio stream; probe assertions and full decode passed, five sampled frames and a full-size middle frame were opened. The subject and side-revealing progression were recognizable, but close inspection exposed distorted/connected perforation details. This is not finished product fidelity, exact hidden geometry, full temporal quality or a blind visual win over Wan. Audio was not listened to. Downloaded evidence: `work/frontend-craft-calibration-20261031/video-ltx25-hd-check/` on this host. Save temporary URLs immediately; this output used a same-host `/--replicas/<id>/gradio_api/file=...` path. Validate that observed shape/origin rather than following arbitrary redirects.

A separate local derivative of this LTX clip was also tested at **1280 × 832, 60 fps, 303 frames, 5.05 s, H.264, no audio**. It used the same motion-compensated interpolation/endpoint-padding approach above, without the Lanczos scale step, and bounded output to `ceil(source_duration × 60)` frames. Probe/full decode passed and five sampled frames were opened. This preserves the higher-resolution generative base without making it larger; it does not repair its distorted details or establish full temporal quality. Evidence: `work/frontend-craft-calibration-20261031/video-ltx25-60fps/`. Keep the native source and choose a derivative only when its visible benefit justifies estimated frames, encoding and delivery cost.

No weights/dependencies, account, subscription or top-up were installed/created. The serving Space's access to gated weights does not establish the user's model/output commercial rights. Keep synthetic media labeled, inspect delivery behavior and verify rights separately before production.

## 5. Working local composition option, explicitly chosen

Installed ffmpeg/ffprobe and native `zoompan`/libx264 help were checked. A local smoke render from the synthetic HF still produced **960 × 640, 3 seconds, 72 frames, 24 fps, H.264, no audio**. Its sampled frame sheet was opened. This is verified local composition, **not a successful Wan output**, a seamless loop, physical 3D, user-approved design or proof of more creative pages.

A checked recipe, with current project's actual source/output paths:

```sh
ffmpeg -hide_banner -loglevel error -n -loop 1 -i INPUT.webp \
  -vf "scale=1920:1280,zoompan=z='min(zoom+0.0005,1.035)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=72:s=960x640:fps=24,format=yuv420p" \
  -t 3 -c:v libx264 -preset veryfast -crf 20 -threads 2 \
  -movflags +faststart -an OUTPUT.mp4
ffprobe -v error -show_streams -show_format -of json OUTPUT.mp4
```

This gentle push-in is a transport/composition example, not a required look. Choose motion from the shot brief. Do not silently substitute it when the task requires genuine object action or generated scene change. Keep existing files safe (`-n`), bound duration/resolution/resources and use only known media inputs; no dependency/model installation follows from this recipe.

## 6. Persist, inspect and integrate

Save returned media immediately because service URLs may expire. Validate the selected output origin, file type/signature and bounded size before download; never execute returned content or follow arbitrary redirect targets. Record route/model/settings/source rights, actual seed and measured file metadata. A timeout does not prove remote inference stopped.

Probe the MP4 with ffprobe and decode representative frames/scene handoffs. Inspect identity/geometry continuity, crop, flicker, unwanted text, material/light and intended motion at delivery size. A contact sheet is sampled frame evidence, not full motion/audio/hardware verification. Do not infer 4K, a loop seam, 60 fps or commercial rights from an API success.

Deliver a poster/static alternative and appropriate reduced-motion behavior. Keep key text/actions in HTML over stable readable surfaces. Use muted/playsinline/autoplay/loop only where the product and browser policy support them; pause unnecessary offscreen/hidden playback and verify the loop if promised. No fake clinical/game footage or invented performance claims.

For cost and public-data policy see [free-first assets](../../references/free-assets.md); for shot intent and story grammar see [composition and personality](../../references/composition-and-personality.md). Report the chosen mode, actual file/checks and unresolved limits plainly.
