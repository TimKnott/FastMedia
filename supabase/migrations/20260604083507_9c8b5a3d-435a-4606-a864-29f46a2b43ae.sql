
-- 1. Bookings: scope the permissive admin-manage policy to authenticated only
ALTER POLICY "Admins can manage bookings" ON public.bookings TO authenticated;

-- 2. Leads: add restrictive SELECT policy requiring admin role for authenticated users
CREATE POLICY "Restrict leads select to admins"
  ON public.leads
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Payment orders: explicit deny for anon
CREATE POLICY "Deny anon access on payment_orders"
  ON public.payment_orders
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- 4. Subscriptions: explicit deny for anon
CREATE POLICY "Deny anon access on subscriptions"
  ON public.subscriptions
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
