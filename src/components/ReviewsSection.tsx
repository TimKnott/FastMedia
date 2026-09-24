import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { reviews } from '@/data/reviews';
import { Star, ExternalLink } from 'lucide-react';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';
import LearnMoreModal from '@/components/LearnMoreModal';

const partnerLogos = [
  { name: 'Supabase', label: 'Supabase' },
  { name: 'Vercel', label: 'Vercel' },
];

const learnMore = {
  title: { cs: 'Recenze a sociální důkaz', en: 'Reviews & Social Proof', de: 'Bewertungen & Sozialer Beweis' },
  explanation: {
    cs: 'Zpětná vazba od klientů a partnerství s technologickými lídry zvyšují důvěru návštěvníků a posilují vaši konverzní míru.',
    en: 'Client feedback and partnerships with technology leaders boost visitor trust and strengthen your conversion rate.',
    de: 'Kundenfeedback und Partnerschaften mit Technologieführern stärken das Vertrauen der Besucher und erhöhen Ihre Konversionsrate.',
  },
  benefits: {
    cs: ['Pomáhá návštěvníkům rozhodnout se', 'Buduje důvěru pomocí sociálního důkazu', 'Ukazuje reálné výsledky klientů'],
    en: ['Helps visitors decide', 'Builds trust through social proof', 'Shows real client results'],
    de: ['Hilft Besuchern bei der Entscheidung', 'Baut Vertrauen durch sozialen Beweis auf', 'Zeigt echte Kundenergebnisse'],
  },
};

const ReviewsSection = () => {
  const { t, language } = useLanguage();
  const { getContent, invalidate } = useSiteContent();
  const lang = language as 'cs' | 'en' | 'de';

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section id="reviews" className="py-20 lg:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-6"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-1.5">
            Reviews
            <LearnMoreModal
              title={learnMore.title[lang]}
              explanation={learnMore.explanation[lang]}
              benefits={learnMore.benefits[lang]}
            />
          </span>
          <EditableText
            contentKey="reviews.title"
            defaultValue={t('reviews.title')}
            value={getContent('reviews.title', '') || undefined}
            onSave={invalidate}
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4"
          />
          <EditableText
            contentKey="reviews.subtitle"
            defaultValue={t('reviews.subtitle')}
            value={getContent('reviews.subtitle', '') || undefined}
            onSave={invalidate}
            as="p"
            className="text-muted-foreground text-lg"
          />
        </motion.div>

        {/* Aggregate rating + Google link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="font-display font-bold text-foreground">{avgRating}</span>
            <span className="text-muted-foreground text-sm">({reviews.length} {lang === 'cs' ? 'recenzí' : lang === 'de' ? 'Bewertungen' : 'reviews'})</span>
          </div>
          <a
            href="https://g.page/r/fastmedia-pro/review"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            {lang === 'cs' ? 'Napsat recenzi na Google' : lang === 'de' ? 'Google-Bewertung schreiben' : 'Write a Google Review'}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>

        {/* Reviews Grid - Masonry Style */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 6) * 0.1 }}
              className="break-inside-avoid bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted'}`}
                  />
                ))}
              </div>
              <p className="text-foreground mb-4 leading-relaxed">
                "{review.text[language]}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{review.name}</p>
                  <p className="text-muted-foreground text-xs">{review.trade}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partner Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground text-sm mb-6 uppercase tracking-wider font-medium">
            {lang === 'cs' ? 'Technologičtí partneři' : lang === 'de' ? 'Technologiepartner' : 'Technology Partners'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {partnerLogos.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-xs font-bold">
                  {partner.name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{partner.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
