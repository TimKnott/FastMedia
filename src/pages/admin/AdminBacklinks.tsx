import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, ExternalLink, Link2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Opp = {
  id: string; sort_order: number; site_name: string; site_url: string; submit_url: string | null;
  category: string; target_url: string; title_cs: string | null; title_en: string | null;
  short_cs: string | null; short_en: string | null; long_cs: string | null; long_en: string | null;
  notes: string | null; status: string; live_url: string | null; live_at: string | null;
  link_ok: boolean | null; is_own_site: boolean;
  last_check_at: string | null; last_check_result: string | null;
};

const STATUS: Record<string, { label: string; variant: "secondary" | "outline" | "default" | "destructive" }> = {
  todo: { label: "To do", variant: "outline" },
  submitted: { label: "Submitted", variant: "secondary" },
  live: { label: "Live", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};
const db = supabase as any;

export default function AdminBacklinks() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<Opp | null>(null);
  const [checking, setChecking] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ["backlink_opps"],
    queryFn: async () => {
      const { data, error } = await db.from("backlink_opportunities").select("*").order("sort_order");
      if (error) throw error;
      return data as Opp[];
    },
  });
  const counts = useMemo(() => {
    const c: Record<string, number> = { todo: 0, submitted: 0, live: 0, rejected: 0 };
    data.forEach((o) => (c[o.status] = (c[o.status] ?? 0) + 1));
    return c;
  }, [data]);
  const own = data.filter((o) => o.is_own_site);
  const listings = data.filter((o) => !o.is_own_site && o.live_url && o.last_check_at);
  const lost = data.filter((o) => o.status === "live" && o.link_ok === false);
  const [checkingAll, setCheckingAll] = useState(false);
  const checkAll = async () => {
    setCheckingAll(true);
    const { data: r, error } = await supabase.functions.invoke("backlink-check", { body: { all: true } });
    setCheckingAll(false);
    if (error || r?.error) return toast.error(r?.error ?? error?.message);
    toast.success(`Checked ${r.checked} pages — ${r.linking} link to fastmedia.pro`);
    qc.invalidateQueries({ queryKey: ["backlink_opps"] });
  };
  const weeks = useMemo(() => {
    const monday = (d: Date) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - day); return x; };
    const start = monday(new Date());
    return Array.from({ length: 8 }, (_, i) => {
      const from = new Date(start); from.setDate(from.getDate() - (7 - i) * 7);
      const to = new Date(from); to.setDate(to.getDate() + 7);
      const inWeek = (s: string | null | undefined) => !!s && new Date(s) >= from && new Date(s) < to;
      return {
        label: from.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        submitted: data.filter((o) => inWeek((o as any).submitted_at)).length,
        live: data.filter((o) => inWeek(o.live_at)).length,
      };
    });
  }, [data]);
  const weekMax = Math.max(1, ...weeks.map((w) => Math.max(w.submitted, w.live)));
  const rows = filter === "all" ? data : data.filter((o) => o.status === filter);

  const save = async (patch: Partial<Opp>) => {
    if (!open) return;
    const extra: Record<string, unknown> = {};
    if (patch.status === "submitted" && open.status !== "submitted") extra.submitted_at = new Date().toISOString();
    if (patch.status === "live" && open.status !== "live") extra.live_at = new Date().toISOString();
    const { error } = await db.from("backlink_opportunities").update({ ...patch, ...extra }).eq("id", open.id);
    if (error) return toast.error(error.message);
    setOpen({ ...open, ...patch } as Opp);
    qc.invalidateQueries({ queryKey: ["backlink_opps"] });
    toast.success("Saved");
  };

  const check = async () => {
    if (!open) return;
    setChecking(true);
    const { data: r, error } = await supabase.functions.invoke("backlink-check", { body: { id: open.id } });
    setChecking(false);
    if (error || r?.error) return toast.error(r?.error ?? error?.message);
    toast[r.found ? "success" : "warning"](r.result);
    qc.invalidateQueries({ queryKey: ["backlink_opps"] });
    setOpen({ ...open, last_check_result: r.result, status: r.found ? "live" : open.status });
  };

  const copy = (t?: string | null) => { if (t) { navigator.clipboard.writeText(t); toast.success("Copied"); } };

  const Field = ({ label, k, rows = 2 }: { label: string; k: keyof Opp; rows?: number }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Button size="sm" variant="ghost" onClick={() => copy(open?.[k] as string)}><Copy className="h-3 w-3 mr-1" />Copy</Button>
      </div>
      <Textarea rows={rows} value={(open?.[k] as string) ?? ""} onChange={(e) => setOpen({ ...open!, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Link2 className="h-6 w-6" />Backlink builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          50 real places to list FastMedia.Pro, with Czech and English texts to review, edit and paste. Post each one yourself, then paste the page address and click "Check link".
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Link health (checked automatically every Monday 08:00 Prague)</div>
            <div className="flex flex-wrap gap-6 mt-1">
              <div><span className="text-2xl font-bold">{own.filter((o) => o.link_ok).length}</span><span className="text-sm text-muted-foreground"> of {own.length} of your sites link back</span></div>
              <div><span className="text-2xl font-bold">{listings.filter((o) => o.link_ok).length}</span><span className="text-sm text-muted-foreground"> of {listings.length} checked listings link back</span></div>
              {lost.length > 0 && <div className="text-destructive text-sm self-end">{lost.length} live listing{lost.length > 1 ? "s" : ""} lost the link</div>}
            </div>
          </div>
          <Button size="sm" variant="outline" disabled={checkingAll} onClick={checkAll}>
            {checkingAll && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Check all now
          </Button>
        </div>
        {own.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {own.map((o) => (
              <button key={o.id} onClick={() => setOpen(o)} className="text-left rounded-md border border-border p-2 hover:bg-muted/50">
                <div className="text-sm font-medium flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${o.link_ok ? "bg-primary" : o.last_check_at ? "bg-destructive" : "bg-muted-foreground"}`} />{o.site_name}
                </div>
                <div className="text-xs text-muted-foreground truncate">{o.last_check_result ?? "Not checked yet"}</div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Live backlinks</div>
            <div className="text-3xl font-bold">{counts.live ?? 0} <span className="text-base font-normal text-muted-foreground">of {data.length || 50}</span></div>
          </div>
          <div className="text-sm text-muted-foreground">{Math.round(((counts.live ?? 0) / (data.length || 50)) * 100)}% done</div>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${((counts.live ?? 0) / (data.length || 50)) * 100}%` }} />
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Weekly progress (last 8 weeks) · submitted / went live</div>
          <div className="grid grid-cols-8 gap-2 items-end h-28">
            {weeks.map((w) => (
              <div key={w.label} className="flex flex-col items-center gap-1 h-full justify-end">
                <div className="flex gap-0.5 items-end h-20 w-full justify-center">
                  <div className="w-1/3 bg-secondary rounded-t" style={{ height: `${(w.submitted / weekMax) * 100}%` }} title={`${w.submitted} submitted`} />
                  <div className="w-1/3 bg-primary rounded-t" style={{ height: `${(w.live / weekMax) * 100}%` }} title={`${w.live} live`} />
                </div>
                <div className="text-[10px] text-muted-foreground">{w.submitted}/{w.live}</div>
                <div className="text-[10px] text-muted-foreground">{w.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Target pace: 5 submissions a week finishes all 50 in about 10 weeks.</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(STATUS).map(([k, s]) => (
          <Card key={k} className={`p-4 cursor-pointer ${filter === k ? "ring-2 ring-primary" : ""}`} onClick={() => setFilter(filter === k ? "all" : k)}>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-bold">{counts[k] ?? 0}</div>
          </Card>
        ))}
      </div>

      <Card className="divide-y divide-border">
        {isLoading && <div className="p-6 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>}
        {rows.map((o) => (
          <button key={o.id} onClick={() => setOpen(o)} className="w-full text-left p-3 hover:bg-muted/50 flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-6">{o.sort_order}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{o.site_name}</div>
              <div className="text-xs text-muted-foreground truncate">{o.category} · {o.title_cs}</div>
            </div>
            {o.status === "live" && <CheckCircle2 className="h-4 w-4 text-primary" />}
            <Badge variant={STATUS[o.status]?.variant}>{STATUS[o.status]?.label}</Badge>
          </button>
        ))}
      </Card>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader><DialogTitle>{open.site_name}</DialogTitle></DialogHeader>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline">{open.category}</Badge>
                <a href={open.submit_url ?? open.site_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">
                  Open site to submit <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {open.notes && <p className="text-sm text-muted-foreground">{open.notes}</p>}
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Link to use</span>
                <div className="flex gap-2"><Input readOnly value={open.target_url} /><Button variant="outline" onClick={() => copy(open.target_url)}><Copy className="h-4 w-4" /></Button></div>
              </div>
              <Tabs defaultValue="cs">
                <TabsList><TabsTrigger value="cs">Čeština</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                <TabsContent value="cs" className="space-y-3">
                  <Field label="Title" k="title_cs" rows={1} /><Field label="Short description" k="short_cs" /><Field label="Long description" k="long_cs" rows={6} />
                </TabsContent>
                <TabsContent value="en" className="space-y-3">
                  <Field label="Title" k="title_en" rows={1} /><Field label="Short description" k="short_en" /><Field label="Long description" k="long_en" rows={6} />
                </TabsContent>
              </Tabs>
              <Button variant="outline" onClick={() => save({ title_cs: open.title_cs, short_cs: open.short_cs, long_cs: open.long_cs, title_en: open.title_en, short_en: open.short_en, long_en: open.long_en })}>Save text changes</Button>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm">Status</span>
                  <Select value={open.status} onValueChange={(v) => save({ status: v })}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(STATUS).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Page address where your listing appears</span>
                  <div className="flex gap-2">
                    <Input value={open.live_url ?? ""} placeholder="https://..." onChange={(e) => setOpen({ ...open, live_url: e.target.value })} />
                    <Button variant="outline" onClick={() => save({ live_url: open.live_url })}>Save</Button>
                    <Button onClick={check} disabled={checking || !open.live_url}>{checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check link"}</Button>
                  </div>
                  {open.last_check_result && <p className="text-xs text-muted-foreground">Last check: {open.last_check_result}</p>}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
