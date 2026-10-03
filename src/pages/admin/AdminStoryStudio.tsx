import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, ChevronLeft, ChevronRight, Copy, Download, ExternalLink, Loader2, PenLine, Trash2, Wand2, BookOpenText, Plus } from 'lucide-react';
import { toast } from 'sonner';

type QA = { q: string; a: string };
type Draft = {
  purpose: string; audience: string; angle: string; why_it_matters: string;
  pyramid: Record<'exposition' | 'rising_action' | 'climax' | 'falling_action' | 'resolution', string>;
  post: string; version_a: string; version_b: string; alternate_hooks: string[];
  image: { type: string; text: string; description: string; why: string; layout: string; alt: string; prompt: string };
  cta: string; quality: { name: string; score: number }[];
  warnings: string[]; claims_to_verify: string[]; anonymise: string[]; missing_questions: string[]; editing_notes: string[];
};
type Story = {
  id: string; episode: number | null; title: string; story_type: string; purpose: string | null; angle: string | null;
  suggested_hook: string | null; questions: QA[]; notes: string | null; draft: Draft | null; post: string | null;
  status: string; planned_date: string | null; posted_on: Record<string, string>; approved_at: string | null; created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  questions_needed: 'Questions needed', draft: 'Draft', needs_review: 'Needs review',
  approved: 'Approved', published: 'Published', idea: 'Idea', repurpose: 'Repurpose later',
};
const COUNTS = [1, 3, 5, 10, 20, 30];

const PLATFORMS: { id: string; label: string; url?: (text: string) => string }[] = [
  { id: 'linkedin', label: 'LinkedIn', url: (t) => `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(t)}` },
  { id: 'facebook', label: 'Facebook', url: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.fastmedia.pro')}` },
  { id: 'x', label: 'X', url: (t) => `https://x.com/intent/post?text=${encodeURIComponent(t.slice(0, 270))}` },
  { id: 'threads', label: 'Threads', url: (t) => `https://www.threads.net/intent/post?text=${encodeURIComponent(t.slice(0, 480))}` },
  { id: 'instagram', label: 'Instagram' },
];

const invoke = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('story-studio', { body });
  if (error) {
    let msg = error.message;
    try { const ctx = await (error as { context?: Response }).context?.json(); if (ctx?.error) msg = ctx.error; } catch { /* keep */ }
    throw new Error(msg);
  }
  if (!data?.ok) throw new Error(data?.error || 'Request failed');
  return data;
};

const cssColor = (name: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `hsl(${v})` : '';
};

const wrap = (ctx: CanvasRenderingContext2D, text: string, max: number) => {
  const out: string[] = []; let line = '';
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const n = line ? `${line} ${w}` : w;
    if (ctx.measureText(n).width > max && line) { out.push(line); line = w; } else line = n;
  }
  if (line) out.push(line);
  return out;
};

const TextCard = ({ text, slug }: { text: string; slug: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState('');
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const s = 1080; c.width = s; c.height = s;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = cssColor('--primary') || cssColor('--background'); ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = cssColor('--accent'); ctx.fillRect(90, 330, 130, 10);
    ctx.fillStyle = cssColor('--primary-foreground');
    ctx.font = `700 84px "Space Grotesk", "Inter", sans-serif`;
    let y = 460;
    for (const l of wrap(ctx, text, s - 180).slice(0, 5)) { ctx.fillText(l, 90, y); y += 100; }
    ctx.font = `600 34px "Inter", sans-serif`; ctx.globalAlpha = 0.75;
    ctx.fillText('Tim Knott · FastMedia.Pro', 90, s - 90); ctx.globalAlpha = 1;
    setSrc(c.toDataURL('image/png'));
  }, [text]);
  return (
    <div className="space-y-2">
      <canvas ref={ref} className="hidden" />
      {src && <img src={src} alt={text} className="w-full max-w-xs rounded-lg border border-border" />}
      <Button size="sm" variant="outline" disabled={!src} onClick={() => { const a = document.createElement('a'); a.href = src; a.download = `${slug}.png`; a.click(); }}>
        <Download className="w-3.5 h-3.5 mr-1" /> Download image (1080 × 1080)
      </Button>
    </div>
  );
};

