# Cold-email studio: all seven parts

This adds to the existing Prospecting desk (Admin → Prospecting), its visual editor and the paced Google Workspace queue. Nothing sends without your approval, and no real lead gets an email during testing (Test mode only).

## 1. Onboarding and help
- A first-run walkthrough of 5 steps: connect mailbox, pick leads, choose a template, personalise, approve and queue.
- A "?" help panel on every step, plus a short checklist covering sending limits, business addresses only, and the unsubscribe link.

## 2. Professional editor upgrade
- Full toolbar: headings, bold/italic/underline, colours from the brand palette, alignment, lists, links, image, button, divider, spacer, signature block, undo/redo.
- Desktop and phone preview, plus a plain-text version created automatically.
- A spam-word and length check shown before you approve.

## 3. Template library
- About 10 standard templates: first touch (no website), old website, weak Google listing, no online booking, follow-up 1, follow-up 2, break-up email, referral ask, the €20/month offer, and a video introduction.
- Save your own templates, duplicate them, and set favourites.

## 4. Spreadsheet personalisation (merge fields)
- Upload CSV/XLSX or pick existing leads. Map columns to fields such as {{company}}, {{first_name}}, {{city}}, {{trade}}, {{website}} and {{video_link}}.
- Fallback values for empty fields, and a row-by-row preview that flags missing data.
- Writing prompts beside the editor: what to say in the opening line, what pain to name, which call to action.

## 5. Video landing page
- You upload a video to private file storage, and each prospect gets a personal link (/v/:token).
- The email shows a thumbnail with a play button. Clicking it opens a branded FastMedia page where the video plays straight away, with a "Book a call" button below.
- Views are recorded per prospect (opened, played, watched to the end) and shown on the lead.
- Honest note in the interface: no email app can play video inside the inbox.

## 6. "Which email should I send?" guide
- Pick the type of business and what you know about them (no site, old site, weak Google listing, no booking). The guide recommends a template, subject-line ideas and a reason.
- The rules are written by hand (no AI needed). One click opens the recommended template.

## 7. Czech and German adaptation (not literal translation)
- An "Adapt to Czech / German" button. AI rewrites the email in native phrasing (formal Vy/Sie, local conventions) and leaves {{placeholders}} untouched.
- Side-by-side view, plus a back-translation to English for any sentence so you can check its meaning.

## Technical details
- Database: `email_templates`, `merge_lists` (+ rows), `outreach_videos`, `video_views`. Grants and admin-only access rules, except one limited public function that resolves a video token and records a view.
- Storage: a private `outreach-videos` bucket, served to viewers through short-lived signed links.
- Edge functions: extend `outreach-agent` with `adapt` and `back_translate` actions through the Lovable AI Gateway. New `video-view` function (public, token-validated, rate-safe).
- Frontend: new components under `src/components/admin/outreach/`, a public `/v/:token` page excluded from the sitemap and set to noindex. Each queued email gets an unsubscribe link and a footer with business details.
- Tests: merge-field rendering and fallbacks, protecting placeholders during adaptation, the guide's recommendations, and token validation.

## Cost and limits
- This is a large build: roughly 15–25 Build credits. The template wording and the guide's rules could be written in ChatGPT instead to save credits.
- Not checked yet: whether your Google mailbox is connected to the queue. Nothing will be published.
