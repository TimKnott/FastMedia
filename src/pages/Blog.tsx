import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, LayoutGrid, List, ArrowLeft, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogPosts, categoryLabels, type BlogCategory } from '@/data/blogPosts';
import BlogCard from '@/components/blog/BlogCard';
import BlogFeaturedHero from '@/components/blog/BlogFeaturedHero';
import ScrollToTop from '@/components/ScrollToTop';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type ViewMode = 'grid' | 'list';

const Blog = () => {
  const { language, t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>('all');

  const labels = {
    title: { cs: 'Blog', en: 'Blog', de: 'Blog' },
    subtitle: {
      cs: 'Tipy, trendy a inspirace pro vaše online podnikání',
      en: 'Tips, trends, and inspiration for your online business',
      de: 'Tipps, Trends und Inspiration für Ihr Online-Geschäft',
    },
    search: { cs: 'Hledat články…', en: 'Search articles…', de: 'Artikel suchen…' },
    all: { cs: 'Všechny', en: 'All', de: 'Alle' },
    featured: { cs: 'Doporučené', en: 'Featured', de: 'Empfohlen' },
    noResults: {
      cs: 'Žádné články nenalezeny.',
      en: 'No articles found.',
      de: 'Keine Artikel gefunden.',
    },
    back: { cs: 'Zpět na hlavní stránku', en: 'Back to homepage', de: 'Zurück zur Startseite' },
  };

  const featuredPosts = blogPosts.filter((p) => p.featured);
  const heroPost = featuredPosts[0];

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
      const matchesSearch =
        !search ||
        post.title[language].toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt[language].toLowerCase().includes(search.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, language]);

  const categories = Object.entries(categoryLabels) as [BlogCategory, typeof categoryLabels[BlogCategory]][];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ScrollToTop />

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-12 gradient-hero">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                {labels.back[language]}
              </Button>
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
              {labels.title[language]}
            </h1>
            <p className="text-lg text-white/80">{labels.subtitle[language]}</p>
          </motion.div>

          {/* Featured hero article */}
          {heroPost && <BlogFeaturedHero post={heroPost} />}
        </div>
      </section>

      {/* Filter bar */}
      <section className="py-8 border-b border-border sticky top-16 lg:top-20 z-30 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={labels.search[language]}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-8"
                onClick={() => setActiveCategory('all')}
              >
                {labels.all[language]}
              </Button>
              {categories.map(([key, label]) => (
                <Button
                  key={key}
                  variant={activeCategory === key ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  onClick={() => setActiveCategory(key)}
                >
                  {label[language]}
                </Button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">{labels.noResults[language]}</p>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <BlogCard key={post.id} post={post} layout="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {filtered.map((post) => (
                <BlogCard key={post.id} post={post} layout="list" />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
