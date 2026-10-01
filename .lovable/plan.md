# myname.co.uk showcase hub for all 24 projects

## What you get
- **myname.co.uk**: a polished landing page that replaces the current site. It shows a thumbnail card for each of the 24 projects, with a short description of what the site does and a link to visit it. A small "Developed by FastMedia.Pro" credit links back to www.fastmedia.pro.
- **Each project gets its own address**, for example `progenitors.myname.co.uk`, `calcurly.myname.co.uk`, and so on.
- **Backlink builder** gets one row for the hub plus one row for each project address. The Monday check then verifies each link back to FastMedia automatically.

## Why subdomains, not subdirectories
Each project is a separate site, and a single domain path cannot serve 24 different sites. `name.myname.co.uk` works and keeps each site isolated from FastMedia, as you wanted.

## Steps
1. **Hub content (done by me, here):** I take a screenshot thumbnail of each live site, write a 1–2 sentence English description of each project from what it actually contains, and choose a clean subdomain name for each. I put all of this into a ready-to-paste brief, delivered as a file.
2. **Hub site (you start it, I build it):** create one new, empty Lovable project called "Showcase" and paste the brief into its chat. It builds the landing page there, so it stays completely separate from FastMedia's back office. This project cannot create or edit other projects.
3. **Connect the main domain:** in the Showcase project, go to Settings → Domains → Connect `myname.co.uk` and `www.myname.co.uk`. At Namecheap, replace the old records with the A records shown (185.158.133.1) plus the TXT record. This replaces the current website.
4. **Per-project addresses:** in each of the 24 projects, connect its subdomain (Settings → Domains), add the matching A + TXT records at Namecheap, add the footer credit, and publish. The 15 unpublished projects first need publishing, which only you can do in their own editors.
5. **Backlink builder:** add 25 new rows (the hub plus 24 subdomains), with addresses pre-filled and marked To do. Existing rows 51–59 are updated to their new subdomain addresses. The weekly check runs as usual, and "Check all now" works immediately.
6. **Namecheap checklist:** a single table listing every subdomain with the exact records to add, so each one takes about 2 minutes.

## Caveats
- Unpublished projects have no screenshot yet, so their cards use a branded placeholder until they go live.
- The Temu Style Shop is included as you asked, but it copies another brand. It's best kept off any public showcase.
- Each custom domain needs a paid plan in its own project.
- DNS can take up to 72 hours to work.

## Technical details
- Thumbnails: Playwright screenshots of the 9 live .lovable.app URLs (1280x800, compressed JPEG), bundled with the brief.
- Backlink rows: insert into backlink_opportunities with is_own_site=true, ON CONFLICT (site_url) DO NOTHING; update rows 51–59 site_url to the subdomains.
- Deliverables: a showcase brief (markdown + thumbnails ZIP) and a Namecheap DNS checklist.
