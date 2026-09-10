# Czech-default public website

## Goal
Make every visitor-facing page open in Czech by default, with a clear switch to British English. Keep the selected language while visitors move between pages and return later.

## What will change
- Restore the existing language system so it defaults to Czech instead of forcing English.
- Replace the current language control with a consistent two-option `CZ / EN` switch in desktop and mobile navigation.
- Set the page language correctly for browsers and accessibility whenever the visitor switches.
- Translate all public navigation, homepage sections, offer and grant pages, calculator, contact and quote forms, package pages, consultant page, account/checkout screens, blog interface, legal pages, error states, cookie/accessibility controls, and visitor messages.
- Ensure all industry demo pages use their existing Czech and English content through the shared demo layout; fill any untranslated shared demo labels.
- Use British spelling and wording throughout the English version.
- Localise titles, descriptions, structured page metadata, form errors, success notices, and accessibility labels—not only visible headings.
- Keep admin and staff screens in their existing operational language; this change covers the public front end.

## Technical details
- Simplify the public language type to Czech and English while retaining compatibility with existing translated data.
- Read `fastmedia-language` on startup, falling back to `cs`; update storage and `document.documentElement.lang` on change.
- Move repeated copy into central translation dictionaries or bilingual page data rather than duplicating page layouts.
- Preserve URLs and current functionality; language switching will not redirect or reset forms/calculator progress.
- Update generated/static SEO output so Czech is the default rendered language and British English remains available in-app.

## Verification
- Check all public routes for untranslated interface text in both modes.
- Test the toggle and persistence from homepage, offer, grants, calculator, contact, blog, legal and representative demo pages.
- Verify mobile navigation, forms, calculator interactions, page metadata, no overflow, and no console/runtime errors.