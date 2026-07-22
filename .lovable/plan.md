## Goal

Make `support@fastmedia.pro` forward to your personal inbox (e.g. Gmail).

## Why not Lovable

Lovable Emails only **sends** outbound mail — it does not host mailboxes or receive/forward incoming mail. So the forwarding side has to live at your DNS/mail provider. Nothing to build in the app for this.

## Recommended: Cloudflare Email Routing (free, ~10 min)

The simplest, free option. Works alongside Lovable Emails without conflict because Lovable uses the `notify.fastmedia.pro` subdomain for sending, while forwarding is set up on the root `fastmedia.pro`.

### Steps you'll do (outside Lovable)

1. Create a free Cloudflare account and add `fastmedia.pro` as a site (no need to change registrar — you can keep your current one or move DNS to Cloudflare).
2. In Cloudflare → **Email → Email Routing**, enable routing. Cloudflare shows you the MX + TXT records to add.
3. Add those MX/TXT records at whichever DNS provider currently manages `fastmedia.pro`.
   - Important: these MX records go on the **root domain** (`fastmedia.pro`), NOT on `notify.fastmedia.pro`. Do not touch the Lovable NS delegation on the notify subdomain.
4. In Email Routing → **Routes**, add:
   - Custom address: `support@fastmedia.pro` → forward to your personal email.
   - Verify the destination email (Cloudflare sends a confirmation link).
5. Optional catch-all: forward `*@fastmedia.pro` to the same inbox so nothing gets lost.

Done — mail to `support@` lands in your personal inbox within seconds.

## Alternatives if you'd rather not use Cloudflare

- **Zoho Mail Free**: real mailbox at `support@fastmedia.pro` (webmail + IMAP), up to 5 users free. More setup (MX + SPF + DKIM + DMARC), but you get a real inbox you can log into.
- **Google Workspace**: paid (~€6/user/mo) if you want Gmail-branded `support@fastmedia.pro`.
- **ImprovMX / Forward Email**: dead-simple free forwarders, similar to Cloudflare.

## Sending replies as support@fastmedia.pro

Forwarding delivers mail *to* you, but replies from Gmail will show your personal address by default. Two options:
- Use Gmail's **Send mail as** with an SMTP relay (Zoho free tier or Brevo free tier work well).
- Or ignore it and just reply from your personal address for now.

## What I'll do in the app

Nothing code-side is required for forwarding itself. But I can:
- Update the site's contact copy / mailto links to `support@fastmedia.pro` everywhere (currently already the case, but I'll verify).
- Once forwarding is live, we can also wire Lovable's outbound emails (auth, quotes, notifications) to use `support@fastmedia.pro` as the visible From address so replies to those emails flow back into your forwarded inbox.

## Recommendation

Go with **Cloudflare Email Routing** — free, fastest, and won't conflict with your existing Lovable email setup. Want me to walk you through the exact DNS values once you've enabled it on Cloudflare?
