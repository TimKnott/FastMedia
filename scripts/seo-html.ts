import type { RouteSeo } from './seo-routes';

export const SEO_ORIGIN = 'https://www.fastmedia.pro';

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Public content only: never export account, authentication or parameter URLs. */
export function isIndexablePath(path: string): boolean {
  return path.startsWith('/') && !/[?#]|undefined/.test(path) &&
    !/^\/(admin|portal|account|auth|oauth|login|signup|logout|reset-password|checkout|grant-portal|showcase|404|not-found|api|lovable)(\/|$)/.test(path);
}

export function canonicalPath(path: string): string {
  const base = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return base === '/offer' || base === '/contact' ? `/cs${base}` : base;
}

export function breadcrumbSchema(route: RouteSeo): Record<string, unknown> {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'FastMedia.Pro', item: `${SEO_ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: route.h1 ?? route.title, item: SEO_ORIGIN + canonicalPath(route.path) },
  ] };
}

/** An accessible reading fallback for everyone, not different content for bots. */
export function buildCrawlBody(route: RouteSeo, allRoutes: RouteSeo[]): string {
  const language = route.language ?? 'en-GB';
  const cs = language.startsWith('cs');
  const de = language.startsWith('de');
  const links = allRoutes.filter(r => !r.noindex && isIndexablePath(r.path) && canonicalPath(r.path) === r.path && r.path !== route.path)
    // Campaign routes remain absent from public navigation, as requested.
    .filter(r => !['/business', '/equestrian'].includes(r.path));
  const related = links.filter(r => {
    if (route.path === '/') return !r.path.startsWith('/blog/');
    if (route.path === '/blog') return r.path.startsWith('/blog/');
    if (route.path === '/courses') return r.path.startsWith('/courses/');
    if (route.path.startsWith('/demo/')) return r.path.startsWith('/demo/');
    return ['/', '/calculator', '/cs/offer', '/cs/contact', '/about', '/case-studies', '/blog', '/courses', '/inquiry'].includes(r.path) || (route.path.startsWith('/l/') && r.path.startsWith('/l/'));
  });
  const paragraphs = route.contentBlocks?.length ? route.contentBlocks : [route.description];
  return `<main data-prerender="fallback" class="container mx-auto max-w-4xl px-6 py-12 bg-background text-foreground">
    <nav aria-label="${cs ? 'Drobečková navigace' : de ? 'Brotkrümelnavigation' : 'Breadcrumb'}"><a href="/">FastMedia.Pro</a> / ${escapeHtml(route.h1 ?? route.title)}</nav>
    <h1 class="font-display text-3xl font-bold my-6">${escapeHtml(route.h1 ?? route.title)}</h1>
    <p class="text-lg mb-6">${escapeHtml(route.description)}</p>
    ${paragraphs.map(p => `<p class="mb-4">${escapeHtml(p)}</p>`).join('\n')}
    <nav aria-label="${cs ? 'Související stránky' : de ? 'Weitere Seiten' : 'Related pages'}" class="flex flex-wrap gap-4 my-8">${related.map(r => `<a class="underline" href="${escapeHtml(r.path)}">${escapeHtml(r.h1 ?? r.title.split('|')[0])}</a>`).join('\n')}</nav>
    <p><a href="/calculator">${cs ? 'Naplánovat web v kalkulačce' : de ? 'Website im Kalkulator planen' : 'Plan a website in the calculator'}</a> · <a href="${de ? '/de/contact' : cs ? '/cs/contact' : '/en/contact'}">${cs ? 'Kontakt' : de ? 'Kontakt' : 'Contact'}</a></p>
    <p class="mt-4">FastMedia.Pro · Timothy Knott · IČO 17308551 · <a href="mailto:support@fastmedia.pro">support@fastmedia.pro</a></p>
  </main>
  <style>html[data-seo-pending] #root{display:none}body:has([data-prerender="fallback"]) #root{display:none}</style>
  <script>document.addEventListener('DOMContentLoaded',function(){
    document.documentElement.setAttribute('data-seo-pending','');
    function ready(){
      var root=document.getElementById('root');
      if(!root || !root.querySelector('h1,main,form')) return;
      document.documentElement.removeAttribute('data-seo-pending');
      document.querySelectorAll('[data-prerender="fallback"]').forEach(function(n){n.remove()});
      observer.disconnect();
    }
    var observer=new MutationObserver(ready);
    var root=document.getElementById('root');
    if(root) observer.observe(root,{childList:true,subtree:true});
    ready();
  });</script>`;
}

export function applyToTemplate(template: string, head: string, body: string): string {
  // The template's own title carries a data-rh attribute, so the pattern must
  // allow attributes — otherwise both titles survive and crawlers read the first.
  let html = template.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, '')
    .replace(/<meta\b(?=[^>]*\bname=["'](?:description|robots|twitter:[^"']*)["'])[^>]*>/gi, '')
    .replace(/<meta\b(?=[^>]*\bproperty=["']og:[^"']*["'])[^>]*>/gi, '')
    .replace(/<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*hreflang=)[^>]*>/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<\/head>/i, `${head}\n</head>`);
  // The root contains the branded boot state, not an empty div.
  return html.replace(/(<body\b[^>]*>)/i, `$1\n${body}`);
}