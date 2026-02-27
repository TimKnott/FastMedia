import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Truck, CheckCircle2, MapPin, Package, ShieldCheck } from 'lucide-react';
import { eshopImages } from '@/data/eshopImages';
import type { Product } from '@/data/eshopProducts';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CheckoutFlowProps {
  cart: CartItem[];
  cartTotal: number;
  onBack: () => void;
  onComplete: () => void;
}

type Step = 'shipping' | 'payment' | 'confirmation';

const t = (cs: string, en: string, de: string, lang: string) =>
  lang === 'cs' ? cs : lang === 'de' ? de : en;

const CheckoutFlow = ({ cart, cartTotal, onBack, onComplete }: CheckoutFlowProps) => {
  const { language } = useLanguage();
  const [step, setStep] = useState<Step>('shipping');
  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', phone: '', street: '', city: '', zip: '', country: 'CZ',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shippingCost = shippingMethod === 'express' ? 149 : cartTotal >= 1500 ? 0 : 89;
  const total = cartTotal + shippingCost;

  const gradientClass = 'bg-gradient-to-br from-violet-600 to-fuchsia-500';

  const steps: { key: Step; label: string; icon: typeof MapPin }[] = [
    { key: 'shipping', label: t('Doprava', 'Shipping', 'Versand', language), icon: MapPin },
    { key: 'payment', label: t('Platba', 'Payment', 'Zahlung', language), icon: CreditCard },
    { key: 'confirmation', label: t('Potvrzení', 'Confirmation', 'Bestätigung', language), icon: CheckCircle2 },
  ];

  const currentIdx = steps.findIndex(s => s.key === step);

  const isShippingValid = shipping.firstName && shipping.lastName && shipping.email && shipping.street && shipping.city && shipping.zip;

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setStep('confirmation');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={step === 'shipping' ? onBack : () => setStep(step === 'payment' ? 'shipping' : 'payment')} className="p-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg text-foreground">
            {t('Pokladna', 'Checkout', 'Kasse', language)}
          </h1>
        </div>

        {/* Steps indicator */}
        <div className="container mx-auto px-4 pb-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= currentIdx ? `${gradientClass} text-primary-foreground` : 'bg-secondary text-muted-foreground'
                }`}>
                  {i < currentIdx ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${i <= currentIdx ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-1 ${i < currentIdx ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Main content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping */}
              {step === 'shipping' && (
                <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {/* Shipping address */}
                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {t('Doručovací adresa', 'Shipping Address', 'Lieferadresse', language)}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">{t('Jméno', 'First Name', 'Vorname', language)} *</Label>
                        <Input id="firstName" value={shipping.firstName} onChange={e => setShipping(p => ({ ...p, firstName: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t('Příjmení', 'Last Name', 'Nachname', language)} *</Label>
                        <Input id="lastName" value={shipping.lastName} onChange={e => setShipping(p => ({ ...p, lastName: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input id="email" type="email" value={shipping.email} onChange={e => setShipping(p => ({ ...p, email: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t('Telefon', 'Phone', 'Telefon', language)}</Label>
                        <Input id="phone" value={shipping.phone} onChange={e => setShipping(p => ({ ...p, phone: e.target.value }))} className="mt-1" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="street">{t('Ulice a číslo', 'Street Address', 'Straße und Hausnummer', language)} *</Label>
                        <Input id="street" value={shipping.street} onChange={e => setShipping(p => ({ ...p, street: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="city">{t('Město', 'City', 'Stadt', language)} *</Label>
                        <Input id="city" value={shipping.city} onChange={e => setShipping(p => ({ ...p, city: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="zip">{t('PSČ', 'ZIP Code', 'PLZ', language)} *</Label>
                        <Input id="zip" value={shipping.zip} onChange={e => setShipping(p => ({ ...p, zip: e.target.value }))} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Shipping method */}
                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-primary" />
                      {t('Způsob dopravy', 'Shipping Method', 'Versandart', language)}
                    </h2>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-3">
                      <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="standard" id="standard" />
                          <div>
                            <p className="font-medium text-foreground">{t('Standardní doručení', 'Standard Delivery', 'Standardlieferung', language)}</p>
                            <p className="text-sm text-muted-foreground">{t('3-5 pracovních dnů', '3-5 business days', '3-5 Werktage', language)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-foreground">{cartTotal >= 1500 ? t('Zdarma', 'Free', 'Kostenlos', language) : '89 Kč'}</span>
                      </label>
                      <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="express" id="express" />
                          <div>
                            <p className="font-medium text-foreground">{t('Expresní doručení', 'Express Delivery', 'Expresslieferung', language)}</p>
                            <p className="text-sm text-muted-foreground">{t('Následující pracovní den', 'Next business day', 'Nächster Werktag', language)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-foreground">149 Kč</span>
                      </label>
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={() => setStep('payment')}
                    disabled={!isShippingValid}
                    className={`w-full ${gradientClass} text-primary-foreground font-semibold h-12 text-base`}
                  >
                    {t('Pokračovat k platbě', 'Continue to Payment', 'Weiter zur Zahlung', language)}
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      {t('Způsob platby', 'Payment Method', 'Zahlungsmethode', language)}
                    </h2>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      {[
                        { value: 'card', label: t('Platební karta', 'Credit Card', 'Kreditkarte', language), desc: 'Visa, Mastercard, Maestro', icon: '💳' },
                        { value: 'bank', label: t('Bankovní převod', 'Bank Transfer', 'Banküberweisung', language), desc: t('Platba předem na účet', 'Pay in advance to account', 'Vorauszahlung auf Konto', language), icon: '🏦' },
                        { value: 'cod', label: t('Dobírka', 'Cash on Delivery', 'Nachnahme', language), desc: t('Platba při převzetí +39 Kč', 'Pay on delivery +39 CZK', 'Zahlung bei Lieferung +39 CZK', language), icon: '📦' },
                        { value: 'gpay', label: 'Google Pay / Apple Pay', desc: t('Expresní platba', 'Express payment', 'Express-Zahlung', language), icon: '📱' },
                      ].map(pm => (
                        <label key={pm.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === pm.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <RadioGroupItem value={pm.value} />
                          <span className="text-2xl">{pm.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{pm.label}</p>
                            <p className="text-sm text-muted-foreground">{pm.desc}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="bg-card rounded-2xl p-6 shadow-card">
                      <h3 className="font-display font-bold text-foreground mb-4">{t('Údaje karty', 'Card Details', 'Kartendaten', language)}</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>{t('Číslo karty', 'Card Number', 'Kartennummer', language)}</Label>
                          <Input placeholder="•••• •••• •••• ••••" className="mt-1 font-mono" maxLength={19} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>{t('Platnost', 'Expiry', 'Ablaufdatum', language)}</Label>
                            <Input placeholder="MM / YY" className="mt-1 font-mono" maxLength={7} />
                          </div>
                          <div>
                            <Label>CVV</Label>
                            <Input placeholder="•••" className="mt-1 font-mono" maxLength={4} type="password" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                        {t('Platba je zabezpečena SSL šifrováním', 'Payment is secured with SSL encryption', 'Zahlung ist mit SSL-Verschlüsselung gesichert', language)}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handlePlaceOrder}
                    className={`w-full ${gradientClass} text-primary-foreground font-semibold h-12 text-base`}
                  >
                    {t(`Zaplatit ${total.toLocaleString()} Kč`, `Pay ${total.toLocaleString()} CZK`, `${total.toLocaleString()} CZK bezahlen`, language)}
                  </Button>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === 'confirmation' && orderPlaced && (
                <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="bg-card rounded-2xl p-8 shadow-card text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                      <div className={`w-20 h-20 ${gradientClass} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
                      </div>
                    </motion.div>
                    <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                      {t('Objednávka přijata!', 'Order Confirmed!', 'Bestellung bestätigt!', language)}
                    </h2>
                    <p className="text-muted-foreground mb-2">
                      {t('Číslo objednávky', 'Order number', 'Bestellnummer', language)}: <span className="font-mono font-bold text-foreground">#FM-{Math.floor(10000 + Math.random() * 90000)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('Potvrzení bylo odesláno na', 'Confirmation sent to', 'Bestätigung gesendet an', language)} <span className="font-medium text-foreground">{shipping.email || 'email@example.com'}</span>
                    </p>
                  </div>

                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      {t('Souhrn objednávky', 'Order Summary', 'Bestellübersicht', language)}
                    </h3>
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={eshopImages[item.product.id]} alt={item.product.name[language]} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.product.name[language]}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity}×</p>
                          </div>
                          <span className="text-sm font-bold text-foreground">{(item.product.price * item.quantity).toLocaleString()} Kč</span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-3 mt-3 space-y-1">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{t('Doprava', 'Shipping', 'Versand', language)}</span>
                          <span>{shippingCost === 0 ? t('Zdarma', 'Free', 'Kostenlos', language) : `${shippingCost} Kč`}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-foreground">
                          <span>{t('Celkem', 'Total', 'Gesamt', language)}</span>
                          <span>{total.toLocaleString()} Kč</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h3 className="font-display font-bold text-foreground mb-3">{t('Doručovací adresa', 'Shipping Address', 'Lieferadresse', language)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {shipping.firstName} {shipping.lastName}<br />
                      {shipping.street}<br />
                      {shipping.zip} {shipping.city}
                    </p>
                  </div>

                  <Button onClick={onComplete} className={`w-full ${gradientClass} text-primary-foreground font-semibold h-12 text-base`}>
                    {t('Pokračovat v nákupu', 'Continue Shopping', 'Weiter einkaufen', language)}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          {step !== 'confirmation' && (
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-card sticky top-36">
                <h3 className="font-display font-bold text-foreground mb-4">{t('Vaše objednávka', 'Your Order', 'Ihre Bestellung', language)}</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-secondary/30">
                        <img src={eshopImages[item.product.id]} alt={item.product.name[language]} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.product.name[language]}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity}× {item.product.price.toLocaleString()} Kč</p>
                      </div>
                      <span className="text-sm font-bold text-foreground whitespace-nowrap">{(item.product.price * item.quantity).toLocaleString()} Kč</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('Mezisoučet', 'Subtotal', 'Zwischensumme', language)}</span>
                    <span>{cartTotal.toLocaleString()} Kč</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('Doprava', 'Shipping', 'Versand', language)}</span>
                    <span>{shippingCost === 0 ? t('Zdarma', 'Free', 'Kostenlos', language) : `${shippingCost} Kč`}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{t('Dobírka', 'COD fee', 'Nachnahme', language)}</span>
                      <span>39 Kč</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                    <span>{t('Celkem', 'Total', 'Gesamt', language)}</span>
                    <span>{total.toLocaleString()} Kč</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutFlow;
