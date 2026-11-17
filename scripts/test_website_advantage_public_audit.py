"""Offline regression tests: no network requests or customer data."""
import importlib.util
import pathlib
import unittest
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

    def test_eight_unique_https_sites(self):
        self.assertEqual(len(audit.SITES), 8)
        self.assertEqual(len(set(audit.SITES.values())), 8)
        self.assertTrue(all(x.startswith("https://") for x in audit.SITES.values()))

if __name__ == "__main__":
    unittest.main()
