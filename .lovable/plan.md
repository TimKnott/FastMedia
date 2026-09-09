# Grant support slider in the AI calculator

Let visitors estimate how much a digitalisation grant could cover, on a sliding scale from 0% to 85%, and connect it to the offer page.

## What the visitor sees

On the final "Your Quote Summary" step, below the coupon block, a new panel:

- Title: "Digitalisation grant estimate" (Czech default wording on the Czech/German versions).
- A slider from 0% to 85% (steps of 5%), starting at 0%, plus a small number box so an exact figure like 62% can be typed in.
- Quick preset buttons: 0%, 30%, 50%, 70%, 85%.
- Live figures that update as the slider moves:
  - Grant contribution (estimated)
  - Your share after the grant
  - The unchanged full project price stays visible above it
- A short honesty note: the grant rate is decided by the grant provider and the figure is only an indication, with a link to the grant guide page.

Rules:
- The grant applies to the one-off build cost only (after any coupon), not to hosting or other monthly fees — that matches how these programmes work.
- The amount actually payable at checkout is unchanged; the grant panel is an estimate, clearly labelled as such.

## Where it also appears

- Quote PDF: an extra line under the totals showing the chosen grant rate, the estimated grant contribution and the visitor's share, only when the slider is above 0%.
- Quote enquiry data sent with the request includes the chosen grant rate so you can see it in the back office.
- Offer page: the existing grant section gets a second link straight to the calculator's grant estimator, worded "Estimate your price after a grant" in both languages, plus a mention in the calculator card.
- Grant guide page: a link back to the calculator estimator.

## Technical notes

- `src/pages/CalculatorPage.tsx`: add `grantRate` state (0-85), derive `grantAmount = discountedOneTime * rate/100` and `netAfterGrant`, render a shadcn `Slider` + `Input` panel in the `step === 'summary'` block, add labels to all three language dictionaries (cs/en/de), and include the values in the PDF totals card and the quote submission payload.
- `src/pages/OfferLanding.tsx`: add a secondary CTA in the grant section and a line in the calculator card, both linking to `/calculator#grant`.
- `src/pages/GrantGuide.tsx`: add a calculator CTA.
- No database or backend changes.
