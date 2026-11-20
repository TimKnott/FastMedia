"""Check both production sitemap exports after prerender. Pass --live to test the host too."""
import json
import sys
import uuid
from html.parser import HTMLParser
from pathlib import Path
from urllib import error, request, robotparser
from urllib.parse import urlsplit
from xml.etree import ElementTree

origin = 'https://www.fastmedia.pro'
dist = Path('dist')
robots = robotparser.RobotFileParser()
robots.parse((dist / 'robots.txt').read_text().splitlines())
urls = {node.text for filename in ('sitemap.xml', 'sitemap-content.xml')
        for node in ElementTree.parse(dist / filename).findall('.//{*}loc')}
issues = []


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.directives = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs.get('href'))
        if tag == 'meta' and attrs.get('name') in ('robots', 'googlebot'):
            self.directives.append(attrs.get('content', '').lower())


for url in sorted(urls):
    path = urlsplit(url).path
    html = dist / path.lstrip('/') / 'index.html'
    if not html.is_file():
        issues.append(f'{path}: missing built page')
        continue
    head = Head()
    head.feed(html.read_text())
    if head.canonicals != [url] or not url.startswith(origin + '/'):
        issues.append(f'{path}: wrong canonical {head.canonicals}')
    if any('noindex' in directive for directive in head.directives) or not robots.can_fetch('Googlebot', url):
        issues.append(f'{path}: sitemap advertises an excluded page')

for prompt in json.loads(Path('scripts/search-buyer-prompts.json').read_text()):
    if origin + prompt['path'] not in urls:
        issues.append(f"Missing buyer landing page: {prompt['path']}")

markets = {p['market'] for p in json.loads(Path('scripts/search-buyer-prompts.json').read_text())}
for market in ('English', 'Czech Republic', 'United Kingdom', 'European Union'):
    if market not in markets:
        issues.append(f'Buyer query set missing market: {market}')

limitations = []
if '--live' in sys.argv:
    UA = {'User-Agent': 'Mozilla/5.0 (FastMedia release check)'}
    class NoRedirect(request.HTTPRedirectHandler):
        def redirect_request(self, *args):
            return None

    probe = '/about?source=release-check'
    try:
        request.build_opener(NoRedirect).open(request.Request('https://fastmedia.pro' + probe, headers=UA), timeout=20).close()
        issues.append('Bare host returned success without redirecting')
    except error.HTTPError as response:
        location = response.headers.get('Location')
        if location != origin + probe:
            issues.append(f'Bare host redirect lost path/query: {response.code} {location}')
        elif response.code not in (301, 308):
            limitations.append(f'Bare host redirects with {response.code}, not permanent 301/308 (set by hosting)')
    checks = [('/services/wholesale-trade-portal', 200, b'Trade ordering portals for wholesalers'),
              ('/about', 200, b'#organization'),
              ('/missing-' + uuid.uuid4().hex, 404, None),
              ('/blog/missing-' + uuid.uuid4().hex, 404, None)]
    for path, expected, marker in checks:
        try:
            with request.urlopen(request.Request(origin + path, headers=UA), timeout=20) as response:
                status, body = response.status, response.read()
        except error.HTTPError as response:
            status, body = response.code, response.read()
        if expected == 200:
            if status != 200 or marker not in body:
                issues.append(f'{path}: expected prerendered page, got {status}')
        elif status != 404:
            shell = b'noindex' not in body
            limitations.append(f'{path}: hosting SPA fallback returned {status}' + (' (static shell, noindex added only after JS runs)' if shell else ' with noindex'))

print(f'Checked {len(urls)} distinct sitemap URLs. {len(issues)} issues.')
for issue in issues:
    print(issue)
for item in limitations:
    print('HOSTING LIMITATION:', item)
sys.exit(bool(issues))
