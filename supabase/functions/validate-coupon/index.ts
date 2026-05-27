// Public coupon validation endpoint used by the calculator before purchase.
// Returns the discount amount or an error reason. Does NOT mark as redeemed.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { code, oneTimeAmount = 0, monthlyAmount = 0 } = await req.json()
    if (!code || typeof code !== 'string') {
      return json({ valid: false, error: 'missing_code' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const normalized = code.trim().toUpperCase()
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', normalized)
      .maybeSingle()

    if (error) throw error
    if (!coupon) return json({ valid: false, error: 'not_found' })
    if (!coupon.is_active) return json({ valid: false, error: 'inactive' })

    const now = new Date()
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return json({ valid: false, error: 'not_yet_valid' })
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return json({ valid: false, error: 'expired' })
    }
    if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
      return json({ valid: false, error: 'max_uses_reached' })
    }

    const applies = coupon.applies_to as 'one_time' | 'monthly' | 'both'
    const baseAmount =
      applies === 'monthly' ? Number(monthlyAmount)
      : applies === 'one_time' ? Number(oneTimeAmount)
      : Number(oneTimeAmount) + Number(monthlyAmount)

    if (baseAmount < Number(coupon.min_amount || 0)) {
      return json({ valid: false, error: 'min_amount_not_met', minAmount: coupon.min_amount })
    }

    let oneTimeDiscount = 0
    let monthlyDiscount = 0
    const value = Number(coupon.discount_value)

    if (coupon.discount_type === 'percentage') {
      if (applies === 'one_time' || applies === 'both') {
        oneTimeDiscount = Math.round((Number(oneTimeAmount) * value) / 100)
      }
      if (applies === 'monthly' || applies === 'both') {
        monthlyDiscount = Math.round((Number(monthlyAmount) * value) / 100)
      }
    } else {
      // fixed
      if (applies === 'one_time') oneTimeDiscount = Math.min(value, Number(oneTimeAmount))
      else if (applies === 'monthly') monthlyDiscount = Math.min(value, Number(monthlyAmount))
      else {
        // split proportionally on 'both'
        const total = Number(oneTimeAmount) + Number(monthlyAmount)
        if (total > 0) {
          oneTimeDiscount = Math.min(
            Number(oneTimeAmount),
            Math.round((value * Number(oneTimeAmount)) / total),
          )
          monthlyDiscount = Math.min(Number(monthlyAmount), value - oneTimeDiscount)
        }
      }
    }

    return json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        applies_to: coupon.applies_to,
        currency: coupon.currency,
      },
      oneTimeDiscount,
      monthlyDiscount,
    })
  } catch (e) {
    console.error('validate-coupon error', e)
    return json({ valid: false, error: 'server_error' }, 500)
  }

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
