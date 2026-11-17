import { useState, type ChangeEvent } from "react";
import { Activity, BarChart3, BookOpen, Bot, Calculator, CalendarCheck, ChevronDown, ChevronUp, ClipboardCheck, ExternalLink, Globe2, History, Image, Info, Languages, LockKeyhole, QrCode, Search, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { imageStatusLabel, parsePublicMetadataAudit, type MetadataAuditReport } from "@/lib/websiteAdvantageAudit";
import { discoveryStatusLabel, parseDiscoveryAudit, type DiscoveryReport } from "@/lib/websiteAdvantageDiscovery";
import approvedSocialImages from "../../../config/website-advantage-social-image-targets.json";

/**
 * FastMedia Website Advantage Programme — release candidate (read-only).
 * Never treat an untested site as healthy. No credentials, PII, cross-site
 * API calls, customer records, background jobs or production writes.
 * This page must stay inside the existing Super Admin route protection.
 * Future collectors MUST enforce the role on the server, independently.
 */
const PROGRAMME_URL = "https://chatgpt.com/space/page_6afc0b7d91988191add6bc38f8effc2b";
const RELEASE_REGISTER_URL = "https://chatgpt.com/space/page_6afc0f21d4408191bd156fc9696342ef";

const websites = [
  { name: "FastMedia.Pro", url: "https://fastmedia.pro", platform: "Lovable" },
  { name: "SevenHourTeacher", url: "https://7hourteacher.com", platform: "Lovable" },
  { name: "Koně a Stáje", url: "https://koneastaje.com", platform: "Lovable" },
  { name: "Zelený Kůň", url: "https://zelenykun.com", platform: "Lovable" },
  { name: "StandaToys", url: "https://standatoys.com", platform: "Base44" },
  { name: "The Progenitors", url: "https://theprogenitors.com", platform: "Lovable" },
  { name: "Calcurly", url: "https://calcurly.com", platform: "Lovable" },
  { name: "JusticeLeague", url: "https://justiceleague.online", platform: "Base44" },
] as const;

// Historical evidence only: first bounded public HTML audit, 17 Nov 2026 08:52 UTC.
// This does NOT assert current health, image accessibility or social cache status.
const metadataSnapshot: Record<string, "metadata_present" | "unknown"> = {
  "FastMedia.Pro": "metadata_present",
  "SevenHourTeacher": "unknown",
  "Koně a Stáje": "metadata_present",
  "Zelený Kůň": "metadata_present",
  "StandaToys": "metadata_present",
  "The Progenitors": "metadata_present",
  "Calcurly": "metadata_present",
  "JusticeLeague": "metadata_present",
};

const workstreams = [
  { label: "Structured data", icon: Search, detail: "Schema.org markup, eligible rich results and factual business signals" },
  { label: "Installable web apps", icon: Smartphone, detail: "PWA manifests, offline behavior and home-screen installation" },
  { label: "Interactive lead tools", icon: Calculator, detail: "Quotations, calculators and useful customer self-service" },
  { label: "AI site assistants", icon: Bot, detail: "Accurate guidance, safe hand-off and enquiry qualification" },
  { label: "Branded QR campaigns", icon: QrCode, detail: "Trackable page links for print, listings and campaigns" },
  { label: "Multilingual SEO", icon: Languages, detail: "Localized pages, canonical URLs and hreflang where relevant" },
  { label: "One-click contact and booking", icon: CalendarCheck, detail: "Accessible enquiry, booking, email and phone actions" },
  { label: "Page-specific sharing images", icon: Image, detail: "Approved Open Graph artwork for homepage, products and stories" },
  { label: "Conversion tracking", icon: BarChart3, detail: "Verified enquiries, bookings and source attribution" },
  { label: "Mobile performance", icon: Zap, detail: "Core Web Vitals, image efficiency and responsive usability" },
  { label: "CRM enquiry follow-up", icon: ClipboardCheck, detail: "Acknowledgements, lead routing and response reliability" },
  { label: "Website health monitoring", icon: Activity, detail: "Availability, broken forms, sitemaps and regression detection" },
] as const;

const onboarding = [
  { title: "Understand the programme", detail: "Review the scope, eight websites and the twelve website improvement workstreams." },
  { title: "Confirm the existing baseline", detail: "Check current features and record the last known-good release before editing." },
  { title: "Run safe verification", detail: "Verify a test or build result; never assume an untested website has passed." },
  { title: "Release with a rollback plan", detail: "Publish one small tested change at a time and retain its restore reference." },
] as const;

const qualityGates = [
  "Source and previous production version recorded",
  "Production build and automated checks passed",
  "Super Admin access tested for signed-out and lower-role users",
  "Mobile layout, keyboard navigation and contrast reviewed",
  "No secrets, personal data or unnecessary tracking exposed",
  "Production rollback path tested or explicitly documented",
  "Live domain, social image and critical forms verified after release",
] as const;

export default function AdminWebsiteAdvantage() {
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [auditReport, setAuditReport] = useState<MetadataAuditReport | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [discoveryReport, setDiscoveryReport] = useState<DiscoveryReport | null>(null);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const importDiscovery = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setDiscoveryError(null);
    try {
      if (file.size > 1024 * 1024) throw new Error("Report exceeds the 1 MB import limit.");
      if (!file.name.toLowerCase().endsWith(".json")) throw new Error("Please choose a .json report.");
      setDiscoveryReport(parseDiscoveryAudit(await file.text()));
    } catch (error) {
      setDiscoveryReport(null);
      setDiscoveryError(error instanceof Error ? error.message : "Could not read the discovery report.");
    }
    event.currentTarget.value = "";
  };
  const importAudit = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setAuditError(null);
    try {
      if (file.size > 1024 * 1024) throw new Error("Report exceeds the 1 MB import limit.");
      if (!file.name.toLowerCase().endsWith(".json")) throw new Error("Please choose a .json report.");
      const parsed = parsePublicMetadataAudit(await file.text());
      setAuditReport(parsed);
    } catch (error) {
      setAuditReport(null);
      setAuditError(error instanceof Error ? error.message : "Could not read the report.");
    }
    event.currentTarget.value = "";
  };
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12" data-testid="website-advantage-admin">
      <header className="rounded-xl border bg-card p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline"><LockKeyhole className="mr-1 h-3 w-3" aria-hidden="true" />Super Admin</Badge>
          <Badge variant="secondary">Read-only preview</Badge>
          <Badge variant="outline">Release candidate</Badge>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">Website Advantage Programme</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          A single control point for FastMedia's portfolio quality, SEO, social sharing, conversions,
          security and release history. No live monitoring is enabled in this version.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={PROGRAMME_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <BookOpen className="h-4 w-4" aria-hidden="true" />Open programme guide
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          <a href={RELEASE_REGISTER_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <History className="h-4 w-4" aria-hidden="true" />View release register
          </a>
        </div>
      </header>

      <section aria-label="Programme overview" className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Portfolio websites", value: String(websites.length), help: "Listed in the programme", icon: Globe2 },
          { label: "Quality workstreams", value: String(workstreams.length), help: "Checks planned", icon: ClipboardCheck },
          { label: "Local audit imported", value: auditReport ? "Yes" : "No", help: "No backend connection", icon: Info },
        ].map(({ label, value, help, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="h-4 w-4" aria-hidden="true" />{label}</div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground">{help}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-labelledby="onboarding-heading">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle id="onboarding-heading">Getting started</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Four steps to a controlled, reversible release.</p>
            </div>
            <Button type="button" variant="outline" size="sm" aria-expanded={onboardingOpen}
              aria-controls="website-advantage-onboarding" onClick={() => setOnboardingOpen(!onboardingOpen)}>
              {onboardingOpen ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}
              {onboardingOpen ? "Hide" : "Show"}
            </Button>
          </CardHeader>
          {onboardingOpen && (
            <CardContent id="website-advantage-onboarding">
              <ol className="grid gap-3 md:grid-cols-2">
                {onboarding.map((step, index) => (
                  <li key={step.title} className="flex gap-3 rounded-lg border p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">{index + 1}</span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Onboarding is guidance only. Completing these steps requires actual test evidence and a saved release record.
              </p>
            </CardContent>
          )}
        </Card>
      </section>

      <section aria-labelledby="audit-import-heading">
        <Card>
          <CardHeader>
            <CardTitle id="audit-import-heading">Import public audit evidence</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Run the manual Website Advantage public metadata workflow in GitHub, download its JSON report,
              then load it here. Reports are processed only in this browser session.
              No customer records or credentials are uploaded.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <label htmlFor="website-advantage-audit-file" className="block text-sm font-medium">
              Choose a metadata audit JSON file (maximum 1 MB)
            </label>
            <input id="website-advantage-audit-file" type="file" accept=".json,application/json"
              onChange={importAudit}
              className="block w-full max-w-xl cursor-pointer rounded-md border border-input p-2 text-sm
                         file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2
                         file:text-primary-foreground focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-ring" />
            {auditError && <p role="alert" className="text-sm text-destructive">{auditError}</p>}
            {auditReport ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Report loaded — 8 sites</p>
                  <p className="text-xs text-muted-foreground">
                    Audit timestamp: {new Date(auditReport.checked_at_utc).toLocaleString()}
                    {" · "}Public homepage HTML metadata only
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm"
                  onClick={() => { setAuditReport(null); setAuditError(null); }}>
                  Clear report
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                A historical snapshot is shown below until you import a new report.
                Importing does not certify current uptime, search indexing, security, or social cache freshness.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="portfolio-heading">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="portfolio-heading" className="text-xl font-semibold">Website portfolio</h2>
          <Badge variant="outline">All checks awaiting verification</Badge>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Historical sample: 17 Nov 2026, 08:52 UTC. Seven sites contained the seven checked HTML metadata fields;
          one could not be reached by the runner. Some live OG images differ from approved artwork.
          These are not uptime or current-health ratings.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {websites.map((site) => {
            const result = auditReport?.sites.find(item => item.name === site.name);
            return (
            <Card key={site.url}>
              <CardContent className="p-4">
                <div className="mb-3 overflow-hidden rounded-lg border bg-muted">
                  <img src={approvedSocialImages.targets[site.name]}
                    alt={`Approved social-sharing artwork for ${site.name}`}
                    width={1200} height={630} loading="lazy"
                    className="aspect-[1200/630] w-full object-cover" />
                </div>
                <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{site.name}</p>
                  <p className="break-all text-xs text-muted-foreground">{site.url}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{site.platform}</Badge>
                    <Badge variant="outline">
                      {result
                        ? result.state === "pass" ? "Metadata fields present" : result.state === "unknown" ? "Audit unknown" : "Metadata needs review"
                        : metadataSnapshot[site.name] === "metadata_present" ? "HTML metadata present · 17 Nov" : "Audit unknown · 17 Nov"}
                    </Badge>
                    {result && <Badge variant="outline">{imageStatusLabel(result.approved_image_match)}</Badge>}
                    <Badge variant="outline">Current health not verified</Badge>
                  </div>
                </div>
                <a href={site.url} target="_blank" rel="noopener noreferrer"
                  aria-label={`Open ${site.name} in a new tab`}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border text-primary hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                </div>
              </CardContent>
            </Card>
          );})}
        </div>
      </section>

      <section aria-labelledby="discovery-heading">
        <Card>
          <CardHeader>
            <CardTitle id="discovery-heading">Search and AI discovery files</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Load the separate public discovery JSON report to review robots.txt, XML sitemaps and optional
              llms.txt for all eight websites. Presence does not prove indexing or AI citations.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <label htmlFor="website-advantage-discovery-file" className="block text-sm font-medium">
              Choose discovery audit JSON (maximum 1 MB)
            </label>
            <input id="website-advantage-discovery-file" type="file" accept=".json,application/json"
              onChange={importDiscovery}
              className="block w-full max-w-xl cursor-pointer rounded-md border border-input p-2 text-sm
                         file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2
                         file:text-primary-foreground focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-ring" />
            {discoveryError && <p role="alert" className="text-sm text-destructive">{discoveryError}</p>}
            {discoveryReport ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Public discovery file check: {new Date(discoveryReport.checked_at_utc).toLocaleString()}
                  </p>
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => { setDiscoveryReport(null); setDiscoveryError(null); }}>Clear discovery report</Button>
                </div>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                    <thead className="bg-muted/60">
                      <tr>
                        <th scope="col" className="p-3 font-medium">Website</th>
                        <th scope="col" className="p-3 font-medium">Robots.txt</th>
                        <th scope="col" className="p-3 font-medium">Sitemap</th>
                        <th scope="col" className="p-3 font-medium">Optional AI guidance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discoveryReport.sites.map(site => (
                        <tr key={site.name} className="border-t">
                          <th scope="row" className="p-3 font-medium">{site.name}</th>
                          <td className="p-3">{discoveryStatusLabel(site.resources["robots.txt"].state)}</td>
                          <td className="p-3">
                            {discoveryStatusLabel(site.resources["sitemap.xml"].state)}
                            {typeof site.resources["sitemap.xml"].entry_count === "number"
                              ? ` · ${site.resources["sitemap.xml"].entry_count} entries` : ""}
                          </td>
                          <td className="p-3">{discoveryStatusLabel(site.resources["llms.txt"].state)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  These are point-in-time public file checks. A missing optional llms.txt is not a search failure.
                  Confirm indexing and actual crawler behavior separately.
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No discovery report loaded. Run the manual GitHub audit and import its JSON file here.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="workstreams-heading">
        <h2 id="workstreams-heading" className="mb-3 text-xl font-semibold">Quality assurance workstreams</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {workstreams.map(({ label, detail, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base">
                <Icon className="h-4 w-4" aria-hidden="true" />{label}
              </CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{detail}</p>
                <Badge variant="outline" className="mt-3">Not verified</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="release-heading">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle id="release-heading">Professional release checklist</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Release gates, not a self-certified pass.</p>
            </div>
            <Button type="button" variant="outline" size="sm" aria-expanded={releaseOpen}
              aria-controls="website-advantage-release" onClick={() => setReleaseOpen(!releaseOpen)}>
              {releaseOpen ? "Hide" : "Show"}
              {releaseOpen ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
            </Button>
          </CardHeader>
          {releaseOpen && (
            <CardContent id="website-advantage-release">
              <ul className="space-y-3">
                {qualityGates.map((gate) => (
                  <li key={gate} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-muted-foreground/50" aria-hidden="true" />
                    <span>{gate} <span className="text-muted-foreground">— awaiting evidence</span></span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Accessibility target: WCAG 2.2 AA. Security review includes role-based access and backend enforcement.
                These targets are not certifications or claims of completed compliance.
              </p>
            </CardContent>
          )}
        </Card>
      </section>

      <footer className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />Security boundary
        </p>
        <p className="mt-1">This static interface is routed through the existing Super Admin guard.
          Future monitoring APIs must independently verify Super Admin authorization server-side.
          This page performs no external writes, scheduled scans or database mutations.</p>
      </footer>
    </div>
  );
}
