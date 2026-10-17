import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApprovedReviews, initials } from '@/hooks/useApprovedReviews';
import { Button } from '@/components/ui/button';

/** Homepage reviews: shows only real, approved client reviews. Hidden when there are none. */
const ReviewsSection = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const { data: reviews = [] } = useApprovedReviews();
  if (reviews.length === 0) return null;

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const shown = reviews.slice(0, 6);

  return (
    <section id="reviews" className="py-20 lg:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">{language === 'de' ? 'Bewertungen' : en ? 'Reviews' : 'Recenze'}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4">
            {language === 'de' ? 'Das sagen unsere Kunden' : en ? 'What our clients say' : 'Co říkají naši klienti'}
          </h2>
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="font-display font-bold text-foreground">{avg}</span>
            <span className="text-muted-foreground text-sm">({reviews.length} {language === 'de' ? 'Bewertungen' : en ? 'reviews' : 'recenzí'})</span>
          </div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {shown.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.08 }}
              className="break-inside-avoid bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex gap-1 mb-4" aria-label={`${r.rating}/5`}>
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className={`w-4 h-4 ${s < r.rating ? 'text-accent fill-accent' : 'text-muted'}`} />
                ))}
              </div>
              {language === 'de' && <p className="text-xs text-muted-foreground mb-2">Bewertung in der Originalsprache</p>}
              <p className="text-foreground mb-4 leading-relaxed">“{r.review_text}”</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center font-semibold text-sm">
                  {initials(r.name)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{r.name}</p>
                  {r.company && <p className="text-muted-foreground text-xs">{r.company}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline">
            <Link to="/reviews">{language === 'de' ? 'Alle Bewertungen ansehen oder eine Bewertung schreiben' : en ? 'Read all reviews or leave yours' : 'Všechny recenze a napsat vlastní'}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
