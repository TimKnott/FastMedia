import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { trades } from '@/data/trades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';

const BookingSection = () => {
  const { t, language } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    trade: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    setFormData({ name: '', email: '', phone: '', trade: '', message: '' });
  };

  const contactInfo = [
    { icon: Phone, value: '+420 123 456 789', label: { cs: 'Telefon', en: 'Phone', de: 'Telefon' } },
    { icon: Mail, value: 'info@fastmedia.pro', label: { cs: 'E-mail', en: 'Email', de: 'E-Mail' } },
    { icon: MapPin, value: 'Praha, Česká republika', label: { cs: 'Adresa', en: 'Address', de: 'Adresse' } },
  ];

  return (
    <section id="contact" className="py-20 lg:py-32 gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Contact</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-3 mb-4">
              {t('booking.title')}
            </h2>
            <p className="text-white/80 text-lg mb-10">
              {t('booking.subtitle')}
            </p>

            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <info.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">{info.label[language]}</p>
                    <p className="text-white font-medium">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-3xl p-8 lg:p-10 shadow-lg"
            >
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-foreground font-display font-bold text-xl">
                    {t('booking.success')}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-foreground text-sm font-medium mb-2">
                        {t('booking.name')}
                      </label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jan Novák"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-foreground text-sm font-medium mb-2">
                        {t('booking.email')}
                      </label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jan@example.cz"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-foreground text-sm font-medium mb-2">
                        {t('booking.phone')}
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+420 123 456 789"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-foreground text-sm font-medium mb-2">
                        {t('booking.trade')}
                      </label>
                      <Select
                        value={formData.trade}
                        onValueChange={(value) => setFormData({ ...formData, trade: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="..." />
                        </SelectTrigger>
                        <SelectContent>
                          {trades.map((trade) => (
                            <SelectItem key={trade.id} value={trade.id}>
                              {trade.icon} {t(trade.nameKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      {t('booking.message')}
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gradient-accent text-accent-foreground font-semibold h-14 text-lg shadow-glow hover:opacity-90 transition-opacity"
                  >
                    {t('booking.submit')}
                    <Send className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
