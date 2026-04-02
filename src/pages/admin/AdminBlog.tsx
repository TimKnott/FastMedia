import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { blogPosts } from '@/data/blogPosts';
import { ExternalLink, Edit, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminBlog = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.blog')}</h1>
          <p className="text-muted-foreground mt-1">{blogPosts.length} {t('blog.articles_published')}</p>
        </div>
        <Button size="sm" disabled>
          <Plus className="w-4 h-4 mr-1" />
          {t('blog.new_article')}
        </Button>
      </div>

      <div className="space-y-3">
        {blogPosts.map((post) => (
          <Card key={post.slug} className="shadow-card">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{post.title.cs}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                    <span className="text-xs font-mono text-muted-foreground">/blog/{post.slug}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                    <Edit className="w-3 h-3 mr-1" />
                    {t('landing.edit')}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBlog;
