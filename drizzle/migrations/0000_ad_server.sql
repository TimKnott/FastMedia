CREATE TABLE public.ad_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  width int, height int,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'direct', -- direct | network | house
  target_domains text NOT NULL DEFAULT 'all',
  priority int NOT NULL DEFAULT 0,
  starts_at timestamptz, ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  zone_id uuid NOT NULL REFERENCES public.ad_zones(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'image', -- image | html
  image_url text, click_url text, alt_text text, html text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.ad_events (
  id bigserial PRIMARY KEY,
  creative_id uuid REFERENCES public.ad_creatives(id) ON DELETE SET NULL,
  zone_slug text, domain text, event text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ad_events_created_idx ON public.ad_events(created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_zones, public.ad_campaigns, public.ad_creatives TO authenticated;
GRANT SELECT, DELETE ON public.ad_events TO authenticated;
GRANT ALL ON public.ad_zones, public.ad_campaigns, public.ad_creatives, public.ad_events TO service_role;
GRANT USAGE ON SEQUENCE public.ad_events_id_seq TO service_role;

ALTER TABLE public.ad_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage zones" ON public.ad_zones FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage campaigns" ON public.ad_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage creatives" ON public.ad_creatives FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins read events" ON public.ad_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete events" ON public.ad_events FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER ad_campaigns_updated BEFORE UPDATE ON public.ad_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public serving: returns only the fields needed to render one ad
CREATE OR REPLACE FUNCTION public.serve_ad(_zone text, _domain text)
RETURNS TABLE(creative_id uuid, type text, image_url text, click_url text, alt_text text, html text, width int, height int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, c.type, c.image_url, c.click_url, c.alt_text, c.html, z.width, z.height
  FROM ad_creatives c
  JOIN ad_zones z ON z.id = c.zone_id AND z.active AND z.slug = left(_zone, 64)
  JOIN ad_campaigns k ON k.id = c.campaign_id AND k.active
  WHERE c.active
    AND (k.starts_at IS NULL OR k.starts_at <= now())
    AND (k.ends_at IS NULL OR k.ends_at > now())
    AND (k.target_domains = 'all' OR lower(left(_domain,255)) = ANY(string_to_array(replace(lower(k.target_domains),' ',''), ',')))
  ORDER BY CASE k.kind WHEN 'direct' THEN 0 WHEN 'network' THEN 1 ELSE 2 END, k.priority DESC, random()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.log_ad_event(_creative uuid, _zone text, _domain text, _event text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _event NOT IN ('impression','click') THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM ad_creatives WHERE id = _creative) THEN RETURN; END IF;
  INSERT INTO ad_events(creative_id, zone_slug, domain, event)
  VALUES (_creative, left(_zone,64), lower(left(_domain,255)), _event);
END $$;

REVOKE ALL ON FUNCTION public.serve_ad(text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_ad_event(uuid,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.serve_ad(text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_ad_event(uuid,text,text,text) TO anon, authenticated;