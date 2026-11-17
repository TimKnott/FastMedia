"""Offline, deterministic tests for public artwork verification."""
import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).with_name("website_advantage_image_verify.py")
SPEC = importlib.util.spec_from_file_location("website_advantage_image_verify", PATH)
image_check = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(image_check)

class ImageVerifierTests(unittest.TestCase):
    def test_jpeg_sof_dimensions(self):
        # Minimal JPEG segment containing an SOF0 frame; no network or Pillow.
        data = bytes.fromhex("ffd8ffc0001108027604b003011100021100031100ffd9")
        self.assertEqual(image_check.jpeg_dimensions(data), (1200, 630))

    def test_invalid_bytes_not_treated_as_image(self):
        self.assertIsNone(image_check.jpeg_dimensions(b"<html>error</html>"))
        self.assertIsNone(image_check.jpeg_dimensions(b""))

    def test_unlisted_url_is_blocked_before_network(self):
        r = image_check.verify("Bad host", "https://localhost/internal")
        self.assertEqual(r["state"], "blocked")
        self.assertFalse(r["checked"])

    def test_all_eight_approved_targets_are_https(self):
        import json
        registry = json.loads(image_check.REGISTRY.read_text(encoding="utf-8"))
        self.assertEqual(len(registry["targets"]), 8)
        for url in registry["targets"].values():
            self.assertTrue(url.startswith("https://media.base44.com/"))

if __name__ == "__main__":
    unittest.main()
