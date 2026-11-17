import { ExternalLink, ShieldCheck, Activity, Image, Search, BarChart3, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Website Advantage is a READ-ONLY Super Admin programme index.
 * All status values are deliberately "Not verified" until backed by a
 * server-side authenticated collector. Never infer healthy from a link.
 * This page contains no credentials, customer data, or external writes.
 */
const websites = [
  { name: "FastMedia.Pro", url: "https://fastmedia.pro", platform: "Lovable" },
  { name: "SevenHourTeacher", url: "https://sevenhourteacher.com", platform: "Lovable" },
  { name: "Koně a Stáje", url: "https://koneastaje.com", platform: "Lovable" },
  { name: "Zelený Kůň", url: "https://zelenykun.com", platform: "Lovable" },
  { name: "StandaToys", url: "https://standatoys.com", platform: "Base44" },
  { name: "The Progenitors", url: "https://theprogenitors.com", platform: "Lovable" },
  { name: "Calcurly", url: "https://calcurly.com", platform: "Lovable" },
  { name: "JusticeLeague", url: "https://justiceleague.online", platform: "Base44" },
] as const;

const workstreams = [
  { label: "Social previews", icon: Image, detail: "Open Graph and Twitter images" },
  { label: "SEO and schema", icon: Search, detail: "Search indexing, metadata and structured data" },
  { label: "Conversions", icon: BarChart3, detail: "Enquiries, bookings and campaign attribution" },
  { label: "Site health", icon: Activity, detail: "Availability, performance and failed forms" },
  { label: "Security and access", icon: ShieldCheck, detail: "Server-enforced permissions and integrations" },
  { label: "Change and rollback", icon: History, detail: "Baselines, checkpoints, deployment evidence" },
] as const;

export default function AdminWebsiteAdvantage() {
  return (
    <div className="space-y-6" data-testid="website-advantage-admin">
      <div>
        <h1 className="text-2xl font-bold">FastMedia Website Advantage Programme</h1>
        <p className="text-muted-foreground mt-2">
          Super Admin programme register. Read-only: no monitoring or production changes run from this page.
        </p>
      </div>
      <Card>
        <CardHeader><CardTitle>Portfolio — 8 websites</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {websites.map((site) => (
            <div key={site.url} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="min-w-0">
                <p className="font-medium">{site.name}</p>
                <p className="text-xs text-muted-foreground">{site.platform} · Status not verified</p>
              </div>
              <a href={site.url} target="_blank" rel="noopener noreferrer"
                aria-label={`Open ${site.name} website`} className="shrink-0 text-primary">
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {workstreams.map(({ label, detail, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base">
              <Icon className="h-4 w-4" />{label}
            </CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{detail}</p>
              <Badge variant="outline" className="mt-3">Not verified</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Programme records</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Current stage: implementation and verification. No production write controls are enabled.</p>
          <a className="text-primary underline" href="https://chatgpt.com/space/page_6afc0b7d91988191add6bc38f8effc2b"
            target="_blank" rel="noopener noreferrer">Open the ChatGPT programme and rollback register</a>
          <p className="text-muted-foreground">
            Future live data requires a server-side Super Admin authorization check and read-only collector.
            A hidden menu or client-side route alone is not a security boundary.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
