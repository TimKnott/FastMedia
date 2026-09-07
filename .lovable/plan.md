# Move fastmedia.pro mailbox to Google Workspace

## The honest answer

Yes — for a professional mailbox you actually log into, read, and reply from (like `support@fastmedia.pro`), Google Workspace is the gold standard and would permanently fix the "can't receive email" problem that has dragged on for months.

But it's important to split the two jobs email does on your site:

| Job | Who does it today | Would Google Workspace help? |
|---|---|---|
| **Receiving & replying** to `support@fastmedia.pro` | Nothing — Namecheap's servers reject it (the 554 bounce) | **Yes — this is exactly what it solves** |
| **Website sending** (quotes, contact notifications, reports) | Your site's own mail system via `notify.fastmedia.pro` — healthy and verified | **No change needed** — keep as is |

## What you'd get with Google Workspace

- A real Gmail inbox at `support@fastmedia.pro` — send AND reply from your own domain
- Works instantly with your existing Gmail habits; mobile apps, search, spam filtering
- Replies come *from* support@fastmedia.pro instead of your private Gmail — looks far more professional to customers
- ~£5/user/month (Business Starter). One user is enough to start.
- Alternative if cost matters: the free Namecheap forwarder fix from before still works, but replies would come from your private Gmail address, not the branded one.

## What needs to happen

### Your part (I cannot do these — they need your accounts)

1. Sign up for Google Workspace at workspace.google.com, choose Business Starter, one user: `support@fastmedia.pro`.
2. Google gives you a verification code and MX records.
3. In Namecheap (Domain List → Manage `fastmedia.pro` → Advanced DNS):
   - **Remove** the 5 `eforward*.registrar-servers.com` MX records (they're the servers currently bouncing your mail)
   - **Add** Google's MX record (`SMTP.GOOGLE.COM`, priority 1) and Google's verification TXT record
   - **Leave `notify.fastmedia.pro` completely untouched** — your website's sending lives there
4. In Namecheap → Redirect Email: remove any stale forwarding rules (they stop mattering once MX points to Google).
5. Tell me when done — I'll verify the records went live.

### My part (after you confirm the switch)

1. Verify the new MX/TXT records are live with a DNS check.
2. Send a real test email to `support@fastmedia.pro` through the site's own mail system and confirm it lands in the new Google inbox.
3. Add an SPF record so mail Google sends for your domain is trusted (I'll give you the exact line, or confirm Google's setup wizard already added it).
4. Keep the daily deliverability probe running against `support@fastmedia.pro` — it should flip from FAIL/bounce to PASS once Google is live, giving you a permanent early-warning if anything ever breaks again.
5. Update the Email Deliverability page notes to reflect Google Workspace as the inbound provider.

## What does NOT change

- Website notifications, quote emails, contact-form alerts, and the daily report keep sending via `notify.fastmedia.pro` — that system is verified and healthy.
- The bounce/suppression history dashboard and Slack failure alerts keep working.
- No code changes are needed to the site itself beyond verification and documentation.

## Risks

- Switching MX records means any mail sent during propagation (minutes to a few hours) may be delayed, not lost.
- Do not delete or alter the `notify.fastmedia.pro` DNS records during the Namecheap edit — that would break website sending.
