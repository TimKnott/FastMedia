import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

const db = supabase as any;
type Zone = { id: string; slug: string; name: string; width: number | null; height: number | null; active: boolean };
type Campaign = { id: string; name: string; kind: string; target_domains: string; priority: number; starts_at: string | null; ends_at: string | null; active: boolean };
type Creative = { id: string; campaign_id: string; zone_id: string; type: string; image_url: string | null; click_url: string | null; alt_text: string | null; html: string | null; active: boolean };
type Ev = { creative_id: string | null; zone_slug: string | null; domain: string | null; event: string };

const KIND_LABEL: Record<string, string> = { direct: "Direct sponsor", network: "Google AdSense / network", house: "FastMedia house ad" };

export default function AdminAds() {
  const qc = useQueryClient();
  const q = (key: string, table: string, order = "created_at") =>
    useQuery({ queryKey: ["ads", key], queryFn: async () => { const { data, error } = await db.from(table).select("*").order(order); if (error) throw error; return data; } });
  const zones = (q("zones", "ad_zones").data ?? []) as Zone[];
  const campaigns = (q("campaigns", "ad_campaigns").data ?? []) as Campaign[];
  const creatives = (q("creatives", "ad_creatives").data ?? []) as Creative[];
  const events = (useQuery({
    queryKey: ["ads", "events"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const { data, error } = await db.from("ad_events").select("creative_id,zone_slug,domain,event").gte("created_at", since).limit(50000);
      if (error) throw error; return data;
    },
  }).data ?? []) as Ev[];
  const refresh = () => qc.invalidateQueries({ queryKey: ["ads"] });

  const stats = useMemo(() => {
    const byDomain: Record<string, { i: number; c: number }> = {};
    let i = 0, c = 0;
    for (const e of events) {
      const d = e.domain || "unknown"; byDomain[d] ??= { i: 0, c: 0 };
      if (e.event === "impression") { i++; byDomain[d].i++; } else { c++; byDomain[d].c++; }
    }
    return { i, c, byDomain: Object.entries(byDomain).sort((a, b) => b[1].i - a[1].i) };
  }, [events]);
  const ctr = (i: number, c: number) => (i ? ((c / i) * 100).toFixed(2) + "%" : "–");

  const run = async (p: Promise<{ error: any }>, ok: string) => {
    const { error } = await p; if (error) return toast.error(error.message); toast.success(ok); refresh();
  };

  // New campaign form
  const [nc, setNc] = useState({ name: "", kind: "direct", target_domains: "all", priority: 0, starts_at: "", ends_at: "" });
  // New creative form
  const [cr, setCr] = useState({ campaign_id: "", zone_id: "", type: "image", image_url: "", click_url: "", alt_text: "", html: "" });

  const tag = (slug: string) => `<div data-fastmedia-ad="${slug}"></div>\n<script async src="https://www.fastmedia.pro/ad.js"></script>`;
  const copy = (t: string) => navigator.clipboard.writeText(t).then(() => toast.success("Copied"));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Ad server</h1>
        <p className="text-sm text-muted-foreground">Serve sponsor banners, Google AdSense code or FastMedia promos across all your websites. Order: direct sponsor → network → house ad.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4"><div className="text-sm text-muted-foreground">Impressions (30 days)</div><div className="text-2xl font-bold">{stats.i}</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Clicks (30 days)</div><div className="text-2xl font-bold">{stats.c}</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Click rate</div><div className="text-2xl font-bold">{ctr(stats.i, stats.c)}</div></Card>
      </div>

      <Tabs defaultValue="sites">
        <TabsList>
          <TabsTrigger value="sites">By website</TabsTrigger>
          <TabsTrigger value="zones">Ad slots & tags</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="creatives">Ads</TabsTrigger>
        </TabsList>

        <TabsContent value="sites">
          <Card className="p-4">
            {stats.byDomain.length === 0 ? <p className="text-sm text-muted-foreground">No ad views yet. Add an ad tag to one of your websites to start.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted-foreground"><th className="py-2">Website</th><th>Impressions</th><th>Clicks</th><th>Click rate</th></tr></thead>
                <tbody>{stats.byDomain.map(([d, v]) => <tr key={d} className="border-t border-border"><td className="py-2">{d}</td><td>{v.i}</td><td>{v.c}</td><td>{ctr(v.i, v.c)}</td></tr>)}</tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="space-y-3">
          {zones.map((z) => (
            <Card key={z.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div><span className="font-semibold">{z.name}</span> <span className="text-xs text-muted-foreground">{z.width}×{z.height}</span></div>
                <Switch checked={z.active} onCheckedChange={(v) => run(db.from("ad_zones").update({ active: v }).eq("id", z.id), "Saved")} aria-label={`Turn ${z.name} on or off`} />
              </div>
              <pre className="whitespace-pre-wrap rounded bg-muted p-2 text-xs">{tag(z.slug)}</pre>
              <Button size="sm" variant="outline" onClick={() => copy(tag(z.slug))}><Copy className="mr-1 h-3 w-3" />Copy tag</Button>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-3">
          <Card className="grid gap-2 p-4 sm:grid-cols-3">
            <Input placeholder="Campaign name" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} />
            <Select value={nc.kind} onValueChange={(v) => setNc({ ...nc, kind: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(KIND_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Websites: all, or plumber.myname.co.uk, ..." value={nc.target_domains} onChange={(e) => setNc({ ...nc, target_domains: e.target.value })} />
            <Input type="number" placeholder="Priority" value={nc.priority} onChange={(e) => setNc({ ...nc, priority: Number(e.target.value) })} />
            <Input type="date" aria-label="Start date" value={nc.starts_at} onChange={(e) => setNc({ ...nc, starts_at: e.target.value })} />
            <Input type="date" aria-label="End date" value={nc.ends_at} onChange={(e) => setNc({ ...nc, ends_at: e.target.value })} />
            <Button className="sm:col-span-3" disabled={!nc.name.trim()} onClick={() => run(db.from("ad_campaigns").insert({ ...nc, name: nc.name.trim(), starts_at: nc.starts_at || null, ends_at: nc.ends_at || null }), "Campaign added")}>Add campaign</Button>
          </Card>
          {campaigns.map((k) => (
            <Card key={k.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <div className="font-semibold">{k.name} <Badge variant="outline">{KIND_LABEL[k.kind] ?? k.kind}</Badge></div>
                <div className="text-xs text-muted-foreground">Websites: {k.target_domains} · priority {k.priority}{k.ends_at ? ` · ends ${k.ends_at.slice(0, 10)}` : ""}</div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={k.active} onCheckedChange={(v) => run(db.from("ad_campaigns").update({ active: v }).eq("id", k.id), "Saved")} aria-label="Active" />
                <Button size="icon" variant="ghost" aria-label="Delete campaign" onClick={() => confirm("Delete this campaign and its ads?") && run(db.from("ad_campaigns").delete().eq("id", k.id), "Deleted")}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="creatives" className="space-y-3">
          <Card className="grid gap-2 p-4 sm:grid-cols-3">
            <Select value={cr.campaign_id} onValueChange={(v) => setCr({ ...cr, campaign_id: v })}>
              <SelectTrigger><SelectValue placeholder="Campaign" /></SelectTrigger>
              <SelectContent>{campaigns.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={cr.zone_id} onValueChange={(v) => setCr({ ...cr, zone_id: v })}>
              <SelectTrigger><SelectValue placeholder="Ad slot" /></SelectTrigger>
              <SelectContent>{zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={cr.type} onValueChange={(v) => setCr({ ...cr, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="image">Banner image</SelectItem><SelectItem value="html">Code (AdSense etc.)</SelectItem></SelectContent>
            </Select>
            {cr.type === "image" ? (<>
              <Input placeholder="Image address (https://...)" value={cr.image_url} onChange={(e) => setCr({ ...cr, image_url: e.target.value })} />
              <Input placeholder="Link when clicked (https://...)" value={cr.click_url} onChange={(e) => setCr({ ...cr, click_url: e.target.value })} />
              <Input placeholder="Image description" value={cr.alt_text} onChange={(e) => setCr({ ...cr, alt_text: e.target.value })} />
            </>) : (
              <Textarea className="sm:col-span-3" rows={5} placeholder="Paste your Google AdSense or other ad code" value={cr.html} onChange={(e) => setCr({ ...cr, html: e.target.value })} />
            )}
            <Button className="sm:col-span-3" disabled={!cr.campaign_id || !cr.zone_id || (cr.type === "image" ? !/^https:\/\//.test(cr.image_url) : !cr.html.trim())}
              onClick={() => run(db.from("ad_creatives").insert(cr.type === "image"
                ? { campaign_id: cr.campaign_id, zone_id: cr.zone_id, type: "image", image_url: cr.image_url, click_url: cr.click_url || null, alt_text: cr.alt_text || null }
                : { campaign_id: cr.campaign_id, zone_id: cr.zone_id, type: "html", html: cr.html }), "Ad added")}>Add ad</Button>
          </Card>
          {creatives.map((c) => {
            const n = events.filter((e) => e.creative_id === c.id);
            const i = n.filter((e) => e.event === "impression").length, cl = n.length - i;
            return (
              <Card key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div className="text-sm">
                  <div className="font-semibold">{campaigns.find((k) => k.id === c.campaign_id)?.name} → {zones.find((z) => z.id === c.zone_id)?.name}</div>
                  <div className="text-xs text-muted-foreground">{c.type === "image" ? c.image_url : "Code ad"} · {i} views · {cl} clicks · {ctr(i, cl)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={c.active} onCheckedChange={(v) => run(db.from("ad_creatives").update({ active: v }).eq("id", c.id), "Saved")} aria-label="Active" />
                  <Button size="icon" variant="ghost" aria-label="Delete ad" onClick={() => confirm("Delete this ad?") && run(db.from("ad_creatives").delete().eq("id", c.id), "Deleted")}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
