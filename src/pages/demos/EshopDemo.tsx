import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  ShieldCheck,
  TicketPercent,
  X,
  Sparkles,
  Search,
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import {
  calculatorFeatures,
  BASE_WEBSITE_PRICE,
  BASE_HOSTING_PRICE,
  LABOR_RATE,
  categoryLabels,
  type CalculatorFeature,
} from '@/data/calculatorFeatures';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type CartLine = { id: string; quantity: number };
type Category = CalculatorFeature['category'] | 'all';

const t = (cs: string, en: string, de: string, lang: string) =>
  lang === 'cs' ? cs : lang === 'de' ? de : en;

const formatPrice = (n: number, lang: string) =>
  new Intl.NumberFormat(lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : 'cs-CZ').format(n);

const EshopDemo = () => {
  const { language } = useLanguage();
  const { openCheckout, checkoutElement } = useStripeCheckout();

  const [cart, setCart] = useState<CartLine[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    oneTimeDiscount: number;
    monthlyDiscount: number;
  } | null>(null);

  // Email for receipt
  const [email, setEmail] = useState('');

  const featureById = (id: string) => calculatorFeatures.find(f => f.id === id);

  const filtered = useMemo(() => {
    return calculatorFeatures.filter(f => {
      if (category !== 'all' && f.category !== category) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const name = (language === 'cs' ? f.nameCs : language === 'de' ? f.nameDe : f.nameEn).toLowerCase();
      const desc = (language === 'cs' ? f.descCs : language === 'de' ? f.descDe : f.descEn).toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [category, search, language]);

  const addToCart = (f: CalculatorFeature) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === f.id);
      if (existing) {
        if (!f.allowMultiple) return prev;
        return prev.map(c => (c.id === f.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { id: f.id, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(c => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter(c => c.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));

  const totals = useMemo(() => {
    const items = cart
      .map(c => {
        const f = featureById(c.id);
        if (!f) return null;
        return { feature: f, quantity: c.quantity };
      })
      .filter((x): x is { feature: CalculatorFeature; quantity: number } => !!x);

    const oneTime = items.reduce((s, i) => s + i.feature.oneTimePrice * i.quantity, BASE_WEBSITE_PRICE);
    const laborHours = items.reduce((s, i) => s + i.feature.laborHours * i.quantity, 0);
    const laborCost = laborHours * LABOR_RATE;
    const monthly = items.reduce((s, i) => s + i.feature.monthlyPrice * i.quantity, BASE_HOSTING_PRICE);
    const hostingAnnual = monthly * 12;
    const oneTimeBeforeDiscount = oneTime + laborCost;
    const monthlyDiscountAnnual = (appliedCoupon?.monthlyDiscount ?? 0) * 12;
    const totalDiscount = (appliedCoupon?.oneTimeDiscount ?? 0) + monthlyDiscountAnnual;
    const grandTotal = Math.max(0, oneTimeBeforeDiscount + hostingAnnual - totalDiscount);
    return {
      items,
      oneTime,
      laborHours,
      laborCost,
      monthly,
      hostingAnnual,
      oneTimeBeforeDiscount,
      totalDiscount,
      grandTotal,
    };
  }, [cart, appliedCoupon]);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-coupon', {
        body: {
          code: couponInput.trim(),
          oneTimeAmount: totals.oneTimeBeforeDiscount,
          monthlyAmount: totals.monthly,
        },
      });
      if (error) throw error;
      if (!data?.valid) {
        toast({
          title: t('Neplatný kupón', 'Invalid coupon', 'Ungültiger Gutschein', language),
          variant: 'destructive',
        });
        return;
      }
      setAppliedCoupon({
        code: data.coupon.code,
        oneTimeDiscount: data.oneTimeDiscount || 0,
        monthlyDiscount: data.monthlyDiscount || 0,
      });
      toast({ title: t('Kupón aplikován', 'Coupon applied', 'Gutschein angewendet', language) });
    } catch (e) {
      console.error(e);
      toast({
        title: t('Chyba kupónu', 'Coupon error', 'Gutscheinfehler', language),
        variant: 'destructive',
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const handleCheckout = () => {
    if (totals.items.length === 0) return;
    const lineItems = [
      {
        name: t('Základní web', 'Base website', 'Basis-Website', language),
        amount: BASE_WEBSITE_PRICE * 100,
        quantity: 1,
        productId: 'base_website',
      },
      ...totals.items.map(i => ({
        name: language === 'cs' ? i.feature.nameCs : language === 'de' ? i.feature.nameDe : i.feature.nameEn,
        amount: i.feature.oneTimePrice * 100,
        quantity: i.quantity,
        productId: i.feature.id,
      })),
    ];
    if (totals.laborCost > 0) {
      lineItems.push({
        name: t(
          `Práce (${totals.laborHours} h)`,
          `Labor (${totals.laborHours} h)`,
          `Arbeit (${totals.laborHours} h)`,
          language,
        ),
        amount: totals.laborCost * 100,
        quantity: 1,
        productId: 'labor',
      });
    }
    lineItems.push({
      name: t(
        'Hosting a údržba — 12 měsíců předem',
        'Hosting & maintenance — 12 months prepaid',
        'Hosting & Wartung — 12 Monate im Voraus',
        language,
      ),
      amount: totals.hostingAnnual * 100,
      quantity: 1,
      productId: 'hosting_annual',
    });

    // Apply coupon discount as a negative adjustment by reducing the largest non-base line proportionally.
    // Stripe doesn't accept negative amounts, so we proportionally reduce paid lines.
    if (totals.totalDiscount > 0) {
      const discountMinor = totals.totalDiscount * 100;
      const totalBeforeDiscountMinor = lineItems.reduce((s, l) => s + l.amount * l.quantity, 0);
      if (totalBeforeDiscountMinor > discountMinor) {
        const ratio = (totalBeforeDiscountMinor - discountMinor) / totalBeforeDiscountMinor;
        for (const li of lineItems) {
          li.amount = Math.max(1, Math.round(li.amount * ratio));
        }
      }
    }

    openCheckout({
      cart: lineItems,
      source: 'calculator',
      customerEmail: email || undefined,
      title: t('Dokončit objednávku', 'Complete your order', 'Bestellung abschließen', language),
      metadata: {
        coupon: appliedCoupon?.code || '',
        features: totals.items.map(i => `${i.feature.id}x${i.quantity}`).join(','),
      },
    });
  };

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: t('Vše', 'All', 'Alle', language) },
    { id: 'essential', label: categoryLabels.essential[language] },
    { id: 'marketing', label: categoryLabels.marketing[language] },
    { id: 'advanced', label: categoryLabels.advanced[language] },
    { id: 'premium', label: categoryLabels.premium[language] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Build Your Website Package — FastMedia.Pro"
        description={t(
          'Sestavte si web na míru: vyberte funkce z našeho katalogu a okamžitě objednejte.',
          'Configure your bespoke website: pick the features you need and order instantly.',
          'Konfigurieren Sie Ihre Website: wählen Sie Funktionen aus dem Katalog und bestellen Sie sofort.',
          language,
        )}
        canonical="/demo/eshop"
        pagePath="/demo/eshop"
      />

      {/* Back banner */}
      <div className="bg-foreground text-background py-2 px-4 text-sm flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 hover:text-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('Zpět na FastMedia.Pro', 'Back to FastMedia.Pro', 'Zurück zu FastMedia.Pro', language)}
        </Link>
        <LanguageSwitcher triggerClassName="text-background/80 hover:text-background hover:bg-primary-foreground/10 h-7 px-2" />
      </div>

      {/* Hero */}
      <section className="relative py-16 sm:py-24 gradient-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-sm">
              <Sparkles className="w-4 h-4" />
              {t('Sestavte si web', 'Build your website', 'Stellen Sie Ihre Website zusammen', language)}
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              {t(
                'Vyberte funkce a zaplaťte ihned',
                'Pick the features and pay instantly',
                'Funktionen wählen und sofort bezahlen',
                language,
              )}
            </h1>
            <p className="text-primary-foreground/85 text-lg">
              {t(
                'Stejný katalog jako náš AI kalkulátor — žádné nesmyslné produkty navíc. Cena obsahuje 12 měsíců hostingu předem.',
                'Same catalogue as our AI calculator — no random products on top. Price includes 12 months of hosting prepaid.',
                'Gleicher Katalog wie unser KI-Rechner — keine zufälligen Zusatzprodukte. Preis enthält 12 Monate Hosting im Voraus.',
                language,
              )}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        {/* Catalogue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('Hledat funkce…', 'Search features…', 'Funktionen suchen…', language)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    category === c.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((f, idx) => {
              const name = language === 'cs' ? f.nameCs : language === 'de' ? f.nameDe : f.nameEn;
              const desc = language === 'cs' ? f.descCs : language === 'de' ? f.descDe : f.descEn;
              const inCart = cart.find(c => c.id === f.id);
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (idx % 8) * 0.04 }}
                  className="bg-card border border-border rounded-2xl p-5 flex flex-col shadow-card"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl" aria-hidden>{f.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground">{name}</h3>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {categoryLabels[f.category][language]}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{desc}</p>
                  <div className="text-sm mb-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('Jednorázově', 'One-time', 'Einmalig', language)}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(f.oneTimePrice, language)} Kč
                      </span>
                    </div>
                    {f.monthlyPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t('Měsíčně', 'Monthly', 'Monatlich', language)}
                        </span>
                        <span className="font-semibold text-foreground">
                          +{formatPrice(f.monthlyPrice, language)} Kč
                        </span>
                      </div>
                    )}
                  </div>
                  {inCart ? (
                    <div className="flex items-center justify-between gap-2">
                      {f.allowMultiple ? (
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" onClick={() => updateQty(f.id, -1)} className="h-8 w-8">
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-semibold w-6 text-center">{inCart.quantity}</span>
                          <Button size="icon" variant="outline" onClick={() => updateQty(f.id, 1)} className="h-8 w-8">
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-accent font-medium">
                          <CheckCircle2 className="w-4 h-4" /> {t('Vybráno', 'Added', 'Hinzugefügt', language)}
                        </span>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => removeFromCart(f.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => addToCart(f)} className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      {t('Přidat', 'Add', 'Hinzufügen', language)}
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Cart summary */}
        <aside className="lg:sticky lg:top-6 self-start bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="font-display font-bold text-lg flex items-center gap-2 text-foreground">
            <ShoppingCart className="w-5 h-5 text-primary" />
            {t('Vaše objednávka', 'Your order', 'Ihre Bestellung', language)}
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t('Základní web', 'Base website', 'Basis-Website', language)}</span>
              <span>{formatPrice(BASE_WEBSITE_PRICE, language)} Kč</span>
            </div>
            {totals.items.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">
                {t('Zatím žádné funkce.', 'No features yet.', 'Noch keine Funktionen.', language)}
              </p>
            ) : (
              totals.items.map(i => {
                const name =
                  language === 'cs' ? i.feature.nameCs : language === 'de' ? i.feature.nameDe : i.feature.nameEn;
                return (
                  <div key={i.feature.id} className="flex justify-between gap-2 text-foreground">
                    <span className="truncate">
                      {name}
                      {i.quantity > 1 ? ` × ${i.quantity}` : ''}
                    </span>
                    <span className="font-medium shrink-0">
                      {formatPrice(i.feature.oneTimePrice * i.quantity, language)} Kč
                    </span>
                  </div>
                );
              })
            )}
            {totals.laborCost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {t('Práce', 'Labor', 'Arbeit', language)} ({totals.laborHours} h)
                </span>
                <span>{formatPrice(totals.laborCost, language)} Kč</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground border-t border-border pt-2">
              <span>
                {t(
                  'Hosting — 12 měsíců předem',
                  'Hosting — 12 months prepaid',
                  'Hosting — 12 Monate im Voraus',
                  language,
                )}
              </span>
              <span>{formatPrice(totals.hostingAnnual, language)} Kč</span>
            </div>
          </div>

          {/* Coupon */}
          <div className="p-3 rounded-xl border border-dashed border-primary/30 bg-primary/5">
            {!appliedCoupon ? (
              <div className="flex gap-2 items-center">
                <TicketPercent className="w-4 h-4 text-primary shrink-0" />
                <Input
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  placeholder={t('Slevový kód', 'Discount code', 'Gutscheincode', language)}
                  className="h-9 font-mono text-sm"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyCoupon();
                    }
                  }}
                />
                <Button size="sm" onClick={applyCoupon} disabled={!couponInput.trim() || couponLoading}>
                  {couponLoading ? '…' : t('Použít', 'Apply', 'Anwenden', language)}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span className="font-mono text-sm font-bold">{appliedCoupon.code}</span>
                  <span className="text-xs text-muted-foreground">
                    −{formatPrice(totals.totalDiscount, language)} Kč
                  </span>
                </div>
                <Button size="icon" variant="ghost" onClick={removeCoupon} className="h-7 w-7">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('E-mail pro účtenku', 'Email for receipt', 'E-Mail für Beleg', language)}
            />
          </div>

          {/* Total */}
          <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{t('Celkem k úhradě', 'Total due', 'Gesamtbetrag', language)}</span>
              <span className="text-2xl font-display font-bold">{formatPrice(totals.grandTotal, language)} Kč</span>
            </div>
            <p className="text-xs opacity-80 mt-1">
              {t(
                'Včetně 12 měsíců hostingu předem.',
                'Includes 12 months of hosting, prepaid.',
                'Inkl. 12 Monate Hosting im Voraus.',
                language,
              )}
            </p>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={totals.items.length === 0}
            className="w-full h-12 text-base font-semibold"
          >
            {t('Zaplatit kartou', 'Pay by card', 'Mit Karte bezahlen', language)}
          </Button>
          <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {t('Zabezpečeno Stripe', 'Secured by Stripe', 'Gesichert durch Stripe', language)}
          </p>
        </aside>
      </div>

      {checkoutElement}
      <Footer />
    </div>
  );
};

export default EshopDemo;
