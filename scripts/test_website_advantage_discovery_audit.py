"""Offline tests for Website Advantage public discovery audit."""
import importlib.util
import pathlib
import unittest
from unittest import mock

PATH = pathlib.Path(__file__).with_name("website_advantage_discovery_audit.py")
SPEC = importlib.util.spec_from_file_location("website_advantage_discovery_audit", PATH)
# The script imports the sibling audit module in normal Python execution.
import sys
sys.path.insert(0, str(PATH.parent))
discovery = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(discovery)

class DiscoveryTests(unittest.TestCase):
    def test_sitemap_xml_parses_namespaces_and_counts_urls(self):
        xml = ('<?xml version="1.0"?>'
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
               '<url><loc>https://example.com/1</loc></url>'
               '<url><loc>https://example.com/2</loc></url>'
               '</urlset>')
        self.assertEqual(discovery.inspect_sitemap_xml(xml.encode("utf-8")),
                         {"kind": "urlset", "entries": 2})

    def test_sitemap_xml_rejects_html_and_malformed_xml(self):
        self.assertIsNone(discovery.inspect_sitemap_xml(b"<html><body>fallback</body></html>"))
        self.assertIsNone(discovery.inspect_sitemap_xml(b"<urlset><url></urlset>"))

    def test_sitemap_index_counts_child_sitemaps(self):
        xml = b'<sitemapindex><sitemap/><sitemap/></sitemapindex>'
        self.assertEqual(discovery.inspect_sitemap_xml(xml), {"kind": "sitemapindex", "entries": 2})

    def test_only_expected_public_resources(self):
        self.assertEqual(discovery.PATHS, ("robots.txt", "sitemap.xml", "llms.txt"))
        self.assertEqual(len(discovery.SITES), 8)
    def test_audit_does_not_wander_beyond_named_paths(self):
        with mock.patch.object(discovery, "fetch_public_file",
                               side_effect=lambda url, path: {"url": url + path, "state": "unknown"}) as fetch:
            result = discovery.audit_one("FastMedia.Pro", "https://fastmedia.pro/")
        self.assertEqual(set(result["resources"]), set(discovery.PATHS))
        self.assertEqual(fetch.call_count, 3)

if __name__ == "__main__":
    unittest.main()
