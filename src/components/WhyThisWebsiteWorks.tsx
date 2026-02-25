import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, UserCheck, PhoneOff, Shield, MousePointerClick, Inbox, Target, TrendingUp } from 'lucide-react';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';

const WhyThisWebsiteWorks = () => {
  const { language } = useLanguage();
  const { getContent, invalidate } = useSiteContent();

  const bullets = [
    { icon: MessageSquare, text: { cs: 'Odpovídá zákazníkům okamžitě', en: 'Answers customer questions instantly', de: 'Beantwortet Kundenfragen sofort' } },
    { icon: UserCheck, text: { cs: 'Sbírá poptávky i mimo pracovní dobu', en: 'Captures leads even when the business is closed', de: 'Erfasst Leads auch außerhalb der Geschäftszeiten' } },
    { icon: PhoneOff, text: { cs: 'Snižuje vyrušování telefonáty', en: 'Reduces phone interruptions', de: 'Reduziert Telefonunterbrechungen' } },
    { icon: Shield, text: { cs: 'Buduje důvěru před prvním kontaktem', en: 'Increases trust before first contact', de: 'Steigert Vertrauen vor dem ersten Kontakt' } },
    { icon: MousePointerClick, text: { cs: 'Usnadňuje rezervaci, dotaz i nákup', en: 'Makes it easy to book, ask, or buy', de: 'Erleichtert Buchung, Anfrage oder Kauf' } },
    { icon: Inbox, text: { cs: 'Centralizuje veškerou komunikaci', en: 'Centralizes all communication', de: 'Zentralisiert die gesamte Kommunikation' } },
    { icon: Target, text: { cs: 'Navrženo pro přeměnu návštěvníků v zákazníky', en: 'Designed to turn visitors into customers', de: 'Entworfen, um Besucher in Kunden zu verwandeln' } },
  ];

  return (
    <section className="py-16 lg:py-24 bg-accent/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              FastMedia.Pro
            </div>
            <EditableText
              contentKey="whythisworks.title"
              defaultValue={language === 'cs' ? 'Proč tento web funguje' : language === 'en' ? 'Why This Website Works' : 'Warum diese Website funktioniert'}
              value={getContent('whythisworks.title', '') || undefined}
              onSave={invalidate}
              as="h2"
              className="text-3xl sm:text-4xl font-display font-bold text-foreground"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {bullets.map((bullet, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 shadow-sm"
              >
                <bullet.icon className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-foreground text-sm font-medium">{bullet.text[language]}</span>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-muted-foreground text-sm italic">
            {language === 'cs' 
              ? 'Firmy využívající automatizaci ušetří desítky hodin měsíčně a odpovídají rychleji než konkurence.'
              : language === 'en'
              ? 'Businesses using automation save dozens of hours per month and respond faster than competitors.'
              : 'Unternehmen, die Automatisierung nutzen, sparen Dutzende Stunden pro Monat und reagieren schneller als die Konkurrenz.'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyThisWebsiteWorks;
