#!/usr/bin/env python3
"""Read-only public website metadata audit. No credentials or private endpoints.

This script makes bounded HTTP requests to eight allowlisted domains and writes
a local JSON evidence report. It never modifies a website, follows a limited
number of redirects, or claims that a failed network check proves downtime.
"""
import argparse
import datetime as dt
import html.parser
import json
import pathlib
import urllib.error
import urllib.parse
import urllib.request

SITES = {
    "FastMedia.Pro": "https://fastmedia.pro/",
    "SevenHourTeacher": "https://sevenhourteacher.com/",
    "Koně a Stáje": "https://koneastaje.com/",
    "Zelený Kůň": "https://zelenykun.com/",
    "StandaToys": "https://standatoys.com/",
    "The Progenitors": "https://theprogenitors.com/",
    "Calcurly": "https://calcurly.com/",
    "JusticeLeague": "https://justiceleague.online/",
}

TARGETS_FILE = pathlib.Path(__file__).resolve().parent.parent / "config" / "website-advantage-social-image-targets.json"

def approved_social_targets():
    with TARGETS_FILE.open(encoding="utf-8") as file:
        data = json.load(file)
    names = set(SITES)
    if data.get("schema_version") != 1 or set(data.get("targets", {})) != names:
        raise ValueError("Approved image registry does not contain exactly the eight portfolio sites")
    return data["targets"]

class MetaParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.canonical = None
        self.title = None
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta":
            key = (a.get("property") or a.get("name") or "").lower()
            if key and key not in self.meta:
                self.meta[key] = a.get("content", "")
        elif tag == "link" and a.get("rel", "").lower() == "canonical":
            self.canonical = a.get("href")
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title = (self.title or "") + data

ALLOWED_HOSTS = frozenset(
    host
    for url in SITES.values()
    for host in (
        urllib.parse.urlsplit(url).hostname,
        "www." + urllib.parse.urlsplit(url).hostname,
    )
)

class LimitedRedirect(urllib.request.HTTPRedirectHandler):
    max_redirections = 4

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        parsed = urllib.parse.urlsplit(newurl)
        # Never follow a redirect to localhost, private networks, or unlisted hosts.
        if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
            raise ValueError("redirect target is outside the audited host allowlist")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def fetch(url, timeout=12, max_bytes=524288):
    req = urllib.request.Request(url, headers={
        "User-Agent": "FastMedia-WebsiteAdvantageAudit/1.0 (+public metadata only)",
        "Accept": "text/html,application/xhtml+xml",
    })
    opener = urllib.request.build_opener(LimitedRedirect)
    with opener.open(req, timeout=timeout) as resp:
        final_url = resp.geturl()
        if urllib.parse.urlsplit(final_url).scheme not in ("http", "https"):
            raise ValueError("unexpected redirect scheme")
        data = resp.read(max_bytes)
        return resp.status, final_url, data.decode("utf-8", errors="replace")

def audit(name, url, approved_image_url):
    result = {"name": name, "url": url, "state": "unknown", "checks": {},
              "approved_image_url": approved_image_url, "approved_image_match": "unknown"}
    try:
        status, final_url, page = fetch(url)
        result["http_status"] = status
        result["final_url"] = final_url
        parser = MetaParser()
        parser.feed(page)
        result["checks"] = {
            "title": bool((parser.title or "").strip()),
            "description": bool(parser.meta.get("description")),
            "canonical": bool(parser.canonical),
            "og_title": bool(parser.meta.get("og:title")),
            "og_description": bool(parser.meta.get("og:description")),
            "og_image": bool(parser.meta.get("og:image")),
            "twitter_image": bool(parser.meta.get("twitter:image")),
        }
        result["og_image_url"] = parser.meta.get("og:image")
        result["approved_image_match"] = (
            "match" if result["og_image_url"] == approved_image_url
            else "different" if result["og_image_url"] else "missing"
        )
        result["canonical_url"] = parser.canonical
        result["state"] = "pass" if status == 200 and all(result["checks"].values()) else "needs_review"
        # This state covers only the seven listed HTML metadata fields, not
        # actual social image availability, indexing or website health.
    except (urllib.error.URLError, TimeoutError, ValueError, OSError) as exc:
        result["error"] = type(exc).__name__
        result["state"] = "unknown"
    return result

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--output", default="website-advantage-audit.json")
    args = p.parse_args()
    targets = approved_social_targets()
    report = {
        "schema_version": 2,
        "checked_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "scope": "public homepage HTML metadata only",
        "limitations": [
            "Not an authenticated security test",
            "Does not verify image HTTP response or WhatsApp cache",
            "A network error is unknown, not proof of outage",
            "Dynamic JavaScript-inserted tags may not appear in raw HTML",
            "Approved image match compares URL strings only; it does not prove the image loads",
        ],
        "sites": [audit(name, url, targets[name]) for name, url in SITES.items()],
    }
    with open(args.output, "w", encoding="utf-8") as file:
        json.dump(report, file, indent=2, ensure_ascii=False)
    print(json.dumps({"checked": len(report["sites"]),
        "pass": sum(s["state"] == "pass" for s in report["sites"]),
        "needs_review": sum(s["state"] == "needs_review" for s in report["sites"]),
        "unknown": sum(s["state"] == "unknown" for s in report["sites"])}, indent=2))

if __name__ == "__main__":
    main()
