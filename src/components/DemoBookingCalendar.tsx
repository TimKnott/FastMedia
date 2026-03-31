import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Bell,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface DemoBookingCalendarProps {
  primaryColor: string;
  gradientClass: string;
  tradeName: string;
}

const DemoBookingCalendar = ({ primaryColor, gradientClass, tradeName }: DemoBookingCalendarProps) => {
  const { language } = useLanguage();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const t = (cs: string, en: string, de: string) =>
    language === 'cs' ? cs : language === 'de' ? de : en;

  const monthNames = {
    cs: ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
  };

  const dayLabels = {
    cs: ['Po','Út','St','Čt','Pá','So','Ne'],
    en: ['Mo','Tu','We','Th','Fr','Sa','Su'],
    de: ['Mo','Di','Mi','Do','Fr','Sa','So'],
  };

  const timeSlots = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];

  // Simulate some "booked" slots for realism
  const bookedSlots = useMemo(() => new Set(['10:00','14:00']), []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Mon=0

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null);
    setSelectedTime(null);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const isPast = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    const t2 = new Date(); t2.setHours(0,0,0,0);
    return d < t2;
  };
  const isWeekend = (day: number) => {
    const dow = new Date(currentYear, currentMonth, day).getDay();
    return dow === 0; // Sunday closed
  };

  const benefits = [
    { icon: Clock, title: t('Rezervujte 24/7','Book 24/7','24/7 Buchen'), desc: t('Klienti si mohou vybrat termín kdykoliv, i mimo pracovní dobu.','Clients can choose a time slot anytime, even outside working hours.','Kunden können jederzeit einen Termin wählen, auch außerhalb der Arbeitszeiten.') },
    { icon: Bell, title: t('Automatické připomínky','Automatic Reminders','Automatische Erinnerungen'), desc: t('SMS a email připomínky snižují počet zmeškaných schůzek o 70 %.','SMS & email reminders reduce no-shows by 70%.','SMS- und E-Mail-Erinnerungen reduzieren Nichterscheinen um 70 %.') },
    { icon: Users, title: t('Méně telefonátů','Fewer Phone Calls','Weniger Anrufe'), desc: t('Vaši zákazníci si rezervují sami – ušetříte čas i nervy.','Your customers book themselves – saving you time and hassle.','Ihre Kunden buchen selbst – das spart Zeit und Aufwand.') },
    { icon: Smartphone, title: t('Mobilní přístup','Mobile Friendly','Mobilfreundlich'), desc: t('Perfektní zobrazení na telefonu i tabletu. Rezervace na 2 kliknutí.','Perfect display on phone and tablet. Booking in 2 clicks.','Perfekte Anzeige auf Telefon und Tablet. Buchung in 2 Klicks.') },
  ];

  return (
    <section id="booking" className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="inline-block text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: primaryColor }}>
            {t('Online rezervace', 'Online Booking', 'Online-Buchung')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            {t(
              'Nechte zákazníky rezervovat si termín online',
              'Let Customers Book Appointments Online',
              'Lassen Sie Kunden online Termine buchen'
            )}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t(
              `Integrovaný rezervační systém pro ${tradeName} – žádné telefonáty, žádné čekání. Vaši klienti si sami vyberou volný termín a vy se můžete soustředit na práci.`,
              `Built-in booking system for ${tradeName} – no phone calls, no waiting. Your clients pick an available slot and you can focus on work.`,
              `Integriertes Buchungssystem für ${tradeName} – keine Anrufe, kein Warten. Ihre Kunden wählen einen verfügbaren Termin und Sie können sich auf die Arbeit konzentrieren.`
            )}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          {/* Interactive Calendar – left 3 cols */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-card rounded-3xl shadow-xl border border-border overflow-hidden"
          >
            {/* Calendar header */}
            <div className={`${gradientClass} px-6 py-5 flex items-center justify-between text-primary-foreground`}>
              <button onClick={handlePrevMonth} className="p-1 hover:bg-primary-foreground/20 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-display font-bold text-xl">
                {monthNames[language][currentMonth]} {currentYear}
              </h3>
              <button onClick={handleNextMonth} className="p-1 hover:bg-primary-foreground/20 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayLabels[language].map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const disabled = isPast(day) || isWeekend(day);
                  const selected = selectedDate === day;
                  return (
                    <button
                      key={day}
                      disabled={disabled}
                      onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                      className={`
                        relative aspect-square rounded-xl text-sm font-medium transition-all
                        ${disabled ? 'text-muted-foreground/40 cursor-not-allowed' : 'hover:bg-secondary cursor-pointer'}
                        ${selected ? `text-primary-foreground font-bold shadow-md` : 'text-foreground'}
                      `}
                      style={selected ? { background: primaryColor } : undefined}
                    >
                      {day}
                      {/* Dots indicating availability */}
                      {!disabled && !selected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Time slots */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 pt-6 border-t border-border"
                >
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                    {t('Dostupné časy', 'Available Times', 'Verfügbare Zeiten')} — {selectedDate}. {monthNames[language][currentMonth]}
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                    {timeSlots.map(slot => {
                      const booked = bookedSlots.has(slot);
                      const active = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          disabled={booked}
                          onClick={() => setSelectedTime(slot)}
                          className={`
                            py-2.5 rounded-xl text-sm font-medium transition-all border
                            ${booked
                              ? 'border-border text-muted-foreground/40 line-through cursor-not-allowed bg-muted/30'
                              : active
                                ? 'text-primary-foreground border-transparent shadow-md'
                                : 'border-border text-foreground hover:border-primary/40 hover:bg-secondary cursor-pointer'
                            }
                          `}
                          style={active ? { background: primaryColor, borderColor: primaryColor } : undefined}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>

                  {selectedTime && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                      <Button className={`w-full ${gradientClass} text-primary-foreground font-semibold py-6 text-base`}>
                        <Calendar className="w-5 h-5 mr-2" />
                        {t(
                          `Rezervovat ${selectedDate}. ${monthNames[language][currentMonth]} v ${selectedTime}`,
                          `Book ${monthNames[language][currentMonth]} ${selectedDate} at ${selectedTime}`,
                          `Buchen ${selectedDate}. ${monthNames[language][currentMonth]} um ${selectedTime}`
                        )}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground mt-2">
                        {t('Potvrzení obdržíte emailem a SMS','You will receive confirmation via email & SMS','Sie erhalten eine Bestätigung per E-Mail & SMS')}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Benefits – right 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" style={{ color: primaryColor }} />
              <h3 className="font-display font-bold text-lg text-foreground">
                {t('Proč online rezervace?', 'Why Online Booking?', 'Warum Online-Buchung?')}
              </h3>
            </div>

            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-md transition-shadow"
              >
                <div className={`w-11 h-11 ${gradientClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <b.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{b.title}</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Stats callout */}
            <div className={`${gradientClass} rounded-2xl p-5 text-primary-foreground mt-4`}>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6" />
                <span className="font-display font-bold text-2xl">+35 %</span>
              </div>
              <p className="text-primary-foreground/90 text-sm leading-relaxed">
                {t(
                  'Firmy s online rezervacemi zaznamenávají v průměru o 35 % více zakázek měsíčně.',
                  'Businesses with online booking see on average 35% more appointments per month.',
                  'Unternehmen mit Online-Buchung verzeichnen im Durchschnitt 35 % mehr Termine pro Monat.'
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DemoBookingCalendar;
