# Make leads easy to find and keep admin signed in

## Why leads are hard to find today
The salons and other discovered businesses live on the **Prospecting desk** (`/admin/prospecting`), which sits far down the sidebar. The sidebar item called "Leads" shows only website enquiries, so the discovered salons never appear there.

## About automatic login
The site cannot safely log anyone in just by visiting — that would log in every visitor as admin. Instead:
- Your sign-in is already remembered on your own browser; it stays signed in until you log out.
- When you are signed in and visit any public page, you go straight into the back office's new **Leads hub** with one click (or automatically when you visit `/admin`).
- On the login page, "Continue with Google" and saved-password autofill stay, so re-login is one click.

## What I will build
1. **New "Leads hub" page** (`/admin/leads-hub`), set as the first page after admin login:
   - Big counters: discovered leads, sent to Flowlu, awaiting approval, website enquiries.
   - One table combining discovered prospects (e.g. Salon Grácie) and website enquiries, with search, source filter, website score, and a "Open in Flowlu" button for leads #909–#929.
   - Buttons: Find more leads, Open Prospecting desk.
2. **Sidebar**: pin "Leads hub" at the very top with a count badge; rename existing items to "Website enquiries" and "Prospecting desk" so it's clear.
3. **Public site bar for admins**: when signed in, a slim bar at the top of every public page with "Leads (21)" and "Back office" buttons.
4. **Dashboard**: add a "Discovered leads" card linking to the hub.

## Technical details
- Reads existing `prospects` and `leads` tables (admin RLS already applies); Flowlu IDs taken from stored prospect records.
- `AdminLogin` redirects to `/admin/leads-hub`; `/admin` index keeps dashboard.
- Admin bar uses `useUserRole`, hidden for non-staff. No database changes.
