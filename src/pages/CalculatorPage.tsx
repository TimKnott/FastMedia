import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mic, MicOff, Plus, Minus, Trash2, Sparkles, Download, Send, MessageSquare, Calculator as CalcIcon, ChevronRight, User, Mail, Phone, Shield, CheckCircle2, TrendingUp, TicketPercent, X, CreditCard, Copy, Check } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import jsPDF from 'jspdf';
import logoUrl from '@/assets/logo.jpeg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Eye } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useCalculatorModules } from '@/hooks/useCalculatorModules';
import ModuleAdvisor from '@/components/ModuleAdvisor';
import {
  BASE_WEBSITE_PRICE,
  BASE_HOSTING_PRICE,
  LABOR_RATE,
  categoryLabels,
  type CalculatorFeature,
} from '@/data/calculatorFeatures';
import { trades } from '@/data/trades';
import { getTradePrompts } from '@/data/tradeIdeaPrompts';

type SelectedFeature = { id: string; quantity: number };
type Step = 'trade' | 'features' | 'special' | 'intent' | 'summary';
type AiSuggestion = { id: string; reason?: string };
type SpecialResponse = { suggestion?: string; alternativeFeatures?: string[] };
type SpeechResultEvent = { results: { [index: number]: { [index: number]: { transcript: string } } } };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

