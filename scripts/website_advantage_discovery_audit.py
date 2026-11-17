#!/usr/bin/env python3
"""Read-only eight-site discovery-surface audit (robots, sitemap, optional llms.txt).

This checks public files only. It cannot establish Search Console submission,
indexing, AI rankings, bot compliance, or that every important URL is in a sitemap.
No credentials, personal data, background schedule, or site changes.
"""
import argparse
import datetime as dt
import json
import pathlib
import urllib.error
import urllib.parse
import urllib.request
from website_advantage_public_audit import SITES, LimitedRedirect

PATHS = ("robots.txt", "sitemap.xml", "llms.txt")
MAX_BYTES = 256 * 1024

def fetch_public_file(site_url, filename):
    url = site_url.rstrip("/") + "/" + filename
    req = urllib.request.Request(url, headers={
        "User-Agent": "FastMedia-WebsiteAdvantageDiscoveryAudit/1.0",
        "Accept": "text/plain,application/xml,text/xml,*/*",
    })
    result = {"url": url, "state": "unknown"}
    try:
        opener = urllib.request.build_opener(LimitedRedirect)
        with opener.open(req, timeout=12) as response:
            data = response.read(MAX_BYTES + 1)
            result["status_code"] = response.status
            result["final_url"] = response.geturl()
            result["content_type"] = response.headers.get("Content-Type", "").split(";")[0]
            if len(data) > MAX_BYTES:
                result.update(state="needs_review", detail="response exceeds 256 KiB inspection limit")
                return result
            text = data.decode("utf-8", errors="replace")
            if filename == "robots.txt":
                lines = [line.strip() for line in text.splitlines() if line.strip() and not line.lstrip().startswith("#")]
                result["user_agents"] = [line.split(":",1)[1].strip() for line in lines
                                         if line.lower().startswith("user-agent:")][:60]
                result["sitemap_directives"] = [line.split(":",1)[1].strip() for line in lines
                                                 if line.lower().startswith("sitemap:")][:30]
                result["robots_excerpt"] = "\n".join(lines[:100])[:4000]
                valid = bool(any(line.lower().startswith("user-agent:") for line in lines))
            elif filename == "sitemap.xml":
                valid = "<urlset" in text.lower() or "<sitemapindex" in text.lower()
            else:
                valid = text.lstrip().startswith("#") or text.lstrip().startswith(">")
            result["state"] = "present" if response.status == 200 and valid else "needs_review"
    except urllib.error.HTTPError as exc:
        result.update(state="missing_or_error", status_code=exc.code)
    except (urllib.error.URLError, TimeoutError, ValueError, OSError) as exc:
        result.update(state="unknown", detail=type(exc).__name__)
    return result

def audit_one(name, url):
    return {"name": name, "site_url": url,
            "resources": {filename: fetch_public_file(url, filename) for filename in PATHS}}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="website-advantage-discovery.json")
    args = parser.parse_args()
    report = {
        "schema_version": 1,
        "checked_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "scope": "Public robots.txt, sitemap.xml and optional llms.txt on eight homepage hosts",
        "limitations": [
            "Does not prove any URL is indexed or submitted to Google Search Console",
            "llms.txt is optional and its presence does not guarantee citations in AI answers",
            "Crawler access depends on the complete robots rules and site responses",
            "A network failure is unknown, not confirmed downtime",
        ],
        "sites": [audit_one(name, url) for name, url in SITES.items()],
    }
    pathlib.Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "sites": len(report["sites"]),
        "robots_present": sum(s["resources"]["robots.txt"]["state"] == "present" for s in report["sites"]),
        "sitemap_present": sum(s["resources"]["sitemap.xml"]["state"] == "present" for s in report["sites"]),
        "optional_llms_present": sum(s["resources"]["llms.txt"]["state"] == "present" for s in report["sites"]),
    }, indent=2))

if __name__ == "__main__":
    main()
