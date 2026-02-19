import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mic, MicOff, Plus, Minus, Trash2, Sparkles, Download, Send, MessageSquare, Calculator as CalcIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

type SelectedFeature = { id: string; quantity: number };
type Step = 'trade' | 'features' | 'special' | 'summary';

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

  const lang = language as 'cs' | 'en' | 'de';
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
    },
    en: {
      title: 'Website Calculator',
      subtitle: 'Build your custom website and get an instant quote',
      selectTrade: 'What is your trade?',
      selectFeatures: 'Choose features for your website',
      specialTitle: 'Special Request',
      specialPlaceholder: 'Describe a feature you don\'t see listed...',
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
    },
    de: {
      title: 'Website-Kalkulator',
      subtitle: 'Stellen Sie Ihre Website zusammen und erhalten Sie sofort einen Preis',
      selectTrade: 'Was ist Ihr Gewerk?',
      selectFeatures: 'Wählen Sie Funktionen für Ihre Website',
      specialTitle: 'Sonderwunsch',
      specialPlaceholder: 'Beschreiben Sie eine Funktion, die Sie nicht finden...',
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

  // Export
  const exportQuote = () => {
    const tradeObj = trades.find(t => t.id === selectedTrade);
    const tradeName = tradeObj ? t(tradeObj.nameKey) : selectedTrade;
    
    let text = `${l.title} - FastMedia.Pro\n${'='.repeat(40)}\n\n`;
    text += `${l.selectTrade}: ${tradeName}\n\n`;
    text += `${l.baseWebsite}: ${BASE_WEBSITE_PRICE.toLocaleString()} Kč\n\n`;
    
    if (selectedFeatures.length > 0) {
      text += `${l.selectFeatures}:\n`;
      selectedFeatures.forEach(sf => {
        const feature = getFeatureById(sf.id);
        if (feature) {
          text += `  • ${feature[nameKey]} x${sf.quantity} — ${(feature.oneTimePrice * sf.quantity).toLocaleString()} Kč`;
          if (feature.monthlyPrice > 0) text += ` (+${(feature.monthlyPrice * sf.quantity).toLocaleString()} Kč${l.perMonth})`;
          text += '\n';
        }
      });
    }
    
    text += `\n${l.laborCost}: ${laborCost.toLocaleString()} Kč (${totalLaborHours} ${l.hours})\n`;
    text += `\n${'─'.repeat(40)}\n`;
    text += `${l.totalOneTime}: ${grandTotalOneTime.toLocaleString()} Kč\n`;
    text += `${l.totalMonthly}: ${totalMonthly.toLocaleString()} Kč${l.perMonth}\n`;
    text += `\n${l.canChange}\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fastmedia-quote-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: lang === 'cs' ? 'Nabídka exportována!' : 'Quote exported!' });
  };

  const goNext = () => {
    setDirection(1);
    const steps: Step[] = ['trade', 'features', 'special', 'summary'];
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };

  const goBack = () => {
    setDirection(-1);
    const steps: Step[] = ['trade', 'features', 'special', 'summary'];
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const stepIndex = ['trade', 'features', 'special', 'summary'].indexOf(step);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const categories = ['essential', 'marketing', 'advanced', 'premium'] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero text-primary-foreground py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">FastMedia.Pro</span>
          </Link>
          <div className="text-center">
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2 justify-center">
              <CalcIcon className="w-7 h-7" />
              {l.title}
            </h1>
            <p className="text-primary-foreground/70 text-sm mt-1">{l.subtitle}</p>
          </div>
          <div className="w-24" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {['trade', 'features', 'special', 'summary'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: i === stepIndex ? 1.2 : 1 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i <= stepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </motion.div>
                {i < 3 && (
                  <div className={`w-8 sm:w-16 h-0.5 transition-colors ${i < stepIndex ? 'bg-primary' : 'bg-muted'}`} />
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
                                    <div className="flex gap-3 mt-2 text-xs">
                                      <span className="font-semibold text-foreground">{feature.oneTimePrice.toLocaleString()} Kč</span>
                                      {feature.monthlyPrice > 0 && (
                                        <span className="text-muted-foreground">+{feature.monthlyPrice.toLocaleString()} Kč{l.perMonth}</span>
                                      )}
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
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-7 w-7"
                                      onClick={() => updateQuantity(feature.id, -1)}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="text-sm font-bold w-8 text-center">{qty}</span>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-7 w-7"
                                      onClick={() => updateQuantity(feature.id, 1)}
                                    >
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

              {/* Step 4: Summary */}
              {step === 'summary' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">{l.summaryTitle}</h2>
                  
                  <div className="space-y-3">
                    {/* Base */}
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">🌐 {l.baseWebsite}</span>
                      <span className="font-bold text-sm">{BASE_WEBSITE_PRICE.toLocaleString()} Kč</span>
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
                              <span className="font-bold text-sm">{(feature.oneTimePrice * sf.quantity).toLocaleString()} Kč</span>
                              {feature.monthlyPrice > 0 && (
                                <span className="text-xs text-muted-foreground block">
                                  +{(feature.monthlyPrice * sf.quantity).toLocaleString()} Kč{l.perMonth}
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
                        <span className="font-bold text-sm">{laborCost.toLocaleString()} Kč</span>
                      </div>
                    )}

                    {/* Totals */}
                    <div className="mt-6 p-5 rounded-xl gradient-primary text-primary-foreground">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{l.totalOneTime}</span>
                        <span className="text-2xl font-display font-bold">{grandTotalOneTime.toLocaleString()} Kč</span>
                      </div>
                      <div className="flex justify-between items-center opacity-80">
                        <span className="text-sm">{l.totalMonthly}</span>
                        <span className="text-lg font-bold">{totalMonthly.toLocaleString()} Kč{l.perMonth}</span>
                      </div>
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
            {step !== 'summary' && (
              <Button
                onClick={goNext}
                disabled={step === 'trade' && !selectedTrade}
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
                <span className="font-semibold">{BASE_WEBSITE_PRICE.toLocaleString()} Kč</span>
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
                    <span className="font-semibold whitespace-nowrap">{(feature.oneTimePrice * sf.quantity).toLocaleString()} Kč</span>
                  </motion.div>
                );
              })}
              {totalLaborHours > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">⚙️ {l.laborCost}</span>
                  <span className="font-semibold">{laborCost.toLocaleString()} Kč</span>
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
                  {grandTotalOneTime.toLocaleString()} Kč
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
                  {totalMonthly.toLocaleString()} Kč{l.perMonth}
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalculatorPage;
