import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Loader2, Mail, PlusCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Req = Tables<'module_requests'>;
type Msg = { role: string; content: string };
const STATUS: Record<string, string> = { new: 'New', quoted: 'Quoted', converted: 'Made into a module', declined: 'Declined' };
const fmt = (n: number | null) => (n ?? 0).toLocaleString('cs-CZ');

const AdminModuleRequests = () => {
  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('module_requests').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setItems(data ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<Req>) => {
    const { error } = await supabase.from('module_requests').update(patch).eq('id', id);
    if (error) return toast.error(error.message);
    setItems(xs => xs.map(x => x.id === id ? { ...x, ...patch } : x));
  };

  const convert = async (r: Req) => {
    const id = `custom-${Date.now().toString(36)}`;
    const title = (r.summary ?? 'New module').split(/[.\n]/)[0].slice(0, 60);
    const { error } = await supabase.from('calculator_modules').insert({
      id, icon: '🧩', name_en: title, desc_en: r.summary ?? '', one_time_price: r.suggested_max ?? 0,
      category: 'advanced', active: false, sort_order: 999,
    });
    if (error) return toast.error(error.message);
    await update(r.id, { status: 'converted', converted_module_id: id });
    toast.success('Draft module created. Check the name and price in Calculator modules, then switch it to Live.');
  };

  const mailto = (r: Req) => {
    const body = `Hello${r.contact_name ? ' ' + r.contact_name : ''},\n\nThank you for your idea:\n\n${r.summary ?? ''}\n\nOur price for this: [PRICE] CZK one-off.\n\nKind regards,\nTim Knott\nFastMedia.Pro`;
    return `mailto:${r.contact_email ?? ''}?subject=${encodeURIComponent('Your website idea — quote from FastMedia.Pro')}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Lightbulb className="w-6 h-6" /> Module requests</h1>
        <p className="text-sm text-muted-foreground">Ideas visitors described in the calculator that are not in the module list yet.</p>
      </div>
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : !items.length ? (
        <p className="text-sm text-muted-foreground">No requests yet.</p>
      ) : items.map(r => (
        <Card key={r.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex flex-wrap items-center gap-2">
              <Badge variant={r.status === 'new' ? 'default' : 'secondary'}>{STATUS[r.status] ?? r.status}</Badge>
              <span>{r.trade || 'Unknown trade'}</span>
              <span className="text-xs text-muted-foreground font-normal">{new Date(r.created_at).toLocaleString('en-GB')}</span>
              {(r.suggested_max ?? 0) > 0 && <Badge variant="outline">AI guess {fmt(r.suggested_min)}–{fmt(r.suggested_max)} Kč</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="whitespace-pre-wrap">{r.summary}</p>
            <p className="text-muted-foreground">Contact: {r.contact_name || '—'} {r.contact_email ? `· ${r.contact_email}` : '· no email (check the matching lead)'}</p>
            {r.covered_by.length > 0 && <p className="text-muted-foreground">Partly covered by: {r.covered_by.join(', ')}</p>}
            <details>
              <summary className="cursor-pointer text-muted-foreground">Conversation</summary>
              <div className="mt-2 space-y-1">
                {(r.conversation as Msg[]).map((m, i) => <p key={i}><strong>{m.role === 'visitor' ? 'Visitor' : 'Assistant'}:</strong> {m.content}</p>)}
              </div>
            </details>
            <Textarea placeholder="Your notes" value={notes[r.id] ?? r.admin_notes ?? ''} onChange={e => setNotes(n => ({ ...n, [r.id]: e.target.value }))}
              onBlur={() => notes[r.id] !== undefined && update(r.id, { admin_notes: notes[r.id] })} rows={2} />
            <div className="flex flex-wrap gap-2">
              {r.contact_email && <Button size="sm" asChild onClick={() => update(r.id, { status: 'quoted' })}><a href={mailto(r)}><Mail className="w-4 h-4 mr-2" /> Email a quote</a></Button>}
              <Button size="sm" variant="outline" onClick={() => convert(r)} disabled={r.status === 'converted'}><PlusCircle className="w-4 h-4 mr-2" /> Turn into a module</Button>
              <Button size="sm" variant="ghost" onClick={() => update(r.id, { status: 'declined' })}><X className="w-4 h-4 mr-2" /> Decline</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminModuleRequests;
