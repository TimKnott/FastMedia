# Zelený Kůň — completed SEO source patch

These are the **finished source files** for the existing Lovable project **Zeleny Kun** (project ID `2eaa8f42-c538-473e-8f38-f7d4f27c7c32`). They are staged here because the available Lovable connector supports reading and deployment, but not direct file writing, and no connected GitHub repository for this project was found. They are **not yet live**.

## Files
- `llms.txt` — bilingual AI-discovery file based on current public URLs and published terms.
- `product-schema.ts` — Product/Offer JSON-LD for the existing Czech/English homepage; price is 25 CZK per kilogram, with no invented availability or ratings.
- `apply-seo-patch.mjs` — idempotent script that writes both files into the actual Zelený Kůň checkout and adds the schema to the homepage route's existing head output.

## Apply to the actual project

With the **existing** Zelený Kůň source checkout available locally, run:

```sh
node seo-integrations/zelenykun/apply-seo-patch.mjs /path/to/existing/zelenykun-checkout
```

The script must be run from this FastMedia repository, or with its absolute path. It validates the exact current homepage head code before changing anything and refuses to overwrite different existing destination files.

Then build and deploy the existing project using its own configured pipeline, without creating a replacement app. The source patch was tested twice against the actual homepage source retrieved from Lovable; it is idempotent, and both modified TypeScript files passed syntax validation.

## Production release gate

```sh
node scripts/audit-zelenykun-seo.mjs --strict
```

The gate checks all sitemap URLs against their canonicals, then checks for the published `llms.txt` and Product/Offer schema. At preparation time, all **36 of 36** sitemap URLs passed; the two missing SEO assets correctly failed. Do not mark the deployment complete until this gate passes against `https://zelenykun.com`.

## Editorial and pricing constraints

Do not add health-treatment claims, unsupported stock availability, customer review scores, dry-matter comparisons or guaranteed delivery outside published conditions. The product schema uses the current site price of **25 CZK/kg** and does not imply every order can be filled immediately.
