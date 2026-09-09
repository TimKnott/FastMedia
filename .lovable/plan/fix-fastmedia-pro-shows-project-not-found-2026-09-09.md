# Fix: fastmedia.pro shows "Project not found"

## What is actually wrong

The offer page is built and working. It loads fine on the Lovable address:
https://fastmedia-pro.lovable.app/offer returns the full page.

The problem is the domain, not the page. Right now **every** address on
fastmedia.pro and www.fastmedia.pro fails, not just /offer — the home page
returns the same "Project not found" error.

Checked just now:

```text
www.fastmedia.pro   status: drifted        (1 day 14 hours)
fastmedia.pro       status: awaiting DNS   (1 hour)

A record        www.fastmedia.pro -> 185.158.133.1     OK
TXT record      _lovable.www.fastmedia.pro             MISSING
A record        fastmedia.pro     -> 185.158.133.1     OK
TXT record      _lovable.fastmedia.pro                 MISSING
```

The two ownership-verification TXT records were removed from the domain
settings — most likely while the Google Workspace email records were being
edited. Without them the hosting refuses to serve the site on your own
domain, even though the site itself is published and healthy.

## The fix

1. Open the domain connection card in chat for `www.fastmedia.pro`. It shows
   the exact record to add and, where your registrar supports it, adds it for
   you after you confirm.
2. Do the same for the bare `fastmedia.pro`.
3. Wait for the records to become visible publicly (usually minutes, up to a
   few hours at Namecheap), then re-check both domains.
4. Confirm the home page and /offer both load on www.fastmedia.pro.

Nothing in the site code needs changing, and no credits are needed for this —
it is purely two DNS entries being put back.

## Records that must exist

```text
TXT  _lovable.www.fastmedia.pro
     lovable_verify=659df2776306bd1cc99a1e7721abb8183182ace5168761c712a7201ef7bc21da

TXT  _lovable.fastmedia.pro
     lovable_verify=ba43067dd094b8337a1b7a61a7eaaadeff5f41f5b3be4d60ce2903784918c8db
```

Leave the existing A records (185.158.133.1) and all Google Workspace MX
records untouched.
