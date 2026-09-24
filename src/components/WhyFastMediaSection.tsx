import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Inbox, CalendarCheck, Search, Target, Clock, Bot, BarChart3, Zap } from 'lucide-react';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';

const WhyFastMediaSection = () => {
  const { language } = useLanguage();
  const { getContent, invalidate } = useSiteContent();

  const advantages = [
    {
      icon: Bot,
      title: { cs: 'Zákaznický servis 24/7', en: '24/7 Customer Handling', de: '24/7 Kundenbetreuung' },
      bullets: {
        cs: ['Chatbot okamžitě odpovídá na časté dotazy', 'Funguje v noci, o víkendech i svátcích', 'Snižuje opakované hovory a e-maily'],
        en: ['Chatbot answers common questions instantly', 'Works nights, weekends, and holidays', 'Reduces repetitive calls and emails'],
        de: ['Chatbot beantwortet häufige Fragen sofort', 'Funktioniert nachts, an Wochenenden und Feiertagen', 'Reduziert wiederkehrende Anrufe und E-Mails'],
      },
      stats: { cs: 'Až 70 % dotazů vyřízeno automaticky', en: 'Up to 70% of questions answered automatically', de: 'Bis zu 70 % der Fragen automatisch beantwortet' },
    },
    {
      icon: Inbox,
      title: { cs: 'Všechny zprávy na jednom místě', en: 'All Messages in One Place', de: 'Alle Nachrichten an einem Ort' },
      bullets: {
        cs: ['Chat na webu, Facebook, Instagram, WhatsApp, e-mail', 'Vše v jedné schránce uvnitř systému', 'Ušetříte 5–10 hodin týdně'],
        en: ['Website chat, Facebook, Instagram, WhatsApp, Email', 'All collected into one inbox', 'Save 5–10 hours per week'],
        de: ['Website-Chat, Facebook, Instagram, WhatsApp, E-Mail', 'Alles in einem Posteingang gesammelt', 'Sparen Sie 5–10 Stunden pro Woche'],
      },
      stats: { cs: 'Firmy přijdou až o 30 % zpráv, když platformy nejsou propojené', en: 'Businesses miss up to 30% of messages when platforms are separated', de: 'Unternehmen verpassen bis zu 30 % der Nachrichten bei getrennten Plattformen' },
    },
    {
      icon: CalendarCheck,
      title: { cs: 'Rezervace bez telefonování', en: 'Booking Without Phone Calls', de: 'Buchung ohne Telefonanrufe' },
      bullets: {
        cs: ['Zákazníci rezervují, když se jim to hodí', 'Automatická potvrzení snižují neúčast', 'Služby, konzultace, prohlídky, akce'],
        en: ['Customers book when it suits them', 'Automatic confirmations reduce no-shows', 'Services, consultations, site visits, events'],
        de: ['Kunden buchen, wenn es ihnen passt', 'Automatische Bestätigungen reduzieren Nichterscheinen', 'Dienstleistungen, Beratungen, Besichtigungen, Veranstaltungen'],
      },
      stats: { cs: 'Konverze rezervací stoupá o 25–40 %', en: 'Booking conversion increases by 25–40%', de: 'Buchungskonversion steigt um 25–40 %' },
    },
    {
      icon: Search,
      title: { cs: 'Postaveno pro organický růst', en: 'Built for Organic Growth', de: 'Gebaut für organisches Wachstum' },
      bullets: {
        cs: ['SEO-ready struktura a rychlé načítání', 'Přehledné stránky služeb', 'Lokální cílení pro vaši oblast'],
        en: ['SEO-ready structure and fast loading', 'Clear service pages', 'Location targeting for your area'],
        de: ['SEO-bereite Struktur und schnelles Laden', 'Klare Serviceseiten', 'Standort-Targeting für Ihr Gebiet'],
      },
      stats: { cs: '75 % uživatelů hodnotí důvěryhodnost podle kvality webu', en: '75% of users judge credibility by website quality', de: '75 % der Nutzer beurteilen Glaubwürdigkeit nach Website-Qualität' },
    },
    {
      icon: Target,
      title: { cs: 'Navrženo pro konverzi', en: 'Designed to Convert', de: 'Für Konversion entworfen' },
      bullets: {
        cs: ['Jasné výzvy k akci', 'Sekce důvěry a sociální důkaz', 'Odstraněné bariéry v cestě zákazníka'],
        en: ['Clear calls to action', 'Trust sections and social proof placement', 'Friction removed from customer journey'],
        de: ['Klare Handlungsaufforderungen', 'Vertrauensbereiche und Social Proof', 'Reibungspunkte aus der Customer Journey entfernt'],
      },
      stats: { cs: 'Konverzní layout překonává generický design 2–3×', en: 'Conversion-focused layouts outperform generic designs by 2–3×', de: 'Konversionsorientierte Layouts übertreffen generische Designs um das 2–3-fache' },
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            {language === 'cs' ? 'Proč FastMedia.Pro' : language === 'en' ? 'Why FastMedia.Pro' : 'Warum FastMedia.Pro'}
          </span>
          <EditableText
            contentKey="whyfastmedia.title"
            defaultValue={language === 'cs' ? 'Co získáte s FastMedia.Pro' : language === 'en' ? 'What You Gain With FastMedia.Pro' : 'Was Sie mit FastMedia.Pro gewinnen'}
            value={getContent('whyfastmedia.title', '') || undefined}
            onSave={invalidate}
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4"
          />
          <EditableText
            contentKey="whyfastmedia.subtitle"
            defaultValue={language === 'cs' 
              ? 'Většina webů vypadá dobře, ale dělá velmi málo. Naše weby jsou navrženy podle toho, jak zákazníci skutečně hledají, procházejí a rozhodují se.'
              : language === 'en'
              ? 'Most websites look good but do very little. Our websites are built after analysing how real customers search, scroll, hesitate, and decide.'
              : 'Die meisten Websites sehen gut aus, leisten aber sehr wenig. Unsere Websites basieren auf der Analyse, wie echte Kunden suchen, scrollen und entscheiden.'}
            value={getContent('whyfastmedia.subtitle', '') || undefined}
            onSave={invalidate}
            as="p"
            className="text-muted-foreground text-lg"
            multiline
          />
        </motion.div>

        <div className="space-y-8">
          {advantages.map((adv, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl p-6 lg:p-8 shadow-card hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
                  <adv.icon className="w-7 h-7 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-xl text-foreground mb-3">{adv.title[language]}</h3>
                  <ul className="space-y-2 mb-4">
                    {adv.bullets[language].map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <Zap className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                    <BarChart3 className="w-4 h-4" />
                    {adv.stats[language]}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyFastMediaSection;
