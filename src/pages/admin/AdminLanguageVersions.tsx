import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Languages, Loader2, Check, X, Globe, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const LANGS: [string, string][] = [
  ['bg', 'Bulgarian'], ['hr', 'Croatian'], ['cs', 'Czech'], ['da', 'Danish'], ['nl', 'Dutch'], ['en', 'English'], ['et', 'Estonian'], ['fi', 'Finnish'],
  ['fr', 'French'], ['de', 'German'], ['el', 'Greek'], ['hu', 'Hungarian'], ['ga', 'Irish'], ['it', 'Italian'], ['lv', 'Latvian'], ['lt', 'Lithuanian'],
  ['mt', 'Maltese'], ['pl', 'Polish'], ['pt', 'Portuguese'], ['ro', 'Romanian'], ['sk', 'Slovak'], ['sl', 'Slovenian'], ['es', 'Spanish'], ['sv', 'Swedish'],
];
const PAGES = ['/', '/eu-creative-grant', '/grant-business-plan', '/eu-language-websites', '/grant-eligibility', '/offer', '/courses', '/contact', '/case-studies'];

type Version = {
  id: string; language_code: string; language_name: string; source_path: string; slug: string; title: string;
  meta_description: string; status: string; reviewer_notes: string | null; updated_at: string;
  content: { h1?: string; intro?: string; sections?: { heading: string; paragraphs: string[]; bullets: string[] }[]; cta_label?: string; review_notes?: string[] };
};

const badge = (s: string) => {
  const m: Record<string, string> = { draft: 'bg-muted text-muted-foreground', approved: 'bg-primary/15 text-primary', published: 'bg-accent/15 text-accent', rejected: 'bg-destructive/15 text-destructive' };
  return <Badge className={m[s] ?? ''}>{s}</Badge>;
};

export default function AdminLanguageVersions() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [lang, setLang] = useState('de');
  const [path, setPath] = useState('/eu-creative-grant');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<Version | null>(null);
  const [notes, setNotes] = useState('');

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['language_versions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('language_versions' as never).select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Version[];
    },
  });

  const generate = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('language-version', { body: { language_code: lang, source_path: path } });
      if (error || data?.error) {
        let msg = data?.error ?? error?.message;
        try { msg = (await (error as any)?.context?.json())?.error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      toast({ title: 'Draft created', description: `${data.version.language_name} version of ${path} is ready for review.` });
      qc.invalidateQueries({ queryKey: ['language_versions'] });
      setView(data.version); setNotes('');
    } catch (e) {
      toast({ title: 'Could not create the version', description: (e as Error).message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  const setStatus = async (v: Version, status: string) => {
    const { data: u } = await supabase.auth.getUser();
    const patch: Record<string, unknown> = { status, reviewer_notes: notes || v.reviewer_notes };
    if (status === 'approved') { patch.approved_at = new Date().toISOString(); patch.approved_by = u.user?.id; }
    if (status === 'published') patch.published_at = new Date().toISOString();
    const { error } = await supabase.from('language_versions' as never).update(patch as never).eq('id', v.id);
    if (error) return toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    toast({ title: `Marked ${status}` });
    qc.invalidateQueries({ queryKey: ['language_versions'] });
    setView(null);
  };
  const remove = async (v: Version) => {
    await supabase.from('language_versions' as never).delete().eq('id', v.id);
    qc.invalidateQueries({ queryKey: ['language_versions'] });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><Languages className="h-6 w-6 text-accent" /> Language versions</h1>
        <p className="text-muted-foreground">Build a page in any of the 24 EU languages from its English content. Each one is written for its market, saved as a draft, and only goes live after you approve and publish it.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Create a new version</CardTitle><CardDescription>Takes about a minute per page.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2"><Label>Language</Label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LANGS.map(([c, n]) => <SelectItem key={c} value={c}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>English page</Label>
            <Input list="lv-pages" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/eu-creative-grant" />
            <datalist id="lv-pages">{PAGES.map((p) => <option key={p} value={p} />)}</datalist>
          </div>
          <Button onClick={generate} disabled={busy}>{busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Writing…</> : 'Create draft'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All versions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && versions.length === 0 && <p className="text-muted-foreground">No language versions yet.</p>}
          {versions.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3">
              <span className="font-medium">{v.language_name}</span>
              <span className="text-sm text-muted-foreground">{v.source_path}</span>
              {badge(v.status)}
              <span className="flex-1 truncate text-sm">{v.title}</span>
              <Button size="sm" variant="outline" onClick={() => { setView(v); setNotes(v.reviewer_notes ?? ''); }}><Eye className="mr-1 h-4 w-4" />Review</Button>
              {v.status === 'published' && <Button size="sm" variant="ghost" asChild><a href={`/l/${v.language_code}/${v.slug}`} target="_blank" rel="noreferrer"><Globe className="h-4 w-4" /></a></Button>}
              <Button size="sm" variant="ghost" onClick={() => remove(v)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          {view && (<>
            <DialogHeader><DialogTitle>{view.language_name} · {view.source_path} {badge(view.status)}</DialogTitle></DialogHeader>
            {!!view.content.review_notes?.length && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                <p className="mb-1 font-semibold">Check before publishing</p>
                <ul className="list-disc pl-5">{view.content.review_notes.map((n) => <li key={n}>{n}</li>)}</ul>
              </div>
            )}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Title: {view.title}<br />Description: {view.meta_description}</p>
              <h2 className="font-display text-xl font-bold">{view.content.h1}</h2>
              <p>{view.content.intro}</p>
              {view.content.sections?.map((s) => (
                <div key={s.heading}><h3 className="font-semibold">{s.heading}</h3>
                  {s.paragraphs.map((p) => <p key={p} className="text-sm">{p}</p>)}
                  {!!s.bullets.length && <ul className="list-disc pl-5 text-sm">{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
                </div>
              ))}
            </div>
            <div className="space-y-2"><Label>Reviewer notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div className="flex flex-wrap gap-2">
              {view.status !== 'approved' && view.status !== 'published' && <Button onClick={() => setStatus(view, 'approved')}><Check className="mr-1 h-4 w-4" />Approve</Button>}
              {view.status === 'approved' && <Button onClick={() => setStatus(view, 'published')}><Globe className="mr-1 h-4 w-4" />Publish</Button>}
              {view.status === 'published' && <Button variant="outline" onClick={() => setStatus(view, 'draft')}>Unpublish</Button>}
              <Button variant="outline" onClick={() => setStatus(view, 'rejected')}><X className="mr-1 h-4 w-4" />Reject</Button>
            </div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
