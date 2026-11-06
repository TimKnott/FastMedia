import { csvCell } from '@/lib/csvSafe';
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
import { Loader2, Plus, RefreshCw, Trash2, Download, Mail, Phone, CheckCircle2 } from 'lucide-react';

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'dormant', label: 'Dormant' },
] as const;

const statusLabel = (v: string) => STATUSES.find((s) => s.value === v)?.label ?? v;

const statusClass = (v: string) => {
  switch (v) {
    case 'won':
      return 'bg-primary/15 text-primary border-primary/30';
    case 'lost':
      return 'bg-destructive/15 text-destructive border-destructive/30';
    case 'quoted':
      return 'bg-accent/15 text-accent border-accent/30';
    case 'dormant':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-secondary text-secondary-foreground border-border';
  }
};

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  trade: string | null;
  source: string;
  source_id: string | null;
  status: string;
  estimated_value: number | null;
  notes: string | null;
  first_enquiry_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
}

const emptyDraft = {
  name: '',
  email: '',
  phone: '',
  company: '',
  trade: '',
  status: 'active',
  estimated_value: '',
  notes: '',
};

const formatDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState({ ...emptyDraft });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Could not load your clients');
    else setClients((data ?? []) as Client[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Turn quote enquiries and calculator leads into client records
  const importEnquiries = async () => {
    setImporting(true);
    try {
      const [enq, leads] = await Promise.all([
        supabase
          .from('contact_enquiries')
          .select('id, name, email, phone, company, kind, message, created_at')
          .order('created_at', { ascending: false })
          .limit(300),
        supabase
          .from('leads')
          .select('id, name, email, phone, trade, quote_one_time, special_request, created_at')
          .order('created_at', { ascending: false })
          .limit(300),
      ]);

      const known = new Set(clients.map((c) => c.email.toLowerCase()));
      const rows: Record<string, unknown>[] = [];
      const seen = new Set<string>();

      const push = (row: Record<string, unknown>) => {
        const key = String(row.email ?? '').toLowerCase();
        if (!key || known.has(key) || seen.has(key)) return;
        seen.add(key);
        rows.push({ ...row, email: key });
      };

      for (const e of enq.data ?? []) {
        push({
          name: e.name,
          email: e.email,
          phone: e.phone,
          company: e.company,
          source: e.kind === 'quote' ? 'quote_request' : 'enquiry',
          source_id: e.id,
          status: 'active',
          notes: e.message ?? null,
          first_enquiry_at: e.created_at,
        });
      }

      for (const l of leads.data ?? []) {
        push({
          name: l.name,
          email: l.email,
          phone: l.phone,
          trade: l.trade,
          source: 'calculator',
          source_id: l.id,
          status: 'active',
          estimated_value: l.quote_one_time ?? null,
          notes: l.special_request ?? null,
          first_enquiry_at: l.created_at,
        });
      }

      if (rows.length === 0) {
        toast.info('Every enquiry already has a client record');
        return;
      }

      const { error } = await supabase
        .from('clients')
        .upsert(rows as never, { onConflict: 'email', ignoreDuplicates: true });
      if (error) throw error;
      toast.success(`Added ${rows.length} client${rows.length === 1 ? '' : 's'}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const addManual = async () => {
    if (!draft.name.trim() || !draft.email.trim()) {
      toast.error('Please add a name and an email address');
      return;
    }
    const { error } = await supabase.from('clients').insert({
      name: draft.name.trim(),
      email: draft.email.trim().toLowerCase(),
      phone: draft.phone || null,
      company: draft.company || null,
      trade: draft.trade || null,
      source: 'manual',
      status: draft.status,
      estimated_value: draft.estimated_value ? Number(draft.estimated_value) : null,
      notes: draft.notes || null,
      first_enquiry_at: new Date().toISOString(),
    });
    if (error) {
      toast.error(error.message.includes('clients_email_unique')
        ? 'There is already a client with that email address'
        : error.message);
      return;
    }
    toast.success('Client added');
    setDraft({ ...emptyDraft });
    setAddOpen(false);
    load();
  };

  const patch = async (id: string, changes: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)));
    const { data, error } = await supabase
      .from('clients')
      .update(changes as never)
      .eq('id', id)
      .select('id');
    if (error || !data || data.length === 0) {
      toast.error('Could not save that change');
      load();
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      toast.error('Could not remove that client');
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast.success('Client removed');
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      return [c.name, c.email, c.phone, c.company, c.trade, c.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [clients, search, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of clients) map[c.status] = (map[c.status] ?? 0) + 1;
    return map;
  }, [clients]);

  const exportCsv = () => {
    const header = ['Name', 'Email', 'Phone', 'Company', 'Trade', 'Source', 'Status', 'Value', 'First enquiry', 'Last contacted', 'Notes'];
    const escape = csvCell;
    const csv = [
      header.join(','),
      ...filtered.map((c) =>
        [c.name, c.email, c.phone, c.company, c.trade, c.source, statusLabel(c.status), c.estimated_value, c.first_enquiry_at, c.last_contacted_at, c.notes]
          .map(escape)
          .join(','),
      ),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Every quote enquiry as a client record, with contact details, status and your follow-up notes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={importEnquiries} disabled={importing}>
            {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Pull in new enquiries
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add a client</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Phone</Label>
                    <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Company</Label>
                    <Input value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Trade</Label>
                    <Input value={draft.trade} onChange={(e) => setDraft({ ...draft, trade: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Estimated value</Label>
                    <Input
                      type="number"
                      value={draft.estimated_value}
                      onChange={(e) => setDraft({ ...draft, estimated_value: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>Status</Label>
                  <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Notes</Label>
                  <Textarea rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addManual}>Save client</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">All clients</p>
            <p className="text-2xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>
        {STATUSES.map((s) => (
          <Card key={s.value}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{counts[s.value] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">{filtered.length} shown</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search name, email, notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No clients yet. Use “Pull in new enquiries” to create records from your quote requests.
            </p>
          ) : (
            filtered.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{c.name}</p>
                      <Badge variant="outline" className={statusClass(c.status)}>{statusLabel(c.status)}</Badge>
                      <Badge variant="outline" className="text-muted-foreground">{c.source.replace('_', ' ')}</Badge>
                      {c.trade && <Badge variant="outline" className="text-muted-foreground">{c.trade}</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                        <Mail className="h-3.5 w-3.5" /> {c.email}
                      </a>
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-foreground">
                          <Phone className="h-3.5 w-3.5" /> {c.phone}
                        </a>
                      )}
                      {c.company && <span>{c.company}</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      First enquiry {formatDate(c.first_enquiry_at ?? c.created_at)} · Last contacted {formatDate(c.last_contacted_at)}
                      {c.estimated_value ? ` · Est. ${c.estimated_value}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={c.status} onValueChange={(v) => patch(c.id, { status: v })}>
                      <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => patch(c.id, { last_contacted_at: new Date().toISOString() })}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Followed up
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  rows={2}
                  defaultValue={c.notes ?? ''}
                  placeholder="Follow-up notes…"
                  onBlur={(e) => {
                    if (e.target.value !== (c.notes ?? '')) patch(c.id, { notes: e.target.value || null });
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
