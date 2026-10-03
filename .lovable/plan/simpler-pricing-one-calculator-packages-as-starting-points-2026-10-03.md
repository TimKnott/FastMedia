# Simpler pricing: one calculator, packages as starting points

## Recommendation

Most small-business buyers want both a quick price anchor and the option to customise. Having two separate price systems is confusing because the packages and the calculator can give different totals for the same site. The usual fix is to make the **calculator the single source of truth** and turn the **packages into ready-made starting bundles inside it**.

- Keep the four packages on the homepage, but each one shows "from X" and has one button: **Customise this package**.
- That button opens the calculator with the package's modules already ticked. The visitor can then add or remove modules, and the price updates live.
- The package price always comes from the sum of its modules, so the two can never disagree.
- Packages bought on their own still use the current Stripe checkout, which stays unchanged.

## AI "Suggest something new" assistant

The calculator's current "special request" step is a single question with one answer. It becomes a short conversation:

1. The visitor describes what they want that isn't listed.
2. The AI asks 2–4 follow-up questions to understand what they really need: their goal, who uses it, how often, and examples.
3. It points out existing modules that already cover part of the request.
4. It writes a summary of the need, plus a *rough indicative* price range labelled "to be confirmed by FastMedia".
5. The request is saved with the visitor's contact details and appears in the back office. You get an email about it.

The AI never promises a final price. You confirm it.

## Back office: "Module requests" and "Modules"

- **Module requests:** a list of every new idea, with the conversation, the summary, the suggested price, the visitor and the status (new / quoted / turned into a module / declined). You can send the quote or convert the idea into a module with one click.
- **Modules:** an editor for every calculator module: name, description, one-off price, monthly price, hours, category, on/off and order. Packages are chosen here as sets of modules. Changes appear in the calculator straight away, with no code changes needed.

## Technical notes

- New tables: `calculator_modules` (seeded from `src/data/calculatorFeatures.ts`), `calculator_packages` (slug, name, module ids, sort), `module_requests` (conversation jsonb, summary, suggested range, contact, status, converted_module_id). GRANTs + RLS: public read on active modules/packages; anon insert only via edge function; admin full access via `has_role`.
- Calculator and PricingSection read modules/packages from the database, with the static file as a fallback. The `/calculator?package=pro` route preselects modules.
- The `calculator-ai` special-request path moves to a new `module-advisor` edge function using `openai/gpt-6-astra` over Responses, streamed, with structured output (next question or final summary). It is rate limited and handles 402/429.
- On completion: insert into `module_requests`, then send a notification through the existing email queue to support@fastmedia.pro.
- Admin pages `/admin/modules` and `/admin/module-requests` (minRole admin) are added to the sidebar.
- English-only copy, with the site locked to British English.

## Open question

Package prices currently shown, such as Starter or Pro, may not match the sum of their modules. When they don't, which should we adjust: the package price or the module prices? This plan defaults to showing the sum of the modules and flags any mismatch in the Modules editor so you can decide.
