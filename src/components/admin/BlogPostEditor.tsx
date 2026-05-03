import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { DbBlogPost, BlogSection } from '@/hooks/useDbBlogPosts';

type Lang = 'en';
const LANGS: Lang[] = ['en'];

interface Props {
  post: DbBlogPost | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// Serialize sections <-> markdown-ish text for easy editing
const sectionsToText = (sections: BlogSection[] = []): string =>
  sections
    .map((s) => {
      if (s.type === 'heading') return `## ${s.text}`;
      if (s.type === 'list') return s.items.map((i) => `- ${i}`).join('\n');
      return s.text;
    })
    .join('\n\n');

const textToSections = (text: string): BlogSection[] => {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const out: BlogSection[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.every((l) => l.startsWith('- '))) {
      out.push({ type: 'list', items: lines.map((l) => l.replace(/^- /, '')) });
    } else if (lines.length === 1 && lines[0].startsWith('## ')) {
      out.push({ type: 'heading', text: lines[0].replace(/^## /, '') });
    } else {
      out.push({ type: 'paragraph', text: lines.join(' ') });
    }
  }
  return out;
};

const BlogPostEditor = ({ post, open, onClose, onSaved }: Props) => {
  const [lang, setLang] = useState<Lang>('en');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  // Legacy CS/DE values are preserved on save but no longer editable in UI.
  const [legacyCs, setLegacyCs] = useState<{ title: string; excerpt: string; sections: BlogSection[] }>({ title: '', excerpt: '', sections: [] });
  const [legacyDe, setLegacyDe] = useState<{ title: string; excerpt: string; sections: BlogSection[] }>({ title: '', excerpt: '', sections: [] });
  const [title, setTitle] = useState<Record<Lang, string>>({ en: '' });
  const [excerpt, setExcerpt] = useState<Record<Lang, string>>({ en: '' });
  const [body, setBody] = useState<Record<Lang, string>>({ en: '' });
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [heroUrl, setHeroUrl] = useState('');

  useEffect(() => {
    if (!post) return;
    setLegacyCs({
      title: post.title?.cs || '',
      excerpt: post.excerpt?.cs || '',
      sections: post.content?.cs?.sections || [],
    });
    setLegacyDe({
      title: post.title?.de || '',
      excerpt: post.excerpt?.de || '',
      sections: post.content?.de?.sections || [],
    });
    setTitle({ en: post.title?.en || '' });
    setExcerpt({ en: post.excerpt?.en || '' });
    setBody({ en: sectionsToText(post.content?.en?.sections) });
    setSlug(post.slug);
    setCategory(post.category);
    setHeroUrl(post.hero_image_url || '');
    setLang('en');
    setMode('edit');
  }, [post]);

  const save = async (publishAfter = false) => {
    if (!post) return;
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        slug: slug.trim(),
        category: category.trim(),
        hero_image_url: heroUrl.trim() || null,
        title: { cs: legacyCs.title, en: title.en, de: legacyDe.title },
        excerpt: { cs: legacyCs.excerpt, en: excerpt.en, de: legacyDe.excerpt },
        content: {
          cs: { sections: legacyCs.sections },
          en: { sections: textToSections(body.en) },
          de: { sections: legacyDe.sections },
        },
      };
      if (publishAfter) {
        updates.status = 'published';
        updates.published_at = new Date().toISOString();
      }
      const { error } = await supabase.from('blog_posts').update(updates).eq('id', post.id);
      if (error) throw error;
      toast.success(publishAfter ? 'Saved & published' : 'Draft saved');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!post) return null;

  const previewSections = textToSections(body[lang]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            Edit blog post
            {post.ai_generated && <Badge variant="secondary" className="text-[10px]">AI</Badge>}
            <Badge variant="outline" className="text-[10px]">{post.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-xs" />
          </div>
          <div>
            <Label className="text-xs">Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Hero image URL</Label>
            <Input value={heroUrl} onChange={(e) => setHeroUrl(e.target.value)} placeholder="https://…" />
          </div>
        </div>

        <Tabs value={lang} onValueChange={(v) => setLang(v as Lang)} className="mt-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <TabsList>
              {LANGS.map((l) => (
                <TabsTrigger key={l} value={l} className="uppercase text-xs">{l}</TabsTrigger>
              ))}
            </TabsList>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={mode === 'edit' ? 'default' : 'outline'}
                onClick={() => setMode('edit')}
              >
                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant={mode === 'preview' ? 'default' : 'outline'}
                onClick={() => setMode('preview')}
              >
                <Eye className="w-3.5 h-3.5 mr-1" /> Preview
              </Button>
            </div>
          </div>

          {LANGS.map((l) => (
            <TabsContent key={l} value={l} className="space-y-3 mt-3">
              {mode === 'edit' ? (
                <>
                  <div>
                    <Label className="text-xs">Title ({l.toUpperCase()})</Label>
                    <Input
                      value={title[l]}
                      onChange={(e) => setTitle({ ...title, [l]: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Excerpt ({l.toUpperCase()})</Label>
                    <Textarea
                      value={excerpt[l]}
                      onChange={(e) => setExcerpt({ ...excerpt, [l]: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      Content ({l.toUpperCase()}) — use <code>## Heading</code>, blank line for paragraph break, <code>- item</code> for lists
                    </Label>
                    <Textarea
                      value={body[l]}
                      onChange={(e) => setBody({ ...body, [l]: e.target.value })}
                      rows={18}
                      className="font-mono text-xs"
                    />
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="py-6 space-y-4">
                    {heroUrl && (
                      <img src={heroUrl} alt="" className="w-full h-48 object-cover rounded-lg" />
                    )}
                    <h1 className="text-2xl font-display font-bold text-foreground">{title[l]}</h1>
                    <p className="text-muted-foreground italic">{excerpt[l]}</p>
                    <div className="space-y-3">
                      {previewSections.map((s, i) => {
                        if (s.type === 'heading')
                          return <h2 key={i} className="text-lg font-semibold text-foreground mt-4">{s.text}</h2>;
                        if (s.type === 'list')
                          return (
                            <ul key={i} className="list-disc pl-5 space-y-1 text-sm text-foreground">
                              {s.items.map((it, j) => <li key={j}>{it}</li>)}
                            </ul>
                          );
                        return <p key={i} className="text-sm text-foreground leading-relaxed">{s.text}</p>;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="secondary" onClick={() => save(false)} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            Save draft
          </Button>
          <Button onClick={() => save(true)} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            Save & publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostEditor;
