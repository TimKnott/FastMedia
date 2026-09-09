import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, RefreshCw, Trash2, Download } from 'lucide-react';

const STAGES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'waiting_on_client', label: 'Waiting on client' },
  { value: 'done', label: 'Done' },
] as const;

const stageLabel = (v: string) => STAGES.find((s) => s.value === v)?.label ?? v;

const stageClass = (v: string) => {
  switch (v) {
    case 'won':
    case 'done':
      return 'bg-primary/15 text-primary border-primary/30';
    case 'lost':
      return 'bg-destructive/15 text-destructive border-destructive/30';
    case 'waiting_on_client':
    case 'quoted':
      return 'bg-accent/15 text-accent border-accent/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

interface TrackerItem {
  id: string;
  source: string;
  source_id: string | null;
  title: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  stage: string;
  notes: string | null;
  owner: string | null;
  value: number | null;
  created_at: string;
}

const emptyDraft = {
  title: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  stage: 'new',
  notes: '',
  owner: '',
  value: '',
};

export default function AdminTracker() {
  const [items, setItems] = useState<TrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState({ ...emptyDraft });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tracker_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Could not load the tracker');
    else setItems((data ?? []) as TrackerItem[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Pull in enquiries and leads that are not tracked yet
  const importExisting = async () => {
    setImporting(true);
    try {
      const [enq, leads] = await Promise.all([
        supabase
          .from('contact_enquiries')
          .select('id, name, email, phone, kind, message, created_at')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('leads')
          .select('id, name, email, phone, trade, source, quote_one_time, special_request, created_at')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      const existing = new Set(
        items.filter((i) => i.source_id).map((i) => `${i.source}:${i.source_id}`),
      );

      const rows: Record<string, unknown>[] = [];

      for (const e of enq.data ?? []) {
        if (existing.has(`enquiry:${e.id}`)) continue;
        rows.push({
          source: 'enquiry',
          source_id: e.id,
          title: `${e.kind === 'quote' ? 'Quote request' : 'Enquiry'} — ${e.name}`,
          contact_name: e.name,
          contact_email: e.email,
          contact_phone: e.phone,
          stage: 'new',
          notes: e.message ?? null,
        });
      }

      for (const l of leads.data ?? []) {
        if (existing.has(`lead:${l.id}`)) continue;
        rows.push({
          source: 'lead',
          source_id: l.id,
          title: `Lead — ${l.name} (${l.trade})`,
          contact_name: l.name,
          contact_email: l.email,
          contact_phone: l.phone,
          stage: 'new',
          notes: l.special_request ?? null,
          value: l.quote_one_time ?? null,
        });
      }

      if (rows.length === 0) {
        toast.info('Everything is already in your tracker');
        return;
      }

      const { error } = await supabase
        .from('tracker_items')
        .upsert(rows as never, { onConflict: 'source,source_id', ignoreDuplicates: true });
      if (error) throw error;
      toast.success(`Added ${rows.length} item${rows.length === 1 ? '' : 's'}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const addManual = async () => {
    if (!draft.title.trim()) {
      toast.error('Please add a title');
      return;
    }
    const { error } = await supabase.from('tracker_items').insert({
      source: 'manual',
      title: draft.title.trim(),
      contact_name: draft.contact_name || null,
      contact_email: draft.contact_email || null,
      contact_phone: draft.contact_phone || null,
      stage: draft.stage,
      notes: draft.notes || null,
      owner: draft.owner || null,
      value: draft.value ? Number(draft.value) : null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Entry added');
    setDraft({ ...emptyDraft });
    setAddOpen(false);
    load();
  };

  const patch = async (id: string, changes: Partial<TrackerItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
    const { data, error } = await supabase
      .from('tracker_items')
      .update(changes as never)
      .eq('id', id)
      .select('id');
    if (error || !data || data.length === 0) {
      toast.error('Could not save that change');
      load();
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('tracker_items').delete().eq('id', id);
    if (error) {
      toast.error('Could not delete that entry');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Entry removed');
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (stageFilter !== 'all' && i.stage !== stageFilter) return false;
      if (sourceFilter !== 'all' && i.source !== sourceFilter) return false;
      if (!q) return true;
      return [i.title, i.contact_name, i.contact_email, i.notes, i.owner]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, search, stageFilter, sourceFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of items) map[i.stage] = (map[i.stage] ?? 0) + 1;
    return map;
  }, [items]);

  const exportCsv = () => {
    const header = ['Title', 'Source', 'Stage', 'Contact', 'Email', 'Phone', 'Owner', 'Value', 'Notes', 'Created'];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      header.join(','),
      ...filtered.map((i) =>
        [i.title, i.source, stageLabel(i.stage), i.contact_name, i.contact_email, i.contact_phone, i.owner, i.value, i.notes, new Date(i.created_at).toISOString()]
          .map(escape)
          .join(','),
      ),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Project Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Every enquiry, quote request and lead in one place, with a stage and your own notes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={importExisting} disabled={importing}>
            {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Pull in new items
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add a tracker entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Kitchen fitter website" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Contact name</Label>
                    <Input value={draft.contact_name} onChange={(e) => setDraft({ ...draft, contact_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={draft.contact_email} onChange={(e) => setDraft({ ...draft, contact_email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={draft.contact_phone} onChange={(e) => setDraft({ ...draft, contact_phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Owner</Label>
                    <Input value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} />
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
                  </div>
                  <div>
                    <Label>Stage</Label>
                    <Select value={draft.stage} onValueChange={(v) => setDraft({ ...draft, stage: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addManual}>Save entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAGES.slice(0, 4).map((s) => (
          <Card key={s.value}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{counts[s.value] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Entries ({filtered.length})</CardTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <Input
              className="max-w-xs"
              placeholder="Search name, email or notes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All stages" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All sources" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="enquiry">Enquiries</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
                <SelectItem value="manual">Added by hand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing here yet — use “Pull in new items” to bring across your enquiries and leads.
            </p>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{item.title}</span>
                      <Badge variant="outline" className="capitalize">{item.source === 'manual' ? 'added by hand' : item.source}</Badge>
                      <Badge variant="outline" className={stageClass(item.stage)}>{stageLabel(item.stage)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {[item.contact_name, item.contact_email, item.contact_phone].filter(Boolean).join(' · ') || 'No contact details'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Logged {new Date(item.created_at).toLocaleDateString('en-GB')}
                      {item.value ? ` · value ${item.value}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={item.stage} onValueChange={(v) => patch(item.id, { stage: v })}>
                      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => remove(item.id)} aria-label="Delete entry">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  rows={2}
                  defaultValue={item.notes ?? ''}
                  placeholder="Notes — what was agreed, next step, follow-up date…"
                  onBlur={(e) => {
                    const v = e.target.value;
                    if (v !== (item.notes ?? '')) patch(item.id, { notes: v || null });
                  }}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
