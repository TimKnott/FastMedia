import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const STAGES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'docs_pending', label: 'Awaiting documents' },
  { value: 'application_ready', label: 'Application ready' },
  { value: 'submitted_dpmk', label: 'Submitted via DPMK' },
  { value: 'won', label: 'Grant approved' },
  { value: 'lost', label: 'Not proceeding' },
];

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  created_at: string;
  details: Record<string, string>;
}

interface Task {
  id: string;
  source_id: string | null;
  stage: string;
  notes: string | null;
  owner: string | null;
}

export default function AdminGrantFollowUp() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: enq }, { data: tk }] = await Promise.all([
      supabase
        .from('contact_enquiries')
        .select('id, name, email, phone, company, created_at, details')
        .eq('kind', 'offer')
        .order('created_at', { ascending: false }),
      supabase.from('tracker_items').select('id, source_id, stage, notes, owner').eq('source', 'grant-followup'),
    ]);
    const wizard = ((enq ?? []) as Enquiry[]).filter(e =>
      (e.details?.Source ?? '').toLowerCase().includes('grant-wizard') ||
      (e.details?.Source ?? '').toLowerCase().includes('creative voucher'),
    );
    setEnquiries(wizard);
    setTasks((tk ?? []) as Task[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const taskFor = (id: string) => tasks.find(t => t.source_id === id);

  const sync = async () => {
    setSyncing(true);
    const rows = enquiries
      .filter(e => !taskFor(e.id))
      .map(e => ({
        source: 'grant-followup',
        source_id: e.id,
        title: `Grant: ${e.details?.['Business name'] ?? e.company ?? e.name}`,
        contact_name: e.name,
        contact_email: e.email,
        contact_phone: e.phone,
        stage: 'new',
        value: Number(e.details?.['Project budget (CZK)'] ?? 0) || null,
        notes: null,
      }));
    if (rows.length) {
      const { error } = await supabase.from('tracker_items').insert(rows as never);
      if (error) toast.error('Could not create follow-up tasks.');
      else toast.success(`${rows.length} follow-up task${rows.length === 1 ? '' : 's'} created.`);
    } else {
      toast.info('Every wizard enquiry already has a task.');
    }
    await load();
    setSyncing(false);
  };

  const updateTask = async (id: string, patch: Partial<Task>) => {
    setSaving(id);
    const { error } = await supabase.from('tracker_items').update(patch as never).eq('id', id);
    if (error) toast.error('Could not save.');
    else setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
    setSaving(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enquiries.filter(e => {
      const task = taskFor(e.id);
      if (stageFilter !== 'all' && (task?.stage ?? 'none') !== stageFilter) return false;
      if (!q) return true;
      const d = e.details ?? {};
      return [e.name, e.email, e.company, d.Region, d['Regional hub'], d.Industry, d['Creative modules']]
        .filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [enquiries, tasks, search, stageFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of enquiries) {
      const s = taskFor(e.id)?.stage ?? 'none';
      map[s] = (map[s] ?? 0) + 1;
    }
    return map;
  }, [enquiries, tasks]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Grant follow-up</h1>
          <p className="text-sm text-muted-foreground">
            Every wizard enquiry becomes a tracked task with region, modules and budget — so no applicant is forgotten.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={sync} disabled={syncing || loading}>
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create missing tasks
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={stageFilter === 'all' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setStageFilter('all')}>
          All ({enquiries.length})
        </Badge>
        <Badge variant={stageFilter === 'none' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setStageFilter('none')}>
          No task ({counts['none'] ?? 0})
        </Badge>
        {STAGES.map(s => (
          <Badge key={s.value} variant={stageFilter === s.value ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setStageFilter(s.value)}>
            {s.label} ({counts[s.value] ?? 0})
          </Badge>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search name, email, region, hub…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No matching wizard enquiries.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => {
            const d = e.details ?? {};
            const task = taskFor(e.id);
            return (
              <Card key={e.id}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{d['Business name'] ?? e.company ?? e.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.name} · {e.email}{e.phone ? ` · ${e.phone}` : ''} · {new Date(e.created_at).toLocaleDateString('cs-CZ')}
                      </p>
                    </div>
                    <Badge variant="outline">{d['Readiness score'] ? `Readiness ${d['Readiness score']}/100` : 'No score'}</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                    <p><span className="text-muted-foreground">Region:</span> {d.Region ?? '—'}</p>
                    <p><span className="text-muted-foreground">Hub:</span> {d['Regional hub'] ?? '—'}</p>
                    <p><span className="text-muted-foreground">Budget:</span> {d['Project budget (CZK)'] ? `${Number(d['Project budget (CZK)']).toLocaleString('cs-CZ')} Kč` : '—'}</p>
                    <p><span className="text-muted-foreground">DPMK ref:</span> {d['DPMK reference'] ?? '—'}</p>
                    <p className="sm:col-span-2 lg:col-span-4"><span className="text-muted-foreground">Modules:</span> {d['Creative modules'] ?? '—'}</p>
                  </div>
                  {task ? (
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        value={task.stage}
                        disabled={saving === task.id}
                        onChange={ev => updateTask(task.id, { stage: ev.target.value })}
                      >
                        {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <Textarea
                        className="min-h-[36px] flex-1"
                        placeholder="Follow-up notes…"
                        defaultValue={task.notes ?? ''}
                        onBlur={ev => {
                          if ((ev.target.value || '') !== (task.notes ?? '')) updateTask(task.id, { notes: ev.target.value });
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      No follow-up task yet — press “Create missing tasks”. <ArrowRight className="w-3 h-3" />
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Full pipeline view: <Link className="underline" to="/admin/tracker">Project tracker</Link> · <Link className="underline" to="/admin/offer-leads">Offer enquiries inbox</Link>
      </p>
    </div>
  );
}
