import { useParams, Link, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Tag, Share2, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogPosts, categoryLabels, type ContentBlock } from '@/data/blogPosts';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar, { type TocItem } from '@/components/blog/BlogSidebar';
import ScrollToTop from '@/components/ScrollToTop';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

type Language = 'cs' | 'en' | 'de';

const RichContentRenderer = ({ sections, language }: { sections: ContentBlock[]; language: Language }) => (
  <div className="space-y-6">
    {sections.map((block, i) => {
      switch (block.type) {
        case 'paragraph':
          return <p key={i} className="leading-relaxed text-foreground/90">{block.text[language]}</p>;

        case 'heading': {
          const id = `heading-${i}`;
          return <h2 key={i} id={id} className="font-display font-bold text-xl sm:text-2xl text-foreground mt-8 mb-2 scroll-mt-24">{block.text[language]}</h2>;
        }

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
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const formattedDate = new Date(post.date).toLocaleDateString(
    language === 'cs' ? 'cs-CZ' : language === 'de' ? 'de-DE' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  const related = blogPosts
    .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 3);

  const toc: TocItem[] = post.sections
    .map((block, i) => block.type === 'heading' ? { id: `heading-${i}`, text: block.text[language] } : null)
    .filter(Boolean) as TocItem[];

  const labels = {
    back: { cs: 'Zpět na blog', en: 'Back to blog', de: 'Zurück zum Blog' },
    related: { cs: 'Související články', en: 'Related Articles', de: 'Verwandte Artikel' },
    share: { cs: 'Sdílet', en: 'Share', de: 'Teilen' },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={post.title[language]}
        description={post.excerpt[language]}
        canonical={`/blog/${post.slug}`}
        ogType="article"
        ogImage={typeof post.image === 'string' ? post.image : undefined}
        pagePath={`/blog/${post.slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'FastMedia.Pro', item: 'https://fastmedia.pro/' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://fastmedia.pro/blog' },
            { '@type': 'ListItem', position: 3, name: post.title[language] },
          ],
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://fastmedia.pro/blog/${post.slug}`,
          },
          headline: post.title[language],
          description: post.excerpt[language],
          image: post.image,
          datePublished: post.date,
          dateModified: post.date,
          wordCount: post.sections
            .filter(s => s.type === 'paragraph' || s.type === 'heading')
            .reduce((acc, s) => acc + ((s as any).text[language]?.split(/\s+/).length || 0), 0),
          articleSection: categoryLabels[post.category][language],
          inLanguage: language,
          keywords: post.tags.join(', '),
          author: {
            '@type': 'Person',
            name: post.author,
            jobTitle: post.authorRole[language],
          },
          publisher: {
            '@type': 'Organization',
            name: 'FastMedia.Pro',
            url: 'https://fastmedia.pro',
            logo: {
              '@type': 'ImageObject',
              url: 'https://fastmedia.pro/favicon.jpeg',
            },
          },
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['h1', '.text-lg.leading-relaxed'],
          },
          ...(post.videoUrl ? {
            video: {
              '@type': 'VideoObject',
              name: post.title[language],
              description: post.excerpt[language],
              embedUrl: post.videoUrl.replace('watch?v=', 'embed/'),
              uploadDate: post.date,
            },
          } : {}),
        }) }}
      />
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted/30">
        <motion.div
          className="h-full bg-accent"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <Navbar />
      <ScrollToTop />

      {/* Hero image */}
      <div className="relative pt-16 lg:pt-20">
        <div className="aspect-[21/9] max-h-[480px] w-full overflow-hidden">
          <img src={post.image} alt={post.title[language]} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      </div>

      {/* Article content + sidebar */}
      <div className="container mx-auto px-4 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Main article */}
          <article className="flex-1 min-w-0">
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
          </article>

          {/* Sidebar - desktop only sticky, mobile below */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar currentSlug={post.slug} toc={toc} />
            </div>
          </div>
        </div>
      </div>

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
