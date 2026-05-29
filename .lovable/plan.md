## Scope

You asked for a Stripe checkout backed by the **calculator's selectable items** — nothing else. I'll align both the eshop demo and the calculator to that single source of truth (`src/data/calculatorFeatures.ts` — 25+ items like Contact Form, Booking System, Gallery, AI Chatbot, Invoicing, etc.).

**No products will be pre-created in Stripe.** Every checkout uses dynamic `price_data` so the cart amount = exactly what the calculator computed, in CZK. This keeps your Stripe product list clean and means future additions to `calculatorFeatures.ts` automatically appear without any Stripe sync step.

## Changes

### 1. /demo/eshop — replace with calculator catalogue
- Delete `src/data/eshopProducts.ts` (the 24 invented items).
- Rewrite `src/pages/demos/EshopDemo.tsx` so the product grid is built from `calculatorFeatures` grouped by category (Essential / Marketing / Advanced / Premium).
- Each card shows: icon, name, description, one-time price, monthly add-on (if any), "Add to package" button.
- Rewrite `src/components/eshop/CheckoutFlow.tsx` to show the selected items, the 12-month-prepaid hosting line, coupon input, and the Stripe embedded checkout.

### 2. Calculator — add "Pay now" button
- In `CalculatorPage.tsx`, next to the existing PDF download / quote section, add a primary **Pay now** button.
- Clicking it opens the existing `StripeEmbeddedCheckout` in a dialog with dynamic `price_data` line items:
  - One line per selected feature (name + `oneTimePrice × quantity`)
  - One line for labor (`totalLaborHours × LABOR_RATE`) — if > 0
  - One line: **"Hosting & maintenance — 12 months prepaid"** = `totalMonthly × 12`
  - Coupon discount applied as a negative `price_data` line (Stripe doesn't allow negative line items, so the discount is applied by **reducing the labor / hosting line proportionally** OR by passing `discounts: [{ coupon }]` — I'll use the proportional reduction to keep one checkout call and avoid needing pre-created Stripe coupon objects).

### 3. Coupon flow (already exists, just confirming)
- `validate-coupon` edge function and admin coupon UI at `/admin/coupons` already exist.
- The calculator already calls `validate-coupon` and computes `oneTimeDiscount` + `monthlyDiscount`.
- For the **annual prepay**, `monthlyDiscount × 12` is added to the discount applied at checkout.

### 4. Stripe wiring (already in place — no schema changes)
- `create-checkout` edge function already accepts the `cart` dynamic-price path.
- I'll extend its `Body` type with an optional `metadata` blob (selected feature IDs, coupon code, quote ID) so the webhook can attach the payment to a lead/client_project in the admin.
- No new tables, no migrations.

### 5. Cleanup
- Remove the eshop product imports from any other page (search/replace).
- Update the memory entry [Eshop Demo](mem://features/eshop-demo-implementation) to reflect the new catalogue source.

## Out of scope (ask if you want these)
- Pre-creating individual SKUs in Stripe (you've said no — sticking to dynamic price_data).
- Splitting the payment into one-time + recurring subscription (hosting is charged as 12-month prepay in a single one-off invoice per your instruction).
- Multi-currency (CZK only, matches the calculator).
