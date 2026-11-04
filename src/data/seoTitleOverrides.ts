// Search-only titles for database-backed pages whose stored titles exceed 65 chars.
// Visible headings are untouched. Each override applies only while the stored title
// still equals `original`, so other languages and later edits are never masked.
export const SEO_TITLE_OVERRIDES: Record<string, { original: string; seo: string }> = {
  '/blog/web-pro-zeny-v-podnikani': { original: 'Web pro ženy v podnikání: Jak vybudovat online přítomnost, která prodává', seo: 'Web pro ženy v podnikání: online přítomnost, která prodává' },
  '/blog/web-pro-svatebni-koordinatorky': { original: 'Web pro svatební koordinátorky: Od první poptávky po poslední tanec', seo: 'Web pro svatební koordinátorky: od poptávky po tanec' },
  '/blog/web-pro-nehtove-studio': { original: 'Web pro nehtové studio: Jak online rezervace zvýší vaše tržby o 30 %', seo: 'Web pro nehtové studio s online rezervací | FastMedia.Pro' },
  '/blog/web-pro-masazni-studio': { original: 'Web pro masážní studio: Relaxace pro klienty, automatizace pro vás', seo: 'Web pro masážní studio: relaxace i automatizace' },
  '/blog/web-pro-vyzivove-poradkyne': { original: 'Web pro výživové poradkyně: Jak online přítomnost zvýší vaši klientelu', seo: 'Web pro výživové poradkyně: více klientů online' },
  '/blog/never-lose-a-lead-instant-reply-crm-automation': { original: 'Never Lose a Lead Again: Instant Replies, CRM Capture and the 5-Minute Rule', seo: 'Never Lose a Lead: Instant Replies & CRM Capture' },
  '/blog/why-small-business-websites-fail-to-convert': { original: 'Why Most Small-Business Websites Fail to Convert (and How to Fix Yours)', seo: 'Why Small-Business Websites Fail to Convert' },
  '/blog/ai-website-cost-calculator-saved-small-business-hours-2026': { original: 'How an AI Website Cost Calculator Saved Small Businesses 6 Hours of Quoting in 2026', seo: 'AI Website Cost Calculator: Hours Saved on Quoting' },
  '/blog/ranking-google-ai-overviews-bing-copilot-2026': { original: 'Ranking in Google AI Overviews & Bing Copilot: The 2026 Playbook for Small Sites', seo: 'Ranking in Google AI Overviews & Bing Copilot 2026' },
  '/blog/online-bookings-five-star-reviews-doubled-florist-revenue-2026': { original: 'Online Bookings + 5-Star Reviews: The Two Levers That Doubled Florist Revenue in 2026', seo: 'Online Bookings & 5-Star Reviews for Florists' },
  '/blog/niche-website-templates-plumber-bakery-different-theme': { original: "Niche-Built Website Templates: Why a Plumber and a Bakery Shouldn't Share a Theme", seo: 'Niche Website Templates: Plumber vs Bakery Themes' },
  '/blog/supercharge-wordpress-site-from-slow-to-lovable-lightning-fast': { original: 'Supercharge Your WordPress Site: From Slow to Lovable Lightning-Fast', seo: 'WordPress Site From Slow to Lightning-Fast' },
  '/blog/supercharge-wordpress-slow-site-fast-lovable': { original: 'Supercharge Your WordPress: Transform Slow Sites into Fast, Lovable Experiences', seo: 'Transform a Slow WordPress Site Into a Fast One' },
  '/blog/transforming-slow-wordpress-sites-into-fast-engaging-digital-hubs': { original: 'Transforming Slow WordPress Sites into Fast, Engaging Digital Hubs', seo: 'Slow WordPress Sites Into Fast, Engaging Hubs' },
  '/blog/generative-engine-optimisation-vs-traditional-seo': { original: 'Generative Engine Optimisation (GEO) vs Traditional SEO: A Deep Dive', seo: 'Generative Engine Optimisation (GEO) vs SEO' },
  '/blog/capturing-leads-conversational-quote-calculator': { original: 'Boost Sales: Capturing More Leads with Conversational Quote Calculators', seo: 'Capturing Leads With Conversational Quote Calculators' },
  '/blog/website-not-showing-google-fixes': { original: "Why Isn't My Website On Google? 12 Fixes That Work For UK Businesses", seo: "Why Isn't My Website On Google? 12 Fixes" },
  '/blog/mastering-entity-seo-wikipedia-wikidata-knowledge-graph-importance': { original: 'Mastering Entity SEO: Why Wikipedia, Wikidata & Knowledge Graph Matter', seo: 'Entity SEO: Why Wikipedia & Wikidata Matter' },
  '/blog/capture-leads-conversational-quote-calculator-uk': { original: 'Capture More Leads: Conversational Quote Calculators for UK Trades', seo: 'Conversational Quote Calculators for UK Trades' },
  '/blog/boost-leads-conversational-quote-calculator-uk': { original: 'Boost Leads with a Conversational Quote Calculator for UK Businesses', seo: 'Quote Calculator Leads for UK Businesses' },
  '/blog/entity-seo-wikipedia-knowledge-graph': { original: 'Mastering Entity SEO: Why Wikipedia & Knowledge Graph Reign Supreme', seo: 'Entity SEO: Wikipedia & the Knowledge Graph' },
  '/blog/supercharge-wordpress-site-blazing-fast-performance': { original: 'Supercharge Your WordPress Site: A Guide to Blazing-Fast Performance', seo: 'Guide to Blazing-Fast WordPress Performance' },
  '/blog/get-business-listed-bing-copilot-duckassist': { original: 'Boost Your Local Business: Get Listed in Bing Copilot & DuckAssist', seo: 'Get Listed in Bing Copilot & DuckAssist' },
  '/blog/mastering-e-e-a-t-small-service-business-google-signals': { original: 'Mastering E-E-A-T: Your Small Service Business Guide to Google Signals', seo: 'E-E-A-T Guide for Small Service Businesses' },
  '/blog/content-calendar-customer-questions-uk-seo': { original: 'Mastering Content Calendars with Customer Questions for UK SEO Success', seo: 'Content Calendars From Customer Questions: UK SEO' },
  '/blog/mastering-entity-seo-wikipedia-wikidata-knowledge-graph': { original: 'Mastering Entity SEO: Why Wikipedia, Wikidata & Knowledge Graph are Key', seo: 'Entity SEO: Wikipedia, Wikidata & Knowledge Graph' },
  '/l/fr/eu-creative-grant': { original: 'Aide européenne à la création de sites web : accompagnement gratuit', seo: 'Aide européenne pour sites web : accompagnement' },
  '/l/es/grant-business-plan': { original: 'Plantilla de plan de negocio y prompts de IA para el bono creativo', seo: 'Plan de negocio y prompts de IA: bono creativo' },
  '/l/de/grant-business-plan': { original: 'Businessplan-Vorlage & KI-Prompts für den tschechischen Kreativgutschein', seo: 'Businessplan & KI-Prompts: Kreativgutschein' },
  '/l/sk/grant-business-plan': { original: 'Vzor podnikateľského plánu a AI prompty pre český kreatívny voucher', seo: 'Podnikateľský plán a AI prompty: kreatívny voucher' },
  '/l/es/eu-creative-grant': { original: 'Ayuda creativa de la UE para sitios web: apoyo gratuito para solicitarla', seo: 'Ayuda creativa de la UE para sitios web' },
};

const strip = (t: string) => t.replace(/\s*[|—–-]\s*FastMedia(\.Pro)?\s*$/, '').trim();

/** Returns the search-only title for this path when the stored title still matches. */
export function seoTitleOverride(path: string | undefined, title: string): string {
  const o = path ? SEO_TITLE_OVERRIDES[path.replace(/\/+$/, '')] : undefined;
  return o && strip(title) === o.original ? o.seo : title;
}
