"""Deterministic offline checks for the public PWA manifest survey."""
import importlib.util
import pathlib
import sys
import unittest
from unittest import mock

PATH = pathlib.Path(__file__).with_name("website_advantage_pwa_audit.py")
sys.path.insert(0, str(PATH.parent))
SPEC = importlib.util.spec_from_file_location("website_advantage_pwa_audit", PATH)
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)

class PwaAuditTests(unittest.TestCase):
    def test_manifest_link_in_raw_html(self):
        p = audit.ManifestLinkParser()
        p.feed('<head><link rel="manifest" href="/manifest.webmanifest">'
               '<meta name="theme-color" content="#123456"></head>')
        self.assertEqual(p.manifests, ["/manifest.webmanifest"])
        self.assertEqual(p.theme_color, "#123456")

    def test_rejects_unrelated_or_non_https_targets(self):
        allowed = "https://7hourteacher.com/"
        for href in ["https://other.example/manifest.json", "http://7hourteacher.com/manifest.json",
                     "javascript:alert(1)", "data:text/plain,foo", "https://localhost/pwa.json"]:
            with self.subTest(href=href):
                self.assertIsNone(audit.safe_manifest_url(allowed, href))
        self.assertEqual(audit.safe_manifest_url(allowed, "/manifest.json"),
                         "https://7hourteacher.com/manifest.json")

    def test_manifest_verified_only_on_complete_structure(self):
        response = (
          '<head><link rel="manifest" href="/manifest.json"></head>',
          '{"name":"Example","start_url":"/","display":"standalone","icons":[{"src":"/icon.png","sizes":"192x192"}]}',
        )
        with mock.patch.object(audit,"fetch_small",side_effect=[
            (200,"https://fastmedia.pro/",response[0]),
            (200,"https://fastmedia.pro/manifest.json",response[1])]):
            outcome = audit.inspect_site("FastMedia.Pro","https://fastmedia.pro/")
        self.assertEqual(outcome["state"],"manifest_structure_present")
        self.assertEqual(outcome["service_worker"],"not_tested")

    def test_missing_manifest_link_does_not_claim_installability(self):
        with mock.patch.object(audit,"fetch_small",return_value=(200,"https://calcurly.com/","<html></html>")):
            result = audit.inspect_site("Calcurly","https://calcurly.com/")
        self.assertEqual(result["state"],"no_manifest_link")
        self.assertFalse(result["manifest_linked"])

if __name__ == "__main__":
    unittest.main()
