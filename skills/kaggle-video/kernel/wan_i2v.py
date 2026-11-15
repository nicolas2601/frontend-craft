"""Kaggle kernel: one image-to-video clip with Wan 2.2 TI2V-5B (Apache-2.0) on a T4.

kaggle-video.mjs fills in the settings and the still below and pushes this file as a script kernel. Everything the
run needs is inside it: the still, the prompt and the settings. Output in /kaggle/working: clip.mp4 and run.json.

The T4 has no fast bfloat16, so the video model runs in float16 (Wan 2.2 5B stays finite in it). The text
encoder (UMT5-XXL) overflows in float16, so the prompts are encoded once in float32 on the CPU and the encoder
is freed before the video model loads.
"""
import base64
import gc
import io
import json
import os
import subprocess
import sys
import time

T0 = time.time()
CFG = json.loads(base64.b64decode("__CFG_B64__"))
IMAGE_B64 = "__IMAGE_B64__"
OUT = "/kaggle/working"
REPORT = {"cfg": {k: v for k, v in CFG.items()}, "steps_s": []}


def log(*parts):
    print(f"[{time.time() - T0:8.1f}s]", *parts, flush=True)


def save_report(**extra):
    REPORT.update(extra)
    REPORT["elapsed_s"] = round(time.time() - T0, 1)
    with open(os.path.join(OUT, "run.json"), "w") as f:
        json.dump(REPORT, f, indent=2)


def install():
    pkgs = ["diffusers>=0.35.0", "transformers>=4.51", "accelerate", "ftfy", "imageio", "imageio-ffmpeg", "sentencepiece"]
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", *pkgs], check=True)


def main():
    install()
    log("installed")
    import torch
    from PIL import Image
    from transformers import AutoTokenizer, UMT5EncoderModel
    from diffusers import AutoencoderKLWan, UniPCMultistepScheduler, WanImageToVideoPipeline
    from diffusers.utils import export_to_video

    REPORT["gpus"] = [torch.cuda.get_device_name(i) for i in range(torch.cuda.device_count())]
    log("gpus", REPORT["gpus"])
    model = CFG["model"]
    image = Image.open(io.BytesIO(base64.b64decode(IMAGE_B64))).convert("RGB").resize((CFG["width"], CFG["height"]), Image.LANCZOS)

    tokenizer = AutoTokenizer.from_pretrained(model, subfolder="tokenizer")
    encoder = UMT5EncoderModel.from_pretrained(model, subfolder="text_encoder", torch_dtype=torch.float32)
    log("text encoder loaded")

    def encode(text):
        ids = tokenizer([text], padding="max_length", max_length=512, truncation=True, add_special_tokens=True, return_attention_mask=True, return_tensors="pt")
        with torch.no_grad():
            hidden = encoder(ids.input_ids, ids.attention_mask).last_hidden_state
        n = int(ids.attention_mask.sum())
        hidden[:, n:] = 0  # the pipeline zeroes the padding the same way
        return hidden.to(torch.float16)

    prompt_embeds, negative_embeds = encode(CFG["prompt"]), encode(CFG["negative"])
    del encoder
    gc.collect()
    log("prompts encoded")

    vae = AutoencoderKLWan.from_pretrained(model, subfolder="vae", torch_dtype=torch.float32)
    pipe = WanImageToVideoPipeline.from_pretrained(model, vae=vae, text_encoder=None, tokenizer=None, torch_dtype=torch.float16)
    pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config, flow_shift=CFG["flow_shift"])
    pipe.enable_model_cpu_offload()
    pipe.vae.enable_tiling()
    log("pipeline ready")

    last = [time.time()]

    def on_step(p, i, t, kw):
        now = time.time()
        REPORT["steps_s"].append(round(now - last[0], 1))
        last[0] = now
        log(f"step {i + 1}/{CFG['steps']} {REPORT['steps_s'][-1]}s")
        return kw

    generator = torch.Generator(device="cpu").manual_seed(CFG["seed"])
    with torch.inference_mode():
        frames = pipe(
            image=image,
            prompt_embeds=prompt_embeds.to("cuda"),
            negative_prompt_embeds=negative_embeds.to("cuda"),
            height=CFG["height"],
            width=CFG["width"],
            num_frames=CFG["frames"],
            num_inference_steps=CFG["steps"],
            guidance_scale=CFG["guidance"],
            generator=generator,
            callback_on_step_end=on_step,
        ).frames[0]
    log("denoised and decoded", len(frames), "frames")
    export_to_video(frames, os.path.join(OUT, "clip.mp4"), fps=CFG["fps"])
    save_report(ok=True, frames=len(frames))
    log("wrote clip.mp4")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:  # the report must say why, the log alone is easy to lose
        save_report(ok=False, error=f"{type(err).__name__}: {err}")
        raise
