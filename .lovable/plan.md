

## Fix: Consolidate email_send_log RLS policies

**Problem**: The `email_send_log` table has service_role policies granted `TO public` instead of `TO service_role`. While functionally safe (the `auth.role() = 'service_role'` check blocks anon), the pattern is fragile and confusing.

**Solution**: Drop the three service_role policies that use `TO public` and recreate them scoped to the `service_role` role directly. This makes the intent explicit and removes the fragile dual-policy pattern.

### Migration

1. Drop existing service_role policies on `email_send_log`:
   - "Service role can insert send log" (INSERT, TO public)
   - "Service role can read send log" (SELECT, TO public)
   - "Service role can update send log" (UPDATE, TO public)

2. Recreate them with `TO service_role` (no USING/WITH CHECK needed since service_role bypasses RLS by default, but we keep them for explicitness):
   - INSERT policy TO `service_role`
   - SELECT policy TO `service_role`
   - UPDATE policy TO `service_role`

The admin SELECT policy on `{authenticated}` remains unchanged.

