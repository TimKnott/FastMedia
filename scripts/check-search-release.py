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

if '--live' in sys.argv:
    class NoRedirect(request.HTTPRedirectHandler):
        def redirect_request(self, *args):
            return None

    probe = '/about?source=release-check'
    try:
        request.build_opener(NoRedirect).open('https://fastmedia.pro' + probe, timeout=20).close()
        issues.append('Bare host returned success without redirecting')
    except error.HTTPError as response:
        if response.code not in (301, 308) or response.headers.get('Location') != origin + probe:
            issues.append(f'Bare host returned {response.code}: {response.headers.get("Location")}')
    for path, expected in [('/services/wholesale-trade-portal', 200), ('/missing-' + uuid.uuid4().hex, 404)]:
        try:
            with request.urlopen(origin + path, timeout=20) as response:
                status = response.status
                if expected == 200 and b'Trade ordering portals for wholesalers' not in response.read():
                    issues.append(f'{path}: expected page content missing')
        except error.HTTPError as response:
            status = response.code
        if status != expected:
            issues.append(f'{path}: expected HTTP {expected}, got {status}')

print(f'Checked {len(urls)} distinct sitemap URLs. {len(issues)} issues.')
for issue in issues:
    print(issue)
sys.exit(bool(issues))
