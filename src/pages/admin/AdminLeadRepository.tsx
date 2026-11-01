import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Database, Download, ShieldCheck, Search, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { parseRepositoryCsv, reviewFields, sourceRecords, type ImportKind, type RepositoryLead, type RepositoryEmail } from '@/lib/leadRepository';
import { repositoryText } from '@/lib/leadRepositoryCopy';

interface EmailRecord extends RepositoryEmail { globally_suppressed?: boolean }
interface LeadRecord extends RepositoryLead { emails: EmailRecord[] }
interface ListResult { total: number; rows: LeadRecord[] }
interface ImportResult { imported_or_provenance_updated: number; skipped: number; errors: { row: number; reason: string }[] }

export default function AdminLeadRepository() {
  const { language } = useLanguage();
  const text = (key: string) => repositoryText(language, key);
  const client = useQueryClient();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [debounced, setDebounced] = useState(filters);
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<LeadRecord | null>(null);
  const [emailId, setEmailId] = useState('');
  const [review, setReview] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<ImportKind>('leads');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState<Record<string, string | boolean>>({});
  const [campaignId, setCampaignId] = useState('');
  const [objectionEmail, setObjectionEmail] = useState('');
  const [objectionReason, setObjectionReason] = useState('');
  useEffect(() => { const timer = setTimeout(() => { setDebounced(filters); setPage(0); }, 250); return () => clearTimeout(timer); }, [filters]);
  const list = useQuery({ queryKey: ['lead-repository','list',debounced,page], queryFn: async () => {
    const { data, error } = await supabase.rpc('repository_list', { _filters: debounced, _page: page });
    if (error) throw error;
    return data as unknown as ListResult;
  }});
  const events = useQuery({ queryKey: ['lead-repository','events'], queryFn: async () => {
    const { data, error } = await supabase.from('lead_repository_events').select('*').order('created_at',{ascending:false}).limit(100);
    if (error) throw error; return data;
  }});
  const objections = useQuery({ queryKey: ['lead-repository','objections'], queryFn: async () => {
    const { data, error } = await supabase.from('lead_repository_objections').select('*').order('created_at',{ascending:false}).limit(100);
    if (error) throw error; return data;
  }});
  const campaigns = useQuery({ queryKey: ['lead-repository','campaigns'], queryFn: async () => {
    const { data, error } = await supabase.from('lead_repository_campaigns').select('*').order('created_at',{ascending:false}).limit(50);
    if (error) throw error; return data;
  }});
  const recipients = useQuery({ queryKey: ['lead-repository','recipients',campaignId], enabled: !!campaignId, queryFn: async () => {
    const { data, error } = await supabase.from('lead_repository_recipients').select('*').eq('campaign_id',campaignId);
    if (error) throw error; return data;
  }});
  const history = useQuery({ queryKey: ['lead-repository','reviews',emailId], enabled: !!emailId, queryFn: async () => {
    const { data, error } = await supabase.from('lead_repository_reviews').select('*').eq('email_id',emailId).order('created_at',{ascending:false});
    if (error) throw error; return data;
  }});
  const currentEmail = active?.emails.find(e => e.id === emailId);
  function chooseEmail(email: EmailRecord) {
    setEmailId(email.id);
    const value = email.review && typeof email.review === 'object' && !Array.isArray(email.review) ? email.review : {};
    setReview(Object.fromEntries(Object.entries(value).map(([k,v]) => [k,String(v ?? '')])));
    setObjectionEmail(email.email);
  }
  function openLead(lead: LeadRecord) { setActive(lead); if (lead.emails[0]) chooseEmail(lead.emails[0]); else { setEmailId(''); setReview({}); } }
  async function run(task: () => Promise<void>) {
    setBusy(true);
    try { await task(); await client.invalidateQueries({queryKey:['lead-repository']}); }
    catch (error) { toast.error(error instanceof Error ? error.message : String(error)); }
    finally { setBusy(false); }
  }
  async function importFile() {
    if (!file) return;
    await run(async () => {
      const rows = parseRepositoryCsv(await file.text());
      if (kind !== 'leads' && rows.some(r => !('email' in r) && !('email_address' in r))) throw new Error('Required column: email or email_address');
      const totals: ImportResult = {imported_or_provenance_updated:0,skipped:0,errors:[]};
      for (let start=0; start<rows.length; start+=500) {
        const { data, error } = await supabase.rpc('repository_import',{_kind:kind,_filename:file.name,_rows:rows.slice(start,start+500)});
        if (error) { setResult(totals); throw error; }
        const batch = data as unknown as ImportResult;
        totals.imported_or_provenance_updated += batch.imported_or_provenance_updated;
        totals.skipped += batch.skipped;
        totals.errors.push(...batch.errors.map(e=>({...e,row:e.row+start+1})));
        setResult({...totals});
      }
    });
  }
  async function suppress(kind: 'objection' | 'unsubscribe', address = objectionEmail) {
    if (!address) return;
    await run(async () => {
      const {error} = await supabase.rpc('repository_suppress',{_email:address,_kind:kind,_reason:objectionReason.trim() || `${kind} manually recorded by admin`});
      if(error) throw error;
      setActive(null); toast.success(text('saved'));
    });
  }
  const dropdown = (id: string, value: string, choices: string[], update: (value: string) => void, labels = true) => <div className="space-y-2"><Label htmlFor={id}>{text(id)}</Label><Select value={value || 'all'} onValueChange={v=>update(v==='all'?'':v)}><SelectTrigger id={id}><SelectValue /></SelectTrigger><SelectContent>{choices.map(c=><SelectItem key={c} value={c}>{labels ? text(c) : c}</SelectItem>)}</SelectContent></Select></div>;
  const updateFilter = (key:string,value:string) => setFilters(f=>({...f,[key]:value}));
  return <div className="space-y-6 max-w-7xl mx-auto">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><Database className="w-7 h-7 text-primary"/><h1 className="text-2xl font-heading font-bold">{text('title')}</h1></div><p className="text-muted-foreground mt-2">{text('subtitle')}</p></div><Badge variant="outline" className="gap-2"><ShieldCheck className="w-4 h-4"/>CRM / HOLD</Badge></header>
    <section className="border-l-4 border-primary bg-muted/40 p-4 space-y-2" aria-label={text('compliance')}><p className="font-semibold">{text('disabled')}</p><p className="text-sm text-muted-foreground leading-relaxed">{text('warning')}</p></section>
    <Tabs defaultValue="leads"><TabsList className="flex flex-wrap h-auto gap-1 justify-start">{['leads','import','campaigns','suppression','audit'].map(tab=><TabsTrigger key={tab} value={tab}>{text(tab)}</TabsTrigger>)}</TabsList>
      <TabsContent value="leads" className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{['search','company','industry','location'].map(key=><div key={key} className="space-y-2"><Label htmlFor={`filter-${key}`}>{text(key)}</Label><div className="relative">{key==='search'&&<Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground"/>}<Input id={`filter-${key}`} className={key==='search'?'pl-9':''} value={filters[key]??''} onChange={e=>updateFilter(key,e.target.value)}/></div></div>)}
          {dropdown('segment',filters.segment,['all','owner','founder'],v=>updateFilter('segment',v))}
          <div className="space-y-2"><Label htmlFor="validation">{text('validation')}</Label><Input id="validation" value={filters.validation??''} onChange={e=>updateFilter('validation',e.target.value)}/></div>
          {dropdown('compliance',filters.compliance,['all','UNASSESSED','REVIEWED','SUPPRESSED'],v=>updateFilter('compliance',v),false)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{list.data?.total??0} · {text('leads')} / {Object.keys(selection).length} · {text('selected')}</p><Button variant="outline" disabled={busy} onClick={()=>{if(!window.confirm(text('exportConfirm')))return; void run(async()=>{const {data,error}=await supabase.rpc('repository_export');if(error)throw error;const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='private-lead-repository.json';a.click();URL.revokeObjectURL(url);});}}><Download className="w-4 h-4 mr-2"/>{text('export')}</Button></div>
        {list.error && <p role="alert" className="text-destructive">{list.error.message}</p>}
        <div className="border rounded-md overflow-x-auto"><Table><TableHeader><TableRow>{['name','company','segment','industry','location','emails','status'].map(k=><TableHead key={k}>{text(k)}</TableHead>)}</TableRow></TableHeader><TableBody>
          {list.data?.rows.map(lead=><TableRow key={lead.id}><TableCell><Button variant="link" className="p-0 h-auto text-left whitespace-normal" onClick={()=>openLead(lead)}>{lead.person_name||lead.lead_key}</Button></TableCell><TableCell>{lead.company}</TableCell><TableCell>{lead.segment}</TableCell><TableCell>{lead.industry}</TableCell><TableCell>{lead.location}</TableCell><TableCell>{lead.emails.length}</TableCell><TableCell><Badge variant="secondary">HOLD</Badge></TableCell></TableRow>)}
          {!list.data?.rows.length && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">{list.isLoading?text('loading'):text('empty')}</TableCell></TableRow>}
        </TableBody></Table></div>
        <div className="flex items-center justify-end gap-3"><Button variant="outline" size="icon" aria-label={text('previous')} disabled={page===0} onClick={()=>setPage(p=>p-1)}><ChevronLeft className="w-4 h-4"/></Button><span>{page+1} / {Math.max(1,Math.ceil((list.data?.total??0)/25))}</span><Button variant="outline" size="icon" aria-label={text('next')} disabled={(page+1)*25 >= (list.data?.total??0)} onClick={()=>setPage(p=>p+1)}><ChevronRight className="w-4 h-4"/></Button></div>
      </TabsContent>
      <TabsContent value="import" className="space-y-5 max-w-3xl"><p className="text-sm text-muted-foreground leading-relaxed">{text('importInfo')}</p>
        {dropdown('kind',kind,['leads','emails','compliance_review'],v=>setKind(v as ImportKind),false)}
        <div className="space-y-2"><Label htmlFor="csv-file">{text('file')}</Label><Input id="csv-file" type="file" accept=".csv,text/csv" onChange={e=>{setFile(e.target.files?.[0]??null);setResult(null);}}/></div>
        <Button disabled={busy||!file} onClick={()=>void importFile()}><Upload className="w-4 h-4 mr-2"/>{busy?text('loading'):text('importAction')}</Button>
        {result&&<div role="status" className="bg-muted p-4 rounded-md space-y-3"><p>{result.imported_or_provenance_updated} imported / provenance updated · {result.skipped} skipped · {result.errors.length} errors</p>{result.errors.map((e,i)=><p key={i} className="text-sm text-destructive">CSV row {e.row}: {e.reason}</p>)}</div>}
      </TabsContent>
      <TabsContent value="campaigns" className="space-y-5"><div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="campaign-name">{text('campaignName')}</Label><Input id="campaign-name" value={campaignName} onChange={e=>setCampaignName(e.target.value)}/></div>
        {['subject','sender_identity','promoted_entity','optout_route'].map(k=><div key={k} className="space-y-2"><Label htmlFor={k}>{text(k)}</Label><Input id={k} value={String(message[k]??'')} onChange={e=>setMessage(m=>({...m,[k]:e.target.value}))}/></div>)}
        <div className="space-y-2 md:col-span-2"><Label htmlFor="draft-body">{text('body')}</Label><Textarea id="draft-body" rows={5} value={String(message.body??'')} onChange={e=>setMessage(m=>({...m,body:e.target.value}))}/></div>
        {['commercial_identification','optout_verified'].map(k=><Label key={k} className="flex items-center gap-3"><Checkbox checked={message[k]===true} onCheckedChange={v=>setMessage(m=>({...m,[k]:v===true}))}/>{text(k)}</Label>)}
      </div><p className="text-sm">{text('selected')}: {Object.values(selection).join(', ')||'0'}</p>
      <Button disabled={busy||!campaignName.trim()||!Object.keys(selection).length} onClick={()=>void run(async()=>{const {data,error}=await supabase.rpc('repository_dry_run',{_name:campaignName,_message:message,_email_ids:Object.keys(selection)});if(error)throw error;setCampaignId(data);})}>{text('preview')}</Button>
      <div className="flex flex-wrap gap-2">{campaigns.data?.map(c=><Button key={c.id} variant={c.id===campaignId?'secondary':'outline'} onClick={()=>setCampaignId(c.id)}>{c.name} · DRY RUN</Button>)}</div>
      {recipients.data?.map(r=><div key={r.id} className="border-b py-4"><p className="font-medium break-all">{r.email} · HOLD</p><ul className="text-sm text-muted-foreground list-disc pl-5 mt-2">{Array.isArray(r.decision)&&r.decision.map((reason,i)=><li key={i}>{text(String(reason))}</li>)}</ul></div>)}
      </TabsContent>
      <TabsContent value="suppression" className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="objection-email">Email</Label><Input id="objection-email" type="email" value={objectionEmail} onChange={e=>setObjectionEmail(e.target.value)}/></div><div className="space-y-2"><Label htmlFor="objection-reason">{text('reason')}</Label><Input id="objection-reason" value={objectionReason} onChange={e=>setObjectionReason(e.target.value)}/></div></div><div className="flex flex-wrap gap-3"><Button variant="destructive" disabled={busy||!objectionEmail} onClick={()=>void suppress('objection')}>{text('objection')}</Button><Button variant="outline" disabled={busy||!objectionEmail} onClick={()=>void suppress('unsubscribe')}>{text('unsubscribe')}</Button></div>
      {objections.error&&<p role="alert">{objections.error.message}</p>}{objections.data?.map(o=><div key={o.id} className="border-b py-3"><p className="break-all font-medium">{o.email}</p><p className="text-sm text-muted-foreground">{o.kind} · {o.created_at} · {o.reason}</p></div>)}
      </TabsContent>
      <TabsContent value="audit" className="space-y-3">{events.error&&<p role="alert">{events.error.message}</p>}{events.data?.map(e=><div key={e.id} className="border-b py-3"><p className="font-medium">{e.action}</p><p className="text-xs text-muted-foreground break-all">{e.created_at} · {e.actor_id}</p><pre className="text-xs whitespace-pre-wrap break-words mt-2">{JSON.stringify(e.details,null,2)}</pre></div>)}</TabsContent>
    </Tabs>
    <Sheet open={!!active} onOpenChange={open=>{if(!open)setActive(null);}}><SheetContent className="w-full sm:max-w-2xl overflow-y-auto"><SheetHeader><SheetTitle>{active?.person_name||active?.lead_key}</SheetTitle><SheetDescription>{active?.company} · HOLD</SheetDescription></SheetHeader>
      {active&&<div className="space-y-6 mt-6"><section><h2 className="font-semibold mb-3">{text('provenance')}</h2>{sourceRecords(active.source_rows).map((source,i)=><details key={i} className="border-b py-2"><summary className="cursor-pointer text-sm break-all">{source.file} · {source.kind}</summary><dl className="text-sm space-y-2 py-3">{Object.entries(source.row).map(([k,v])=><div key={k} className="grid grid-cols-2 gap-3"><dt className="text-muted-foreground break-all">{k}</dt><dd className="break-all">{String(v??'')}</dd></div>)}</dl></details>)}</section>
      <section className="space-y-3"><h2 className="font-semibold">{text('emails')}</h2>{active.emails.map(e=><div key={e.id} className="flex items-center gap-3"><Checkbox aria-label={`${text('selected')} ${e.email}`} checked={!!selection[e.id]} onCheckedChange={checked=>setSelection(s=>{const next={...s};if(checked)next[e.id]=e.email;else delete next[e.id];return next;})}/><Button variant={e.id===emailId?'secondary':'outline'} className="min-w-0 flex-1 h-auto py-2 whitespace-normal break-all" onClick={()=>chooseEmail(e)}>{e.email} · {e.validation_status||'—'} · {e.globally_suppressed?'SUPPRESSED':e.compliance_status}</Button></div>)}</section>
      {currentEmail&&<section className="space-y-4"><h2 className="font-semibold">{text('compliance')}</h2><p className="text-sm text-muted-foreground">{text('disabled')}</p>
        {sourceRecords(currentEmail.source_rows).map((source,i)=><details key={i}><summary className="cursor-pointer text-sm">{source.file} · {source.kind}</summary><pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(source.row,null,2)}</pre></details>)}
        {dropdown('lawful_basis',review.lawful_basis||'unassessed',['unassessed','consent','legitimate_interests','other'],v=>setReview(r=>({...r,lawful_basis:v})))}
        {dropdown('channel_permission',review.channel_permission||'unassessed',['unassessed','prior_consent','existing_customer_exception','other_national_permission'],v=>setReview(r=>({...r,channel_permission:v})))}
        {reviewFields.map(k=><div key={k} className="space-y-2"><Label htmlFor={`review-${k}`}>{text(k)}</Label><Textarea id={`review-${k}`} rows={2} value={review[k]??''} onChange={e=>setReview(r=>({...r,[k]:e.target.value}))}/></div>)}
        <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={()=>void run(async()=>{const {error}=await supabase.rpc('repository_review',{_email_id:emailId,_review:review as Json});if(error)throw error;toast.success(text('saved'));setActive(null);})}>{text('save')}</Button><Button variant="destructive" disabled={busy} onClick={()=>void suppress('objection',currentEmail.email)}>{text('objection')}</Button><Button variant="outline" disabled={busy} onClick={()=>void suppress('unsubscribe',currentEmail.email)}>{text('unsubscribe')}</Button></div>
        {history.data?.map(h=><details key={h.id} className="border-t pt-2"><summary className="text-xs cursor-pointer">{h.created_at} · {h.actor_id}</summary><pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(h.review,null,2)}</pre></details>)}
      </section>}</div>}
    </SheetContent></Sheet>
  </div>;
}