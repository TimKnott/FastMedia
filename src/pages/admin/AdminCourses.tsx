import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus, Trash2, Pencil, ArrowUp, ArrowDown, GraduationCap, ExternalLink, Eye, EyeOff, Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PermissionGate from '@/components/admin/PermissionGate';
import { useAllCourses, coursesTable, type Course } from '@/hooks/useCourses';

type Form = {
  slug: string;
  category: string;
  title_cs: string; title_en: string;
  subtitle_cs: string; subtitle_en: string;
  intro_cs: string; intro_en: string;
  learn_cs: string; learn_en: string;
  level_label_cs: string; level_label_en: string;
  duration_label_cs: string; duration_label_en: string;
  embed_url: string;
  embed_html: string;
  is_free: boolean;
  price_czk: number | string;
  is_published: boolean;
};

const emptyForm: Form = {
  slug: '',
  category: 'grants',
  title_cs: '', title_en: '',
  subtitle_cs: '', subtitle_en: '',
  intro_cs: '', intro_en: '',
  learn_cs: '', learn_en: '',
  level_label_cs: '', level_label_en: '',
  duration_label_cs: '', duration_label_en: '',
  embed_url: '',
  embed_html: '',
  is_free: true,
  price_czk: 0,
  is_published: true,
};

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const toForm = (c: Course): Form => ({
  slug: c.slug,
  category: c.category,
  title_cs: c.title_cs, title_en: c.title_en,
  subtitle_cs: c.subtitle_cs, subtitle_en: c.subtitle_en,
  intro_cs: c.intro_cs, intro_en: c.intro_en,
  learn_cs: (c.learn_cs ?? []).join('\n'),
  learn_en: (c.learn_en ?? []).join('\n'),
  level_label_cs: c.level_label_cs, level_label_en: c.level_label_en,
  duration_label_cs: c.duration_label_cs, duration_label_en: c.duration_label_en,
  embed_url: c.embed_url ?? '',
  embed_html: c.embed_html ?? '',
  is_free: c.is_free,
  price_czk: c.price_czk,
  is_published: c.is_published,
});

