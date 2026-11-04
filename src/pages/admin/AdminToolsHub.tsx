import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { mainItems, businessToolItems, contentItems, publicPageItems, adminItems, settingsItems, type MenuItem } from '@/components/admin/AdminSidebar';

/** Department definitions: order = priority. Every card links to an existing sidebar route. */
const DEPARTMENTS: { name: string; desc: string; accent: string; urls: string[] }[] = [
  { name: 'Find work & revenue', desc: 'Opportunities, buying signals and lead discovery', accent: 'border-l-primary',
    urls: ['/admin/opportunities', '/admin/prospecting', '/admin/prospecting?find=1', '/admin/finder', '/admin/lead-scraper', '/admin/lead-repository', '/admin/leads-hub'] },
  { name: 'Pipeline & follow-ups', desc: 'Enquiries, quotes, CRM and clients', accent: 'border-l-accent',
    urls: ['/admin/pipeline', '/admin/flowlu-leads', '/admin/flowlu', '/admin/leads', '/admin/enquiries', '/admin/quote-requests', '/admin/offer-leads', '/admin/grant-follow-up', '/admin/inbox', '/admin/clients', '/admin/client-projects', '/admin/tracker', '/admin/bookings', '/admin/voice-agent'] },
  { name: 'Campaigns & marketing', desc: 'Campaign Studio, ads, email and partners', accent: 'border-l-secondary',
    urls: ['/admin/campaign-studio', '/admin/partners', '/admin/ad-studio', '/admin/ad-compliance', '/admin/video-studio', '/admin/story-studio', '/admin/newsletter', '/admin/vbout', '/admin/emails', '/admin/email-dashboard', '/admin/email-deliverability', '/admin/email-queue', '/admin/lead-emails', '/admin/ads', '/admin/reviews'] },
  { name: 'SEO & visibility', desc: 'Search, AI visibility and language versions', accent: 'border-l-primary',
    urls: ['/admin/seo', '/admin/seo-insights', '/admin/seo-health', '/admin/geo', '/admin/sitemap', '/admin/backlinks', '/admin/language-versions'] },
  { name: 'Website, content & sales tools', desc: 'Pages, demos, calculator, courses and showcase', accent: 'border-l-accent',
    urls: ['/admin/landing-page', '/admin/demos', '/admin/blog-manage', '/admin/case-studies', '/admin/courses', '/admin/modules', '/admin/module-requests', '/admin/media', '/admin/showcase', '/admin/content-history', '/admin/legal'] },
];

export default function AdminToolsHub() {
  const { hasMinRole } = useUserRole();
  const { t } = useLanguage();
  const all: MenuItem[] = [...businessToolItems, ...mainItems, ...contentItems, ...adminItems, ...settingsItems];
  const byUrl = new Map(all.map((i) => [i.url, i]));
  const used = new Set<string>();
  const groups = DEPARTMENTS.map((d) => ({ ...d, items: d.urls.map((u) => { used.add(u); return byUrl.get(u); }).filter((i): i is MenuItem => !!i) }));
  // Anything not placed above (incl. HR, users, settings) lands in the bottom group so no tool is lost.
  const rest = all.filter((i) => !used.has(i.url) && i.url !== '/admin/tools' && !used.has(i.url));
  groups.push({ name: 'Finance, HR & system', desc: 'Accounting, people, users, integrations and settings', accent: 'border-l-muted-foreground', urls: [], items: [...new Map(rest.map((i) => [i.url, i])).values()] });
  groups.push({ name: 'Public pages', desc: 'Open live public pages', accent: 'border-l-muted-foreground', urls: [], items: publicPageItems });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin tools</h1>
        <p className="text-sm text-muted-foreground">Every back-office tool you can use, grouped by department. Most important revenue tools first.</p>
      </div>
      {groups.map((g) => {
        const items = g.items.filter((i) => hasMinRole(i.minRole));
        if (!items.length) return null;
        return (
          <section key={g.name} aria-labelledby={`dept-${g.name}`} className="space-y-2">
            <div>
              <h2 id={`dept-${g.name}`} className="font-display text-lg font-semibold">{g.name}</h2>
              <p className="text-xs text-muted-foreground">{g.desc}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((i) => (
                <Link key={i.url} to={i.url} title={`Open ${t(i.titleKey)}`} className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card className={`h-full border-l-4 ${g.accent} transition-colors hover:bg-muted/50`}>
                    <CardContent className="flex items-center gap-3 p-3">
                      <i.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">{t(i.titleKey)}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
