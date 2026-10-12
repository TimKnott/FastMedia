# One finder for all three websites

The new Cheval et Stable finder becomes a single **Finder** in Business tools, with a website picker at the top. Each website gets its own search types and rules, so results never get mixed up. Searches use app AI credits, and only when you press Search. They never use build credits.

## FastMedia.Pro: "Bad website" finder

- **Search:** a trade + town + radius (e.g. "instalatér, Jihlava, 30 km"). AI web search finds local businesses that have no website, or only a Facebook page or a Firmy.cz listing.
- **Free website health check:** for each business that has a site, the server opens the homepage itself. This costs no AI credits. It checks:
  - whether the site is secure (https)
  - whether it works on phones
  - load time
  - whether there's an old copyright year (e.g. "© 2016")
  - whether there's a call button or a contact form
  - broken pages
- **Score:** each lead gets a 0–100 "needs a new website" score with plain reasons ("No mobile version, last updated 2017"). These are your talking points for a first message.
- **Next steps:** sort by worst site first. Mark a lead as contacted, won or not interested. You can send good ones to the existing Prospecting desk to write a personalised opener.

## Zelený Kůň: horse owners near Louny and Ústí nad Labem

You can't legally collect private horse owners' personal profiles from Facebook or Instagram. It breaks those platforms' rules and EU data protection law (GDPR), and messaging them cold risks your accounts being blocked. The tool will do the two things that do work.

1. **Find the places horse owners gather (the local finder).** The default area is Louny + Ústí nad Labem, 40 km, and you can change it. It finds:
   - stables, livery yards and riding schools (they buy fodder for many horses at once, so they're your best direct customers)
   - pony clubs and riding clubs
   - farriers and equine vets, who are good referral partners
   - local Facebook groups and pages (e.g. "Koně Lounsko"), which you can join and post in as Zelený Kůň
   - local horse shows and events where you could have a stand or hand out free samples

   It only saves public business contact details, the same as the other finders.
2. **Advert targeting pack (feeds the PPC tools).** One click builds a ready-to-use targeting plan:
   - **Facebook/Instagram:** a radius around Louny and Ústí, horse-related interests (horse riding, equestrianism, horse care and similar), age range, and three advert angles. You can open the Ad Studio from there, with Zelený Kůň already selected.
   - **Google/Sklik:** Czech search phrases people use when they need fodder, plus "do not show for" words (recept, hračky, prodej koní…). You can send these straight to the Ad Compliance checker.
   - A plain-English note on the expected audience size and a suggested starter daily budget. These are estimates and are labelled as such.

   Advertising to horse owners this way is allowed. The platforms do the matching, and you never hold anyone's personal data.

## Cheval et Stable

Stays as built: listings, events in Czechia and nearby countries, and blog/YouTube ideas, sent to the Google Sheet.

## Shared across all three

- Each website has an editable list of rules (area, radius, what counts as a good lead, words to avoid), so you can add future websites without new building.
- Every website keeps its own results list, statuses, CSV download and optional Google Sheet link.
- Duplicates are skipped automatically.

## Technical details

- Rename the menu item to "Finder" at `/admin/finder`, and redirect `/admin/directory-finder` there. Add a `mode` per site in `business_sites` (new `modes jsonb`, `sheet_url` already exists).
- Generalise `directory_finds.kind` to allow `bad_site`, `local_place`, `audience_pack`. Add `score int` and `audit jsonb` columns, keeping the same admin-only access rules.
- Rename the `directory-finder` edge function to `finder`, with these actions:
  - `search`: AI web search, with per-site prompt templates
  - `audit`: a plain server fetch of the homepage, with a 10-second timeout and up to 20 sites per run. It parses https, the viewport meta tag, the copyright year, `tel:` links and forms, and records load time. It makes no AI call.
  - `audience_pack`: one AI call, structured JSON output
  - `export`: Google Sheets, as now
- Each run stays capped at 20 results, starts only when you press the button, and turns AI credit or rate-limit errors into plain messages.
- Older Lead Scraper results stay readable. The old Lead Scraper menu item points to the Finder.
