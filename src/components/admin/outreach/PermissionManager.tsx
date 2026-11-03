import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { CONTACT_TYPES, EMAIL_ROUTES, previewDecision, toPermissionRow, type PermissionForm } from '@/lib/permissionManager';

type Row = Record<string, any>;
const TEXT = ['country', 'gdpr_lawful_basis', 'consent_at', 'consent_sender', 'consent_source', 'consent_scope', 'consent_revoked_at', 'customer_sale_ref', 'customer_collected_at', 'customer_sender', 'objection_at', 'country_assessment_ref'];
const BOOL = ['customer_similar_products', 'customer_optout_offered_at_collection'];
const label = (k: string) => k.replace(/_/g, ' ');

export function PermissionManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<PermissionForm>({ email: '', contact_type: 'unknown', email_route: 'none' });
  const [current, setCurrent] = useState<Row | null>(null);
  const [suppressed, setSuppressed] = useState(false);
  const [lookupFailed, setLookupFailed] = useState(false);
  const [audit, setAudit] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    let req = supabase.from('marketing_permissions').select('*').order('updated_at', { ascending: false }).limit(100);
    if (q.trim()) req = req.ilike('email', `%${q.trim()}%`);
    const { data, error } = await req;
    if (error) toast({ title: 'Could not load permissions', description: error.message, variant: 'destructive' });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const open = async (r: Row | null, email = '') => {
    setCurrent(r);
    setForm(r ? { ...r } : { email, contact_type: 'unknown', email_route: 'none' });
    const addr = String(r?.email ?? email).toLowerCase();
    if (!addr) { setAudit([]); setSuppressed(false); return; }
    const [sup, aud] = await Promise.all([
      supabase.from('suppressed_emails').select('id').ilike('email', addr).limit(1),
      supabase.from('marketing_permission_audit').select('*').eq('email', addr).order('created_at', { ascending: false }).limit(20),
    ]);
    setLookupFailed(!!sup.error || !!aud.error);
    setSuppressed((sup.data?.length ?? 0) > 0);
    setAudit(aud.data ?? []);
  };

  const save = async () => {
    const row = toPermissionRow(form);
    if (!row.email || !String(row.email).includes('@')) return toast({ title: 'Enter a valid email', variant: 'destructive' });
    setBusy(true);
    const { data, error } = await supabase.from('marketing_permissions').upsert(row as any, { onConflict: 'email' }).select().single();
    setBusy(false);
    if (error) return toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Saved — review cleared', description: 'Evidence changed, so a human review is required again.' });
    await load(); await open(data);
  };

  const review = async () => {
    if (!current) return;
    if (!confirm('Confirm you have personally reviewed the evidence for this address. Your account and the time will be recorded.')) return;
    setBusy(true);
    // The database trigger overwrites reviewer and time with the signed-in admin and now().
    const { data, error } = await supabase.from('marketing_permissions').update({ legal_review_at: new Date().toISOString() }).eq('id', current.id).select().single();
    setBusy(false);
    if (error) return toast({ title: 'Review failed', description: error.message, variant: 'destructive' });
    await load(); await open(data);
  };

  const decision = previewDecision(current ?? (form.email ? null : null), suppressed, lookupFailed);
  const set = (k: string, v: string | boolean | null) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader><CardTitle className="text-base">Marketing permissions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2"><Input placeholder="Search email" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} /><Button variant="outline" onClick={load}>Search</Button></div>
          <Button size="sm" variant="secondary" className="w-full" onClick={() => open(null, q.includes('@') ? q.trim() : '')}>New record</Button>
          <div className="max-h-[520px] overflow-auto divide-y divide-border">
            {rows.map((r) => (
              <button key={r.id} onClick={() => open(r)} className={`w-full text-left p-2 text-sm hover:bg-muted ${current?.id === r.id ? 'bg-muted' : ''}`}>
                <div className="font-medium truncate">{r.email}</div>
                <div className="text-xs text-muted-foreground">{r.country ?? '??'} · {label(r.contact_type)} · {r.email_route} · {r.legal_review_at ? 'reviewed' : 'not reviewed'}</div>
              </button>
            ))}
            {rows.length === 0 && <p className="text-sm text-muted-foreground p-2">No records.</p>}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">Public, scraped, purchased or enriched contact details are never consent. GDPR basis is recorded separately and does not permit email marketing on its own. Non-Czech recipients need a country-specific legal assessment. This is a product safeguard, not legal advice.</p>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2">Decision {decision.allowed ? <Badge>Eligible</Badge> : <Badge variant="destructive">Blocked</Badge>}</CardTitle></CardHeader>
          <CardContent>
            {!current && <p className="text-xs text-muted-foreground mb-1">Unsaved record — shown as the server would treat it today.</p>}
            <ul className="list-disc pl-5 text-sm space-y-1">{decision.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            {current && <p className="text-xs text-muted-foreground mt-2">Review: {current.legal_review_at ? `${new Date(current.legal_review_at).toLocaleString()} by ${current.legal_review_by}` : 'none'}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Evidence</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div><Label>Email</Label><Input value={String(form.email ?? '')} disabled={!!current} onChange={(e) => set('email', e.target.value)} /></div>
            <div><Label>Contact type</Label><select className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm" value={String(form.contact_type ?? 'unknown')} onChange={(e) => set('contact_type', e.target.value)}>{CONTACT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}</select></div>
            <div><Label>Email marketing route</Label><select className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm" value={String(form.email_route ?? 'none')} onChange={(e) => set('email_route', e.target.value)}>{EMAIL_ROUTES.map((t) => <option key={t} value={t}>{label(t)}</option>)}</select></div>
            {TEXT.map((k) => <div key={k}><Label className="capitalize">{label(k)}</Label><Input value={String(form[k] ?? '')} placeholder={k.endsWith('_at') ? 'YYYY-MM-DDTHH:MM' : ''} onChange={(e) => set(k, e.target.value)} /></div>)}
            {BOOL.map((k) => <label key={k} className="flex items-center gap-2 text-sm capitalize"><input type="checkbox" checked={form[k] === true} onChange={(e) => set(k, e.target.checked)} />{label(k)}</label>)}
            <div className="sm:col-span-2"><Label>Exact consent wording</Label><Textarea value={String(form.consent_text ?? '')} onChange={(e) => set('consent_text', e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? '')} onChange={(e) => set('notes', e.target.value)} /></div>
            <div className="sm:col-span-2 flex gap-2">
              <Button onClick={save} disabled={busy}>Save evidence</Button>
              <Button variant="outline" onClick={review} disabled={busy || !current || !!current.legal_review_at}>Mark reviewed by me</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Audit history</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-1 max-h-64 overflow-auto">
            {audit.length === 0 && <p className="text-muted-foreground">No history.</p>}
            {audit.map((a) => <div key={a.id} className="border-b border-border pb-1">{new Date(a.created_at).toLocaleString()} · {a.old_row ? 'updated' : 'created'} · by {a.actor ?? 'system'} · route {a.new_row?.email_route} · review {a.new_row?.legal_review_at ? 'yes' : 'no'}</div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
