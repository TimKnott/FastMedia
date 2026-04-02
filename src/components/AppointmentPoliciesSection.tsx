import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, XCircle, CalendarCheck, AlertTriangle } from 'lucide-react';
import LearnMoreModal from '@/components/LearnMoreModal';

const policies = [
  {
    icon: CalendarCheck,
    title: { cs: 'Potvrzení rezervace', en: 'Booking Confirmation', de: 'Buchungsbestätigung' },
    desc: {
      cs: 'Po odeslání formuláře obdržíte e-mail s potvrzením do 5 minut. Zkontrolujte prosím i spam.',
      en: 'After submitting the form, you will receive a confirmation email within 5 minutes. Please also check spam.',
      de: 'Nach dem Absenden des Formulars erhalten Sie innerhalb von 5 Minuten eine Bestätigungs-E-Mail. Bitte prüfen Sie auch den Spam-Ordner.',
    },
  },
  {
    icon: Clock,
    title: { cs: 'Přeplánování', en: 'Rescheduling', de: 'Umplanung' },
    desc: {
      cs: 'Schůzku lze bezplatně přeplánovat nejpozději 24 hodin předem prostřednictvím potvrzovacího e-mailu.',
      en: 'Appointments can be rescheduled free of charge at least 24 hours in advance via the confirmation email.',
      de: 'Termine können mindestens 24 Stunden im Voraus kostenlos über die Bestätigungs-E-Mail umgeplant werden.',
    },
  },
  {
    icon: XCircle,
    title: { cs: 'Zrušení', en: 'Cancellation', de: 'Stornierung' },
    desc: {
      cs: 'Zrušení je možné kdykoliv před schůzkou. Při opakovaném nedostavení se může být účet omezen.',
      en: 'Cancellation is possible at any time before the appointment. Repeated no-shows may result in account restrictions.',
      de: 'Eine Stornierung ist jederzeit vor dem Termin möglich. Wiederholtes Nichterscheinen kann zu Kontobeschränkungen führen.',
    },
  },
  {
    icon: AlertTriangle,
    title: { cs: 'Nedostavení se', en: 'No-Show Policy', de: 'Nichterscheinens-Richtlinie' },
    desc: {
      cs: 'Pokud se bez omluvy nedostavíte, budeme vás kontaktovat pro přeplánování. 3× nedostavení = dočasné omezení.',
      en: 'If you don\'t show up without notice, we will contact you to reschedule. 3 no-shows = temporary restriction.',
      de: 'Wenn Sie ohne Benachrichtigung nicht erscheinen, kontaktieren wir Sie zur Umplanung. 3× Nichterscheinen = vorübergehende Einschränkung.',
    },
  },
];

const learnMore = {
  title: { cs: 'Pravidla schůzek', en: 'Appointment Policies', de: 'Terminrichtlinien' },
  explanation: {
    cs: 'Jasná pravidla pro rezervace, přeplánování a zrušení pomáhají předcházet nedorozuměním a chrání čas obou stran.',
    en: 'Clear rules for bookings, rescheduling, and cancellation help prevent misunderstandings and protect both parties\' time.',
    de: 'Klare Regeln für Buchungen, Umplanung und Stornierung helfen, Missverständnisse zu vermeiden und schützen die Zeit beider Seiten.',
  },
  benefits: {
    cs: ['Snižuje nedostavení se o 40%', 'Nastavuje jasná očekávání', 'Chrání váš podnik i zákazníky'],
    en: ['Reduces no-shows by 40%', 'Sets clear expectations', 'Protects your business and customers'],
    de: ['Reduziert Nichterscheinen um 40%', 'Setzt klare Erwartungen', 'Schützt Ihr Unternehmen und Kunden'],
  },
};

const AppointmentPoliciesSection = () => {
  const { language } = useLanguage();
  const lang = language as 'cs' | 'en' | 'de';

  const title = {
    cs: 'Jak fungují naše schůzky',
    en: 'How Our Appointments Work',
    de: 'So funktionieren unsere Termine',
  };

  return (
    <section className="py-12 lg:py-16 bg-secondary/15">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-1.5">
            {lang === 'cs' ? 'Pravidla' : lang === 'de' ? 'Richtlinien' : 'Policies'}
            <LearnMoreModal
              title={learnMore.title[lang]}
              explanation={learnMore.explanation[lang]}
              benefits={learnMore.benefits[lang]}
            />
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">
            {title[lang]}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {policies.map((policy, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 bg-card border border-border rounded-xl p-5"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                <policy.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{policy.title[lang]}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{policy.desc[lang]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppointmentPoliciesSection;
