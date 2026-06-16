import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, X, Plus, Minus, Sun, Moon, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LearnMoreModal from '@/components/LearnMoreModal';

const A11Y_KEY = 'fm_a11y_prefs';

interface A11yPrefs {
  fontSize: number; // 0 = default, 1 = large, 2 = xl
  highContrast: boolean;
  reducedMotion: boolean;
}

const defaultPrefs: A11yPrefs = { fontSize: 0, highContrast: false, reducedMotion: false };

const labels = {
  title: { cs: 'Přístupnost', en: 'Accessibility', de: 'Barrierefreiheit' },
  fontSize: { cs: 'Velikost písma', en: 'Font Size', de: 'Schriftgröße' },
  contrast: { cs: 'Vysoký kontrast', en: 'High Contrast', de: 'Hoher Kontrast' },
  motion: { cs: 'Omezený pohyb', en: 'Reduced Motion', de: 'Reduzierte Bewegung' },
  reset: { cs: 'Resetovat', en: 'Reset', de: 'Zurücksetzen' },
};

const learnMore = {
  title: { cs: 'Funkce přístupnosti', en: 'Accessibility Features', de: 'Barrierefreiheitsfunktionen' },
  explanation: {
    cs: 'Nástroje přístupnosti umožňují přizpůsobit web vašim potřebám — zvětšit text, zvýšit kontrast nebo omezit animace.',
    en: 'Accessibility tools let you customize the website to your needs — enlarge text, increase contrast, or reduce animations.',
    de: 'Barrierefreiheits-Tools ermöglichen es Ihnen, die Website an Ihre Bedürfnisse anzupassen — Text vergrößern, Kontrast erhöhen oder Animationen reduzieren.',
  },
  benefits: {
    cs: ['Přístupný web pro všechny', 'Soulad s WCAG 2.1 AA', 'Inkluzivní uživatelský zážitek'],
    en: ['Accessible website for everyone', 'WCAG 2.1 AA compliance', 'Inclusive user experience'],
    de: ['Barrierefreie Website für alle', 'WCAG 2.1 AA-Konformität', 'Inklusives Benutzererlebnis'],
  },
};

const AccessibilityToolbar = () => {
  const { open, setOpen } = useA11y();
  const [prefs, setPrefs] = useState<A11yPrefs>(defaultPrefs);
  const { language } = useLanguage();
  const lang = language as 'cs' | 'en' | 'de';

  useEffect(() => {
    try {
      const stored = localStorage.getItem(A11Y_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(A11Y_KEY, JSON.stringify(prefs));
    const html = document.documentElement;

    // Font size
    html.classList.remove('a11y-font-lg', 'a11y-font-xl');
    if (prefs.fontSize === 1) html.classList.add('a11y-font-lg');
    if (prefs.fontSize === 2) html.classList.add('a11y-font-xl');

    // High contrast
    html.classList.toggle('a11y-high-contrast', prefs.highContrast);

    // Reduced motion
    html.classList.toggle('a11y-reduced-motion', prefs.reducedMotion);
  }, [prefs]);

  const updatePref = (key: keyof A11yPrefs, value: any) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        aria-label="Accessibility settings"
        className="fixed bottom-20 left-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
      >
        <Accessibility className="w-6 h-6" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/30"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-4 bottom-36 z-[91] w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-accent" />
                  <h3 className="font-display font-bold text-sm text-foreground">{labels.title[lang]}</h3>
                  <LearnMoreModal
                    title={learnMore.title[lang]}
                    explanation={learnMore.explanation[lang]}
                    benefits={learnMore.benefits[lang]}
                    triggerSize="sm"
                  />
                </div>
                <button onClick={() => setOpen(false)} className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              <div className="px-5 pb-5 space-y-4 mt-2">
                {/* Font size */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{labels.fontSize[lang]}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updatePref('fontSize', Math.max(0, prefs.fontSize - 1))}
                      className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                    >
                      <Minus className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-sm font-semibold text-foreground">
                        {prefs.fontSize === 0 ? 'A' : prefs.fontSize === 1 ? 'A+' : 'A++'}
                      </span>
                    </div>
                    <button
                      onClick={() => updatePref('fontSize', Math.min(2, prefs.fontSize + 1))}
                      className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                    >
                      <Plus className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  </div>
                </div>

                {/* High contrast */}
                <button
                  onClick={() => updatePref('highContrast', !prefs.highContrast)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    prefs.highContrast ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {labels.contrast[lang]}
                </button>

                {/* Reduced motion */}
                <button
                  onClick={() => updatePref('reducedMotion', !prefs.reducedMotion)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    prefs.reducedMotion ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  {labels.motion[lang]}
                </button>

                {/* Reset */}
                <button
                  onClick={() => setPrefs(defaultPrefs)}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  {labels.reset[lang]}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityToolbar;
