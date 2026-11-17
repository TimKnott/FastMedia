#!/usr/bin/env python3
"""Bounded public verification of the eight approved Open Graph artwork URLs.

Fetches only the allowlisted Base44 media host and returns independent evidence.
No credentials, cookies, third-party scripts, website edits, or recurring jobs.
"""
import argparse
import datetime as dt
import hashlib
import json
import pathlib
import urllib.error
import urllib.parse
import urllib.request

REGISTRY = pathlib.Path(__file__).resolve().parent.parent / "config" / "website-advantage-social-image-targets.json"
MEDIA_HOST = "media.base44.com"
MAX_BYTES = 5 * 1024 * 1024

class MediaRedirect(urllib.request.HTTPRedirectHandler):
    max_redirections = 3
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        parsed = urllib.parse.urlsplit(newurl)
        if parsed.scheme != "https" or parsed.hostname != MEDIA_HOST:
            raise ValueError("Image redirect outside approved media host")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def jpeg_dimensions(data):
    """Extract dimensions from JPEG SOF marker without external dependencies."""
    if data[:2] != bytes.fromhex("ffd8"):
        return None
    i = 2
    sof = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
    while i + 4 <= len(data):
        if data[i] != 0xFF:
            return None
        while i < len(data) and data[i] == 0xFF:
            i += 1
        if i >= len(data):
            break
        marker = data[i]
        i += 1
        if marker in (0xD9, 0xDA):
            break
        if marker in (0x01,) or 0xD0 <= marker <= 0xD7:
            continue
        if i + 2 > len(data):
            break
        n = int.from_bytes(data[i:i+2], "big")
        if n < 2 or i + n > len(data):
            return None
        if marker in sof and n >= 7:
            height = int.from_bytes(data[i+3:i+5], "big")
            width = int.from_bytes(data[i+5:i+7], "big")
            return (width, height)
        i += n
    return None

def verify(name, url):
    result = {"name": name, "url": url, "state": "unknown", "checked": False}
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname != MEDIA_HOST:
        result.update(state="blocked", reason="image URL not on allowlisted HTTPS media host")
        return result
    request = urllib.request.Request(url, headers={
        "User-Agent": "FastMedia-WebsiteAdvantageImageCheck/1.0",
        "Accept": "image/jpeg",
    })
    try:
        opener = urllib.request.build_opener(MediaRedirect)
        with opener.open(request, timeout=15) as response:
            content_type = response.headers.get("Content-Type", "").split(";")[0].lower()
            data = response.read(MAX_BYTES + 1)
            result.update(
                checked=True,
                status_code=response.status,
                content_type=content_type,
                bytes_read=len(data),
            )
            if len(data) > MAX_BYTES:
                result.update(state="needs_review", reason="image exceeds 5 MiB")
            else:
                dimensions = jpeg_dimensions(data)
                result["dimensions"] = list(dimensions) if dimensions else None
                result["sha256"] = hashlib.sha256(data).hexdigest()
                if response.status == 200 and content_type in ("image/jpeg", "image/jpg") and dimensions == (1200, 630):
                    result["state"] = "pass"
                else:
                    result.update(state="needs_review", reason="HTTP, type or dimensions differ from approved artwork requirements")
    except (ValueError, urllib.error.URLError, TimeoutError, OSError) as exc:
        result.update(state="unknown", reason=type(exc).__name__)
    return result

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="website-advantage-images.json")
    args = parser.parse_args()
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    targets = registry["targets"]
    if registry.get("schema_version") != 1 or len(targets) != 8:
        raise ValueError("Unexpected approved image registry")
    report = {
        "schema_version": 1,
        "checked_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "scope": "Eight approved public social artwork URLs, not live site metadata",
        "sites": [verify(name, url) for name, url in targets.items()],
    }
    pathlib.Path(args.output).write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "checked": len(report["sites"]),
        "pass": sum(x["state"] == "pass" for x in report["sites"]),
        "needs_review": sum(x["state"] == "needs_review" for x in report["sites"]),
        "unknown": sum(x["state"] == "unknown" for x in report["sites"]),
    }, indent=2))

if __name__ == "__main__":
    main()