const CalculatorPage = () => {
  const { language, t } = useLanguage();
  const { openCheckout, checkoutElement } = useStripeCheckout();
  const { modules: calculatorFeatures, packages } = useCalculatorModules();
  const [searchParams] = useSearchParams();
  const initialTrade = (() => {
    const q = searchParams.get('trade');
    return q && trades.some(tr => tr.id === q) ? q : '';
  })();
  const [step, setStep] = useState<Step>(initialTrade ? 'features' : 'trade');
  const [selectedTrade, setSelectedTrade] = useState(initialTrade);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const packageSlug = searchParams.get('package');
  const [packageApplied, setPackageApplied] = useState(false);
  useEffect(() => {
    if (!packageSlug || packageApplied) return;
    const pkg = packages.find(p => p.slug === packageSlug);
    if (!pkg) return;
    setSelectedFeatures(pkg.module_ids.filter(id => calculatorFeatures.some(f => f.id === id)).map(id => ({ id, quantity: 1 })));
    setPackageApplied(true);
  }, [packageSlug, packageApplied, packages, calculatorFeatures]);
  const [specialRequest, setSpecialRequest] = useState('');
  const [specialResponse, setSpecialResponse] = useState<SpecialResponse | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [direction, setDirection] = useState(1);

  // Lead capture fields
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadResult, setLeadResult] = useState<{ score: number; classification: string; leadId: string } | null>(null);

  // Static checkout detail form state
  const [projectTimeline, setProjectTimeline] = useState('');
  const [projectPriority, setProjectPriority] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [contentReady, setContentReady] = useState(false);
  const [projectNotes, setProjectNotes] = useState('');
  const [intentBrief, setIntentBrief] = useState<{ summary: string; intent: Record<string, unknown> } | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applies_to: 'one_time' | 'monthly' | 'both';
    currency?: string | null;
    oneTimeDiscount: number;
    monthlyDiscount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const lang = language;

  const formatPrice = (value: number): string => {
    if (lang === 'en') return value.toLocaleString('en-GB');
    return value.toLocaleString(lang === 'de' ? 'de-DE' : 'cs-CZ');
  };
  const nameKey = `name${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as 'nameCs' | 'nameEn' | 'nameDe';
  const descKey = `desc${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as 'descCs' | 'descEn' | 'descDe';

  const labels = {
    cs: {
      title: 'Kalkulačka webu',
      subtitle: 'Sestavte si web na míru a zjistěte cenu okamžitě',
      selectTrade: 'Jaký je váš obor?',
      selectFeatures: 'Vyberte funkce pro váš web',
      specialTitle: 'Speciální požadavek',
      specialPlaceholder: 'Popište funkci, kterou nenajdete v nabídce...',
      contactTitle: 'Vaše kontaktní údaje',
      contactSubtitle: 'Výsledky uvidíte okamžitě – zadejte údaje pro uložení nabídky.',
      summaryTitle: 'Shrnutí vaší nabídky',
      baseWebsite: 'Základní web',
      laborCost: 'Práce a implementace',
      monthlyHosting: 'Měsíční hosting',
      totalOneTime: 'Celkem jednorázově',
      totalMonthly: 'Celkem měsíčně',
      hours: 'hod',
      back: 'Zpět',
      next: 'Další',
      getSuggestions: 'AI doporučení',
      askSpecial: 'Odeslat dotaz',
      exportPdf: 'Exportovat nabídku',
      sendQuote: 'Odeslat nabídku e-mailem',
      canChange: 'Nebojte se experimentovat – všechny volby lze kdykoliv upravit.',
      voiceHint: 'Mluvte a my zaznamenáme váš požadavek',
      perMonth: '/měs.',
      quantity: 'ks',
      addFeature: 'Přidat',
      removeFeature: 'Odebrat',
      suggestedFor: 'Doporučeno pro vás',
      noFeatures: 'Zatím žádné funkce',
      startOver: 'Začít znovu',
      namePlaceholder: 'Vaše jméno',
      emailPlaceholder: 'vas@email.cz',
      phonePlaceholder: '+420 797 864 432 (nepovinné)',
      gdprLabel: 'Souhlasím se zpracováním osobních údajů pro účely nabídky.',
      submitLead: 'Zobrazit nabídku',
      submittingLead: 'Zpracovávám...',
      resultInstant: 'Výsledky se zobrazí okamžitě',
      leadSuccess: 'Nabídka uložena!',
      scoreLabel: 'Skóre projektu',
    },
    en: {
      title: 'Website Calculator',
      subtitle: 'Build your custom website and get an instant quote',
      selectTrade: 'What is your trade?',
      selectFeatures: 'Choose features for your website',
      specialTitle: 'Special Request',
      specialPlaceholder: 'Describe a feature you don\'t see listed...',
      contactTitle: 'Your Contact Details',
      contactSubtitle: 'Results are shown instantly — enter your details to save your quote.',
      summaryTitle: 'Your Quote Summary',
      baseWebsite: 'Base Website',
      laborCost: 'Labor & Implementation',
      monthlyHosting: 'Monthly Hosting',
      totalOneTime: 'Total One-Time',
      totalMonthly: 'Total Monthly',
      hours: 'hrs',
      back: 'Back',
      next: 'Next',
      getSuggestions: 'AI Suggestions',
      askSpecial: 'Submit Request',
      exportPdf: 'Export Quote',
      sendQuote: 'Email Quote',
      canChange: 'Feel free to experiment – all choices can be adjusted later.',
      voiceHint: 'Speak and we\'ll capture your request',
      perMonth: '/mo',
      quantity: 'pcs',
      addFeature: 'Add',
      removeFeature: 'Remove',
      suggestedFor: 'Recommended for you',
      noFeatures: 'No features selected yet',
      startOver: 'Start Over',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'you@email.com',
      phonePlaceholder: '+1 234 567 890 (optional)',
      gdprLabel: 'I consent to my data being stored and used to provide a quote.',
      submitLead: 'View Quote',
      submittingLead: 'Processing...',
      resultInstant: 'Results shown instantly',
      leadSuccess: 'Quote saved!',
      scoreLabel: 'Project Score',
    },
    de: {
      title: 'Website-Kalkulator',
      subtitle: 'Stellen Sie Ihre Website zusammen und erhalten Sie sofort einen Preis',
      selectTrade: 'Was ist Ihr Gewerk?',
      selectFeatures: 'Wählen Sie Funktionen für Ihre Website',
      specialTitle: 'Sonderwunsch',
      specialPlaceholder: 'Beschreiben Sie eine Funktion, die Sie nicht finden...',
      contactTitle: 'Ihre Kontaktdaten',
      contactSubtitle: 'Ergebnisse werden sofort angezeigt — geben Sie Ihre Daten ein, um Ihr Angebot zu speichern.',
      summaryTitle: 'Ihre Angebotszusammenfassung',
      baseWebsite: 'Basis-Website',
      laborCost: 'Arbeit & Implementierung',
      monthlyHosting: 'Monatliches Hosting',
      totalOneTime: 'Gesamt einmalig',
      totalMonthly: 'Gesamt monatlich',
      hours: 'Std',
      back: 'Zurück',
      next: 'Weiter',
      getSuggestions: 'KI-Empfehlungen',
      askSpecial: 'Anfrage senden',
      exportPdf: 'Angebot exportieren',
      sendQuote: 'Angebot per E-Mail',
      canChange: 'Experimentieren Sie ruhig – alle Optionen können später angepasst werden.',
      voiceHint: 'Sprechen Sie und wir erfassen Ihre Anfrage',
      perMonth: '/Mon.',
      quantity: 'Stk',
      addFeature: 'Hinzufügen',
      removeFeature: 'Entfernen',
      suggestedFor: 'Für Sie empfohlen',
      noFeatures: 'Noch keine Funktionen ausgewählt',
      startOver: 'Neu starten',
      namePlaceholder: 'Ihr Name',
      emailPlaceholder: 'ihre@email.de',
      phonePlaceholder: '+420 797 864 432 (optional)',
      gdprLabel: 'Ich stimme der Speicherung meiner Daten zur Angebotserstellung zu.',
      submitLead: 'Angebot anzeigen',
      submittingLead: 'Wird verarbeitet...',
      resultInstant: 'Ergebnisse werden sofort angezeigt',
      leadSuccess: 'Angebot gespeichert!',
      scoreLabel: 'Projekt-Score',
    },
  };

  const l = labels[lang];

  // Price calculations
  const getFeatureById = (id: string) => calculatorFeatures.find(f => f.id === id);

  const totalOneTime = selectedFeatures.reduce((sum, sf) => {
    const feature = getFeatureById(sf.id);
    return sum + (feature ? feature.oneTimePrice * sf.quantity : 0);
  }, BASE_WEBSITE_PRICE);

  const totalLaborHours = selectedFeatures.reduce((sum, sf) => {
    const feature = getFeatureById(sf.id);
    return sum + (feature ? feature.laborHours * sf.quantity : 0);
  }, 0);

  const laborCost = totalLaborHours * LABOR_RATE;

  const totalMonthly = selectedFeatures.reduce((sum, sf) => {
    const feature = getFeatureById(sf.id);
    return sum + (feature ? feature.monthlyPrice * sf.quantity : 0);
  }, BASE_HOSTING_PRICE);

  const grandTotalOneTime = totalOneTime + laborCost;

  // Apply coupon discounts
  const oneTimeDiscount = appliedCoupon?.oneTimeDiscount ?? 0;
  const monthlyDiscount = appliedCoupon?.monthlyDiscount ?? 0;
  const discountedOneTime = Math.max(0, grandTotalOneTime - oneTimeDiscount);
  const discountedMonthly = Math.max(0, totalMonthly - monthlyDiscount);
  const annualHosting = totalMonthly * 12;
  const discountedAnnualHosting = discountedMonthly * 12;
  const checkoutTotalToday = discountedOneTime + discountedAnnualHosting;
  const totalAnnualDiscount = oneTimeDiscount + monthlyDiscount * 12;

  // Digitalisation grant estimator (0–85%), applies to the one-off build cost only
  const MAX_GRANT_RATE = 85;
  const [grantRate, setGrantRate] = useState(0);
  const grantAmount = Math.round((discountedOneTime * grantRate) / 100);
  const netAfterGrant = Math.max(0, discountedOneTime - grantAmount);

  // Promo coupon window — kept under 3 hours to create urgency
  const PROMO_CODE = 'PROMO-90';
  const PROMO_WINDOW_SECONDS = 2 * 60 * 60 + 55 * 60; // 2h 55m
  const [couponDeadline, setCouponDeadline] = useState<number | null>(null);
  const [couponSecondsLeft, setCouponSecondsLeft] = useState(PROMO_WINDOW_SECONDS);
  const [promoCopied, setPromoCopied] = useState(false);

  useEffect(() => {
    if (!couponDeadline) {
      setCouponSecondsLeft(PROMO_WINDOW_SECONDS);
      return;
    }
    const tick = () => setCouponSecondsLeft(Math.max(0, Math.ceil((couponDeadline - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [couponDeadline]);

  const startCouponWindow = () => {
    if (couponDeadline) return;
    const deadline = Date.now() + PROMO_WINDOW_SECONDS * 1000;
    setCouponDeadline(deadline);
    setCouponSecondsLeft(PROMO_WINDOW_SECONDS);
  };

  const copyPromoCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setPromoCopied(true);
      setCouponInput(PROMO_CODE);
      setTimeout(() => setPromoCopied(false), 2000);
      toast({ title: lang === 'cs' ? 'Kód zkopírován' : lang === 'de' ? 'Code kopiert' : 'Code copied' });
    } catch {
      toast({ title: lang === 'cs' ? 'Nelze zkopírovat' : lang === 'de' ? 'Kopieren fehlgeschlagen' : 'Copy failed', variant: 'destructive' });
    }
  };

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
  };

  // Auto-start the urgency countdown the moment the user lands on the summary
  useEffect(() => {
    if (step === 'summary') startCouponWindow();
    if (step === 'summary' && window.location.hash === '#grant') {
      const timer = window.setTimeout(
        () => document.getElementById('grant')?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
        400,
      );
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);



  const buildStaticIntentBrief = () => {
    const intent = {
      timeline: projectTimeline || null,
      priority: projectPriority || null,
      budget: projectBudget || null,
      contentReady,
      notes: projectNotes.trim() || null,
    };
    const details = [
      projectTimeline && `${lang === 'cs' ? 'Preferovaný termín' : lang === 'de' ? 'Wunschtermin' : 'Preferred timeline'}: ${projectTimeline}`,
      projectPriority && `${lang === 'cs' ? 'Priorita' : lang === 'de' ? 'Priorität' : 'Priority'}: ${projectPriority}`,
      projectBudget && `${lang === 'cs' ? 'Rozpočet' : lang === 'de' ? 'Budget' : 'Budget'}: ${projectBudget}`,
      contentReady && (lang === 'cs' ? 'Obsah je připravený' : lang === 'de' ? 'Inhalte sind bereit' : 'Content is ready'),
      projectNotes.trim() && `${lang === 'cs' ? 'Poznámky' : lang === 'de' ? 'Notizen' : 'Notes'}: ${projectNotes.trim()}`,
    ].filter(Boolean);
    return {
      intent,
      summary: details.length
        ? details.join('\n')
        : (lang === 'cs' ? 'Volitelné otázky přeskočeny.' : lang === 'de' ? 'Optionale Fragen übersprungen.' : 'Optional checkout questions skipped.'),
    };
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-coupon', {
        body: { code: couponInput.trim(), oneTimeAmount: grandTotalOneTime, monthlyAmount: totalMonthly },
      });
      if (error) throw error;
      if (!data?.valid) {
        const reason = data?.error || 'invalid';
        const msg: Record<string, string> = {
          not_found: lang === 'cs' ? 'Kupón nenalezen' : lang === 'de' ? 'Gutschein nicht gefunden' : 'Coupon not found',
          inactive: lang === 'cs' ? 'Kupón je neaktivní' : lang === 'de' ? 'Gutschein inaktiv' : 'Coupon is inactive',
          expired: lang === 'cs' ? 'Kupón vypršel' : lang === 'de' ? 'Gutschein abgelaufen' : 'Coupon expired',
          not_yet_valid: lang === 'cs' ? 'Kupón zatím neplatí' : lang === 'de' ? 'Noch nicht gültig' : 'Not yet valid',
          max_uses_reached: lang === 'cs' ? 'Kupón byl vyčerpán' : lang === 'de' ? 'Limit erreicht' : 'Coupon limit reached',
          min_amount_not_met: lang === 'cs' ? 'Minimální částka nesplněna' : lang === 'de' ? 'Mindestbetrag nicht erreicht' : 'Minimum amount not met',
        };
        toast({ title: msg[reason] || (lang === 'cs' ? 'Neplatný kupón' : 'Invalid coupon'), variant: 'destructive' });
        return;
      }
      setAppliedCoupon({ ...data.coupon, oneTimeDiscount: data.oneTimeDiscount, monthlyDiscount: data.monthlyDiscount });
      toast({ title: lang === 'cs' ? 'Kupón uplatněn!' : lang === 'de' ? 'Gutschein angewendet!' : 'Coupon applied!' });
    } catch (e) {
      console.error(e);
      toast({ title: lang === 'cs' ? 'Chyba validace' : 'Validation error', variant: 'destructive' });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  // Feature management
  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev => {
      const exists = prev.find(f => f.id === id);
      if (exists) return prev.filter(f => f.id !== id);
      return [...prev, { id, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedFeatures(prev =>
      prev.map(f => {
        if (f.id !== id) return f;
        const newQty = Math.max(1, f.quantity + delta);
        return { ...f, quantity: newQty };
      })
    );
  };

  const isSelected = (id: string) => selectedFeatures.some(f => f.id === id);
  const getQuantity = (id: string) => selectedFeatures.find(f => f.id === id)?.quantity ?? 0;

  // Voice input
  const toggleVoice = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({ title: lang === 'cs' ? 'Hlasový vstup není podporován' : 'Voice input not supported', variant: 'destructive' });
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const speechWindow = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'cs' ? 'cs-CZ' : lang === 'de' ? 'de-DE' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechResultEvent) => {
      const transcript = event.results[0][0].transcript;
      setSpecialRequest(prev => prev ? prev + ' ' + transcript : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  }, [isListening, lang]);

  // AI suggestions
  const fetchSuggestions = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculator-ai', {
        body: {
          selectedFeatures: selectedFeatures.map(f => f.id),
          trade: selectedTrade,
          language: lang,
        },
      });
      if (error) throw error;
      if (data?.suggestions) setAiSuggestions(data.suggestions);
    } catch (e) {
      console.error(e);
      toast({ title: lang === 'cs' ? 'Chyba AI' : 'AI Error', variant: 'destructive' });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const submitSpecialRequest = async () => {
    if (!specialRequest.trim()) return;
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculator-ai', {
        body: {
          selectedFeatures: selectedFeatures.map(f => f.id),
          trade: selectedTrade,
          specialRequest,
          language: lang,
        },
      });
      if (error) throw error;
      setSpecialResponse(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Static checkout detail form
  const continueToCheckout = () => {
    setIntentBrief(buildStaticIntentBrief());
    startCouponWindow();
    setDirection(1);
    setStep('summary');
  };

  // Submit lead
  const submitLead = async () => {
    if (!contactName.trim() || !contactEmail.trim() || !gdprConsent) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      toast({ title: lang === 'cs' ? 'Neplatný e-mail' : 'Invalid email', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const staticBrief = buildStaticIntentBrief();
      const { data, error } = await supabase.functions.invoke('score-lead', {
        body: {
          name: contactName.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim() || undefined,
          trade: selectedTrade,
          selectedFeatures,
          specialRequest: specialRequest.trim() || undefined,
          quoteOneTime: grandTotalOneTime,
          quoteMonthly: totalMonthly,
          laborHours: totalLaborHours,
          language: lang,
          gdprConsent: true,
          intent: staticBrief.intent,
          intentSummary: staticBrief.summary,
          intentTranscript: null,
          coupon: appliedCoupon ? { code: appliedCoupon.code, oneTimeDiscount, monthlyDiscount } : null,
          grant: grantRate > 0 ? { ratePercent: grantRate, estimatedAmount: grantAmount, netAfterGrant } : null,
        },
      });
      if (error) throw error;
      setIntentBrief(staticBrief);
      setLeadResult({ score: data.score, classification: data.classification, leadId: data.leadId });
      startCouponWindow();
      setDirection(1);
      setStep('summary');
      toast({ title: l.leadSuccess });
    } catch (e) {
      console.error(e);
      toast({ title: lang === 'cs' ? 'Chyba při odesílání' : 'Submission error', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build the polished, branded quote PDF (template-driven)
  const buildQuotePdf = async (): Promise<{ doc: jsPDF; quoteId: string }> => {
    const tradeObj = trades.find(t => t.id === selectedTrade);
    const tradeName = tradeObj ? t(tradeObj.nameKey) : selectedTrade;

    // --- Brand palette ---
    const NAVY: [number, number, number] = [11, 27, 59];
    const NAVY_SOFT: [number, number, number] = [30, 50, 92];
    const CORAL: [number, number, number] = [255, 107, 90];
    const INK: [number, number, number] = [24, 31, 47];
    const MUTED: [number, number, number] = [110, 120, 140];
    const LINE: [number, number, number] = [225, 229, 238];
    const ZEBRA: [number, number, number] = [246, 248, 252];
    const SUCCESS: [number, number, number] = [16, 140, 90];

    // Preload logo as data URL (cached after first use)
    const logoDataUrl: string | null = await fetch(logoUrl)
      .then(r => r.blob())
      .then(b => new Promise<string>(res => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as string);
        fr.readAsDataURL(b);
      }))
      .catch(() => null);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const M = 44; // margin

    const quoteId = `Q-${Date.now().toString().slice(-8)}`;
    const today = new Date().toLocaleDateString(lang === 'cs' ? 'cs-CZ' : lang === 'de' ? 'de-DE' : 'en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    const validUntil = new Date(Date.now() + 14 * 86400000).toLocaleDateString(lang === 'cs' ? 'cs-CZ' : lang === 'de' ? 'de-DE' : 'en-GB');

    // ---------- Template chrome (reusable per page) ----------
    const drawHeader = () => {
      // Top navy band
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, pageW, 96, 'F');
      // Coral accent stripe
      doc.setFillColor(...CORAL);
      doc.rect(0, 96, pageW, 4, 'F');

      if (logoDataUrl) {
        try { doc.addImage(logoDataUrl, 'JPEG', M, 24, 46, 46, undefined, 'FAST'); } catch {}
      }
      doc.setTextColor(255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('FastMedia.Pro', M + 58, 48);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(200, 210, 230);
      doc.text('Bespoke websites for service businesses', M + 58, 64);

      // Right-side QUOTE wordmark
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255);
      doc.text('QUOTE', pageW - M, 44, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(200, 210, 230);
      doc.text(`No. ${quoteId}`, pageW - M, 60, { align: 'right' });
      doc.text(`Issued: ${today}`, pageW - M, 73, { align: 'right' });

      doc.setTextColor(...INK);
    };

    const drawFooter = (pageNum: number, totalPages: number) => {
      const fy = pageH - 70;
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.5);
      doc.line(M, fy, pageW - M, fy);

      // Contact line
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text('FastMedia.Pro  •  support@fastmedia.pro  •  +420 797 864 432  •  fastmedia.pro', M, fy + 14);

      // Legal links (rich hyperlinks)
      const links: { label: string; slug: string }[] = [
        { label: 'Terms of Service', slug: 'terms-of-service' },
        { label: 'Privacy Policy', slug: 'privacy-policy' },
        { label: 'GDPR & Data Rights', slug: 'gdpr' },
        { label: 'Cookie Policy', slug: 'cookie-policy' },
        { label: 'Refund Policy', slug: 'refund-policy' },
        { label: 'DPA', slug: 'dpa' },
      ];
      let lx = M;
      const ly = fy + 30;
      doc.setFontSize(8.5);
      links.forEach((lnk, i) => {
        const label = lnk.label;
        doc.setTextColor(...NAVY_SOFT);
        doc.textWithLink(label, lx, ly, { url: `https://www.fastmedia.pro/legal/${lnk.slug}` });
        const w = doc.getTextWidth(label);
        lx += w;
        if (i < links.length - 1) {
          doc.setTextColor(...MUTED);
          doc.text('  ·  ', lx, ly);
          lx += doc.getTextWidth('  ·  ');
        }
      });

      doc.setTextColor(...MUTED);
      doc.setFontSize(8);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageW - M, fy + 30, { align: 'right' });
      doc.text(`Quote valid until ${validUntil}`, pageW - M, fy + 14, { align: 'right' });
      doc.setTextColor(...INK);
    };

    // ---------- Page 1 content ----------
    drawHeader();
    let y = 130;

    // Prepared-for / project card
    doc.setFillColor(...ZEBRA);
    doc.roundedRect(M, y, pageW - M * 2, 86, 6, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text('PREPARED FOR', M + 16, y + 20);
    doc.text('PROJECT', pageW / 2 + 8, y + 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(contactName || '—', M + 16, y + 40);
    doc.text(tradeName || '—', pageW / 2 + 8, y + 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    if (contactEmail) doc.text(contactEmail, M + 16, y + 56);
    if (contactPhone) doc.text(contactPhone, M + 16, y + 70);
    doc.text(`Estimated build: 4–6 weeks`, pageW / 2 + 8, y + 56);
    doc.text(`Currency: CZK  •  All prices excl. VAT`, pageW / 2 + 8, y + 70);

    y += 110;

    // Section title
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Your Custom Website Quote', M, y);
    doc.setDrawColor(...CORAL);
    doc.setLineWidth(2);
    doc.line(M, y + 5, M + 60, y + 5);
    y += 24;

    // Table header
    const COL_ITEM = M + 12;
    const COL_QTY = pageW - M - 220;
    const COL_ONE = pageW - M - 120;
    const COL_MO = pageW - M - 12;

    const drawTableHeader = () => {
      doc.setFillColor(...NAVY);
      doc.rect(M, y, pageW - M * 2, 24, 'F');
      doc.setTextColor(255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('ITEM', COL_ITEM, y + 16);
      doc.text('QTY', COL_QTY, y + 16, { align: 'right' });
      doc.text('ONE-TIME', COL_ONE, y + 16, { align: 'right' });
      doc.text('MONTHLY', COL_MO, y + 16, { align: 'right' });
      y += 24;
      doc.setTextColor(...INK);
    };
    drawTableHeader();

    let zebra = false;
    const ensureSpace = (needed: number) => {
      if (y + needed > pageH - 110) {
        drawFooter(doc.getNumberOfPages(), 0); // placeholder; rewritten at end
        doc.addPage();
        drawHeader();
        y = 130;
        drawTableHeader();
      }
    };

    const tableRow = (label: string, sub: string | null, qty: string, oneTime: string, monthly: string) => {
      const labelLines = doc.splitTextToSize(label, COL_QTY - COL_ITEM - 12);
      const subLines = sub ? doc.splitTextToSize(sub, COL_QTY - COL_ITEM - 12) : [];
      const rowH = Math.max(26, 14 * labelLines.length + (sub ? 11 * subLines.length + 4 : 0) + 8);
      ensureSpace(rowH);

      if (zebra) {
        doc.setFillColor(...ZEBRA);
        doc.rect(M, y, pageW - M * 2, rowH, 'F');
      }
      zebra = !zebra;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      doc.text(labelLines, COL_ITEM, y + 16);

      if (sub) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text(subLines, COL_ITEM, y + 16 + 14 * labelLines.length);
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      doc.text(qty, COL_QTY, y + 16, { align: 'right' });
      doc.text(oneTime, COL_ONE, y + 16, { align: 'right' });
      doc.setTextColor(...MUTED);
      doc.text(monthly, COL_MO, y + 16, { align: 'right' });
      doc.setTextColor(...INK);

      y += rowH;
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.4);
      doc.line(M, y, pageW - M * 2 + M, y);
    };

    // Base website row + inclusions
    tableRow(
      'Base Website',
      'Up to 5 pages · Mobile responsive · SSL/HTTPS · Basic SEO · GDPR cookie banner · Google Maps · Contact details · 12 months hosting prepaid',
      '1',
      `${formatPrice(BASE_WEBSITE_PRICE)} Kč`,
      `${formatPrice(BASE_HOSTING_PRICE)} Kč/mo`,
    );

    // Add-on rows
    selectedFeatures.forEach(sf => {
      const f = getFeatureById(sf.id);
      if (!f) return;
      tableRow(
        `${f.icon}  ${f[nameKey]}`,
        f[descKey],
        String(sf.quantity),
        `${formatPrice(f.oneTimePrice * sf.quantity)} Kč`,
        f.monthlyPrice > 0 ? `${formatPrice(f.monthlyPrice * sf.quantity)} Kč/mo` : '—',
      );
    });

    if (totalLaborHours > 0) {
      tableRow(
        `Custom development & integration`,
        `Senior engineering time at ${LABOR_RATE} Kč/h`,
        `${totalLaborHours} h`,
        `${formatPrice(laborCost)} Kč`,
        '—',
      );
    }

    y += 16;

    // ---------- Totals card ----------
    ensureSpace(160);
    const cardX = pageW - M - 260;
    const cardW = 260;
    const cardH = appliedCoupon ? 150 : 96;

    doc.setFillColor(...NAVY);
    doc.roundedRect(cardX, y, cardW, cardH, 8, 8, 'F');
    doc.setTextColor(255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('Subtotal (one-time)', cardX + 16, y + 24);
    doc.text(`${formatPrice(grandTotalOneTime)} Kč`, cardX + cardW - 16, y + 24, { align: 'right' });
    doc.text('Recurring', cardX + 16, y + 42);
    doc.text(`${formatPrice(totalMonthly)} Kč/mo`, cardX + cardW - 16, y + 42, { align: 'right' });

    let cardY = y + 60;
    if (appliedCoupon) {
      doc.setTextColor(255, 180, 170);
      doc.text(`Coupon ${appliedCoupon.code}`, cardX + 16, cardY);
      const discLabel = `- ${formatPrice(oneTimeDiscount)} Kč`;
      doc.text(discLabel, cardX + cardW - 16, cardY, { align: 'right' });
      cardY += 18;
      doc.setDrawColor(80, 100, 140);
      doc.line(cardX + 16, cardY - 6, cardX + cardW - 16, cardY - 6);
      doc.setTextColor(255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Total due today', cardX + 16, cardY + 8);
      doc.text(`${formatPrice(discountedOneTime)} Kč`, cardX + cardW - 16, cardY + 8, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(255, 180, 170);
      doc.text('Recurring after discount', cardX + 16, cardY + 26);
      doc.text(`${formatPrice(discountedMonthly)} Kč/mo`, cardX + cardW - 16, cardY + 26, { align: 'right' });
    } else {
      doc.setDrawColor(80, 100, 140);
      doc.line(cardX + 16, cardY - 4, cardX + cardW - 16, cardY - 4);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...CORAL);
      doc.text('Total due today', cardX + 16, cardY + 12);
      doc.setTextColor(255);
      doc.text(`${formatPrice(grandTotalOneTime)} Kč`, cardX + cardW - 16, cardY + 12, { align: 'right' });
    }

    // Notes column left of totals card
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('What happens next', M, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const next = doc.splitTextToSize(
      '1. Accept this quote and pay the deposit.\n2. Discovery call within 48 hours.\n3. Design proofs in 5–7 business days.\n4. Build & QA, then launch.\n\nAll figures exclude VAT. Hosting is billed annually in advance.',
      cardX - M - 24,
    );
    doc.text(next, M, y + 28);

    y += cardH + 24;

    // ---------- Grant estimate (indicative) ----------
    if (grantRate > 0) {
      ensureSpace(70);
      doc.setFillColor(238, 243, 252);
      doc.roundedRect(M, y, pageW - M * 2, 54, 8, 8, 'F');
      doc.setTextColor(...INK);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Digitalisation grant estimate — ${grantRate}% support rate`, M + 14, y + 20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(
        `Estimated grant contribution: ${formatPrice(grantAmount)} Kč   |   Your share after the grant: ${formatPrice(netAfterGrant)} Kč`,
        M + 14,
        y + 36,
      );
      doc.setFontSize(8);
      doc.text(
        'Indicative only. The support rate and eligibility are decided by the grant provider; this quote is payable in full unless a grant is awarded.',
        M + 14,
        y + 48,
      );
      y += 70;
    }

    // ---------- Signature / legal strip ----------
    ensureSpace(60);
    doc.setDrawColor(...LINE);
    doc.line(M, y, pageW - M, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    const legalIntro = doc.splitTextToSize(
      'By accepting this quote you agree to FastMedia.Pro\'s Terms of Service, Privacy Policy, GDPR processing terms, Cookie Policy, Refund Policy and Data Processing Agreement linked in the footer of every page. This proposal is valid for 14 days from the issue date.',
      pageW - M * 2,
    );
    doc.text(legalIntro, M, y);

    // ---------- Repaginate footers with real total ----------
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      // Clear previous footer area in case placeholder was drawn
      doc.setFillColor(255, 255, 255);
      doc.rect(0, pageH - 80, pageW, 80, 'F');
      drawFooter(p, totalPages);
    }

    return { doc, quoteId };
  };

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);
  const [lastBuiltQuoteId, setLastBuiltQuoteId] = useState<string>('');

  const previewQuote = async () => {
    setPdfPreviewLoading(true);
    try {
      const { doc, quoteId } = await buildQuotePdf();
      const url = doc.output('bloburl') as unknown as string;
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      setLastBuiltQuoteId(quoteId);
      setPdfPreviewUrl(url);
    } catch (e) {
      console.error(e);
      toast({ title: lang === 'cs' ? 'Náhled se nepodařilo vytvořit' : lang === 'de' ? 'Vorschau fehlgeschlagen' : 'Preview failed', variant: 'destructive' });
    } finally {
      setPdfPreviewLoading(false);
    }
  };

  const exportQuote = async () => {
    const { doc, quoteId } = await buildQuotePdf();
    doc.save(`fastmedia-quote-${quoteId}.pdf`);
    toast({ title: lang === 'cs' ? 'PDF staženo!' : lang === 'de' ? 'PDF heruntergeladen!' : 'PDF downloaded!' });
  };

  const downloadFromPreview = () => {
    if (!pdfPreviewUrl) return;
    const a = document.createElement('a');
    a.href = pdfPreviewUrl;
    a.download = `fastmedia-quote-${lastBuiltQuoteId || Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const closePreview = () => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    setPdfPreviewUrl(null);
  };


  const payNow = () => {
    if (selectedFeatures.length === 0 && grandTotalOneTime <= BASE_WEBSITE_PRICE) return;
    const nameKey = lang === 'cs' ? 'nameCs' : lang === 'de' ? 'nameDe' : 'nameEn';
    const lineItems: { name: string; amount: number; quantity: number; productId?: string }[] = [
      {
        name: l.baseWebsite,
        amount: BASE_WEBSITE_PRICE * 100,
        quantity: 1,
        productId: 'base_website',
      },
      ...selectedFeatures
        .map(sf => {
          const f = getFeatureById(sf.id);
          if (!f) return null;
          return {
            name: f[nameKey],
            amount: f.oneTimePrice * 100,
            quantity: sf.quantity,
            productId: f.id,
          };
        })
        .filter((x): x is { name: string; amount: number; quantity: number; productId: string } => !!x),
    ];
    if (totalLaborHours > 0) {
      lineItems.push({
        name: `${l.laborCost} (${totalLaborHours} ${l.hours})`,
        amount: laborCost * 100,
        quantity: 1,
        productId: 'labor',
      });
    }
    const hostingAnnual = totalMonthly * 12;
    lineItems.push({
      name: lang === 'cs'
        ? 'Hosting a údržba — 12 měsíců předem'
        : lang === 'de'
        ? 'Hosting & Wartung — 12 Monate im Voraus'
        : 'Hosting & maintenance — 12 months prepaid',
      amount: hostingAnnual * 100,
      quantity: 1,
      productId: 'hosting_annual',
    });

    const totalDiscount = totalAnnualDiscount;
    if (totalDiscount > 0) {
      const discountMinor = totalDiscount * 100;
      const totalMinor = lineItems.reduce((s, l) => s + l.amount * l.quantity, 0);
      if (totalMinor > discountMinor) {
        const ratio = (totalMinor - discountMinor) / totalMinor;
        for (const li of lineItems) li.amount = Math.max(1, Math.round(li.amount * ratio));
      }
    }

    openCheckout({
      cart: lineItems,
      source: 'calculator',
      customerEmail: contactEmail || undefined,
      customerName: contactName || undefined,
      title: lang === 'cs' ? 'Dokončit objednávku' : lang === 'de' ? 'Bestellung abschließen' : 'Complete your order',
      metadata: {
        trade: selectedTrade || '',
        coupon: appliedCoupon?.code || '',
        leadId: leadResult?.leadId || '',
        features: selectedFeatures.map(s => `${s.id}x${s.quantity}`).join(','),
        checkoutTotalToday: String(checkoutTotalToday),
        intent: intentBrief ? JSON.stringify(intentBrief.intent).slice(0, 450) : '',
      },
    });
  };




  const allSteps: Step[] = ['trade', 'features', 'special', 'intent', 'summary'];

  const goNext = () => {
    setDirection(1);
    if (step === 'intent') {
      continueToCheckout();
      return;
    }
    const idx = allSteps.indexOf(step);
    if (idx < allSteps.length - 1) setStep(allSteps[idx + 1]);
  };

  const goBack = () => {
    setDirection(-1);
    const idx = allSteps.indexOf(step);
    if (idx > 0) setStep(allSteps[idx - 1]);
  };

  const stepIndex = allSteps.indexOf(step);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const categories = ['essential', 'marketing', 'advanced', 'premium'] as const;

  const isContactValid = contactName.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) && gdprConsent;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={l.title}
        description={l.subtitle}
        canonical="/calculator"
        pagePath="/calculator"
      />
      <Navbar />

      {/* Header */}
      <div className="gradient-hero text-primary-foreground py-6 pt-24">
        <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2 justify-center">
              <CalcIcon className="w-7 h-7" />
              {l.title}
            </h1>
            <p className="text-primary-foreground/70 text-sm mt-1">{l.subtitle}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {allSteps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: i === stepIndex ? 1.2 : 1 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i <= stepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </motion.div>
                {i < allSteps.length - 1 && (
                  <div className={`w-6 sm:w-12 h-0.5 transition-colors ${i < stepIndex ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              {/* Step 1: Trade Selection */}
              {step === 'trade' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">{l.selectTrade}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {trades.map((trade) => (
                      <motion.button
                        key={trade.id}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setSelectedTrade(trade.id);
                          setDirection(1);
                          setStep('features');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedTrade === trade.id
                            ? 'border-primary bg-primary/5 shadow-elegant'
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                      >
                        <span className="text-2xl block mb-2">{trade.icon}</span>
                        <span className="font-medium text-sm text-foreground">{t(trade.nameKey)}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Feature Selection */}
              {step === 'features' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-3">{l.selectFeatures}</h2>
                  <div className="mb-6 flex items-center justify-between gap-3 p-3 rounded-xl border border-accent/30 bg-accent/5">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {lang === 'cs'
                        ? 'Nechcete odpovídat na další otázky? Přeskočte rovnou na kupón a platbu.'
                        : lang === 'de'
                        ? 'Keine Lust auf weitere Fragen? Direkt zum Gutschein & zur Zahlung.'
                        : "Don't want to answer more questions? Jump straight to the coupon & checkout."}
                    </p>
                    <Button size="sm" variant="outline" onClick={continueToCheckout} className="shrink-0 border-accent/40 text-accent hover:bg-accent/10">
                      <TicketPercent className="w-4 h-4 mr-2" />
                      {lang === 'cs' ? 'Přeskočit' : lang === 'de' ? 'Überspringen' : 'Skip'}
                    </Button>
                  </div>
                  
                  {/* AI suggestions */}
                  {aiSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20"
                    >
                      <p className="font-semibold text-accent text-sm flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4" />
                        {l.suggestedFor}
                      </p>
                      {aiSuggestions.map((s) => {
                        const feature = getFeatureById(s.id);
                        if (!feature || isSelected(s.id)) return null;
                        return (
                          <div key={s.id} className="flex items-center justify-between py-1.5">
                            <div>
                              <span className="text-sm font-medium">{feature.icon} {feature[nameKey]}</span>
                              <span className="text-xs text-muted-foreground ml-2">— {s.reason}</span>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => toggleFeature(s.id)} className="text-xs">
                              <Plus className="w-3 h-3 mr-1" />{l.addFeature}
                            </Button>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchSuggestions}
                    disabled={isLoadingAI}
                    className="mb-6"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoadingAI ? '...' : l.getSuggestions}
                  </Button>

                  {categories.map(cat => {
                    const features = calculatorFeatures.filter(f => f.category === cat);
                    const catLabel = categoryLabels[cat][lang];
                    return (
                      <div key={cat} className="mb-6">
                        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">{catLabel}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {features.map(feature => {
                            const selected = isSelected(feature.id);
                            const qty = getQuantity(feature.id);
                            return (
                              <motion.div
                                key={feature.id}
                                layout
                                whileHover={{ scale: 1.01 }}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  selected
                                    ? 'border-primary bg-primary/5 shadow-elegant'
                                    : 'border-border bg-card hover:border-primary/20'
                                }`}
                                onClick={() => toggleFeature(feature.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-lg">{feature.icon}</span>
                                      <span className="font-semibold text-sm text-foreground">{feature[nameKey]}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{feature[descKey]}</p>
                                    <div className="flex gap-3 mt-2 text-xs items-center">
                                      <span className="font-semibold text-foreground">{formatPrice(feature.oneTimePrice)} Kč</span>
                                      {feature.monthlyPrice > 0 && (
                                        <span className="text-muted-foreground">+{formatPrice(feature.monthlyPrice)} Kč{l.perMonth}</span>
                                      )}
                                      <Link
                                        to={`/feature/${feature.id}`}
                                        className="text-primary hover:underline ml-auto"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        {lang === 'cs' ? 'Více info →' : lang === 'de' ? 'Mehr Info →' : 'Learn more →'}
                                      </Link>
                                    </div>
                                  </div>
                                  {selected && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs"
                                    >
                                      ✓
                                    </motion.div>
                                  )}
                                </div>
                                {/* Quantity controls for multiple */}
                                {selected && feature.allowMultiple && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex items-center gap-3 mt-3 pt-3 border-t border-border"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(feature.id, -1)} aria-label="Decrease quantity">
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="text-sm font-bold w-8 text-center">{qty}</span>
                                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(feature.id, 1)} aria-label="Increase quantity">
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                    <span className="text-xs text-muted-foreground">{l.quantity}</span>
                                  </motion.div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 3: Special Request */}
              {step === 'special' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">{l.specialTitle}</h2>
                  <p className="text-muted-foreground text-sm mb-6">{l.canChange}</p>

                  <ModuleAdvisor
                    trade={selectedTrade}
                    selectedModules={selectedFeatures.map(f => f.id)}
                    modules={calculatorFeatures}
                    ideaPrompts={getTradePrompts(selectedTrade, lang)}
                    contactName={contactName}
                    contactEmail={contactEmail}
                    isSelected={isSelected}
                    onToggleModule={toggleFeature}
                    onSummary={(summary) => setSpecialRequest(summary)}
                  />
                </div>
              )}

              {/* Step 4: Static checkout details */}
              {step === 'intent' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                        {lang === 'cs' ? 'Volitelné detaily před objednávkou' : lang === 'de' ? 'Optionale Details vor der Bestellung' : 'Optional details before checkout'}
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {lang === 'cs'
                          ? 'Toto je pevný formulář bez AI opakování. Můžete jej přeskočit a rovnou zaplatit.'
                          : lang === 'de'
                          ? 'Dies ist ein statisches Formular ohne KI-Schleife. Sie können direkt zur Zahlung springen.'
                          : 'This is a static form with no AI question loop. You can skip it and go straight to checkout.'}
                      </p>
                    </div>
                    <Button variant="outline" onClick={continueToCheckout} className="shrink-0">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {lang === 'cs' ? 'Přeskočit a zaplatit' : lang === 'de' ? 'Überspringen und bezahlen' : 'Skip to checkout'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-4 p-5 rounded-xl bg-card border border-border shadow-card">
                      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        {lang === 'cs' ? 'Projektové detaily' : lang === 'de' ? 'Projektdetails' : 'Project details'}
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="project-timeline">{lang === 'cs' ? 'Preferovaný start' : lang === 'de' ? 'Gewünschter Start' : 'Preferred start'}</Label>
                        <Input id="project-timeline" type="date" value={projectTimeline} onChange={e => setProjectTimeline(e.target.value)} className="h-11" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project-priority">{lang === 'cs' ? 'Hlavní priorita' : lang === 'de' ? 'Hauptpriorität' : 'Main priority'}</Label>
                        <select
                          id="project-priority"
                          value={projectPriority}
                          onChange={e => setProjectPriority(e.target.value)}
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">{lang === 'cs' ? 'Vyberte prioritu' : lang === 'de' ? 'Priorität wählen' : 'Select a priority'}</option>
                          <option value="More enquiries">{lang === 'cs' ? 'Více poptávek' : lang === 'de' ? 'Mehr Anfragen' : 'More enquiries'}</option>
                          <option value="Online bookings">{lang === 'cs' ? 'Online rezervace' : lang === 'de' ? 'Online-Buchungen' : 'Online bookings'}</option>
                          <option value="Sell services online">{lang === 'cs' ? 'Prodej služeb online' : lang === 'de' ? 'Services online verkaufen' : 'Sell services online'}</option>
                          <option value="Brand credibility">{lang === 'cs' ? 'Důvěryhodnost značky' : lang === 'de' ? 'Markenvertrauen' : 'Brand credibility'}</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project-budget">{lang === 'cs' ? 'Rozpočtový rámec' : lang === 'de' ? 'Budgetrahmen' : 'Budget range'}</Label>
                        <select
                          id="project-budget"
                          value={projectBudget}
                          onChange={e => setProjectBudget(e.target.value)}
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">{lang === 'cs' ? 'Volitelné' : lang === 'de' ? 'Optional' : 'Optional'}</option>
                          <option value="Starter">Starter</option>
                          <option value="Growth">Growth</option>
                          <option value="Premium">Premium</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                        <Checkbox id="content-ready" checked={contentReady} onCheckedChange={(checked) => setContentReady(checked === true)} />
                        <Label htmlFor="content-ready" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                          {lang === 'cs' ? 'Mám připravené texty, fotky nebo logo.' : lang === 'de' ? 'Texte, Fotos oder Logo sind bereit.' : 'I already have copy, photos, or a logo ready.'}
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project-notes">{lang === 'cs' ? 'Poznámky' : lang === 'de' ? 'Notizen' : 'Notes'}</Label>
                        <textarea
                          id="project-notes"
                          value={projectNotes}
                          onChange={e => setProjectNotes(e.target.value.slice(0, 1000))}
                          rows={4}
                          placeholder={lang === 'cs' ? 'Cokoliv důležitého k objednávce…' : lang === 'de' ? 'Alles Wichtige zur Bestellung…' : 'Anything important for the order…'}
                          className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 p-5 rounded-xl bg-card border border-border shadow-card">
                      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        {lang === 'cs' ? 'Uložit nabídku' : lang === 'de' ? 'Angebot speichern' : 'Save the quote'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {lang === 'cs'
                          ? 'Volitelné. Pokud nechcete nabídku uložit, použijte tlačítko přeskočit.'
                          : lang === 'de'
                          ? 'Optional. Wenn Sie das Angebot nicht speichern möchten, überspringen Sie diesen Schritt.'
                          : 'Optional. If you do not want to save the quote, use the skip button.'}
                      </p>

                      <div className="space-y-2">
                        <Label htmlFor="lead-name" className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {lang === 'cs' ? 'Jméno' : lang === 'de' ? 'Name' : 'Name'} *
                        </Label>
                        <Input id="lead-name" value={contactName} onChange={e => setContactName(e.target.value)} placeholder={l.namePlaceholder} className="h-12" maxLength={100} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lead-email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          E-Mail *
                        </Label>
                        <Input id="lead-email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder={l.emailPlaceholder} className="h-12" maxLength={255} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lead-phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {lang === 'cs' ? 'Telefon' : lang === 'de' ? 'Telefon' : 'Phone'}
                        </Label>
                        <Input id="lead-phone" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder={l.phonePlaceholder} className="h-12" maxLength={30} />
                      </div>

                      <div className="flex items-start gap-3 pt-2">
                        <Checkbox id="gdpr-consent" checked={gdprConsent} onCheckedChange={(checked) => setGdprConsent(checked === true)} />
                        <Label htmlFor="gdpr-consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                          <Shield className="w-3.5 h-3.5 inline mr-1 text-primary" />
                          {l.gdprLabel}
                        </Label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Button variant="outline" onClick={continueToCheckout} className="h-12">
                          <CreditCard className="w-4 h-4 mr-2" />
                          {lang === 'cs' ? 'Pokračovat bez uložení' : lang === 'de' ? 'Ohne Speichern weiter' : 'Continue without saving'}
                        </Button>
                        <Button onClick={submitLead} disabled={!isContactValid || isSubmitting} className="h-12 gradient-primary text-primary-foreground">
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                              {l.submittingLead}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="w-4 h-4" />
                              {lang === 'cs' ? 'Uložit a zaplatit' : lang === 'de' ? 'Speichern und bezahlen' : 'Save and checkout'}
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Summary */}
              {step === 'summary' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">{l.summaryTitle}</h2>

                  {/* Promo coupon — copy & countdown (top of summary) */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-5 shadow-lg"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/20">
                          <TicketPercent className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-display text-base font-bold text-foreground">
                            {lang === 'cs'
                              ? 'Sleva 90 % — platí jen krátce'
                              : lang === 'de'
                              ? '90 % Rabatt — nur kurze Zeit'
                              : '90% off — limited time offer'}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {lang === 'cs'
                              ? 'Zkopírujte kód a vložte ho do pole níže před vypršením času.'
                              : lang === 'de'
                              ? 'Kopieren Sie den Code und fügen Sie ihn unten ein, bevor die Zeit abläuft.'
                              : 'Copy the code and paste it into the field below before time runs out.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={copyPromoCode}
                          className="group inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-background px-3 py-2 font-mono text-sm font-bold text-accent transition hover:bg-accent/10"
                        >
                          {PROMO_CODE}
                          {promoCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 opacity-70 group-hover:opacity-100" />}
                        </button>
                        <div className="rounded-lg bg-background/90 border border-border px-3 py-2 text-center">
                          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                            {lang === 'cs' ? 'Zbývá' : lang === 'de' ? 'Verbleibend' : 'Ends in'}
                          </span>
                          <span className="font-display text-base font-bold text-accent tabular-nums">{formatCountdown(couponSecondsLeft)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>


                  {/* Lead score badge */}
                  {leadResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-4"
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{l.scoreLabel}</p>
                        <p className="text-2xl font-display font-bold text-foreground">{leadResult.score}/100</p>
                        <p className="text-xs font-semibold text-primary capitalize">{leadResult.classification.replace('_', ' ')}</p>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="space-y-3">
                    {/* Base */}
                    <div className="rounded-lg bg-muted/50 border border-border/60 overflow-hidden">
                      <div className="flex justify-between items-center p-3">
                        <span className="text-sm font-medium">🌐 {l.baseWebsite}</span>
                        <span className="font-bold text-sm">{formatPrice(BASE_WEBSITE_PRICE)} Kč</span>
                      </div>
                      <div className="px-3 pb-3 pt-0">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                          {lang === 'cs' ? 'V ceně základního webu' : lang === 'de' ? 'Im Basispaket enthalten' : "What's included"}
                        </p>
                        <ul className="grid sm:grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-foreground/90">
                          {(lang === 'cs'
                            ? [
                                'Až 5 stránek (Úvod, O nás, Služby, Galerie, Kontakt)',
                                'Responzivní design pro mobil i tablet',
                                'SSL certifikát (HTTPS)',
                                '12 měsíců hostingu předem',
                                'Základní on-page SEO',
                                'GDPR cookie lišta',
                                'Kontaktní údaje a mapa',
                                'Rychlé načítání a optimalizace',
                              ]
                            : lang === 'de'
                            ? [
                                'Bis zu 5 Seiten (Start, Über uns, Leistungen, Galerie, Kontakt)',
                                'Responsives Design für Mobile & Tablet',
                                'SSL-Zertifikat (HTTPS)',
                                '12 Monate Hosting im Voraus',
                                'Grundlegende On-Page-SEO',
                                'DSGVO-Cookie-Banner',
                                'Kontaktdaten & Karte',
                                'Schnelle Ladezeit & Optimierung',
                              ]
                            : [
                                'Up to 5 pages (Home, About, Services, Gallery, Contact)',
                                'Fully responsive mobile & tablet design',
                                'SSL certificate (HTTPS)',
                                '12 months hosting prepaid',
                                'Basic on-page SEO setup',
                                'GDPR cookie banner',
                                'Business contact details & map',
                                'Performance optimisation',
                              ]
                          ).map((item) => (
                            <li key={item} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>


                    {/* Features */}
                    {selectedFeatures.map(sf => {
                      const feature = getFeatureById(sf.id);
                      if (!feature) return null;
                      return (
                        <motion.div
                          key={sf.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-between items-center p-3 rounded-lg bg-card border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <span>{feature.icon}</span>
                            <span className="text-sm font-medium">{feature[nameKey]}</span>
                            {sf.quantity > 1 && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">x{sf.quantity}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-bold text-sm">{formatPrice(feature.oneTimePrice * sf.quantity)} Kč</span>
                              {feature.monthlyPrice > 0 && (
                                <span className="text-xs text-muted-foreground block">
                                  +{formatPrice(feature.monthlyPrice * sf.quantity)} Kč{l.perMonth}
                                </span>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => toggleFeature(sf.id)}
                              aria-label="Remove feature"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}

                    {selectedFeatures.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-8">{l.noFeatures}</p>
                    )}

                    {/* Labor */}
                    {totalLaborHours > 0 && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">⚙️ {l.laborCost} ({totalLaborHours} {l.hours})</span>
                        <span className="font-bold text-sm">{formatPrice(laborCost)} Kč</span>
                      </div>
                    )}

                    <div className="mt-4 p-4 rounded-xl border-2 border-accent/40 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent shadow-md">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <TicketPercent className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">
                              {lang === 'cs' ? 'Sleva 90 % — platí jen 3 hodiny' : lang === 'de' ? '90 % Rabatt — nur 3 Stunden gültig' : '90% off — valid for only 3 hours'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {lang === 'cs'
                                ? 'Zkopírujte kód níže a vložte ho do pole. Cena se okamžitě přepočítá.'
                                : lang === 'de'
                                ? 'Kopieren Sie den Code unten und fügen Sie ihn in das Feld ein. Der Preis wird sofort neu berechnet.'
                                : 'Copy the code below and paste it into the field. Your total will update instantly.'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <button
                            type="button"
                            onClick={copyPromoCode}
                            className="group flex-1 inline-flex items-center justify-between gap-3 rounded-lg border-2 border-dashed border-accent/60 bg-background px-4 py-3 font-mono text-base font-bold text-accent transition hover:bg-accent/10"
                          >
                            <span className="tracking-wider">{PROMO_CODE}</span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-muted-foreground group-hover:text-accent">
                              {promoCopied
                                ? (lang === 'cs' ? 'Zkopírováno' : lang === 'de' ? 'Kopiert' : 'Copied')
                                : (lang === 'cs' ? 'Kopírovat' : lang === 'de' ? 'Kopieren' : 'Copy')}
                              {promoCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </span>
                          </button>
                          <Button
                            size="sm"
                            onClick={() => { setCouponInput(PROMO_CODE); setTimeout(applyCoupon, 50); }}
                            disabled={couponLoading || !!appliedCoupon}
                            className="h-11 sm:h-auto"
                          >
                            {appliedCoupon
                              ? (lang === 'cs' ? 'Uplatněno' : lang === 'de' ? 'Angewendet' : 'Applied')
                              : (lang === 'cs' ? 'Použít kód' : lang === 'de' ? 'Code anwenden' : 'Use code')}
                          </Button>
                          <div className="rounded-lg bg-background/90 border border-border px-3 py-2 text-center shrink-0">
                            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                              {lang === 'cs' ? 'Zbývá' : lang === 'de' ? 'Verbleibend' : 'Time left'}
                            </span>
                            <span className="font-display text-base font-bold text-accent tabular-nums">{formatCountdown(couponSecondsLeft)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coupon input */}
                    <div className="mt-4 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5">
                      {!appliedCoupon ? (
                        <div className="flex gap-2 items-center">
                          <TicketPercent className="w-4 h-4 text-primary shrink-0" />
                          <Input
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder={lang === 'cs' ? 'Slevový kód' : lang === 'de' ? 'Gutscheincode' : 'Discount code'}
                            className="h-9 font-mono text-sm"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                          />
                          <Button size="sm" onClick={applyCoupon} disabled={!couponInput.trim() || couponLoading}>
                            {couponLoading ? '...' : (lang === 'cs' ? 'Použít' : lang === 'de' ? 'Anwenden' : 'Apply')}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                            <span className="font-mono text-sm font-bold">{appliedCoupon.code}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              −{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `${formatPrice(appliedCoupon.discount_value)} Kč`}
                            </span>
                          </div>
                          <Button size="icon" variant="ghost" onClick={removeCoupon} className="h-7 w-7" aria-label="Remove coupon">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="mt-4 p-5 rounded-xl gradient-primary text-primary-foreground">
                      {appliedCoupon && oneTimeDiscount > 0 && (
                        <div className="flex justify-between items-center mb-1 opacity-80 text-sm">
                          <span>{l.totalOneTime}</span>
                          <span className="line-through">{formatPrice(grandTotalOneTime)} Kč</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{appliedCoupon ? (lang === 'cs' ? 'Jednorázově po slevě' : lang === 'de' ? 'Einmalig nach Rabatt' : 'One-time after discount') : l.totalOneTime}</span>
                        <span className="text-xl font-display font-bold">{formatPrice(discountedOneTime)} Kč</span>
                      </div>
                      {appliedCoupon && monthlyDiscount > 0 && (
                        <div className="flex justify-between items-center mb-1 opacity-80 text-sm">
                          <span>{lang === 'cs' ? 'Hosting 12 měsíců' : lang === 'de' ? 'Hosting 12 Monate' : '12 months hosting'}</span>
                          <span className="line-through">{formatPrice(annualHosting)} Kč</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center opacity-90">
                        <span className="text-sm">{lang === 'cs' ? 'Hosting 12 měsíců předem' : lang === 'de' ? 'Hosting 12 Monate im Voraus' : '12 months hosting prepaid'}</span>
                        <span className="text-lg font-bold">{formatPrice(discountedAnnualHosting)} Kč</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-primary-foreground/20 flex justify-between items-center">
                        <span className="font-semibold">{lang === 'cs' ? 'K úhradě dnes' : lang === 'de' ? 'Heute zu zahlen' : 'Total due today'}</span>
                        <span className="text-2xl font-display font-bold">{formatPrice(checkoutTotalToday)} Kč</span>
                      </div>
                      {appliedCoupon && (oneTimeDiscount > 0 || monthlyDiscount > 0) && (
                        <div className="mt-2 pt-2 border-t border-primary-foreground/20 text-xs opacity-90">
                          {lang === 'cs' ? 'Celková sleva dnes' : lang === 'de' ? 'Gesamtersparnis heute' : 'Total saved today'}: {formatPrice(totalAnnualDiscount)} Kč
                        </div>
                      )}
                    </div>

                    {/* Digitalisation grant estimator */}
                    <div id="grant" className="mt-4 p-5 rounded-xl border-2 border-primary/30 bg-primary/5 scroll-mt-24">
                      <p className="font-display text-base font-bold text-foreground">
                        {lang === 'cs' ? 'Odhad dotace na digitalizaci' : lang === 'de' ? 'Schätzung des Digitalisierungszuschusses' : 'Digitalisation grant estimate'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lang === 'cs'
                          ? 'Posuňte na míru podpory, kterou vám poskytovatel nabídne (až 85 %). Dotace se počítá z jednorázové ceny za web.'
                          : lang === 'de'
                          ? 'Stellen Sie die Förderquote ein, die Ihnen angeboten wird (bis zu 85 %). Der Zuschuss gilt für die einmaligen Kosten.'
                          : 'Slide to the support rate you are offered (up to 85%). The grant applies to the one-off build cost.'}
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <Slider
                          value={[grantRate]}
                          onValueChange={(v) => setGrantRate(Math.min(MAX_GRANT_RATE, Math.max(0, v[0])))}
                          min={0}
                          max={MAX_GRANT_RATE}
                          step={5}
                          className="flex-1"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <Input
                            type="number"
                            min={0}
                            max={MAX_GRANT_RATE}
                            value={grantRate}
                            onChange={(e) => {
                              const n = Number(e.target.value);
                              setGrantRate(Number.isFinite(n) ? Math.min(MAX_GRANT_RATE, Math.max(0, Math.round(n))) : 0);
                            }}
                            className="h-9 w-20 text-sm"
                          />
                          <span className="text-sm font-semibold text-muted-foreground">%</span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {[0, 30, 50, 70, 85].map((preset) => (
                          <Button
                            key={preset}
                            type="button"
                            size="sm"
                            variant={grantRate === preset ? 'default' : 'outline'}
                            className="h-8 px-3 text-xs"
                            onClick={() => setGrantRate(preset)}
                          >
                            {preset}%
                          </Button>
                        ))}
                      </div>

                      {grantRate > 0 && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-lg bg-background border border-border p-3">
                            <p className="text-xs text-muted-foreground">
                              {lang === 'cs' ? 'Odhadovaný příspěvek dotace' : lang === 'de' ? 'Geschätzter Zuschuss' : 'Estimated grant contribution'}
                            </p>
                            <p className="font-display text-lg font-bold text-accent">−{formatPrice(grantAmount)} Kč</p>
                          </div>
                          <div className="rounded-lg bg-background border border-border p-3">
                            <p className="text-xs text-muted-foreground">
                              {lang === 'cs' ? 'Váš podíl po dotaci' : lang === 'de' ? 'Ihr Anteil nach dem Zuschuss' : 'Your share after the grant'}
                            </p>
                            <p className="font-display text-lg font-bold text-foreground">{formatPrice(netAfterGrant)} Kč</p>
                          </div>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-muted-foreground">
                        {lang === 'cs'
                          ? 'Jde pouze o orientační odhad. Míru podpory i nárok posuzuje poskytovatel dotace; částka k úhradě výše se nemění.'
                          : lang === 'de'
                          ? 'Nur ein Richtwert. Förderquote und Anspruch entscheidet der Fördergeber; der oben zu zahlende Betrag bleibt unverändert.'
                          : 'This is an indication only. The support rate and eligibility are decided by the grant provider, and the amount payable above is unchanged.'}{' '}
                        <Link to="/grants" className="text-primary underline underline-offset-2">
                          {lang === 'cs' ? 'Průvodce dotacemi' : lang === 'de' ? 'Förderleitfaden' : 'Read the grant guide'}
                        </Link>
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-4">{l.canChange}</p>
                  </div>

                  {/* Export actions */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button onClick={payNow} className="gradient-primary text-primary-foreground font-semibold">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {lang === 'cs'
                        ? `Zaplatit ${formatPrice(checkoutTotalToday)} Kč`
                        : lang === 'de'
                        ? `Jetzt ${formatPrice(checkoutTotalToday)} Kč bezahlen`
                        : `Pay ${formatPrice(checkoutTotalToday)} CZK now`}
                    </Button>
                    <Button onClick={previewQuote} variant="outline" disabled={pdfPreviewLoading}>
                      <Eye className="w-4 h-4 mr-2" />
                      {pdfPreviewLoading
                        ? (lang === 'cs' ? 'Načítám…' : lang === 'de' ? 'Lädt…' : 'Loading…')
                        : (lang === 'cs' ? 'Náhled PDF' : lang === 'de' ? 'PDF-Vorschau' : 'Preview PDF')}
                    </Button>
                    <Button onClick={exportQuote} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {l.exportPdf}
                    </Button>
                    <Link to="/#contact">
                      <Button variant="outline">
                        <Send className="w-4 h-4 mr-2" />
                        {l.sendQuote}
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {lang === 'cs'
                      ? 'Cena zahrnuje 12 měsíců hostingu předem. Slevový kód můžete použít výše.'
                      : lang === 'de'
                      ? 'Preis enthält 12 Monate Hosting im Voraus. Gutscheincode oben anwendbar.'
                      : 'Price includes 12 months of hosting prepaid. Apply a coupon above.'}
                  </p>

                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex flex-wrap justify-between gap-3 mt-8">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={step === 'trade'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {l.back}
            </Button>
            <div className="flex flex-wrap gap-3 ml-auto">
              {step !== 'summary' && step !== 'trade' && (
                <Button
                  variant="outline"
                  onClick={continueToCheckout}
                  className="border-accent/40 text-accent hover:bg-accent/10"
                >
                  <TicketPercent className="w-4 h-4 mr-2" />
                  {lang === 'cs'
                    ? 'Přeskočit otázky → kupón a platba'
                    : lang === 'de'
                    ? 'Fragen überspringen → Gutschein & Zahlung'
                    : 'Skip questions → coupon & checkout'}
                </Button>
              )}
              {step !== 'summary' && (
                <Button
                  onClick={goNext}
                  disabled={step === 'trade' && !selectedTrade}
                >
                  {l.next}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
            {step === 'summary' && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFeatures([]);
                  setSelectedTrade('');
                  setStep('trade');
                  setAiSuggestions([]);
                  setSpecialRequest('');
                  setSpecialResponse(null);
                  setContactName('');
                  setContactEmail('');
                  setContactPhone('');
                  setGdprConsent(false);
                  setLeadResult(null);
                  setProjectTimeline('');
                  setProjectPriority('');
                  setProjectBudget('');
                  setContentReady(false);
                  setProjectNotes('');
                  setIntentBrief(null);
                  setAppliedCoupon(null);
                  setCouponInput('');
                  setCouponDeadline(null);
                  setCouponSecondsLeft(PROMO_WINDOW_SECONDS);
                }}
              >
                {l.startOver}
              </Button>
            )}
          </div>
        </div>

        {/* Sticky price sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:w-80 shrink-0"
        >
          <div className="sticky top-24 p-5 rounded-2xl bg-card border border-border shadow-card">
            <h3 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <CalcIcon className="w-5 h-5 text-primary" />
              {lang === 'cs' ? 'Živý přehled' : lang === 'de' ? 'Live-Übersicht' : 'Live Overview'}
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{l.baseWebsite}</span>
                <span className="font-semibold">{formatPrice(BASE_WEBSITE_PRICE)} Kč</span>
              </div>
              {selectedFeatures.map(sf => {
                const feature = getFeatureById(sf.id);
                if (!feature) return null;
                return (
                  <motion.div
                    key={sf.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between"
                  >
                    <span className="text-muted-foreground truncate mr-2">
                      {feature.icon} {feature[nameKey]}
                      {sf.quantity > 1 && <span className="text-xs"> x{sf.quantity}</span>}
                    </span>
                    <span className="font-semibold whitespace-nowrap">{formatPrice(feature.oneTimePrice * sf.quantity)} Kč</span>
                  </motion.div>
                );
              })}
              {totalLaborHours > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">⚙️ {l.laborCost}</span>
                  <span className="font-semibold">{formatPrice(laborCost)} Kč</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">{l.totalOneTime}</span>
                <motion.span
                  key={grandTotalOneTime}
                  initial={{ scale: 1.3, color: 'hsl(var(--accent))' }}
                  animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                  className="text-xl font-display font-bold"
                >
                  {formatPrice(grandTotalOneTime)} Kč
                </motion.span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">{l.totalMonthly}</span>
                <motion.span
                  key={totalMonthly}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-bold text-muted-foreground"
                >
                  {formatPrice(totalMonthly)} Kč{l.perMonth}
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
      {checkoutElement}
      <Dialog open={!!pdfPreviewUrl} onOpenChange={(o) => { if (!o) closePreview(); }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-border">
            <DialogTitle>
              {lang === 'cs' ? 'Náhled vaší nabídky' : lang === 'de' ? 'Vorschau Ihres Angebots' : 'Quote PDF preview'}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {lang === 'cs'
                ? 'Zkontrolujte šablonu, poté stáhněte finální PDF.'
                : lang === 'de'
                ? 'Überprüfen Sie die Vorlage und laden Sie dann das finale PDF herunter.'
                : 'Review the template, then download the final PDF.'}
            </p>
          </DialogHeader>
          <div className="flex-1 bg-muted overflow-hidden">
            {pdfPreviewUrl && (
              <iframe
                src={pdfPreviewUrl}
                title="Quote preview"
                className="w-full h-full border-0"
              />
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button variant="outline" onClick={closePreview}>
              {lang === 'cs' ? 'Zavřít' : lang === 'de' ? 'Schließen' : 'Close'}
            </Button>
            <Button onClick={downloadFromPreview} className="gradient-primary text-primary-foreground">
              <Download className="w-4 h-4 mr-2" />
              {lang === 'cs' ? 'Stáhnout PDF' : lang === 'de' ? 'PDF herunterladen' : 'Download PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalculatorPage;
