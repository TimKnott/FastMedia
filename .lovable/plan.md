## Scope

Wire two product sets to Lovable Payments (Stripe):
- **3 service packages** (Starter 4 990, Basic 9 990, Pro 19 990 CZK — one-off) + **3 hosting tiers** (1 500 / 2 000 / 3 500 CZK/mo — recurring). Enterprise stays "Contact us".
- **24 eshop demo products** as test-mode one-off items behind the existing `/demo/eshop` flow.

Tax: **Full compliance handling** (+3.5%) on every session, since all products are digital services.

## Default business logic (you skipped — confirm or override after I ship)

**One-off package purchase** → upsert `client_projects` draft (linked to the Stripe customer), send confirmation email to customer + admin notification (re-using existing `notify-admin` + `send-transactional-email`), insert row into `accounting_entries` as one-time revenue.

**Subscription start (hosting)** → upsert `subscriptions` row via webhook, send welcome email, log monthly recurring entry in accounting on each renewal.

**Subscription cancel** → keep access until `current_period_end`, flag `cancel_at_period_end`, notify admin.

**Upgrade** → immediate switch, prorated by Stripe.
**Downgrade** → scheduled at period end (no refund mid-cycle).

**Eshop demo purchase** → fulfilment is mocked (no real shipping); just record the order in a new `demo_orders` table and show the existing checkout success page.

## Build steps

1. **Create products in Stripe** via `batch_create_product`:
   - `pkg_starter` / `pkg_basic` / `pkg_pro` — one-off CZK
   - `hosting_starter` / `hosting_basic` / `hosting_pro` — recurring monthly CZK
   - `eshop_p1` … `eshop_p24` — one-off CZK
   - All tagged `txcd_10000000` (general digital goods) — eligible for full compliance handling.

2. **Migration** — `subscriptions` table (per Stripe webhook spec, with `environment` column + RLS), `demo_orders` table, indexes, `has_active_subscription` function.

3. **Edge functions** (all with `verify_jwt = false`):
   - `create-checkout` — resolves price by `lookup_key`, uses `resolveOrCreateCustomer`, `ui_mode: "embedded_page"`, `managed_payments: { enabled: true }`, sets `payment_intent_data.description` for one-offs.
   - `payments-webhook` — handles `customer.subscription.{created,updated,deleted}` + `checkout.session.completed` (one-offs → `client_projects` draft + accounting entry + emails).
   - `payments-customer-portal` already exists — leave it.

4. **Frontend**:
   - `PricingSection` "View package" CTA → opens `StripeEmbeddedCheckout` for the package (one-off) and offers the matching hosting subscription as a follow-up.
   - `/demo/eshop` checkout → swap mocked finish for real embedded checkout in test mode.
   - Reuse `BillingPortalButton` on `/account`.
   - Add `PaymentTestModeBanner` at app root.

5. **Tax codes**: after `batch_create_product`, `stripe.products.update` each with `tax_code: 'txcd_10000000'` (one-time script as part of the create-checkout deploy).

## Files

**New**
- `supabase/functions/_shared/stripe.ts` (verifyWebhook + createStripeClient — partly exists, will extend)
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/payments-webhook/index.ts`
- `src/lib/stripe.ts`
- `src/components/StripeEmbeddedCheckout.tsx`
- `src/components/PaymentTestModeBanner.tsx`
- `src/hooks/useStripeCheckout.tsx`
- `src/hooks/useSubscription.tsx`
- `src/data/stripeProducts.ts` (price-id → human label map)
- migration: `subscriptions`, `demo_orders`, `has_active_subscription`

**Edited**
- `src/App.tsx` — mount `PaymentTestModeBanner`
- `src/components/PricingSection.tsx` — checkout CTA
- `src/components/eshop/CheckoutFlow.tsx` — real checkout
- `supabase/config.toml` — `verify_jwt = false` for new functions

## Out of scope (do separately)
- Real shipping/fulfilment for demo eshop
- Enterprise tier checkout (stays as contact form)
- Coupon redemption inside Stripe (existing `/admin/coupons` keeps own flow)
- Migrating existing manual `accounting_entries` to Stripe-driven

Confirm and I'll start. If the default business logic above is wrong, paste corrections and I'll adjust before building.