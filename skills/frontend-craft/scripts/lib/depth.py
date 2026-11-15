"""Depth from one photograph with Depth Anything V2 Small (Apache-2.0) on the CPU, for parallax.mjs.

    python3 depth.py <model.onnx> <W> <H>  < rgb24 raw frame of W x H  > uint16 little-endian depth, W x H

W and H must be multiples of 14. Near is high (65535), far is low (0). Needs numpy and onnxruntime.
"""
import sys

import numpy as np
import onnxruntime as ort

MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD = np.array([0.229, 0.224, 0.225], np.float32)


def main():
    model, w, h = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    raw = sys.stdin.buffer.read()
    if len(raw) != w * h * 3:
        sys.exit(f"depth.py: expected {w * h * 3} bytes of rgb24, got {len(raw)}")
    rgb = np.frombuffer(raw, dtype=np.uint8).reshape(h, w, 3).astype(np.float32) / 255.0
    x = ((rgb - MEAN) / STD).transpose(2, 0, 1)[None]
    session = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
    depth = session.run(None, {session.get_inputs()[0].name: x})[0].reshape(h, w)
    span = max(1e-6, float(depth.max() - depth.min()))
    sys.stdout.buffer.write((((depth - depth.min()) / span) * 65535).astype("<u2").tobytes())


if __name__ == "__main__":
    main()
