# Email Studio: finish and verify parts 1–4, 6 and 7

Parts 1–4, 6 and 7 are already in the preview from the last build: templates and writing guides, spreadsheet personalization, the polished editor, onboarding, industry recommendations, and Czech/German rewrites. The video page also exists, but it gets no further work now. This plan doesn't rebuild anything. It checks what's there and fixes only real problems.

## Steps
1. **Sign in as admin in the preview and open Email Studio.** Go through the onboarding steps, the guide, the templates and the editor at desktop and phone widths. Take screenshots.
2. **Templates and writing guides.** Load each of the 10 templates, save one as a favourite and reload the page to confirm it was kept. Check the writing prompts and the email checks.
3. **Spreadsheet personalization.** Paste a sample CSV with a missing field. Check column matching, fallback values, the per-row preview, the missing-field warnings and the CSV export.
4. **Editor.** Try undo/redo, headings, lists, links, an image, a CTA button and the mobile preview. Confirm the formatted email survives saving.
5. **Industry recommendations.** Pick several trades and signals and confirm the suggested email type and template match them.
6. **Czech and German rewrites.** Run one real rewrite in each language (this uses a small amount of AI credit). Confirm the merge placeholders like {{name}} survive and the English back-check appears.
7. **Fix only defects found**, then rerun the email studio tests. No emails sent, nothing published, video work untouched.

## Credit note
Steps 1–6 are checks only. Fixes in step 7 use Build credits, so I'll report each defect first if it's more than a small fix.

## Technical details
- Files: `src/components/admin/outreach/EmailStudio.tsx`, `src/components/admin/EmailVisualEditor.tsx`, `src/lib/emailStudio.ts`, `supabase/functions/email-adapt/index.ts`.
- Tests: `src/test/emailStudio.test.ts` plus the pacing and sanitizer tests.
- Sign-in via a minted admin session in Playwright.