const copy = async (t: string, label: string) => {
  try { await navigator.clipboard.writeText(t); toast.success(`${label} copied`); } catch { toast.error('Copy blocked — select and copy manually'); }
};

const AdminStoryStudio = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState('30');
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('linkedin_stories').select('*').order('episode', { ascending: true, nullsFirst: false }).order('created_at');
    if (error) toast.error(error.message);
    setStories((data ?? []) as unknown as Story[]);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const update = async (id: string, patch: Partial<Story>) => {
    const { error } = await supabase.from('linkedin_stories').update({ ...patch, updated_at: new Date().toISOString() } as never).eq('id', id);
    if (error) { toast.error(error.message); return false; }
    setStories((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    return true;
  };

  const plan = async () => {
    setBusy('plan');
    try {
      const data = await invoke({ action: 'plan', count: Number(count), existing_titles: stories.map((s) => s.title) });
      const start = stories.reduce((m, s) => Math.max(m, s.episode ?? 0), 0);
      const rows = (data.ideas as { title: string; story_type: string; purpose: string; angle: string; suggested_hook: string; questions: string[] }[])
        .map((i, n) => ({ episode: start + n + 1, title: i.title, story_type: i.story_type, purpose: i.purpose, angle: i.angle, suggested_hook: i.suggested_hook, questions: i.questions.map((q) => ({ q, a: '' })), status: 'questions_needed' }));
      const { error } = await supabase.from('linkedin_stories').insert(rows as never);
      if (error) throw error;
      toast.success(`${rows.length} story ideas planned — answer the questions to turn them into posts`);
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Planning failed'); } finally { setBusy(null); }
  };

  const writeDraft = async (s: Story) => {
    const data = await invoke({ action: 'draft', title: s.title, story_type: s.story_type, angle: s.angle, questions: s.questions, notes: s.notes });
    const d = data.draft as Draft;
    await update(s.id, { draft: d, post: d.post, status: 'needs_review' });
  };

  const writeBatch = async () => {
    const ready = stories.filter((s) => s.status === 'questions_needed' && s.questions.some((q) => q.a.trim())).slice(0, Number(count));
    if (!ready.length) { toast.info('No answered stories yet — open a story and answer its questions first.'); return; }
    setBusy('batch');
    let done = 0;
    for (const s of ready) {
      try { await writeDraft(s); done++; } catch (e) { toast.error(`${s.title}: ${e instanceof Error ? e.message : 'failed'}`); if (e instanceof Error && /credits|Too many/.test(e.message)) break; }
    }
    setBusy(null);
    if (done) toast.success(`${done} post${done > 1 ? 's' : ''} written — review and approve them`);
  };

  const addOwn = async () => {
    const start = stories.reduce((m, s) => Math.max(m, s.episode ?? 0), 0);
    const { data, error } = await supabase.from('linkedin_stories').insert({ episode: start + 1, title: 'My own story', story_type: 'personal', questions: [{ q: 'What happened? Tell it in your own words — rough notes are fine.', a: '' }], status: 'questions_needed' } as never).select().single();
    if (error) { toast.error(error.message); return; }
    await load(); setOpenId((data as { id: string }).id);
  };

  const shown = useMemo(() => stories.filter((s) => filter === 'all' || s.status === filter), [stories, filter]);
  const counts = useMemo(() => stories.reduce<Record<string, number>>((m, s) => ({ ...m, [s.status]: (m[s.status] ?? 0) + 1 }), {}), [stories]);
  const open = stories.find((s) => s.id === openId) ?? null;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><BookOpenText className="w-6 h-6" /> Freytag's Pyramid</h1>
        <p className="text-sm text-muted-foreground mt-1">LinkedIn story posts in 8–12 short lines, written only from your own answers. Nothing is ever posted automatically — you approve every post, then choose where to share it. Back office only.</p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">How many at once</Label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{COUNTS.map((c) => <SelectItem key={c} value={String(c)}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={plan} disabled={!!busy}>{busy === 'plan' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1" />} Plan {count} new stories</Button>
          <Button variant="secondary" onClick={writeBatch} disabled={!!busy}>{busy === 'batch' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <PenLine className="w-4 h-4 mr-1" />} Write up to {count} answered posts</Button>
          <Button variant="outline" onClick={addOwn} disabled={!!busy}><Plus className="w-4 h-4 mr-1" /> Tell my own story</Button>
          <p className="text-xs text-muted-foreground basis-full">Step 1: plan ideas. Step 2: open each one and answer its questions about your real experience. Step 3: write the posts, review, approve, share.</p>
        </CardContent>
      </Card>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All ({stories.length})</TabsTrigger>
          {['questions_needed', 'needs_review', 'approved', 'published'].map((s) => <TabsTrigger key={s} value={s}>{STATUS_LABEL[s]} ({counts[s] ?? 0})</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : shown.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No stories here yet. Choose 30 and press “Plan 30 new stories”.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shown.map((s) => {
            const answered = s.questions.filter((q) => q.a.trim()).length;
            return (
              <button key={s.id} onClick={() => setOpenId(s.id)} className="text-left rounded-xl border border-border bg-card p-4 hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">#{s.episode}</span>
                  <Badge variant={s.status === 'approved' || s.status === 'published' ? 'default' : 'outline'} className="text-[10px]">{STATUS_LABEL[s.status]}</Badge>
                  <Badge variant="secondary" className="text-[10px] capitalize">{s.story_type}</Badge>
                </div>
                <p className="font-medium text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.post?.split('\n')[0] || s.suggested_hook}</p>
                <p className="text-[11px] text-muted-foreground mt-2">{answered}/{s.questions.length} questions answered{Object.keys(s.posted_on ?? {}).length ? ` · shared on ${Object.keys(s.posted_on).join(', ')}` : ''}</p>
              </button>
            );
          })}
        </div>
      )}

      <StoryDialog story={open} onClose={() => setOpenId(null)} update={update} writeDraft={writeDraft}
        remove={async (id) => { const { error } = await supabase.from('linkedin_stories').delete().eq('id', id); if (error) toast.error(error.message); else { setOpenId(null); setStories((s) => s.filter((x) => x.id !== id)); } }} />
    </div>
  );
};

