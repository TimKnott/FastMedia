import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

/** Read-only freshness per module (latest record time). No jobs are triggered from here. */
const HEALTH: { label: string; table: string; url: string }[] = [
  { label: 'Opportunities', table: 'opportunities', url: '/admin/opportunities' },
  { label: 'Prospecting', table: 'prospects', url: '/admin/prospecting' },
  { label: 'Outreach queue', table: 'outreach_messages', url: '/admin/prospecting' },
  { label: 'Lead Repository', table: 'lead_repository_events', url: '/admin/lead-repository' },
  { label: 'Flowlu sync', table: 'flowlu_sync_log', url: '/admin/flowlu' },
  { label: 'Website enquiries', table: 'contact_enquiries', url: '/admin/enquiries' },
  { label: 'Blog', table: 'blog_posts', url: '/admin/blog-manage' },
];

export const APPROVALS: { item: string; who: 'You' | 'System' }[] = [
  { item: 'Denisa: create her account (denisa2013@gmail.com) so a limited Opportunities-only role can be assigned', who: 'You' },
  { item: 'Enter FastMedia hourly rates per role and target margin for quotes (none are assumed)', who: 'You' },
  { item: 'Import first sourced opportunities file (JSON/CSV)', who: 'You' },
  { item: 'Set partner commission terms', who: 'You' },
  { item: 'Publish the site when ready (preview-only changes are not live)', who: 'You' },
  { item: 'Deploy saved suppression/unsubscribe changes for outreach and Flowlu senders (needs your go-ahead)', who: 'You' },
  { item: 'Supply missing Lead Repository CSV files', who: 'You' },
  { item: 'Confirm whether briefing email delivery should be set up', who: 'You' },
  { item: 'Central "Update everything" orchestrator with run ledger — designed, not built; each module still updates from its own page', who: 'System' },
];

function HealthPanel() {
  const [rows, setRows] = useState<Record<string, string | null | 'error'>>({});
  const load = () => HEALTH.forEach(async (h) => {
    const { data, error } = await supabase.from(h.table as any).select('created_at').order('created_at', { ascending: false }).limit(1);
    setRows((r) => ({ ...r, [h.table]: error ? 'error' : (data?.[0] as any)?.created_at ?? null }));
  });
  useEffect(load, []);
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Tool health</h2>
        <Button size="sm" variant="outline" onClick={load} title="Re-read the latest record time for each tool (read-only, runs no jobs)">Refresh status</Button>
      </div>
      <p className="text-xs text-muted-foreground">Latest record per tool. A single "Update everything" action is not available yet — run updates from each tool.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {HEALTH.map((h) => { const v = rows[h.table]; return (
          <Link key={h.table} to={h.url} title={`Open ${h.label}`}><Card className="hover:bg-muted/50"><CardContent className="p-3 text-sm">
            <p className="font-medium">{h.label}</p>
            <p className="text-xs text-muted-foreground">{v === undefined ? 'Checking…' : v === 'error' ? 'Status unavailable' : v ? `Last record ${new Date(v).toLocaleString()}` : 'No records yet'}</p>
          </CardContent></Card></Link>); })}
      </div>
    </section>
  );
}

function ApprovalsPanel() {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-semibold">Needs your approval / action</h2>
      <ul className="space-y-1 text-sm">
        {APPROVALS.map((a) => <li key={a.item} className="flex gap-2"><span className="w-16 shrink-0 text-xs text-muted-foreground">{a.who === 'You' ? 'You' : 'Pending'}</span><span>{a.item}</span></li>)}
      </ul>
    </section>
  );
}
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
  { name: 'Campaigns & marketing', desc: 'Campaign Studio, ads, email and partners', accent: 'border-l-destructive/60',
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
      {hasMinRole('admin') && <><ApprovalsPanel /><HealthPanel /></>}
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
