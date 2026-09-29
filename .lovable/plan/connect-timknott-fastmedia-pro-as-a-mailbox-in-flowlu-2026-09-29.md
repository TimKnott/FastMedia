# Connect timknott@fastmedia.pro as a mailbox in Flowlu

## Background
Flowlu's API cannot send emails — its email module is read-only. Sending from inside Flowlu requires connecting a real mailbox in Flowlu's own settings, done manually by the user. After that, Flowlu can send and receive email as timknott@fastmedia.pro, and every message can be linked to CRM leads.

## Step 1 — You connect the mailbox (5 minutes, in Flowlu)
Because timknott@fastmedia.pro is a Google Workspace address, Flowlu needs a Google App Password ([1](https://www.flowlu.com/help/articles/494-512-522--how-to-connect-gmail/)):

1. **Turn on 2-Step Verification** (if not already on): myaccount.google.com → Security → 2-Step Verification.
2. **Create an App Password**: myaccount.google.com → Security → 2-Step Verification → App passwords → "Select app: Custom" → name it "Flowlu" → Generate → copy the 16-character code.
3. **Make sure IMAP is on**: in Gmail, Settings → See all settings → Forwarding and POP/IMAP → Enable IMAP ([2](https://www.flowlu.com/help/articles/494-512--how-to-set-up-email-sync/)).
4. **Connect in Flowlu**: fastmedia.flowlu.com → open the **Email** module in the main menu → **Connect an Account** (if an account already exists, use the three-dots menu → add new) → choose **Gmail** → enter timknott@fastmedia.pro and the 16-character App Password ([1](https://www.flowlu.com/help/articles/494-512-522--how-to-connect-gmail/)).
5. **Sync settings**: choose how far back to import (e.g. 1 month), and tick **Use CRM** so incoming emails can create contacts/opportunities automatically ([2](https://www.flowlu.com/help/articles/494-512--how-to-set-up-email-sync/)).

Tell me in chat when done — the App Password itself never needs to be shared with me or the website.

## Step 2 — I verify the connection
Call the existing admin-gated `flowlu-admin` edge function with action `raw_get` on `email/account/list` (a read-only Flowlu endpoint) and confirm the timknott@fastmedia.pro mailbox appears as active. Report the result honestly.

## Step 3 — Small build: mailbox status in the back office
Add a "Mailboxes" panel to the admin Flowlu page (`/admin/flowlu`) that calls the same read-only endpoint and lists connected mailboxes with their status, so you can always see whether the Flowlu email link is healthy without leaving the site.

## What changes for you afterwards
- You can compose and send email to any lead from inside Flowlu, and replies sync back to the lead's timeline.
- Nothing else changes: the website's own notifications and prospect emails continue to send through Google Workspace from timknott@fastmedia.pro (better deliverability than sending through Flowlu).
