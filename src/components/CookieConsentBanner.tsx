import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LearnMoreModal from '@/components/LearnMoreModal';

const COOKIE_KEY = 'fm_cookie_consent';

const texts = {
  message: {
    cs: 'Tento web používá cookies pro zajištění správné funkčnosti a analýzu návštěvnosti.',
    en: 'This website uses cookies to ensure proper functionality and analyze traffic.',
    de: 'Diese Website verwendet Cookies, um die ordnungsgemäße Funktionalität sicherzustellen und den Datenverkehr zu analysieren.',
  },
  accept: { cs: 'Přijmout', en: 'Accept', de: 'Akzeptieren' },
  reject: { cs: 'Odmítnout', en: 'Reject', de: 'Ablehnen' },
  privacy: { cs: 'Zásady ochrany osobních údajů', en: 'Privacy Policy', de: 'Datenschutzrichtlinie' },
};

const learnMore = {
  title: { cs: 'Souhlas s cookies a ochrana soukromí', en: 'Cookie Consent & Privacy Compliance', de: 'Cookie-Einwilligung & Datenschutz' },
  explanation: {
    cs: 'Cookies pomáhají zlepšovat vaši zkušenost na webu. Máte plnou kontrolu nad tím, které cookies povolíte. Dodržujeme GDPR a české zákony o ochraně osobních údajů.',
    en: 'Cookies help improve your experience on the website. You have full control over which cookies you allow. We comply with GDPR and data protection laws.',
    de: 'Cookies helfen, Ihr Erlebnis auf der Website zu verbessern. Sie haben die volle Kontrolle darüber, welche Cookies Sie zulassen. Wir halten uns an die DSGVO und Datenschutzgesetze.',
  },
  benefits: {
    cs: ['Plný soulad s GDPR', 'Transparentní zacházení s daty', 'Buduje důvěru návštěvníků'],
    en: ['Full GDPR compliance', 'Transparent data handling', 'Builds visitor trust'],
    de: ['Volle DSGVO-Konformität', 'Transparenter Umgang mit Daten', 'Baut Besuchervertrauen auf'],
  },
};

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const { language } = useLanguage();
  const lang = language as 'cs' | 'en' | 'de';

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem(COOKIE_KEY, accepted ? 'accepted' : 'rejected');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[70] bg-card border border-border rounded-2xl shadow-2xl p-5"
        >
          <button
            onClick={() => handleConsent(false)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-foreground text-sm leading-relaxed">
                {texts.message[lang]}{' '}
                <a href="/privacy" className="text-accent hover:underline font-medium">
                  {texts.privacy[lang]}
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => handleConsent(true)} size="sm" className="flex-1">
              {texts.accept[lang]}
            </Button>
            <Button onClick={() => handleConsent(false)} variant="outline" size="sm" className="flex-1">
              {texts.reject[lang]}
            </Button>
            <LearnMoreModal
              title={learnMore.title[lang]}
              explanation={learnMore.explanation[lang]}
              benefits={learnMore.benefits[lang]}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
