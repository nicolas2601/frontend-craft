import importlib.util
import io
import json
import tempfile
import unittest
from email.message import Message
from pathlib import Path
from unittest.mock import patch

MODULE = Path(__file__).resolve().parents[1] / "scripts" / "hf_zerogpu_asset.py"
spec = importlib.util.spec_from_file_location("hf_asset", MODULE)
asset = importlib.util.module_from_spec(spec)
spec.loader.exec_module(asset)


class Response(io.BytesIO):
    def __init__(self, data, mime="application/json"):
        super().__init__(data)
        self.headers = Message()
        self.headers["Content-Type"] = mime


def metadata(hardware="zero-a10g"):
    return {"host": asset.BASE, "runtime": {"stage": "RUNNING", "hardware": {"current": hardware}}}


class AssetTests(unittest.TestCase):
    def test_invalid_seed_stops_before_any_request(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(asset, "open_public") as network:
            for seed in (-1, 2 ** 32):
                with self.assertRaisesRegex(ValueError, "seed"):
                    asset.generate_asset("Public product", Path(folder) / str(seed), seed=seed)
            network.assert_not_called()

    def test_requires_current_zerogpu_and_expected_host(self):
        self.assertEqual(asset.require_zerogpu(metadata()), "zero-a10g")
        for data in (metadata("cpu-basic"), {**metadata(), "host": "https://other.example"}, {}):
            with self.assertRaises(ValueError):
                asset.require_zerogpu(data)

    def test_download_rejects_other_origins_and_credentials(self):
        self.assertEqual(asset.checked_asset_url([{"url": asset.BASE + "/gradio_api/file=image.webp"}]),
                         asset.BASE + "/gradio_api/file=image.webp")
        for url in ("http://localhost/image", "https://other.example/x", asset.BASE.replace("https://", "https://user:pass@") + "/x", asset.BASE + ":444/x"):
            with self.assertRaises(ValueError):
                asset.checked_asset_url([{"url": url}])
        for result in (None, [], [None], [{"path": "/tmp/image"}]):
            with self.assertRaises(ValueError):
                asset.checked_asset_url(result)

    def test_stream_errors_stop_without_a_retry(self):
        self.assertEqual(asset.completed_result([b'event: complete\n', b'data: ["ok"]\n'], float("inf")), ["ok"])
        for lines in ([b'event: error\n', b'data: {"message":"quota exhausted"}\n'], []):
            with self.assertRaises(ValueError):
                asset.completed_result(lines, float("inf"))

    def test_image_type_and_size_boundary(self):
        self.assertEqual(asset.image_bytes(Response(b"image bytes", "image/webp"))[1], ".webp")
        with self.assertRaises(ValueError):
            asset.image_bytes(Response(b"<html>error</html>", "text/html"))
        with patch.object(asset, "MAX_IMAGE_BYTES", 4):
            with self.assertRaises(ValueError):
                asset.image_bytes(Response(b"12345", "image/webp"))

    def test_one_request_flow_and_existing_output_protection(self):
        calls = []

        def fake(url, payload=None, timeout=30):
            calls.append((url, payload))
            if url == asset.METADATA:
                return Response(json.dumps(metadata()).encode())
            if payload is not None:
                return Response(b'{"event_id":"one-event"}')
            if "/call/generate/" in url:
                body = 'event: complete\ndata: ' + json.dumps([{"url": asset.BASE + "/gradio_api/file=image.webp"}]) + '\n'
                return Response(body.encode())
            return Response(b"image bytes", "image/webp")

        with tempfile.TemporaryDirectory() as folder, patch.object(asset, "open_public", fake):
            output = Path(folder) / "asset"
            result = asset.generate_asset("Public fictional product", output)
            self.assertEqual(result["status"], "generated_pending_review")
            self.assertFalse(result["visually_inspected"])
            self.assertEqual(sum(payload is not None for _, payload in calls), 1)
            self.assertEqual((output / "asset.webp").read_bytes(), b"image bytes")
            before = len(calls)
            with self.assertRaises(ValueError):
                asset.generate_asset("Another product", output)
            self.assertEqual(len(calls), before)


if __name__ == "__main__":
    unittest.main()
