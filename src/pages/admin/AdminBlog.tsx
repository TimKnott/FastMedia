import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Sparkles, Trash2, Eye, EyeOff, Loader2, Pencil, CheckCircle2, XCircle, Volume2, Clock, Headphones, AlertCircle, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDbBlogPosts, type DbBlogPost } from '@/hooks/useDbBlogPosts';
import { blogPosts as staticPosts } from '@/data/blogPosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BlogPostEditor from '@/components/admin/BlogPostEditor';
import BlogAudioPlayer from '@/components/blog/BlogAudioPlayer';
import SocialShareStudio from '@/components/admin/SocialShareStudio';

const AdminBlog = () => {
  const { t, language } = useLanguage();
  const { posts, loading, reload } = useDbBlogPosts({ status: 'all' });
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState<DbBlogPost | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<DbBlogPost | null>(null);
  const [sharing, setSharing] = useState<DbBlogPost | null>(null);

  const pending = useMemo(() => posts.filter(p => p.approval_status === 'pending_review'), [posts]);
  const reviewed = useMemo(() => posts.filter(p => p.approval_status !== 'pending_review'), [posts]);

  const generateNow = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-generate-blog', { body: {} });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Failed');
      toast.success(`Draft created: ${data.slug}. Audio is generating in the background.`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const approve = async (postId: string) => {
    setActioning(postId);
    try {
      const { data, error } = await supabase.functions.invoke('blog-approve', { body: { post_id: postId, action: 'approve' } });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Approval failed');
      toast.success('Published!');
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Approval failed');
    } finally { setActioning(null); }
  };

  const reject = async (postId: string) => {
    const reason = prompt('Reason for rejection (optional):') ?? undefined;
    setActioning(postId);
    try {
      const { data, error } = await supabase.functions.invoke('blog-approve', { body: { post_id: postId, action: 'reject', reason } });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Rejection failed');
      toast.success('Marked as rejected');
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Rejection failed');
    } finally { setActioning(null); }
  };

  const regenerateAudio = async (postId: string) => {
    setActioning(postId);
    try {
      const { data, error } = await supabase.functions.invoke('blog-tts', { body: { post_id: postId } });
      if (error) {
        const ctx = (error as { context?: Response })?.context;
        let body: string | undefined;
        if (ctx && typeof ctx.text === 'function') { try { body = await ctx.clone().text(); } catch { /* noop */ } }
        const { isElevenLabsUpgradeError, ELEVENLABS_UPGRADE_MESSAGE } = await import('@/lib/ttsErrors');
        if (isElevenLabsUpgradeError(error) || isElevenLabsUpgradeError(body)) {
          toast.warning(ELEVENLABS_UPGRADE_MESSAGE);
          return;
        }
        throw error;
      }
      if (!data?.ok) throw new Error(data?.error || 'Audio failed');
      toast.success('Audio regenerated');
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Audio failed');
    } finally { setActioning(null); }
  };

  const togglePublish = async (id: string, current: string) => {
    const newStatus = current === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from('blog_posts')
      .update({ status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(newStatus === 'published' ? 'Published' : 'Unpublished'); reload(); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); reload(); }
  };

  const totalPublished = posts.filter(p => p.status === 'published').length + staticPosts.length;

  const renderCard = (post: DbBlogPost) => {
    const isPending = post.approval_status === 'pending_review';
    return (
      <Card key={post.id} className={`shadow-card ${isPending ? 'border-accent/50 ring-1 ring-accent/20' : ''}`}>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={post.status === 'published' ? 'default' : 'outline'} className="text-[10px]">{post.status}</Badge>
                  {post.auto_generated && <Badge variant="secondary" className="text-[10px]">Auto AI</Badge>}
                  {!post.auto_generated && post.ai_generated && <Badge variant="secondary" className="text-[10px]">AI</Badge>}
                  <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
                  {isPending && <Badge className="bg-accent text-accent-foreground text-[10px]">Pending review</Badge>}
                  {post.approval_status === 'rejected' && <Badge variant="destructive" className="text-[10px]">Rejected</Badge>}
                  {post.audio_url ? (
                    <Badge variant="outline" className="text-[10px] gap-1"><Volume2 className="w-3 h-3" />Audio</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1"><Loader2 className="w-3 h-3 animate-spin" />No audio</Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] gap-1"><Clock className="w-3 h-3" />{post.read_time_minutes} min</Badge>
                </div>
                <p className="font-medium text-sm text-foreground truncate">
                  {post.title?.[language] || post.title?.en || post.slug}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {post.excerpt?.[language] || post.excerpt?.en}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground mt-1">/blog/{post.slug}</p>
                {post.seo_keywords && post.seo_keywords.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {post.seo_keywords.slice(0, 5).map(k => (
                      <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{k}</span>
                    ))}
                  </div>
                )}
                {post.approval_status === 'rejected' && post.rejection_reason && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{post.rejection_reason}</p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0 flex-wrap">
                {isPending && (
                  <>
                    <Button size="sm" className="h-8 text-xs" onClick={() => approve(post.id)} disabled={actioning === post.id}>
                      {actioning === post.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />} Approve & publish
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => reject(post.id)} disabled={actioning === post.id}>
                      <XCircle className="w-3 h-3 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {post.audio_url && (
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setPreviewAudio(post)}>
                    <Headphones className="w-3 h-3 mr-1" /> Preview
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => regenerateAudio(post.id)} disabled={actioning === post.id}>
                  <Volume2 className="w-3 h-3 mr-1" /> {post.audio_url ? 'Re-narrate' : 'Generate audio'}
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditing(post)}>
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button size="sm" className="h-8 text-xs gradient-accent text-accent-foreground" onClick={() => setSharing(post)}>
                  <Share2 className="w-3 h-3 mr-1" /> Share to social
                </Button>
                {!isPending && (
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => togglePublish(post.id, post.status)}>
                    {post.status === 'published' ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>
                )}
                {post.status === 'published' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(post.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            {previewAudio?.id === post.id && post.audio_url && (
              <BlogAudioPlayer audioUrl={post.audio_url} readMinutes={post.read_time_minutes} title={post.title?.en} />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.blog')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {totalPublished} published · <span className={pending.length ? 'text-accent font-semibold' : ''}>{pending.length} pending review</span> · auto-generates every 3 days
          </p>
        </div>
        <Button size="sm" onClick={generateNow} disabled={generating}>
          {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
          {generating ? 'Generating…' : 'Generate new draft now'}
        </Button>
      </div>

      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="py-3 text-xs text-muted-foreground">
          ✨ Every 3 days an SEO-optimised draft with FAQ & HowTo schema is generated. ElevenLabs voiceover is attached automatically. You receive an email at <strong>support@fastmedia.pro</strong> for every draft and posts only publish after you approve them here.
        </CardContent>
      </Card>

      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Awaiting your approval ({pending.length})
          </h2>
          <div className="space-y-3">{pending.map(renderCard)}</div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">All AI / CMS articles</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading…</p>
        ) : reviewed.length === 0 && pending.length === 0 ? (
          <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">No AI articles yet — click "Generate new draft now".</CardContent></Card>
        ) : (
          <div className="space-y-3">{reviewed.map(renderCard)}</div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Editorial library ({staticPosts.length})
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
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
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

      <BlogPostEditor post={editing} open={!!editing} onClose={() => setEditing(null)} onSaved={reload} />
      <SocialShareStudio post={sharing} open={!!sharing} onClose={() => setSharing(null)} />
    </div>
  );
};

export default AdminBlog;
