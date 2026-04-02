-- Drop the three service_role policies currently granted TO public
DROP POLICY "Service role can insert send log" ON public.email_send_log;
DROP POLICY "Service role can read send log" ON public.email_send_log;
DROP POLICY "Service role can update send log" ON public.email_send_log;

-- Recreate them scoped directly TO service_role
CREATE POLICY "Service role can insert send log"
ON public.email_send_log FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can read send log"
ON public.email_send_log FOR SELECT TO service_role
USING (true);

CREATE POLICY "Service role can update send log"
ON public.email_send_log FOR UPDATE TO service_role
USING (true)
WITH CHECK (true);