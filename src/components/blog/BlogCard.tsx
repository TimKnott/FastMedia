import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Play, ArrowRight, Headphones } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BlogPost } from '@/data/blogPosts';
import { categoryLabels } from '@/data/blogPosts';

interface BlogCardProps {
  post: BlogPost;
  layout?: 'grid' | 'list';
}

const BlogCard = ({ post, layout = 'grid' }: BlogCardProps) => {
  const { language } = useLanguage();

  const formattedDate = new Date(post.date).toLocaleDateString(
    language === 'cs' ? 'cs-CZ' : language === 'de' ? 'de-DE' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  if (layout === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group"
      >
        <Link
          to={`/blog/${post.slug}`}
          className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl border border-border bg-card hover:shadow-elegant transition-all duration-300"
        >
          <div className="relative sm:w-64 shrink-0 aspect-video sm:aspect-[4/3] rounded-xl overflow-hidden">
            <img src={post.image} alt={post.title[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {post.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">{categoryLabels[post.category][language]}</Badge>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
            <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {post.title[language]}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt[language]}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{post.author}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime} min</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link
        to={`/blog/${post.slug}`}
        className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elegant transition-all duration-300 h-full"
      >
        <div className="relative aspect-video overflow-hidden">
          <img src={post.image} alt={post.title[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {post.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
              </div>
            </div>
          )}
          <Badge variant="secondary" className="absolute top-3 left-3 text-xs backdrop-blur-sm">
            {categoryLabels[post.category][language]}
          </Badge>
          <Badge className="absolute top-3 right-3 text-xs gap-1 bg-background/90 text-foreground backdrop-blur-sm border border-border">
            <Headphones className="w-3 h-3" />
            {language === 'cs' ? `Poslechni · ${post.readTime} min` : language === 'de' ? `Anhören · ${post.readTime} min` : `Listen · ${post.readTime} min`}
          </Badge>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span>{formattedDate}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime} min</span>
          </div>
          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {post.title[language]}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{post.excerpt[language]}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">{post.author}</span>
            <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              {language === 'cs' ? 'Číst více' : language === 'de' ? 'Mehr lesen' : 'Read more'}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
