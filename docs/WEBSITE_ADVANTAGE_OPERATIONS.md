# FastMedia Website Advantage Programme — Operations Manual

**Release candidate:** draft PR #3, not deployed. **Audience:** FastMedia Super Admin only.

## Purpose
A portfolio-wide programme for eight websites: FastMedia.Pro, SevenHourTeacher, Koně a Stáje, Zelený Kůň, StandaToys, The Progenitors, Calcurly and JusticeLeague. This programme must audit existing functionality before introducing anything new.

## First-time onboarding
1. Open the Super Admin back office and choose **Website Advantage Programme** after the release is deployed.
2. Read **Getting started**. All status labels start as **Not verified**. They do not imply an outage.
3. Open the ChatGPT programme guide and release register from the dashboard.
4. Select a website and record its existing SEO, social, tracking, accessibility and admin capabilities.
5. For each change, capture the known-good deployment, baseline commit, affected files, test plan and rollback steps.
6. Deploy only after the release checklist passes; verify critical customer paths afterwards.

## Quality standards
- **Security:** OWASP ASVS-inspired controls; authenticated, server-side Super Admin authorization and RLS for any future private API; least privilege and no embedded service credentials.
- **Accessibility:** WCAG 2.2 AA as a target; semantic structure, keyboard support, focus visibility, contrast and mobile reflow. Not a certification.
- **Performance:** Core Web Vitals measured against live devices and network conditions; do not invent passing scores.
- **Search:** titles, descriptions, canonicals, hreflang where applicable, sitemap, robots and appropriate Schema.org structured data.
- **Sharing:** per-page Open Graph and Twitter card metadata; image should be fetchable and typically 1200×630.
- **Privacy:** GDPR and consent review for analytics and marketing; never copy raw visitor personal data into central monitoring without purpose and access controls.
- **Release engineering:** versioned change, CI, peer review, test evidence, rollback, smoke test and monitoring.

## State definitions
- **Not verified:** no trustworthy current check result.
- **Pass:** specific documented check succeeded at recorded time.
- **Needs review:** a check found an issue or incomplete requirement.
- **Unknown:** request failed or data could not be gathered.
- **Blocked:** a required dependency prevents safe completion.

## Existing capabilities — do not duplicate
- FastMedia: SEO health monitor, quotation tool, lead administration, Super Admin role hierarchy.
- SevenHourTeacher: content studio and SEO operations.
- Koně a Stáje: multilingual SEO helper, directory workflows and sitemap jobs.
- Zelený Kůň: SEO plans and pixel reporting plan.
- StandaToys: social tags and multilingual metadata.
- The Progenitors: PWA manifest, structured data and sitemap workflows.
- Calcurly: first-party analytics and calculator embedding.
- JusticeLeague: social sharing metadata.

These are source findings, not proof of production readiness.

## Read-only public metadata collector
The script `scripts/website_advantage_public_audit.py` checks only the eight public homepages and writes JSON. Run locally with `python scripts/website_advantage_public_audit.py` or use the manual GitHub Actions workflow **Website Advantage public metadata audit** after it is available on the default branch. The workflow is **manual only** to avoid surprise compute charges. The output is a 14-day retained evidence artifact; it does not feed the dashboard automatically. A network error is **Unknown**, not a downtime alert.

## Deployment SOP
1. Verify that GitHub main corresponds to the live Lovable project and that the target release mechanism is known.
2. Record last known-good production commit/deployment, DNS target, and restore instructions.
3. Run build and release tests. Check non-super-admin, signed-out and super_admin access with test accounts.
4. Inspect dashboard on phone and desktop; check keyboard and screen-reader labels.
5. Merge the smallest PR only after all gates pass.
6. Publish through the verified platform path; do not assume merge automatically publishes.
7. Test homepage, Super Admin dashboard, enquiries, forms, checkout and any directory search as applicable.
8. Log timestamp, deployed SHA, evidence, outcome and rollback reference in ChatGPT Space.
9. If checks fail, restore the known-good release, then verify the restoration.

## Current change register
- Koně a Stáje: draft PR https://github.com/TimKnott/koneastaje/pull/26 ; isolated repair, CI build passed, not deployed.
- FastMedia: draft PR https://github.com/TimKnott/FastMedia/pull/3 ; dashboard and manual public audit, not deployed.
- Calcurly: OG image change not implemented; no verified editable repository or Lovable credits.

## Cost controls
No background scanning, third-party monitoring, webhook relay or AI usage is enabled by this release. Before replacing a Lovable/Base44 service with ChatGPT, compare capabilities, access, reliability, privacy and cost. ChatGPT is not a permanent web server or drop-in runtime.
