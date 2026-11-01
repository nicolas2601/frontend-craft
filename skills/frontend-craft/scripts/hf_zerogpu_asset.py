#!/usr/bin/env python3
"""One public, anonymous ZeroGPU image request; no tokens, cookies or paid fallback."""

import argparse
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

SPACE_ID = "mcp-tools/Z-Image-Turbo"
BASE = "https://mcp-tools-z-image-turbo.hf.space"
METADATA = "https://huggingface.co/api/spaces/" + SPACE_ID
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_SEED = 2 ** 32 - 1
RESOLUTIONS = (
    "1024x1024 ( 1:1 )",
    "1248x832 ( 3:2 )",
    "832x1248 ( 2:3 )",
)
IMAGE_SUFFIXES = {"image/png": ".png", "image/webp": ".webp", "image/jpeg": ".jpg"}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, file, code, message, headers, new_url):
        raise ValueError("Redirect refused; re-check the public endpoint before retrying")


def open_public(url, payload=None, timeout=30):
    headers = {"Accept": "application/json"}
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload).encode()
    request = urllib.request.Request(url, data=data, headers=headers)
    # No HF client, credential lookup, CookieProcessor or Authorization header.
    return urllib.request.build_opener(NoRedirect()).open(request, timeout=timeout)


def require_zerogpu(metadata):
    runtime = metadata.get("runtime", {})
    hardware = runtime.get("hardware", {})
    current = hardware.get("current") if isinstance(hardware, dict) else hardware
    if runtime.get("stage") != "RUNNING" or not str(current).startswith("zero-"):
        raise ValueError("Public Space is not running on verified ZeroGPU; no inference started")
    if metadata.get("host") != BASE:
        raise ValueError("Space host changed; inspect it before use")
    return current


def completed_result(stream, deadline):
    event = ""
    for raw in stream:
        if time.monotonic() > deadline:
            raise TimeoutError("Result deadline exceeded; no retry or paid fallback")
        line = raw.decode().strip()
        if line.startswith("event: "):
            event = line[7:]
        elif line.startswith("data: ") and event in ("complete", "error"):
            data = json.loads(line[6:])
            if event == "error":
                raise ValueError("Space rejected the request; stop here: " + str(data))
            return data
    raise ValueError("Result stream ended without a completed image")


def checked_asset_url(result):
    if not isinstance(result, list) or not result or not isinstance(result[0], dict):
        raise ValueError("Unexpected image result; inspect the response schema")
    url = result[0].get("url")
    parsed = urllib.parse.urlparse(url) if isinstance(url, str) else None
    if not parsed or parsed.scheme != "https" or parsed.hostname != urllib.parse.urlparse(BASE).hostname:
        raise ValueError("Unexpected asset URL; download refused")
    if parsed.username or parsed.password or parsed.port not in (None, 443):
        raise ValueError("Unexpected credentials or port in asset URL")
    return url


def image_bytes(response):
    mime = response.headers.get_content_type()
    if mime not in IMAGE_SUFFIXES:
        raise ValueError("Response is not a supported image")
    data = response.read(MAX_IMAGE_BYTES + 1)
    if not data or len(data) > MAX_IMAGE_BYTES:
        raise ValueError("Image is empty or exceeds the download limit")
    return data, IMAGE_SUFFIXES[mime]


def generate_asset(prompt, output_dir, seed=2718, resolution=RESOLUTIONS[1]):
    if not isinstance(seed, int) or not 0 <= seed <= MAX_SEED:
        raise ValueError("seed must be a non-negative 32-bit integer")
    if not prompt.strip() or resolution not in RESOLUTIONS:
        raise ValueError("A public nonempty prompt and supported resolution are required")
    if output_dir.exists() and any(output_dir.iterdir()):
        raise ValueError("Use an empty output directory; existing assets are never overwritten")
    output_dir.mkdir(parents=True, exist_ok=True)
    record = {"space": SPACE_ID, "transport": "anonymous HTTP", "prompt": prompt,
              "seed": seed, "resolution": resolution, "status": "pending",
              "visually_inspected": False, "output_rights_verified": False}
    try:
        with open_public(METADATA) as response:
            record["hardware"] = require_zerogpu(json.load(response))
        payload = {"prompt": prompt, "resolution": resolution, "seed": seed,
                   "steps": 8, "shift": 3.0, "random_seed": False}
        with open_public(BASE + "/gradio_api/call/v2/generate", payload) as response:
            event_id = json.load(response).get("event_id", "")
        if not isinstance(event_id, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", event_id):
            raise ValueError("Unexpected event identifier")
        with open_public(BASE + "/gradio_api/call/generate/" + event_id, timeout=110) as response:
            result = completed_result(response, time.monotonic() + 100)
        url = checked_asset_url(result)
        with open_public(url) as response:
            data, suffix = image_bytes(response)
        path = output_dir / ("asset" + suffix)
        with path.open("xb") as file:
            file.write(data)
        record.update(status="generated_pending_review", asset=path.name, bytes=len(data))
    except Exception as error:
        record.update(status="failed", error=str(error))
        write_manifest(output_dir, record)
        raise
    write_manifest(output_dir, record)
    return record


def write_manifest(output_dir, record):
    with (output_dir / "manifest.json").open("x") as file:
        json.dump(record, file, indent=2, ensure_ascii=False)
        file.write("\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prompt", required=True, help="Public/synthetic text only; sent to the public Space")
    parser.add_argument("--output-dir", required=True, type=Path, help="An empty asset directory")
    parser.add_argument("--seed", type=int, default=2718, help="Non-negative 32-bit seed")
    parser.add_argument("--resolution", choices=RESOLUTIONS, default=RESOLUTIONS[1])
    args = parser.parse_args()
    try:
        record = generate_asset(args.prompt, args.output_dir, args.seed, args.resolution)
    except Exception as error:
        parser.exit(1, "Asset generation stopped: " + str(error) + "\n")
    print(json.dumps(record, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