interface DialogProps {
  story: Story | null; onClose: () => void;
  update: (id: string, p: Partial<Story>) => Promise<boolean>;
  writeDraft: (s: Story) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const StoryDialog = ({ story, onClose, update, writeDraft, remove }: DialogProps) => {
  const [step, setStep] = useState(0);
  const [qs, setQs] = useState<QA[]>([]);
  const [notes, setNotes] = useState('');
  const [post, setPost] = useState('');
  const [writing, setWriting] = useState(false);
  const [newQ, setNewQ] = useState('');

  useEffect(() => {
    if (!story) return;
    setQs(story.questions); setNotes(story.notes ?? ''); setPost(story.post ?? ''); setStep(0);
  }, [story?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (story?.post) setPost(story.post); }, [story?.post]);

  if (!story) return null;
  const d = story.draft;
  const approved = story.status === 'approved' || story.status === 'published';
  const lines = post.split('\n').filter((l) => l.trim()).length;
  const avg = d?.quality?.length ? (d.quality.reduce((a, q) => a + q.score, 0) / d.quality.length).toFixed(1) : null;

  const saveAnswers = () => update(story.id, { questions: qs, notes });

  const write = async () => {
    setWriting(true);
    try { await saveAnswers(); await writeDraft({ ...story, questions: qs, notes }); toast.success('Post written — review it below'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Writing failed'); } finally { setWriting(false); }
  };

  const approve = async () => {
    const { data } = await supabase.auth.getUser();
    if (await update(story.id, { post, status: 'approved', approved_at: new Date().toISOString(), approved_by: data.user?.id } as Partial<Story>)) toast.success('Approved — you can now share it');
  };

  const markPosted = (p: string) => update(story.id, { posted_on: { ...story.posted_on, [p]: new Date().toISOString() }, status: 'published' });

  const cur = qs[step];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">#{story.episode} {story.title} <Badge variant="outline">{STATUS_LABEL[story.status]}</Badge></DialogTitle>
          <DialogDescription>{story.angle || 'Your story, in your words.'}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={d ? 'post' : 'questions'}>
          <TabsList>
            <TabsTrigger value="questions">Your experience</TabsTrigger>
            <TabsTrigger value="post" disabled={!d}>Post</TabsTrigger>
            <TabsTrigger value="details" disabled={!d}>Story check</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4 mt-4">
            {cur && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-normal">Question {step + 1} of {qs.length}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Label htmlFor="answer" className="text-base font-medium text-foreground">{cur.q}</Label>
                  <Textarea id="answer" rows={6} value={cur.a} placeholder="Real details help: who, where, when, what you expected, what went wrong, what changed…"
                    onChange={(e) => setQs((all) => all.map((x, i) => (i === step ? { ...x, a: e.target.value } : x)))} />
                  <div className="flex justify-between">
                    <Button size="sm" variant="outline" disabled={step === 0} onClick={() => { void saveAnswers(); setStep(step - 1); }}><ChevronLeft className="w-4 h-4" /> Back</Button>
                    <Button size="sm" variant="outline" disabled={step >= qs.length - 1} onClick={() => { void saveAnswers(); setStep(step + 1); }}>Next <ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex gap-2">
              <Input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Add your own question or prompt…" />
              <Button variant="outline" disabled={!newQ.trim()} onClick={() => { setQs((a) => [...a, { q: newQ.trim(), a: '' }]); setStep(qs.length); setNewQ(''); }}>Add</Button>
            </div>
            <div>
              <Label htmlFor="notes" className="text-xs">Anything else (names to keep private, permission notes, rough thoughts)</Label>
              <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {d?.missing_questions?.length ? (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <p className="font-medium mb-1">The last draft needs more detail:</p>
                <ul className="list-disc pl-5 space-y-1">{d.missing_questions.map((q) => <li key={q}><button className="underline text-left" onClick={() => { setQs((a) => [...a, { q, a: '' }]); setStep(qs.length); }}>{q}</button></li>)}</ul>
              </div>
            ) : null}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={write} disabled={writing || !qs.some((q) => q.a.trim())}>{writing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <PenLine className="w-4 h-4 mr-1" />} {d ? 'Rewrite post' : 'Write post'}</Button>
              <Button variant="outline" onClick={async () => { await saveAnswers(); toast.success('Answers saved'); }}>Save answers</Button>
              <Button variant="ghost" className="ml-auto text-destructive" onClick={() => remove(story.id)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
            </div>
          </TabsContent>

          {d && (
            <TabsContent value="post" className="mt-4">
              <div className="grid lg:grid-cols-[1fr_320px] gap-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post" className="text-xs">Post ({lines} lines{lines > 12 ? ' — too long' : ''})</Label>
                    {avg && <Badge variant="secondary">Quality {avg}/5</Badge>}
                  </div>
                  <Textarea id="post" rows={16} value={post} onChange={(e) => setPost(e.target.value)} disabled={approved} className="font-sans leading-relaxed" />
                  {post.includes('[NEEDS DETAIL]') && <p className="text-xs text-destructive">Replace every [NEEDS DETAIL] before approving.</p>}
                  <div className="flex gap-2 flex-wrap">
                    {!approved ? (
                      <>
                        <Button onClick={approve} disabled={post.includes('[NEEDS DETAIL]')}><CheckCircle2 className="w-4 h-4 mr-1" /> Approve post</Button>
                        <Button variant="outline" onClick={() => update(story.id, { post })}>Save edits</Button>
                        <Button variant="outline" onClick={() => setPost(d.version_a)}>Use Version A</Button>
                        <Button variant="outline" onClick={() => setPost(d.version_b)}>Use Version B</Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={() => update(story.id, { status: 'needs_review', approved_at: null })}>Unapprove to edit</Button>
                    )}
                  </div>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Share</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {!approved ? <p className="text-xs text-muted-foreground">Sharing unlocks once the post is approved.</p> : (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => copy(post, 'Post')}><Copy className="w-3.5 h-3.5 mr-1" /> Copy post</Button>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {PLATFORMS.map((p) => (
                              <div key={p.id} className="flex items-center gap-2 rounded-md border border-border p-2">
                                <span className="text-sm flex-1">{p.label}{story.posted_on?.[p.id] && <CheckCircle2 className="inline w-3.5 h-3.5 ml-1 text-accent" aria-label="Shared" />}</span>
                                {p.url ? (
                                  <Button size="sm" variant="outline" asChild><a href={p.url(post)} target="_blank" rel="noopener noreferrer" onClick={() => { void copy(post, 'Post'); }}><ExternalLink className="w-3.5 h-3.5 mr-1" /> Open</a></Button>
                                ) : <span className="text-[11px] text-muted-foreground">Upload in app</span>}
                                <Button size="sm" variant="ghost" onClick={() => markPosted(p.id)}>Mark shared</Button>
                              </div>
                            ))}
                          </div>
                          <p className="text-[11px] text-muted-foreground">The post is copied when you open a platform — paste it, add the image, then press post there.</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs">Image ({d.image.type.replace('_', ' ')})</Label>
                  <TextCard text={d.image.text || d.alternate_hooks[0] || story.title} slug={`story-${story.episode}`} />
                  <p className="text-xs text-muted-foreground">{d.image.description}</p>
                  <p className="text-xs"><span className="font-medium">Alt text:</span> {d.image.alt}</p>
                  <Button size="sm" variant="ghost" onClick={() => copy(d.image.prompt, 'Image prompt')}><Copy className="w-3.5 h-3.5 mr-1" /> Copy illustration prompt</Button>
                  <div>
                    <p className="text-xs font-medium mb-1">Alternate hooks</p>
                    <ul className="space-y-1">{d.alternate_hooks.map((h) => <li key={h} className="text-xs text-muted-foreground">• {h}</li>)}</ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {d && (
            <TabsContent value="details" className="mt-4 space-y-4 text-sm">
              <div className="grid sm:grid-cols-2 gap-3">
                {([['Purpose', d.purpose], ['Audience', d.audience], ['Angle', d.angle], ['Why it matters', d.why_it_matters], ['Call to action', d.cta]] as const).map(([k, v]) => (
                  <div key={k}><p className="text-xs text-muted-foreground">{k}</p><p>{v}</p></div>
                ))}
              </div>
              <div>
                <p className="font-medium mb-1">Story shape</p>
                {Object.entries(d.pyramid).map(([k, v]) => <p key={k}><span className="capitalize text-muted-foreground">{k.replace('_', ' ')}:</span> {v}</p>)}
              </div>
              <div>
                <p className="font-medium mb-1">Quality scores</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">{d.quality.map((q) => <span key={q.name} className="text-xs">{q.name}: <b>{q.score}</b>/5</span>)}</div>
              </div>
              {([['Warnings', d.warnings], ['Claims to verify', d.claims_to_verify], ['May need anonymising', d.anonymise], ['Editing notes', d.editing_notes]] as const).map(([k, list]) => list.length ? (
                <div key={k}><p className="font-medium mb-1">{k}</p><ul className="list-disc pl-5 text-muted-foreground">{list.map((x) => <li key={x}>{x}</li>)}</ul></div>
              ) : null)}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminStoryStudio;