const AdminCourses = () => {
  const qc = useQueryClient();
  const { data: courses = [], isLoading } = useAllCourses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['courses', 'all'] });
    qc.invalidateQueries({ queryKey: ['courses', 'published'] });
  };

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingId(course.id);
    setForm(toForm(course));
    setDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const title = form.title_en.trim() || form.title_cs.trim();
      const slug = slugify(form.slug || title);
      if (!slug) throw new Error('Add a course title first');
      const payload = {
        slug,
        category: form.category.trim() || 'grants',
        title_cs: form.title_cs.trim(),
        title_en: form.title_en.trim(),
        subtitle_cs: form.subtitle_cs.trim(),
        subtitle_en: form.subtitle_en.trim(),
        intro_cs: form.intro_cs.trim(),
        intro_en: form.intro_en.trim(),
        learn_cs: form.learn_cs.split('\n').map((s) => s.trim()).filter(Boolean),
        learn_en: form.learn_en.split('\n').map((s) => s.trim()).filter(Boolean),
        level_label_cs: form.level_label_cs.trim(),
        level_label_en: form.level_label_en.trim(),
        duration_label_cs: form.duration_label_cs.trim(),
        duration_label_en: form.duration_label_en.trim(),
        embed_url: form.embed_url.trim() || null,
        embed_html: form.embed_html.trim() || null,
        is_free: form.is_free,
        price_czk: form.is_free ? 0 : Number(form.price_czk) || 0,
        is_published: form.is_published,
      };
      if (editingId) {
        const { error } = await coursesTable().update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const maxOrder = courses.reduce((max, c) => Math.max(max, c.sort_order), 0);
        const { error } = await coursesTable().insert({ ...payload, sort_order: maxOrder + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success(editingId ? 'Course updated' : 'Course added');
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e?.message ?? 'Could not save the course'),
  });

  const togglePublished = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await coursesTable().update({ is_published: value }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      invalidate();
      toast.success(v.value ? 'Course is now shown on the website' : 'Course hidden from the website');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Could not change the course'),
  });

  const move = useMutation({
    mutationFn: async ({ index, direction }: { index: number; direction: -1 | 1 }) => {
      const target = index + direction;
      if (target < 0 || target >= courses.length) return;
      const a = courses[index];
      const b = courses[target];
      // Normalise both positions so order stays stable even if values were equal.
      const res1 = await coursesTable().update({ sort_order: target + 1 }).eq('id', a.id);
      if (res1.error) throw res1.error;
      const res2 = await coursesTable().update({ sort_order: index + 1 }).eq('id', b.id);
      if (res2.error) throw res2.error;
    },
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e?.message ?? 'Could not reorder the courses'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await coursesTable().delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Course deleted');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Could not delete the course'),
  });

  return (
    <PermissionGate minRole="editor">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" /> Courses
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add Mini Course Generator courses, write the "what you will learn" section, set a price or keep it free,
              and drag the order with the arrows — the public page follows this order.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/courses" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" /> View courses page
              </Link>
            </Button>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" /> New course
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading courses…</p>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-muted-foreground">
              No courses yet. Press “New course” to add your first one.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {courses.map((course, index) => (
              <Card key={course.id} className={course.is_published ? '' : 'opacity-70'}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">
                        {course.title_en || course.title_cs || course.slug}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {course.subtitle_en || course.subtitle_cs || '—'}
                      </CardDescription>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant={course.is_published ? 'default' : 'secondary'} className="gap-1">
                          {course.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {course.is_published ? 'Shown' : 'Hidden'}
                        </Badge>
                        <Badge variant="outline">
                          {course.is_free || course.price_czk <= 0 ? 'Free' : `${course.price_czk.toLocaleString('en-GB')} CZK`}
                        </Badge>
                        <Badge variant="outline">Position {index + 1}</Badge>
                        <Badge variant="outline">{course.category}</Badge>
                        <Badge variant="outline">
                          {course.embed_html || course.embed_url ? 'Course embedded' : 'No embed yet'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={course.is_published}
                        onCheckedChange={(v) => togglePublished.mutate({ id: course.id, value: v })}
                        aria-label="Show this course on the website"
                      />
                      <Button size="icon" variant="outline" disabled={index === 0}
                        onClick={() => move.mutate({ index, direction: -1 })} aria-label="Move up">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" disabled={index === courses.length - 1}
                        onClick={() => move.mutate({ index, direction: 1 })} aria-label="Move down">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => openEdit(course)} aria-label="Edit course">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" aria-label="Copy public link"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://www.fastmedia.pro/courses/${course.slug}`);
                          toast.success('Public link copied');
                        }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" aria-label="Delete course"
                        onClick={() => {
                          if (confirm('Delete this course? This cannot be undone.')) remove.mutate(course.id);
                        }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  /courses/{course.slug}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit course' : 'New course'}</DialogTitle>
              <DialogDescription>
                Paste the Mini Course Generator embed code or share link. The introduction accepts links — use
                &lt;a href="/calculator"&gt;text&lt;/a&gt; for your own pages and a full https address for other websites.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Web address (slug)</Label>
                  <Input
                    value={form.slug}
                    placeholder="eu-creative-grants"
                    onChange={(e) => set('slug', e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Leave empty to build it from the English title.</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="grants" />
                </div>
              </div>

              <Tabs defaultValue="cs">
                <TabsList>
                  <TabsTrigger value="cs">Čeština</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="cs" className="space-y-4 pt-4">
                  <div><Label>Title (Czech)</Label><Input value={form.title_cs} onChange={(e) => set('title_cs', e.target.value)} /></div>
                  <div><Label>Subheading (Czech)</Label><Input value={form.subtitle_cs} onChange={(e) => set('subtitle_cs', e.target.value)} /></div>
                  <div>
                    <Label>What you will learn (Czech) — one point per line</Label>
                    <Textarea rows={5} value={form.learn_cs} onChange={(e) => set('learn_cs', e.target.value)} />
                  </div>
                  <div>
                    <Label>Introduction (Czech) — links allowed</Label>
                    <Textarea rows={6} value={form.intro_cs} onChange={(e) => set('intro_cs', e.target.value)}
                      placeholder={'<p>Úvodní odstavec s <a href="/grant-eligibility">odkazem</a>.</p>'} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Level label (Czech)</Label><Input value={form.level_label_cs} onChange={(e) => set('level_label_cs', e.target.value)} placeholder="Pro začátečníky" /></div>
                    <div><Label>Length label (Czech)</Label><Input value={form.duration_label_cs} onChange={(e) => set('duration_label_cs', e.target.value)} placeholder="Přibližně 45 minut" /></div>
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 pt-4">
                  <div><Label>Title (English)</Label><Input value={form.title_en} onChange={(e) => set('title_en', e.target.value)} /></div>
                  <div><Label>Subheading (English)</Label><Input value={form.subtitle_en} onChange={(e) => set('subtitle_en', e.target.value)} /></div>
                  <div>
                    <Label>What you will learn (English) — one point per line</Label>
                    <Textarea rows={5} value={form.learn_en} onChange={(e) => set('learn_en', e.target.value)} />
                  </div>
                  <div>
                    <Label>Introduction (English) — links allowed</Label>
                    <Textarea rows={6} value={form.intro_en} onChange={(e) => set('intro_en', e.target.value)}
                      placeholder={'<p>Opening paragraph with a <a href="/grant-eligibility">link</a>.</p>'} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Level label (English)</Label><Input value={form.level_label_en} onChange={(e) => set('level_label_en', e.target.value)} placeholder="Beginner friendly" /></div>
                    <div><Label>Length label (English)</Label><Input value={form.duration_label_en} onChange={(e) => set('duration_label_en', e.target.value)} placeholder="About 45 minutes" /></div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <div>
                  <Label>Mini Course Generator embed code</Label>
                  <Textarea rows={4} value={form.embed_html} onChange={(e) => set('embed_html', e.target.value)}
                    placeholder='<iframe src="https://minicoursegenerator.com/..." width="100%" height="700"></iframe>' />
                </div>
                <div>
                  <Label>…or just the course link</Label>
                  <Input value={form.embed_url} onChange={(e) => set('embed_url', e.target.value)}
                    placeholder="https://minicoursegenerator.com/your-course" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_published} onCheckedChange={(v) => set('is_published', v)} />
                  <span className="text-sm">Show on the website</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_free} onCheckedChange={(v) => set('is_free', v)} />
                  <span className="text-sm">Free course</span>
                </div>
                {!form.is_free && (
                  <div className="flex items-center gap-2">
                    <Label className="whitespace-nowrap">Price (CZK)</Label>
                    <Input className="w-32" type="number" min={0} value={form.price_czk}
                      onChange={(e) => set('price_czk', e.target.value)} />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => save.mutate()} disabled={save.isPending}>
                  {save.isPending ? 'Saving…' : editingId ? 'Save changes' : 'Add course'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  );
};

export default AdminCourses;
