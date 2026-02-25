import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bot, MessageSquareText, CalendarCheck, Filter, Route, Clock, DollarSign, Brain } from 'lucide-react';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';

const AutomationSection = () => {
  const { language } = useLanguage();
  const { getContent, invalidate } = useSiteContent();

  const tasks = [
    { icon: MessageSquareText, text: { cs: 'Odpovídá na dotazy', en: 'Answers questions', de: 'Beantwortet Fragen' } },
    { icon: Filter, text: { cs: 'Sbírá poptávky', en: 'Collects inquiries', de: 'Sammelt Anfragen' } },
    { icon: CalendarCheck, text: { cs: 'Rezervuje termíny', en: 'Books appointments', de: 'Bucht Termine' } },
    { icon: Brain, text: { cs: 'Filtruje vážné zákazníky', en: 'Filters serious customers', de: 'Filtert ernsthafte Kunden' } },
    { icon: Route, text: { cs: 'Směruje zprávy správně', en: 'Routes messages correctly', de: 'Leitet Nachrichten korrekt weiter' } },
  ];

  const results = [
    { icon: Clock, text: { cs: 'Méně času na telefonu', en: 'Less phone time', de: 'Weniger Telefonzeit' } },
    { icon: DollarSign, text: { cs: 'Méně chaosu v e-mailu', en: 'Less email chaos', de: 'Weniger E-Mail-Chaos' } },
    { icon: Bot, text: { cs: 'Více skutečné práce odvedeno', en: 'More real work done', de: 'Mehr echte Arbeit erledigt' } },
  ];

  return (
    <section className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">
              {language === 'cs' ? 'Automatizace' : language === 'en' ? 'Automation' : 'Automatisierung'}
            </span>
            <EditableText
              contentKey="automation.title"
              defaultValue={language === 'cs' ? 'Ušetřete čas. Ušetřete peníze. Snižte stres.' : language === 'en' ? 'Save Time. Save Money. Reduce Stress.' : 'Zeit sparen. Geld sparen. Stress reduzieren.'}
              value={getContent('automation.title', '') || undefined}
              onSave={invalidate}
              as="h2"
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-6"
            />
            <EditableText
              contentKey="automation.subtitle"
              defaultValue={language === 'cs'
                ? 'Weby od FastMedia.Pro fungují jako digitální zaměstnanec. Pracují za vás, zatímco vy děláte to, co umíte nejlépe.'
                : language === 'en'
                ? 'FastMedia.Pro websites act like a digital employee. They work for you while you do what you do best.'
                : 'FastMedia.Pro-Websites fungieren wie ein digitaler Mitarbeiter. Sie arbeiten für Sie, während Sie das tun, was Sie am besten können.'}
              value={getContent('automation.subtitle', '') || undefined}
              onSave={invalidate}
              as="p"
              className="text-muted-foreground text-lg mb-8"
              multiline
            />
            <div className="space-y-3">
              {tasks.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <task.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-foreground font-medium">{task.text[language]}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-card rounded-2xl p-8 shadow-card">
              <h3 className="font-display font-bold text-xl text-foreground mb-6">
                {language === 'cs' ? 'Výsledek' : language === 'en' ? 'Result' : 'Ergebnis'}
              </h3>
              <div className="space-y-4">
                {results.map((result, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-accent/5 rounded-xl">
                    <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                      <result.icon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <span className="text-foreground font-semibold text-lg">{result.text[language]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Who is this for */}
            <div className="bg-card rounded-2xl p-8 shadow-card">
              <h3 className="font-display font-bold text-xl text-foreground mb-4">
                {language === 'cs' ? 'Pro koho je to ideální' : language === 'en' ? 'Who This Is For' : 'Für wen ist das ideal'}
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                {(language === 'cs' ? ['Živnostníci a podnikatelé', 'Malé týmy', 'Servisní firmy', 'Místní firmy soutěžící na důvěře'] 
                  : language === 'en' ? ['Owner-operators', 'Small teams', 'Service businesses', 'Local companies competing on trust'] 
                  : ['Einzelunternehmer', 'Kleine Teams', 'Dienstleistungsunternehmen', 'Lokale Unternehmen, die auf Vertrauen setzen']
                ).map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AutomationSection;
