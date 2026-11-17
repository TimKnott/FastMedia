#!/usr/bin/env python3
"""Public-only, bounded PWA manifest survey for the eight FastMedia sites.

This does NOT claim an installable PWA, offline support or service-worker
registration. It checks raw homepage HTML and a linked same-site manifest only.
"""
import argparse
import datetime as dt
import html.parser
import json
import pathlib
import urllib.parse
import urllib.error
import urllib.request
from website_advantage_public_audit import SITES, LimitedRedirect

LIMIT = 140 * 1024

class ManifestLinkParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.manifests = []
        self.theme_color = None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "link" and "manifest" in a.get("rel", "").lower().split():
            if a.get("href"):
                self.manifests.append(a["href"])
        elif tag == "meta" and a.get("name", "").lower() == "theme-color":
            self.theme_color = a.get("content")

def safe_manifest_url(site_url, href):
    if not href or href.startswith(("data:", "javascript:")):
        return None
    url = urllib.parse.urljoin(site_url, href)
    parsed = urllib.parse.urlsplit(url)
    site = urllib.parse.urlsplit(site_url)
    allowed = {site.hostname, "www." + (site.hostname or "")}
    # Avoid fetching arbitrary third-party or internal endpoints from a meta tag.
    if parsed.scheme != "https" or parsed.hostname not in allowed or parsed.username:
        return None
    return url

def fetch_small(url, accept):
    req = urllib.request.Request(url, headers={
        "User-Agent": "FastMedia-WebsiteAdvantagePWAInspector/1.0",
        "Accept": accept,
    })
    with urllib.request.build_opener(LimitedRedirect).open(req, timeout=15) as resp:
        b = resp.read(LIMIT + 1)
        if len(b) > LIMIT:
            raise ValueError("Response exceeds bounded 140 KiB audit limit")
        return resp.status, resp.geturl(), b.decode("utf-8", errors="replace")

def inspect_site(name, site_url):
    result = {"name":name, "url":site_url, "state":"unknown",
              "manifest_linked":False, "service_worker":"not_tested"}
    try:
        status, final_url, raw = fetch_small(site_url, "text/html")
        parser = ManifestLinkParser()
        parser.feed(raw)
        result.update(http_status=status, final_url=final_url,
                      theme_color_present=bool(parser.theme_color),
                      manifest_linked=bool(parser.manifests),
                      manifest_links_count=len(parser.manifests))
        if not parser.manifests:
            result.update(state="no_manifest_link", reason="No manifest link in raw homepage HTML")
            return result
        manifest_url = safe_manifest_url(final_url, parser.manifests[0])
        if not manifest_url:
            result.update(state="unverified_manifest_link", reason="Manifest URL outside allowlisted HTTPS host")
            return result
        result["manifest_url"] = manifest_url
        code, final_manifest, body = fetch_small(manifest_url, "application/manifest+json,application/json")
        manifest = json.loads(body)
        if not isinstance(manifest, dict):
            result.update(state="invalid_manifest")
            return result
        icons = manifest.get("icons") if isinstance(manifest.get("icons"), list) else []
        start = manifest.get("start_url", "/")
        result.update(manifest_http_status=code, final_manifest_url=final_manifest,
            name_present=bool(manifest.get("name") or manifest.get("short_name")),
            start_url_present=isinstance(start, str) and bool(start),
            display=manifest.get("display"),
            icons_count=len(icons),
            icon_size_labels=[str(i.get("sizes", ""))[:30] for i in icons[:8] if isinstance(i, dict)])
        result["state"] = "manifest_structure_present" if (
            code == 200 and result["name_present"] and result["start_url_present"] and len(icons)
        ) else "manifest_needs_review"
    except urllib.error.HTTPError as exc:
        result.update(state="missing_or_error", http_error=exc.code)
    except (urllib.error.URLError, TimeoutError, ValueError, OSError, json.JSONDecodeError) as exc:
        result.update(state="unknown", error_type=type(exc).__name__)
    return result

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--output", default="website-advantage-pwa-audit.json")
    args = p.parse_args()
    sites = [inspect_site(name,url) for name,url in SITES.items()]
    report = {
      "schema_version": 1,
      "checked_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
      "scope": "Public homepage manifest links and linked manifest structure",
      "limitations": [
        "Manifest presence alone does not prove actual installation or offline operation",
        "Service-worker registration and mobile prompts require real browser testing",
        "A network error is unknown, not confirmed downtime",
      ],
      "sites": sites,
    }
    pathlib.Path(args.output).write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"sites":len(sites),
       "manifest_structure_present":sum(s["state"]=="manifest_structure_present" for s in sites),
       "no_manifest_link":sum(s["state"]=="no_manifest_link" for s in sites),
       "unknown_or_review":sum(s["state"] not in ("manifest_structure_present","no_manifest_link") for s in sites)}))

if __name__=="__main__":
    main()
