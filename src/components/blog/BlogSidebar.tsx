import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Tags, Mail, Clock, ArrowRight, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogPosts, categoryLabels, type BlogCategory } from '@/data/blogPosts';
import { toast } from 'sonner';

type Language = 'cs' | 'en' | 'de';

const labels = {
  toc: { cs: 'Obsah článku', en: 'Table of Contents', de: 'Inhaltsverzeichnis' },
  popular: { cs: 'Populární články', en: 'Popular Articles', de: 'Beliebte Artikel' },
  categories: { cs: 'Kategorie', en: 'Categories', de: 'Kategorien' },
  newsletter: { cs: 'Newsletter', en: 'Newsletter', de: 'Newsletter' },
  newsletterDesc: {
    cs: 'Získejte nejnovější tipy a trendy přímo do vašeho e-mailu.',
    en: 'Get the latest tips and trends delivered straight to your inbox.',
    de: 'Erhalten Sie die neuesten Tipps und Trends direkt in Ihren Posteingang.',
  },
  subscribe: { cs: 'Odebírat', en: 'Subscribe', de: 'Abonnieren' },
  emailPlaceholder: { cs: 'Váš e-mail…', en: 'Your email…', de: 'Ihre E-Mail…' },
  subscribed: { cs: 'Úspěšně přihlášeno!', en: 'Successfully subscribed!', de: 'Erfolgreich abonniert!' },
  min: { cs: 'min', en: 'min', de: 'Min' },
};

const popularPosts = blogPosts
  .filter((p) => p.featured)
  .concat(blogPosts.filter((p) => !p.featured))
  .slice(0, 5);

const categoryCounts = blogPosts.reduce<Record<BlogCategory, number>>((acc, post) => {
  acc[post.category] = (acc[post.category] || 0) + 1;
  return acc;
}, {} as Record<BlogCategory, number>);

export interface TocItem {
  id: string;
  text: string;
}

interface BlogSidebarProps {
  currentSlug?: string;
  toc?: TocItem[];
}

const BlogSidebar = ({ currentSlug, toc = [] }: BlogSidebarProps) => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(labels.subscribed[language]);
      setEmail('');
    }
  };

  const filteredPopular = popularPosts.filter((p) => p.slug !== currentSlug).slice(0, 4);

  return (
    <aside className="space-y-8">
      {/* Table of contents */}
      {toc.length > 0 && (
        <nav className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 mb-3">
            <ListOrdered className="w-4 h-4 text-accent" />
            {labels.toc[language]}
          </h3>
          <ol className="space-y-1.5">
            {toc.map((item, idx) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-start gap-2 py-0.5"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="text-xs text-accent/60 font-mono mt-0.5 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="line-clamp-2">{item.text}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Popular articles */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-accent" />
          {labels.popular[language]}
        </h3>
        <div className="space-y-4">
          {filteredPopular.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group flex gap-3 items-start"
            >
              <img
                src={post.image}
                alt={post.title[language]}
                className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border group-hover:ring-2 ring-accent/40 transition-all"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                  {post.title[language]}
                </p>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> {post.readTime} {labels.min[language]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Category cloud */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 mb-4">
          <Tags className="w-4 h-4 text-accent" />
          {labels.categories[language]}
        </h3>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(categoryLabels) as [BlogCategory, typeof categoryLabels[BlogCategory]][]).map(
            ([key, label]) => (
              <Link key={key} to={`/blog?category=${key}`}>
                <Badge
                  variant="outline"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-sm py-1.5 px-3"
                >
                  {label[language]}
                  <span className="ml-1.5 text-xs text-muted-foreground">({categoryCounts[key] || 0})</span>
                </Badge>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Newsletter signup */}
      <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5">
        <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4 text-primary" />
          {labels.newsletter[language]}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {labels.newsletterDesc[language]}
        </p>
        <form onSubmit={handleSubscribe} className="flex gap-2">
          <Input
            type="email"
            required
            placeholder={labels.emailPlaceholder[language]}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 text-sm bg-background"
          />
          <Button type="submit" size="sm" className="shrink-0 h-9">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </aside>
  );
};

export default BlogSidebar;
