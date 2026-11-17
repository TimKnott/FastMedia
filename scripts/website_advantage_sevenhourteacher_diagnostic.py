#!/usr/bin/env python3
"""Public HTTPS/DNS diagnosis for known SevenHourTeacher hostnames; no credentials."""
import datetime as dt
import json
import socket
import urllib.error
import urllib.parse
import urllib.request

HOSTS = (
    "sevenhourteacher.com",
    "www.sevenhourteacher.com",
    "seven-hour-teacher.lovable.app",
)
results = []
for host in HOSTS:
    row = {"host": host}
    try:
        addrs = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
        row["dns"] = "resolved"
        row["address_count"] = len({a[4][0] for a in addrs})
    except OSError as exc:
        row["dns"] = "error"
        row["dns_error"] = f"{type(exc).__name__}: {exc}"
    try:
        req = urllib.request.Request("https://" + host + "/", headers={"User-Agent":"FastMedia-WebsiteAdvantageDiagnostics/1.0"})
        with urllib.request.urlopen(req, timeout=12) as response:
            response.read(512)
            row["http_status"] = response.status
            row["final_host"] = urllib.parse.urlparse(response.geturl()).hostname
    except urllib.error.HTTPError as exc:
        row["http_status"] = exc.code
    except Exception as exc:
        row["http_error"] = f"{type(exc).__name__}: {str(exc)[:220]}"
    results.append(row)
with open("sevenhourteacher-domain-diagnostic.json", "w", encoding="utf-8") as fp:
    json.dump({"checked_at_utc":dt.datetime.now(dt.timezone.utc).isoformat(),"results":results},fp,ensure_ascii=False,indent=2)
for r in results:
    print(r["host"],"DNS:",r.get("dns"),r.get("dns_error",""),"HTTPS:",r.get("http_status",r.get("http_error")))
