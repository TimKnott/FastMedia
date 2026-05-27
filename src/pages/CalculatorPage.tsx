import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mic, MicOff, Plus, Minus, Trash2, Sparkles, Download, Send, MessageSquare, Calculator as CalcIcon, ChevronRight, User, Mail, Phone, Shield, CheckCircle2, TrendingUp, TicketPercent, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  calculatorFeatures,
  BASE_WEBSITE_PRICE,
  BASE_HOSTING_PRICE,
  LABOR_RATE,
  categoryLabels,
  type CalculatorFeature,
} from '@/data/calculatorFeatures';
import { trades } from '@/data/trades';
import { getTradePrompts } from '@/data/tradeIdeaPrompts';

type SelectedFeature = { id: string; quantity: number };
type Step = 'trade' | 'features' | 'special' | 'intent' | 'contact' | 'summary';
type IntentTurn = { key: string; question: string; answer: string };

const CalculatorPage = () => {
  const { language, t } = useLanguage();
  const [step, setStep] = useState<Step>('trade');
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const [specialRequest, setSpecialRequest] = useState('');
  const [specialResponse, setSpecialResponse] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
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

  // Conversational intake state
  const [intentHistory, setIntentHistory] = useState<IntentTurn[]>([]);
  const [intentCurrent, setIntentCurrent] = useState<{ key: string; question: string; suggestions?: string[] } | null>(null);
  const [intentListening, setIntentListening] = useState(false);
  const [intentAnswer, setIntentAnswer] = useState('');
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentBrief, setIntentBrief] = useState<{ summary: string; intent: Record<string, unknown> } | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applies_to: 'one_time' | 'monthly' | 'both';
    oneTimeDiscount: number;
    monthlyDiscount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const lang = language as 'cs' | 'en' | 'de';

  const formatPrice = (value: number): string => {
    if (lang === 'en') return value.toLocaleString('en-US');
    return value.toLocaleString('de-DE');
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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'cs' ? 'cs-CZ' : lang === 'de' ? 'de-DE' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
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

  // Conversational intake
  const fetchNextIntent = useCallback(async (history: IntentTurn[]) => {
    setIntentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('intake-conversation', {
        body: {
          language: lang,
          trade: selectedTrade,
          selectedFeatures,
          specialRequest: specialRequest.trim() || undefined,
          quoteOneTime: grandTotalOneTime,
          quoteMonthly: totalMonthly,
          history,
        },
      });
      if (error) throw error;
      if (data?.done) {
        setIntentBrief({ summary: data.summary, intent: data.intent });
        setIntentCurrent(null);
      } else if (data?.question) {
        setIntentCurrent({ key: data.key, question: data.question, suggestions: Array.isArray(data.suggestions) ? data.suggestions : [] });
        setIntentAnswer('');
      }
    } catch (e) {
      console.error(e);
      // Soft-fail: let the user proceed even if AI is down
      setIntentCurrent(null);
      setIntentBrief({ summary: '', intent: {} });
    } finally {
      setIntentLoading(false);
    }
  }, [lang, selectedTrade, selectedFeatures, specialRequest, grandTotalOneTime, totalMonthly]);

  const submitIntentAnswer = useCallback((override?: string) => {
    if (!intentCurrent || intentLoading) return;
    const text = (override ?? intentAnswer).trim();
    if (!text) return;
    const next: IntentTurn[] = [
      ...intentHistory,
      { key: intentCurrent.key, question: intentCurrent.question, answer: text },
    ];
    setIntentHistory(next);
    setIntentCurrent(null);
    setIntentAnswer('');
    fetchNextIntent(next);
  }, [intentCurrent, intentAnswer, intentLoading, intentHistory, fetchNextIntent]);

  const skipIntent = useCallback(() => {
    if (!intentCurrent || intentLoading) return;
    const next: IntentTurn[] = [
      ...intentHistory,
      { key: intentCurrent.key, question: intentCurrent.question, answer: 'Skipped' },
    ];
    setIntentHistory(next);
    setIntentCurrent(null);
    setIntentAnswer('');
    fetchNextIntent(next);
  }, [intentCurrent, intentLoading, intentHistory, fetchNextIntent]);

  const startIntentVoice = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SR: typeof window.SpeechRecognition | undefined =
      // @ts-expect-error vendor prefix
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast({ title: 'Voice input not supported', description: 'Please use Chrome, Edge or Safari.', variant: 'destructive' });
      return;
    }
    const rec = new SR();
    rec.lang = language === 'cs' ? 'cs-CZ' : language === 'de' ? 'de-DE' : 'en-GB';
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setIntentAnswer((prev) => (finalText || interim ? (finalText || interim) : prev));
    };
    rec.onerror = () => setIntentListening(false);
    rec.onend = () => setIntentListening(false);
    try {
      rec.start();
      setIntentListening(true);
    } catch {
      setIntentListening(false);
    }
  }, [language]);

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
          intent: intentBrief?.intent ?? null,
          intentSummary: intentBrief?.summary ?? null,
          intentTranscript: intentHistory.length ? intentHistory : null,
          coupon: appliedCoupon ? { code: appliedCoupon.code, oneTimeDiscount, monthlyDiscount } : null,
        },
      });
      if (error) throw error;
      setLeadResult({ score: data.score, classification: data.classification, leadId: data.leadId });
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

  // Export quote as a polished PDF
  const exportQuote = () => {
    const tradeObj = trades.find(t => t.id === selectedTrade);
    const tradeName = tradeObj ? t(tradeObj.nameKey) : selectedTrade;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 50;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('FastMedia.Pro', 40, y);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(l.title, pageW - 40, y, { align: 'right' });
    y += 14;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(new Date().toLocaleDateString(), pageW - 40, y, { align: 'right' });
    doc.setTextColor(0);

    y += 28;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${l.selectTrade}: `, 40, y);
    doc.setFont('helvetica', 'normal');
    doc.text(tradeName, 160, y);
    if (contactName) { y += 14; doc.setFont('helvetica', 'bold'); doc.text('Prepared for: ', 40, y); doc.setFont('helvetica', 'normal'); doc.text(contactName, 160, y); }
    if (contactEmail) { y += 14; doc.setFont('helvetica', 'bold'); doc.text('Email: ', 40, y); doc.setFont('helvetica', 'normal'); doc.text(contactEmail, 160, y); }

    y += 26;
    doc.setDrawColor(220);
    doc.line(40, y, pageW - 40, y);
    y += 18;

    const row = (label: string, value: string, bold = false) => {
      if (y > 760) { doc.addPage(); y = 50; }
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 11 : 10);
      const lines = doc.splitTextToSize(label, pageW - 200);
      doc.text(lines, 40, y);
      doc.text(value, pageW - 40, y, { align: 'right' });
      y += 14 * lines.length + 2;
    };

    row(l.baseWebsite, `${formatPrice(BASE_WEBSITE_PRICE)} Kč`);
    selectedFeatures.forEach(sf => {
      const f = getFeatureById(sf.id);
      if (!f) return;
      const qty = sf.quantity > 1 ? ` x${sf.quantity}` : '';
      const monthly = f.monthlyPrice > 0 ? ` (+${formatPrice(f.monthlyPrice * sf.quantity)} Kč${l.perMonth})` : '';
      row(`• ${f[nameKey]}${qty}${monthly}`, `${formatPrice(f.oneTimePrice * sf.quantity)} Kč`);
    });
    if (totalLaborHours > 0) row(`${l.laborCost} (${totalLaborHours} ${l.hours})`, `${formatPrice(laborCost)} Kč`);

    y += 6;
    doc.line(40, y, pageW - 40, y);
    y += 16;
    row(l.totalOneTime, `${formatPrice(grandTotalOneTime)} Kč`, true);
    row(l.totalMonthly, `${formatPrice(totalMonthly)} Kč${l.perMonth}`, true);

    if (appliedCoupon) {
      y += 6;
      doc.setTextColor(0, 140, 90);
      row(`Coupon ${appliedCoupon.code} (-${appliedCoupon.discount_type === 'percentage' ? appliedCoupon.discount_value + '%' : formatPrice(appliedCoupon.discount_value) + ' ' + (appliedCoupon as any).currency || ''})`,
        `- ${formatPrice(oneTimeDiscount)} Kč${monthlyDiscount ? ` / -${formatPrice(monthlyDiscount)} ${l.perMonth}` : ''}`);
      doc.setTextColor(0);
      y += 4;
      doc.setDrawColor(180);
      doc.line(40, y, pageW - 40, y); y += 16;
      row(lang === 'cs' ? 'K úhradě jednorázově' : lang === 'de' ? 'Zu zahlen einmalig' : 'Total due (one-time)', `${formatPrice(discountedOneTime)} Kč`, true);
      row(l.totalMonthly, `${formatPrice(discountedMonthly)} Kč${l.perMonth}`, true);
    }

    y += 26;
    doc.setFontSize(9);
    doc.setTextColor(120);
    const footerLines = doc.splitTextToSize(l.canChange + '  •  https://fastmedia.pro  •  support@fastmedia.pro', pageW - 80);
    doc.text(footerLines, 40, y);

    doc.save(`fastmedia-quote-${Date.now()}.pdf`);
    toast({ title: lang === 'cs' ? 'PDF staženo!' : lang === 'de' ? 'PDF heruntergeladen!' : 'PDF downloaded!' });
  };


  const allSteps: Step[] = ['trade', 'features', 'special', 'intent', 'contact', 'summary'];

  const goNext = () => {
    setDirection(1);
    const idx = allSteps.indexOf(step);
    if (idx < allSteps.length - 1) {
      const next = allSteps[idx + 1];
      setStep(next);
      // Kick off the conversational intake when entering the intent step.
      if (next === 'intent' && !intentCurrent && !intentBrief && !intentLoading) {
        fetchNextIntent(intentHistory);
      }
    }
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
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">{l.selectFeatures}</h2>
                  
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
                      {aiSuggestions.map((s: any) => {
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
                                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(feature.id, -1)}>
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="text-sm font-bold w-8 text-center">{qty}</span>
                                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(feature.id, 1)}>
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

                  {/* Idea prompts */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                      {lang === 'cs' ? '💡 Nápady k vyzkoušení' : lang === 'de' ? '💡 Ideen zum Ausprobieren' : '💡 Ideas to try'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getTradePrompts(selectedTrade, lang).map((prompt) => (
                        <motion.button
                          key={prompt}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSpecialRequest(prompt)}
                          className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                        >
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <Input
                      value={specialRequest}
                      onChange={e => setSpecialRequest(e.target.value)}
                      placeholder={l.specialPlaceholder}
                      className="pr-20 h-14 text-base"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleVoice}
                        className={`h-10 w-10 ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                  {isListening && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-destructive mt-2 flex items-center gap-1"
                    >
                      <span className="inline-block w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      {l.voiceHint}
                    </motion.p>
                  )}
                  <Button
                    onClick={submitSpecialRequest}
                    disabled={!specialRequest.trim() || isLoadingAI}
                    className="mt-4"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {isLoadingAI ? '...' : l.askSpecial}
                  </Button>

                  {specialResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-5 rounded-xl bg-card border border-border shadow-card"
                    >
                      <p className="text-sm text-foreground whitespace-pre-wrap">{specialResponse.suggestion}</p>
                      {specialResponse.alternativeFeatures?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            {lang === 'cs' ? 'Doporučené alternativy:' : 'Recommended alternatives:'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {specialResponse.alternativeFeatures.map((fId: string) => {
                              const feature = getFeatureById(fId);
                              if (!feature) return null;
                              return (
                                <Button
                                  key={fId}
                                  size="sm"
                                  variant={isSelected(fId) ? 'default' : 'outline'}
                                  onClick={() => toggleFeature(fId)}
                                  className="text-xs"
                                >
                                  {feature.icon} {feature[nameKey]}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 4: Conversational intake */}
              {step === 'intent' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {lang === 'cs' ? 'Pár otázek navíc' : lang === 'de' ? 'Ein paar zusätzliche Fragen' : 'A few quick questions'}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    {lang === 'cs'
                      ? 'Pomůže nám to připravit přesnější nabídku. Otázky se přizpůsobují vašim odpovědím.'
                      : lang === 'de'
                      ? 'So können wir ein passgenaues Angebot erstellen. Die Fragen passen sich Ihren Antworten an.'
                      : 'It helps us tailor the proposal. Questions adapt to your previous answers.'}
                  </p>

                  {/* Transcript */}
                  <div className="space-y-3 mb-4">
                    {intentHistory.map((turn, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-border bg-card p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
                          {turn.question}
                        </p>
                        <p className="text-sm text-foreground">{turn.answer}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Current question */}
                  {intentLoading && !intentCurrent && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 rounded-xl bg-muted/40">
                      <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      {lang === 'cs' ? 'Připravujeme další otázku…' : lang === 'de' ? 'Nächste Frage wird vorbereitet…' : 'Preparing the next question…'}
                    </div>
                  )}

                  {intentCurrent && (
                    <motion.div
                      key={intentCurrent.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4"
                    >
                      <p className="font-semibold text-foreground mb-3 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        {intentCurrent.question}
                      </p>

                      {intentCurrent.key === 'timeline' ? (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            {lang === 'cs'
                              ? 'Doporučujeme cca jeden měsíc — vyberte preferované datum.'
                              : lang === 'de'
                              ? 'Wir empfehlen etwa einen Monat — wählen Sie Ihr Wunschdatum.'
                              : 'We recommend around one month — select your preferred date.'}
                          </p>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal h-12",
                                  !intentAnswer && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {intentAnswer ? format(new Date(intentAnswer), "PPP") : (lang === 'cs' ? 'Vyberte datum' : lang === 'de' ? 'Datum auswählen' : 'Pick a date')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={intentAnswer ? new Date(intentAnswer) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    // Store ISO date string but also format for display
                                    setIntentAnswer(date.toISOString());
                                  }
                                }}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                                defaultMonth={(() => {
                                  const d = new Date();
                                  d.setMonth(d.getMonth() + 1);
                                  return d;
                                })()}
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <div className="flex justify-end mt-3">
                            <Button onClick={submitIntentAnswer} disabled={!intentAnswer.trim() || intentLoading} size="sm">
                              <Send className="w-3.5 h-3.5 mr-2" />
                              {lang === 'cs' ? 'Odpovědět' : lang === 'de' ? 'Antworten' : 'Send answer'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <textarea
                            value={intentAnswer}
                            onChange={e => setIntentAnswer(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault();
                                submitIntentAnswer();
                              }
                            }}
                            rows={3}
                            placeholder={lang === 'cs' ? 'Vaše odpověď…' : lang === 'de' ? 'Ihre Antwort…' : 'Your answer…'}
                            className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                          <div className="flex justify-end mt-3">
                            <Button onClick={submitIntentAnswer} disabled={!intentAnswer.trim() || intentLoading} size="sm">
                              <Send className="w-3.5 h-3.5 mr-2" />
                              {lang === 'cs' ? 'Odpovědět' : lang === 'de' ? 'Antworten' : 'Send answer'}
                            </Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Done */}
                  {intentBrief && !intentCurrent && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-accent/30 bg-accent/5 p-4"
                    >
                      <p className="text-sm font-semibold text-accent flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {lang === 'cs' ? 'Hotovo, díky!' : lang === 'de' ? 'Fertig, danke!' : 'All set, thanks!'}
                      </p>
                      {intentBrief.summary && (
                        <p className="text-sm text-foreground whitespace-pre-wrap">{intentBrief.summary}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-3">
                        {lang === 'cs'
                          ? 'Pokračujte zadáním kontaktních údajů.'
                          : lang === 'de'
                          ? 'Bitte geben Sie nun Ihre Kontaktdaten ein.'
                          : 'Continue to share your contact details.'}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 5: Contact Details & Lead Capture */}
              {step === 'contact' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">{l.contactTitle}</h2>
                  <p className="text-muted-foreground text-sm mb-2">{l.contactSubtitle}</p>
                  <div className="flex items-center gap-2 mb-8 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-xs font-medium text-accent">{l.resultInstant}</span>
                  </div>

                  <div className="max-w-md space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="lead-name" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {lang === 'cs' ? 'Jméno' : lang === 'de' ? 'Name' : 'Name'} *
                      </Label>
                      <Input
                        id="lead-name"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder={l.namePlaceholder}
                        className="h-12"
                        maxLength={100}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lead-email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        E-Mail *
                      </Label>
                      <Input
                        id="lead-email"
                        type="email"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder={l.emailPlaceholder}
                        className="h-12"
                        maxLength={255}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lead-phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {lang === 'cs' ? 'Telefon' : lang === 'de' ? 'Telefon' : 'Phone'}
                      </Label>
                      <Input
                        id="lead-phone"
                        type="tel"
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        placeholder={l.phonePlaceholder}
                        className="h-12"
                        maxLength={30}
                      />
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                      <Checkbox
                        id="gdpr-consent"
                        checked={gdprConsent}
                        onCheckedChange={(checked) => setGdprConsent(checked === true)}
                      />
                      <Label htmlFor="gdpr-consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        <Shield className="w-3.5 h-3.5 inline mr-1 text-primary" />
                        {l.gdprLabel}
                      </Label>
                    </div>

                    <Button
                      onClick={submitLead}
                      disabled={!isContactValid || isSubmitting}
                      className="w-full h-12 gradient-primary text-primary-foreground text-base"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          {l.submittingLead}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          {l.submitLead}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Summary */}
              {step === 'summary' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">{l.summaryTitle}</h2>

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
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">🌐 {l.baseWebsite}</span>
                      <span className="font-bold text-sm">{formatPrice(BASE_WEBSITE_PRICE)} Kč</span>
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
                          <Button size="icon" variant="ghost" onClick={removeCoupon} className="h-7 w-7">
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
                        <span className="font-semibold">{appliedCoupon ? (lang === 'cs' ? 'K úhradě' : lang === 'de' ? 'Zu zahlen' : 'You pay') : l.totalOneTime}</span>
                        <span className="text-2xl font-display font-bold">{formatPrice(discountedOneTime)} Kč</span>
                      </div>
                      <div className="flex justify-between items-center opacity-80">
                        <span className="text-sm">{l.totalMonthly}</span>
                        <span className="text-lg font-bold">{formatPrice(discountedMonthly)} Kč{l.perMonth}</span>
                      </div>
                      {appliedCoupon && (oneTimeDiscount > 0 || monthlyDiscount > 0) && (
                        <div className="mt-2 pt-2 border-t border-primary-foreground/20 text-xs opacity-90">
                          {lang === 'cs' ? 'Sleva' : lang === 'de' ? 'Rabatt' : 'Saved'}: {formatPrice(oneTimeDiscount)} Kč{monthlyDiscount > 0 ? ` + ${formatPrice(monthlyDiscount)} Kč${l.perMonth}` : ''}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-4">{l.canChange}</p>
                  </div>

                  {/* Export actions */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button onClick={exportQuote} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {l.exportPdf}
                    </Button>
                    <Link to="/#contact">
                      <Button className="gradient-accent text-accent-foreground">
                        <Send className="w-4 h-4 mr-2" />
                        {l.sendQuote}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={step === 'trade'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {l.back}
            </Button>
            {step !== 'summary' && step !== 'contact' && (
              <Button
                onClick={goNext}
                disabled={(step === 'trade' && !selectedTrade) || (step === 'intent' && !intentBrief)}
              >
                {l.next}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
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
                  setIntentHistory([]);
                  setIntentCurrent(null);
                  setIntentAnswer('');
                  setIntentBrief(null);
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
    </div>
  );
};

export default CalculatorPage;
