"""Offline regression tests: no network requests or customer data."""
import importlib.util
import pathlib
import unittest
from unittest import mock
import urllib.request

PATH = pathlib.Path(__file__).with_name("website_advantage_public_audit.py")
SPEC = importlib.util.spec_from_file_location("website_advantage_public_audit", PATH)
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)

class MetadataAuditTests(unittest.TestCase):
    def test_parses_social_and_canonical(self):
        parser = audit.MetaParser()
        parser.feed('<html><head><title>Example</title><meta name="description" content="Test">'
                    '<meta property="og:image" content="https://example.com/og.jpg">'
                    '<link rel="canonical" href="https://example.com/"></head></html>')
        self.assertEqual(parser.title, "Example")
        self.assertEqual(parser.meta["og:image"], "https://example.com/og.jpg")
        self.assertEqual(parser.canonical, "https://example.com/")

    def test_redirects_to_other_hosts_rejected(self):
        handler = audit.LimitedRedirect()
        request = urllib.request.Request("https://fastmedia.pro/")
        for url in ["http://fastmedia.pro/", "https://localhost/admin",
                    "https://127.0.0.1/", "https://other.example/"]:
            with self.subTest(url=url), self.assertRaises(ValueError):
                handler.redirect_request(request, None, 302, "Found", {}, url)

    def test_www_canonical_redirect_is_allowed(self):
        handler = audit.LimitedRedirect()
        request = urllib.request.Request("https://fastmedia.pro/")
        redirect = handler.redirect_request(request, None, 301, "Moved", {}, "https://www.fastmedia.pro/")
        self.assertEqual(redirect.full_url, "https://www.fastmedia.pro/")

    def test_approved_image_registry_matches_eight_sites(self):
        targets = audit.approved_social_targets()
        self.assertEqual(set(targets), set(audit.SITES))
        self.assertTrue(all(x.startswith("https://media.base44.com/") for x in targets.values()))

    def test_social_image_match_and_different_are_distinguished(self):
        approved = audit.approved_social_targets()["FastMedia.Pro"]
        page = ('<html><head><title>Example</title><meta name="description" content="ok">'
                '<meta property="og:title" content="Example">'
                '<meta property="og:description" content="ok">'
                '<meta property="og:image" content="' + approved + '">'
                '<meta name="twitter:image" content="' + approved + '">'
                '<link rel="canonical" href="https://fastmedia.pro/"></head></html>')
        with mock.patch.object(audit, "fetch", return_value=(200, "https://fastmedia.pro/", page)):
            result = audit.audit("FastMedia.Pro", "https://fastmedia.pro/", approved)
        self.assertEqual(result["approved_image_match"], "match")
        self.assertEqual(result["state"], "pass")
        different = page.replace(approved, "https://example.net/other.jpg")
        with mock.patch.object(audit, "fetch", return_value=(200, "https://fastmedia.pro/", different)):
            result = audit.audit("FastMedia.Pro", "https://fastmedia.pro/", approved)
        self.assertEqual(result["approved_image_match"], "different")
        self.assertEqual(result["state"], "pass")

    def test_base44_resized_approved_image_is_distinguished(self):
        approved = audit.approved_social_targets()["JusticeLeague"]
        transformed = approved + "/v1/fill/w_1200,h_630/approved.jpg"
        self.assertEqual(audit.compare_image_url(approved, approved), "match")
        self.assertEqual(audit.compare_image_url(transformed, approved), "platform_resized")
        self.assertEqual(audit.compare_image_url("https://example.com/other.jpg", approved), "different")
        self.assertEqual(audit.compare_image_url(None, approved), "missing")
        self.assertEqual(audit.compare_image_url(approved + ".attacker.example/v1/fill/a", approved), "different")

    def test_eight_unique_https_sites(self):
        self.assertEqual(len(audit.SITES), 8)
        self.assertEqual(len(set(audit.SITES.values())), 8)
        self.assertTrue(all(x.startswith("https://") for x in audit.SITES.values()))

if __name__ == "__main__":
    unittest.main()
