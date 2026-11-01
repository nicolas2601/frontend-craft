# Free-first asset production that can actually run

Choose the artifact from the product and its placement before choosing a generator. An interface icon, a finished illustration, a product photograph concept, a freely rotatable mesh and a timed film are different deliverables. Do not use rough vector placeholders merely because they are cheap, or generate unrelated imagery to make a weak page busier.

## 1. Production brief, not “make it premium”

The agent derives a concise asset brief from the user's short request:

`purpose/placement → subject/silhouette → composition and crop → material/light/camera → color role → required detail and exclusions → delivery format and fallback`

Reserve negative space for HTML copy where appropriate; prefer real text in the DOM over generated lettering. Keep a consistent object/material/light vocabulary across related assets. Inspect the result at actual presentation size and close-up for malformed geometry, incoherent materials, unwanted words/logos and mismatch with the intended crop. A successful API response is not aesthetic acceptance.

Preserve the prompt, model/provider, seed/settings, source/license and selected file alongside the asset. Label synthetic scenes honestly; never present an invented product, facility, person, credential or outcome as documentary evidence. Do not upload a client's private images/source to public inference without authorization.

## 2. Verified anonymous HF ZeroGPU route

On 2026-10-31, the public Space [mcp-tools/Z-Image-Turbo](https://huggingface.co/spaces/mcp-tools/Z-Image-Turbo) was running on `zero-a10g`. Its current app source exposed `/generate`, six parameters and a public Gradio API. The source's prompt-enhancement path was disabled; no paid enhancement was used.

The [official ZeroGPU documentation](https://huggingface.co/docs/hub/spaces-zerogpu) explicitly permits free use, subject to quotas. At inspection it listed 2 included GPU minutes for anonymous access and 5 for a free account, while paid tiers had larger quotas and could automatically consume **pre-paid credits after their included quota**. These limits can change. Model/Space Apache-2.0 metadata is not a promise that every hosted inference path is free or that every generated output is cleared for every commercial use.

**Consequently, do not blindly use an authenticated generation tool under a free-only requirement.** First establish the selected route's current budget/terms. The bundled helper uses anonymous HTTP from the outset, with no HF client, token, Authorization header, session cookies or account credits. It checks that the fixed public Space is currently running on ZeroGPU before requesting one image. It never rotates accounts, falls back to a paid endpoint or retries a quota/login failure. Do not use anonymous access to evade an earlier block or exhausted quota.

Verified invocation pattern, using the actual installed skill path:

```sh
python -I -B /absolute/path/to/frontend-craft/scripts/hf_zerogpu_asset.py \
  --prompt "PUBLIC SYNTHETIC ASSET BRIEF DERIVED FROM THIS PRODUCT" \
  --output-dir ./assets/generated/concept-01
```

The output directory must be empty. Supported shapes are square, 3:2 and 2:3 via `--resolution`; `--seed` accepts a non-negative 32-bit seed and rejects invalid values before any request. The helper saves the image and manifest, explicitly marked pending visual review. It bounds downloads, rejects redirects/unexpected asset origins, never overwrites an existing asset and stops on protocol/cost/hardware uncertainty. Re-check the live schema/source if the API changes; do not add automatic provider fallbacks. A timeout does not prove remote work was cancelled.

**Actual smoke evidence:** one anonymous request generated a 1248 × 832 WebP of a fictional ceramic desktop instrument. The file was opened and inspected: coherent main silhouette, a differentiated metal control, contact shadow, right-weighted composition and left-side copy space were visible. This proves this specific public route worked and produced an inspectable candidate—not that it is a final design, always available, physically accurate, or representative of another model's frontend skill. Its colors/object are not a style preset, and it is not bundled as a template asset. The helper's request/error/output boundaries have separate mocked unit tests; no second generation was needed for those checks.

## 3. Other routes and their real limits

| Need | First useful path | Boundary |
| --- | --- | --- |
| Icons and genuinely diagrammatic content | Existing licensed icon set, authored SVG/CSS | A small icon enlarged is not automatically finished hero media |
| A supplied/owned visual | Prepare/crop/compress the approved original | Preserve product identity and source rights; don't substitute unrelated stock |
| Public licensed imagery | Inspect the specific source/license and crop at target size | Attribution, depicted brands/people and claimed ownership still matter |
| Background removal/editing | A parameter-verified compatible tool, or local installed processing | `not-lain/background-removal` parameters were inspected, but price/quota/data handling and output were not tested; don't label it guaranteed free |
| True interactive 3D | Authored geometry/material/light/camera or a properly licensed mesh | A raster image that looks 3D cannot be freely orbited; provide semantic controls and static fallback |
| A video or product loop | [Internal video module](../modules/hf-video/SKILL.md): verified local composition and a separately classified Wan inference candidate | The anonymous Wan test returned an error, not a video. Music/footage rights and tool terms remain separate; no blanket free-commercial Remotion claim |
| Local open-weight inference | Only after hardware, storage, model terms and installation are explicitly chosen | This machine's bounded probe found no usable NVIDIA driver and no Blender; no model weights were downloaded |

For native HF MCP, use actual model/Space discovery and parameter tools. Record configured, retrieved and successfully invoked separately. Editing/video/3D entries in its catalog are candidates until their route, price, quota, license and outputs are checked. Do not install a large local model, create an account, top up, call Higgsfield/MiniMax paid media or send private references because a third-party skill suggests it.

If a free route is unavailable, retain the requested ambition and disclose the gap. Choose an appropriate existing/owned/licensed or deliberate original asset strategy, not a lower-fidelity drawing renamed as an approved direction.
