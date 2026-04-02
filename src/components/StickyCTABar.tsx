import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Calculator, Phone, ChevronUp } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LearnMoreModal from '@/components/LearnMoreModal';

const ctaTranslations = {
  bookNow: { cs: 'Rezervovat', en: 'Book Now', de: 'Jetzt buchen' },
  getQuote: { cs: 'Kalkulace', en: 'Get a Quote', de: 'Angebot' },
  callback: { cs: 'Zavolat zpět', en: 'Callback', de: 'Rückruf' },
};

const learnMoreContent = {
  cta: {
    title: { cs: 'Co je CTA?', en: 'What is a CTA?', de: 'Was ist ein CTA?' },
    explanation: {
      cs: 'Call-to-Action (CTA) tlačítka vedou návštěvníky k provedení klíčových akcí — jako je rezervace konzultace, vyžádání cenové nabídky nebo zpětné zavolání.',
      en: 'Call-to-Action (CTA) buttons guide visitors to take key actions — like booking a consultation, requesting a quote, or requesting a callback.',
      de: 'Call-to-Action (CTA) Buttons leiten Besucher zu wichtigen Aktionen — wie eine Beratung buchen, ein Angebot anfordern oder einen Rückruf anfordern.',
    },
    benefits: {
      cs: ['Zvyšuje konverze až o 30%', 'Zlepšuje uživatelský zážitek', 'Vede návštěvníky ke klíčovým akcím'],
      en: ['Increases conversions by up to 30%', 'Improves user experience', 'Guides visitors to key actions'],
      de: ['Steigert Konversionen um bis zu 30%', 'Verbessert die Benutzererfahrung', 'Leitet Besucher zu wichtigen Aktionen'],
    },
  },
};

const StickyCTABar = () => {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Hide on admin pages
  if (pathname.startsWith('/admin')) return null;

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBooking = () => {
    if (pathname === '/') {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#booking');
    }
  };

  const goToCalculator = () => navigate('/calculator');

  const goToInquiry = () => navigate('/inquiry');

  const lang = language as 'cs' | 'en' | 'de';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none"
        >
          <div className="container mx-auto px-4 pb-4 flex justify-center pointer-events-auto">
            <div className="relative bg-card/95 backdrop-blur-lg border border-border shadow-2xl rounded-2xl overflow-hidden">
              {/* Collapse toggle */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
              >
                <ChevronUp className={`w-3 h-3 text-muted-foreground transition-transform ${collapsed ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 px-4 py-3"
                  >
                    <button
                      onClick={scrollToBooking}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      {ctaTranslations.bookNow[lang]}
                    </button>

                    <button
                      onClick={goToCalculator}
                      className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors whitespace-nowrap"
                    >
                      <Calculator className="w-4 h-4" />
                      {ctaTranslations.getQuote[lang]}
                    </button>

                    <button
                      onClick={goToInquiry}
                      className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-semibold hover:bg-secondary/80 transition-colors whitespace-nowrap"
                    >
                      <Phone className="w-4 h-4" />
                      {ctaTranslations.callback[lang]}
                    </button>

                    <LearnMoreModal
                      title={learnMoreContent.cta.title[lang]}
                      explanation={learnMoreContent.cta.explanation[lang]}
                      benefits={learnMoreContent.cta.benefits[lang]}
                      triggerSize="sm"
                      className="ml-1"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyCTABar;
