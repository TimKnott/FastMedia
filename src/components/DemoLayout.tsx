import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, MapPin, Clock, Star, CheckCircle } from 'lucide-react';

interface DemoLayoutProps {
  tradeName: string;
  tradeIcon: string;
  heroTitle: { cs: string; en: string; de: string };
  heroSubtitle: { cs: string; en: string; de: string };
  services: { title: { cs: string; en: string; de: string }; description: { cs: string; en: string; de: string } }[];
  primaryColor: string;
  gradientClass: string;
  children?: ReactNode;
}

const DemoLayout = ({
  tradeName,
  tradeIcon,
  heroTitle,
  heroSubtitle,
  services,
  primaryColor,
  gradientClass,
}: DemoLayoutProps) => {
  const { t, language } = useLanguage();

  const features = [
    { cs: 'Profesionální přístup', en: 'Professional approach', de: 'Professioneller Ansatz' },
    { cs: 'Kvalitní materiály', en: 'Quality materials', de: 'Qualitätsmaterialien' },
    { cs: 'Záruka na práci', en: 'Work guarantee', de: 'Arbeitsgarantie' },
    { cs: 'Férové ceny', en: 'Fair prices', de: 'Faire Preise' },
  ];

  const reviews = [
    { name: 'Martin K.', text: { cs: 'Výborná práce, mohu jen doporučit!', en: 'Excellent work, I can only recommend!', de: 'Ausgezeichnete Arbeit, kann ich nur empfehlen!' }, rating: 5 },
    { name: 'Jana P.', text: { cs: 'Rychlí, spolehliví a profesionální.', en: 'Fast, reliable and professional.', de: 'Schnell, zuverlässig und professionell.' }, rating: 5 },
    { name: 'Tomáš H.', text: { cs: 'Skvělá komunikace po celou dobu.', en: 'Great communication throughout.', de: 'Tolle Kommunikation durchgehend.' }, rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Back to FastMedia Banner */}
      <div className="bg-foreground text-background py-2 px-4 text-center text-sm">
        <Link to="/" className="inline-flex items-center gap-2 hover:text-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('demo.back')}
        </Link>
        <span className="mx-2">|</span>
        <span className="text-background/70">
          {language === 'cs' ? 'Toto je ukázkový web' : language === 'en' ? 'This is a demo website' : 'Dies ist eine Demo-Website'}
        </span>
      </div>

      {/* Demo Navbar */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${gradientClass} rounded-lg flex items-center justify-center text-xl`}>
              {tradeIcon}
            </div>
            <span className="font-display font-bold text-lg text-foreground">{tradeName}</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">{t('demo.about')}</a>
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">{t('demo.services')}</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">{t('demo.contact')}</a>
          </div>
          <Button className={`${gradientClass} text-white font-semibold shadow-md`}>
            <Phone className="w-4 h-4 mr-2" />
            {t('demo.callnow')}
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className={`relative py-20 lg:py-32 ${gradientClass} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <span className="text-6xl mb-6 block">{tradeIcon}</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
              {heroTitle[language]}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {heroSubtitle[language]}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90 font-semibold text-lg px-8">
                <Phone className="w-5 h-5 mr-2" />
                +420 123 456 789
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold text-lg px-8">
                {t('demo.getquote')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className={`inline-block text-sm font-semibold uppercase tracking-wider mb-3`} style={{ color: primaryColor }}>{t('demo.about')}</span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-6">
                {language === 'cs' ? 'Vaši spolehliví partneři' : language === 'en' ? 'Your Reliable Partners' : 'Ihre zuverlässigen Partner'}
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                {language === 'cs' 
                  ? 'Jsme tým zkušených odborníků s více než 15 lety zkušeností. Poskytujeme kvalitní služby za férové ceny.'
                  : language === 'en'
                  ? 'We are a team of experienced professionals with over 15 years of experience. We provide quality services at fair prices.'
                  : 'Wir sind ein Team erfahrener Fachleute mit über 15 Jahren Erfahrung. Wir bieten Qualitätsdienstleistungen zu fairen Preisen.'}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                    <span className="text-foreground">{feature[language]}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`${gradientClass} rounded-3xl p-12 text-center text-white`}
            >
              <div className="text-7xl mb-4">{tradeIcon}</div>
              <div className="text-5xl font-display font-bold mb-2">15+</div>
              <div className="text-white/80">
                {language === 'cs' ? 'let zkušeností' : language === 'en' ? 'years of experience' : 'Jahre Erfahrung'}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className={`inline-block text-sm font-semibold uppercase tracking-wider mb-3`} style={{ color: primaryColor }}>{t('demo.services')}</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              {language === 'cs' ? 'Co pro vás můžeme udělat' : language === 'en' ? 'What We Can Do for You' : 'Was wir für Sie tun können'}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 ${gradientClass} rounded-xl flex items-center justify-center text-white text-xl mb-4`}>
                  {tradeIcon}
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{service.title[language]}</h3>
                <p className="text-muted-foreground text-sm">{service.description[language]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              {language === 'cs' ? 'Co o nás říkají klienti' : language === 'en' ? 'What Clients Say About Us' : 'Was Kunden über uns sagen'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{review.text[language]}"</p>
                <p className="font-semibold text-foreground">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className={`py-16 lg:py-24 ${gradientClass}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">
              {t('demo.contact')}
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Phone className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">+420 123 456 789</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Mail className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">info@example.cz</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Clock className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">Po-Pá 8:00-18:00</p>
              </div>
            </div>
            <Button size="lg" className="bg-white text-foreground hover:bg-white/90 font-semibold text-lg px-8">
              {t('demo.getquote')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-8 h-8 ${gradientClass} rounded-lg flex items-center justify-center text-sm`}>
              {tradeIcon}
            </div>
            <span className="font-display font-bold">{tradeName}</span>
          </div>
          <p className="text-background/70 text-sm">
            © 2024 {tradeName}. {language === 'cs' ? 'Všechna práva vyhrazena.' : language === 'en' ? 'All rights reserved.' : 'Alle Rechte vorbehalten.'}
          </p>
          <div className="mt-4 pt-4 border-t border-background/20">
            <Link to="/" className="text-accent text-sm hover:underline">
              {language === 'cs' ? 'Web vytvořen pomocí FastMedia.Pro' : language === 'en' ? 'Website created by FastMedia.Pro' : 'Website erstellt von FastMedia.Pro'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DemoLayout;
