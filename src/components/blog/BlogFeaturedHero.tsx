import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Play, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BlogPost } from '@/data/blogPosts';
import { categoryLabels } from '@/data/blogPosts';

interface BlogFeaturedHeroProps {
  post: BlogPost;
}

const BlogFeaturedHero = ({ post }: BlogFeaturedHeroProps) => {
  const { language } = useLanguage();

  const formattedDate = new Date(post.date).toLocaleDateString(
    language === 'cs' ? 'cs-CZ' : language === 'de' ? 'de-DE' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group relative block rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[420px] sm:min-h-[280px] max-w-full"
      >
        <img loading="lazy" decoding="async"
          src={post.image}
          alt={post.title[language]}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/60 to-foreground/10" />

        {post.videoUrl && (
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground ml-1" />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-10">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge className="gradient-accent text-accent-foreground text-xs">
              {categoryLabels[post.category][language]}
            </Badge>
            <span className="text-xs sm:text-sm text-primary-foreground/80">{formattedDate}</span>
            <span className="text-xs sm:text-sm text-primary-foreground/80 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.readTime} min
            </span>
          </div>
          <h2 className="font-display font-bold text-lg sm:text-3xl lg:text-4xl text-primary-foreground mb-2 sm:mb-3 max-w-3xl leading-tight">
            {post.title[language]}
          </h2>
          <p className="text-primary-foreground/80 text-xs sm:text-base max-w-2xl mb-4 line-clamp-2">
            {post.excerpt[language]}
          </p>
          <Button variant="secondary" size="sm" className="gap-2 font-semibold group-hover:gap-3 transition-all">
            {language === 'cs' ? 'Číst článek' : language === 'de' ? 'Artikel lesen' : 'Read article'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogFeaturedHero;
