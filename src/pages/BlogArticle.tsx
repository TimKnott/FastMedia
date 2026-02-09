import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Tag, Share2, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogPosts, categoryLabels, type ContentBlock } from '@/data/blogPosts';
import BlogCard from '@/components/blog/BlogCard';
import ScrollToTop from '@/components/ScrollToTop';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Language = 'cs' | 'en' | 'de';

const RichContentRenderer = ({ sections, language }: { sections: ContentBlock[]; language: Language }) => (
  <div className="space-y-6">
    {sections.map((block, i) => {
      switch (block.type) {
        case 'paragraph':
          return <p key={i} className="leading-relaxed text-foreground/90">{block.text[language]}</p>;

        case 'heading':
          return <h2 key={i} className="font-display font-bold text-xl sm:text-2xl text-foreground mt-8 mb-2">{block.text[language]}</h2>;

        case 'list':
          return (
            <ul key={i} className="space-y-2 pl-1">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 text-foreground/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2.5" />
                  <span>{item[language]}</span>
                </li>
              ))}
            </ul>
          );

        case 'image':
          return (
            <figure key={i} className="my-8">
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={block.src} alt={block.alt[language]} className="w-full h-auto" loading="lazy" />
              </div>
              {block.caption && (
                <figcaption className="text-xs text-muted-foreground mt-2 text-center italic">{block.caption[language]}</figcaption>
              )}
            </figure>
          );

        case 'quote':
          return (
            <blockquote key={i} className="relative my-8 pl-6 border-l-4 border-accent bg-accent/5 rounded-r-xl py-5 pr-6">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-accent/20" />
              <p className="text-foreground italic leading-relaxed">&ldquo;{block.text[language]}&rdquo;</p>
              {block.author && <cite className="block mt-3 text-sm font-medium text-muted-foreground not-italic">— {block.author}</cite>}
            </blockquote>
          );

        case 'callout':
          return (
            <div key={i} className="my-6 rounded-xl bg-primary/5 border border-primary/20 p-5">
              <p className="text-sm leading-relaxed text-foreground">{block.text[language]}</p>
            </div>
          );

        default:
          return null;
      }
    })}
  </div>
);

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const formattedDate = new Date(post.date).toLocaleDateString(
    language === 'cs' ? 'cs-CZ' : language === 'de' ? 'de-DE' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  const related = blogPosts
    .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 3);

  const labels = {
    back: { cs: 'Zpět na blog', en: 'Back to blog', de: 'Zurück zum Blog' },
    related: { cs: 'Související články', en: 'Related Articles', de: 'Verwandte Artikel' },
    share: { cs: 'Sdílet', en: 'Share', de: 'Teilen' },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ScrollToTop />

      {/* Hero image */}
      <div className="relative pt-16 lg:pt-20">
        <div className="aspect-[21/9] max-h-[480px] w-full overflow-hidden">
          <img src={post.image} alt={post.title[language]} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      </div>

      {/* Article content */}
      <article className="container mx-auto px-4 lg:px-8 -mt-24 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl shadow-elegant p-6 sm:p-10 border border-border"
          >
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                {labels.back[language]}
              </Button>
            </Link>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Badge className="gradient-accent text-accent-foreground">{categoryLabels[post.category][language]}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {formattedDate}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {post.readTime} min
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-4xl text-foreground leading-tight mb-6">
              {post.title[language]}
            </h1>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {post.author.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{post.author}</p>
                <p className="text-xs text-muted-foreground">{post.authorRole[language]}</p>
              </div>
            </div>

            {/* Video embed */}
            {post.videoUrl && (
              <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-muted">
                <iframe
                  src={post.videoUrl.replace('watch?v=', 'embed/')}
                  title={post.title[language]}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Excerpt lead */}
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">{post.excerpt[language]}</p>
            <Separator className="my-6" />

            {/* Rich article body */}
            <RichContentRenderer sections={post.sections} language={language} />

            {/* Tags */}
            <div className="flex items-center gap-2 mt-10 flex-wrap">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>

            {/* Share */}
            <Separator className="my-6" />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
              >
                <Share2 className="w-4 h-4" />
                {labels.share[language]}
              </Button>
              <Link to="/blog">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  {labels.back[language]}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display font-bold text-2xl text-foreground mb-8 text-center">
              {labels.related[language]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} layout="grid" />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogArticle;
