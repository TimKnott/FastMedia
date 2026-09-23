UPDATE public.outreach_settings
SET getsales_enabled = true,
    getsales_base_url = COALESCE(NULLIF(getsales_base_url, ''), 'https://amazing.getsales.io'),
    getsales_list_id = COALESCE(NULLIF(getsales_list_id, ''), '3cd4ffcc-c1f1-4adc-a558-fcea19e0de44')
WHERE id = 1;