import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Tag, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogPosts, categoryLabels } from '@/data/blogPosts';
import BlogCard from '@/components/blog/BlogCard';
import ScrollToTop from '@/components/ScrollToTop';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

            {/* Article body */}
            <div className="prose prose-lg max-w-none text-foreground">
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">{post.excerpt[language]}</p>
              <Separator className="my-6" />
              <p className="leading-relaxed">{post.content[language]}</p>
              <p className="leading-relaxed mt-4">
                {language === 'cs'
                  ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
                  : language === 'de'
                  ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                  : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'}
              </p>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-8 flex-wrap">
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
