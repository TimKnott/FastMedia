import { useState } from "react";
import { Activity, ArrowRight, BarChart3, BookOpen, CheckCircle2, ChevronDown, ChevronUp, ClipboardCheck, ExternalLink, Globe2, History, Image, Info, LockKeyhole, Search, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  { name: "SevenHourTeacher", url: "https://sevenhourteacher.com", platform: "Lovable" },
  { name: "Koně a Stáje", url: "https://koneastaje.com", platform: "Lovable" },
  { name: "Zelený Kůň", url: "https://zelenykun.com", platform: "Lovable" },
  { name: "StandaToys", url: "https://standatoys.com", platform: "Base44" },
  { name: "The Progenitors", url: "https://theprogenitors.com", platform: "Lovable" },
  { name: "Calcurly", url: "https://calcurly.com", platform: "Lovable" },
  { name: "JusticeLeague", url: "https://justiceleague.online", platform: "Base44" },
] as const;

const workstreams = [
  { label: "Social previews", icon: Image, detail: "Open Graph images, titles and sharing cards" },
  { label: "SEO and schema", icon: Search, detail: "Canonical links, structured data and indexing" },
  { label: "Conversions", icon: BarChart3, detail: "Enquiries, bookings and campaign attribution" },
  { label: "Site health", icon: Activity, detail: "Uptime, mobile performance and forms" },
  { label: "Security and access", icon: ShieldCheck, detail: "Role enforcement, privacy and integrations" },
  { label: "Changes and rollback", icon: History, detail: "Version baselines, tests and restore evidence" },
] as const;

const onboarding = [
  { title: "Understand the programme", detail: "Review the scope, eight websites and the six quality checks." },
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
          { label: "Live checks verified", value: "0", help: "Not connected yet", icon: Info },
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

      <section aria-labelledby="portfolio-heading">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="portfolio-heading" className="text-xl font-semibold">Website portfolio</h2>
          <Badge variant="outline">All checks awaiting verification</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {websites.map((site) => (
            <Card key={site.url}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{site.name}</p>
                  <p className="break-all text-xs text-muted-foreground">{site.url}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{site.platform}</Badge>
                    <Badge variant="outline">Not verified</Badge>
                  </div>
                </div>
                <a href={site.url} target="_blank" rel="noopener noreferrer"
                  aria-label={`Open ${site.name} in a new tab`}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border text-primary hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
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
