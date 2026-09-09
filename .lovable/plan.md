# Fix: fastmedia.pro "Project not found" — add the two missing TXT records

## What the re-test shows

Re-checked after the A record update:

```text
A record    www.fastmedia.pro -> 185.158.133.1   OK
A record    fastmedia.pro     -> 185.158.133.1   OK
TXT         _lovable.www.fastmedia.pro           STILL MISSING
TXT         _lovable.fastmedia.pro               STILL MISSING
```

The A records were already correct — that is why changing them changed nothing.
The site refuses to serve on your own domain because the two ownership TXT
records are not in the DNS. Until they exist, every page (home, /offer, /blog)
returns "Project not found". The site itself is published and healthy.

## The fix

1. In Namecheap (Advanced DNS for fastmedia.pro), add two TXT records:

```text
Host: _lovable.www
Value: lovable_verify=659df2776306bd1cc99a1e7721abb8183182ace5168761c712a7201ef7bc21da

Host: _lovable
Value: lovable_verify=ba43067dd094b8337a1b7a61a7eaaadeff5f41f5b3be4d60ce2903784918c8db
```

   Do not touch the A records or the Google Workspace MX records.

2. Wait for the records to become publicly visible (usually minutes at
   Namecheap).

3. Re-check both domains, then confirm https://www.fastmedia.pro/ and
   https://www.fastmedia.pro/offer both load.

No code changes and no credits are involved — only the two TXT entries.
