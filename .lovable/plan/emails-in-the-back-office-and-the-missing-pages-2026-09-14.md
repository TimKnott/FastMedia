# Emails in the back office, and the missing pages

## What I found

**Your emails are already copied into the back office.** There are 18 messages stored, the newest from Saturday 13 September, and the copy runs automatically every hour from your Google Workspace mailbox. Nothing is lost — but three things make it look broken:

1. **Clicking a line doesn't open the message on the Emails screen.** That screen (Email log) only lists messages you have *sent* and its rows were never made clickable. The screens that do open a message are Support Inbox and Email Dashboard.
2. **When a message does open, it often looks empty.** Most of your real emails are HTML-only; the pop-up only shows the plain-text version, which for several messages is blank or two characters long.
3. **Read / replied / archived never sticks.** Every one of the 18 messages is still marked "unread", so status changes are being rejected silently.

**The rocket header and new pages are published and live.** I checked fastmedia.pro: the home page, /offer, /grant-wizard and the service landing pages all respond correctly. The reason you can't find them is that **none of them are in the website menu** — the menu has Blog, Consultant, Calculator, Enquiry, Grant wizard and Contact, but no Offer page, no grant information pages and no service pages. And if the header still looks old for you, that's your browser holding an old copy of the site.

## What I'll do

**1. One reliable inbox**
- Make the Emails screen's message rows open the full message, same as the inbox.
- Show the real email content in the pop-up: the formatted HTML version when it exists, with a plain-text fallback, so newsletters and customer emails read as they do in Gmail.
- Fix read / replied / archived so the state saves and the unread counter is accurate.
- Add sender, recipient, date, attachments-present note and a Reply button consistently on all three screens.
- Add a manual "Sync now" plus a visible "last synced" time so you can tell at a glance that copying is working.

**2. Put the new pages where people can find them**
- Add to the website menu: Offer, Grant wizard (already there), Grant eligibility, Grant hubs map, and a Services entry linking to the service landing pages.
- Keep the Czech/English labels consistent with the rest of the menu.
- Add the same set to the admin "Public pages" group so you can jump straight to each one.

**3. Confirm what's live**
- Load the home page, /offer, /grant-wizard and one service page in a real browser and check the rocket header renders, then publish.
- Send you the exact links, and the trick for forcing your browser to drop its old copy.

## Technical notes

- `AdminEmails.tsx` lists `email_send_log` only; add an inbound section or make it link to the inbox rather than duplicating it.
- Message dialogs in `AdminInbox.tsx` and `AdminEmailDashboard.tsx` render `body_plain` in a `<pre>`; render sanitised `body_html` (DOMPurify) in an isolated container with `body_plain` fallback.
- All 18 `inbound_emails` rows sit at `status = 'received'` despite `openMessage` writing `read`: the table has one `ALL` policy for admins plus many duplicated `SELECT`-only policies for `authenticated`, so the update is filtered out. Add an explicit admin `UPDATE` policy (and drop the duplicate `SELECT` policies) in a migration, then verify by returned rows.
- `gmail-inbox-sync` cron runs at minute 7 hourly and is active; surface `max(created_at)` as "last synced".
- Menu items live in `navLinks` in `src/components/Navbar.tsx`; service pages come from `src/data/serviceLandings.ts`.
