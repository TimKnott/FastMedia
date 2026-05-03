import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Sparkles, Trash2, Eye, EyeOff, Loader2, Pencil } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDbBlogPosts, type DbBlogPost } from '@/hooks/useDbBlogPosts';
import { blogPosts as staticPosts } from '@/data/blogPosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BlogPostEditor from '@/components/admin/BlogPostEditor';

const AdminBlog = () => {
  const { t, language } = useLanguage();
  const { posts, loading, reload } = useDbBlogPosts({ status: 'all' });
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState<DbBlogPost | null>(null);

  const generateNow = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', { body: {} });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed');
      toast.success(`Draft created: ${data.post?.slug}`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const togglePublish = async (id: string, current: string) => {
    const newStatus = current === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from('blog_posts')
      .update({ status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(newStatus === 'published' ? 'Published' : 'Unpublished');
      reload();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); reload(); }
  };

  const totalPublished = posts.filter(p => p.status === 'published').length + staticPosts.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.blog')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {totalPublished} published · {posts.filter(p => p.status === 'draft').length} drafts · weekly AI generation enabled
          </p>
        </div>
        <Button size="sm" onClick={generateNow} disabled={generating}>
          {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
          {generating ? 'Generating…' : 'Generate AI article now'}
        </Button>
      </div>

      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="py-3 text-xs text-muted-foreground">
          ✨ AI generates 2 fresh trilingual articles per week (Mon + Thu) about web design, SEO, marketing, and small business — saved as drafts for your review. Click "Generate AI article now" to create one immediately.
        </CardContent>
      </Card>

      {/* DB-backed posts */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">AI / CMS Articles</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading…</p>
        ) : posts.length === 0 ? (
          <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">No AI articles yet — click the generate button.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id} className="shadow-card">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={post.status === 'published' ? 'default' : 'outline'} className="text-[10px]">
                          {post.status}
                        </Badge>
                        {post.ai_generated && <Badge variant="secondary" className="text-[10px]">AI</Badge>}
                        <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
                      </div>
                      <p className="font-medium text-sm text-foreground truncate">
                        {post.title?.[language] || post.title?.en || post.slug}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {post.excerpt?.[language] || post.excerpt?.en}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground mt-1">/blog/{post.slug}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditing(post)}>
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => togglePublish(post.id, post.status)}>
                        {post.status === 'published' ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      {post.status === 'published' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(post.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Static legacy posts */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Editorial Library ({staticPosts.length})
        </h2>
        <div className="space-y-2">
          {staticPosts.slice(0, 6).map((post) => (
            <Card key={post.slug} className="shadow-sm">
              <CardContent className="py-3">
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{post.title.cs}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">/blog/{post.slug}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {staticPosts.length > 6 && (
            <p className="text-xs text-muted-foreground text-center py-1">+{staticPosts.length - 6} more curated articles</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;
