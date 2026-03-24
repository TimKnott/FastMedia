import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, TrendingUp, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculatorFeatures, categoryLabels } from '@/data/calculatorFeatures';
import { getFeatureDetail } from '@/data/featureDetails';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import ScrollToTop from '@/components/ScrollToTop';
import FAQJsonLd from '@/components/FAQJsonLd';

const FeatureDetail = () => {
  const { featureId } = useParams<{ featureId: string }>();
  const { language } = useLanguage();
  const lang = language as 'cs' | 'en' | 'de';

  const feature = calculatorFeatures.find(f => f.id === featureId);
  const detail = featureId ? getFeatureDetail(featureId) : undefined;

  const nameKey = `name${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as 'nameCs' | 'nameEn' | 'nameDe';
  const descKey = `desc${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as 'descCs' | 'descEn' | 'descDe';

  if (!feature || !detail) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Feature not found</h1>
          <Link to="/calculator"><Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to Calculator</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const detailsKey = `details${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof detail;
  const benefitsKey = `benefits${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof detail;
  const faqKey = `faq${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof detail;
  const reviewNameKey = `name${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof detail.review;
  const reviewBusinessKey = `business${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof detail.review;
  const reviewQuoteKey = `quote${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof detail.review;
  const reviewResultKey = `result${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof detail.review;

  const details = detail[detailsKey] as string;
  const benefits = detail[benefitsKey] as string[];
  const faqs = detail[faqKey] as { q: string; a: string }[];

  const formatPrice = (value: number): string =>
    lang === 'en' ? value.toLocaleString('en-US') : value.toLocaleString('de-DE');

  const catLabel = categoryLabels[feature.category][lang];

  const labels = {
    cs: { back: 'Zpět do kalkulačky', benefits: 'Klíčové výhody', faq: 'Často kladené otázky', review: 'Co říkají naši zákazníci', result: 'Výsledek', oneTime: 'Jednorázově', monthly: 'Měsíčně', getQuote: 'Přidat do kalkulačky', hours: 'hod práce' },
    en: { back: 'Back to Calculator', benefits: 'Key Benefits', faq: 'Frequently Asked Questions', review: 'What Our Customers Say', result: 'Result', oneTime: 'One-time', monthly: 'Monthly', getQuote: 'Add to Calculator', hours: 'hrs of work' },
    de: { back: 'Zurück zum Kalkulator', benefits: 'Hauptvorteile', faq: 'Häufig gestellte Fragen', review: 'Was unsere Kunden sagen', result: 'Ergebnis', oneTime: 'Einmalig', monthly: 'Monatlich', getQuote: 'Zum Kalkulator hinzufügen', hours: 'Std Arbeit' },
  };

  const l = labels[lang];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${feature[nameKey]} — FastMedia.Pro`}
        description={feature[descKey]}
        canonical={`/feature/${feature.id}`}
        pagePath={`/feature/${feature.id}`}
      />
      <Navbar />
      <ScrollToTop />
      <FAQJsonLd faqs={faqs.map(f => ({ question: f.q, answer: f.a }))} />

      {/* Hero */}
      <div className="relative w-full h-[340px] sm:h-[420px] overflow-hidden">
        <img
          src={detail.heroImage}
          alt={feature[nameKey]}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 container mx-auto">
          <Link to="/calculator" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-3">
            <ArrowLeft className="w-4 h-4" /> {l.back}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{feature.icon}</span>
            <div>
              <Badge variant="secondary" className="mb-1">{catLabel}</Badge>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">{feature[nameKey]}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Pricing strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-10 p-5 rounded-2xl bg-card border border-border"
        >
          <div className="flex-1 min-w-[120px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{l.oneTime}</p>
            <p className="text-2xl font-bold text-foreground">{formatPrice(feature.oneTimePrice)} Kč</p>
          </div>
          {feature.monthlyPrice > 0 && (
            <div className="flex-1 min-w-[120px]">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{l.monthly}</p>
              <p className="text-2xl font-bold text-foreground">+{formatPrice(feature.monthlyPrice)} Kč</p>
            </div>
          )}
          <div className="flex-1 min-w-[120px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{l.hours}</p>
            <p className="text-2xl font-bold text-foreground">{feature.laborHours} {lang === 'cs' ? 'hod' : lang === 'de' ? 'Std' : 'hrs'}</p>
          </div>
          <div className="flex items-center">
            <Link to="/calculator">
              <Button size="lg" className="font-semibold">{l.getQuote}</Button>
            </Link>
          </div>
        </motion.div>

        {/* Detailed description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none mb-12"
        >
          <p className="text-foreground/90 text-lg leading-relaxed">{details}</p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary" /> {l.benefits}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Customer Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" /> {l.review}
          </h2>
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-6 sm:p-8">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-foreground/90 text-lg italic leading-relaxed mb-6">
                "{detail.review[reviewQuoteKey]}"
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {(detail.review[reviewNameKey] as string).charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{detail.review[reviewNameKey]}</p>
                  <p className="text-sm text-muted-foreground">{detail.review[reviewBusinessKey]}</p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-background/60 border border-border flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{l.result}</p>
                  <p className="font-bold text-foreground">{detail.review[reviewResultKey]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" /> {l.faq}
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-4 bg-card" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  <span itemProp="name">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <span itemProp="text">{faq.a}</span>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center py-8"
        >
          <Link to="/calculator">
            <Button size="lg" className="text-lg px-8 py-6 font-bold shadow-elegant">
              <ArrowLeft className="w-5 h-5 mr-2" /> {l.back}
            </Button>
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default FeatureDetail;
