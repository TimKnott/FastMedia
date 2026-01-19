import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, MapPin, Clock, Star, CheckCircle, Users, Award, Shield, Calendar, Facebook, Instagram, Twitter, Linkedin, Play, ChevronRight } from 'lucide-react';
import { getTradeImage } from '@/data/tradeImages';

interface DemoLayoutProps {
  tradeName: string;
  tradeId: string;
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
  tradeId,
  tradeIcon,
  heroTitle,
  heroSubtitle,
  services,
  primaryColor,
  gradientClass,
}: DemoLayoutProps) => {
  const { t, language } = useLanguage();
  const heroImage = getTradeImage(tradeId);

  const stats = [
    { value: '15+', label: { cs: 'let zkušeností', en: 'years experience', de: 'Jahre Erfahrung' } },
    { value: '2,500+', label: { cs: 'spokojených klientů', en: 'happy clients', de: 'zufriedene Kunden' } },
    { value: '99%', label: { cs: 'úspěšnost', en: 'success rate', de: 'Erfolgsrate' } },
    { value: '24/7', label: { cs: 'pohotovost', en: 'availability', de: 'Verfügbarkeit' } },
  ];

  const features = [
    { icon: Shield, text: { cs: 'Záruka na práci', en: 'Work guarantee', de: 'Arbeitsgarantie' } },
    { icon: Award, text: { cs: 'Certifikovaní odborníci', en: 'Certified experts', de: 'Zertifizierte Experten' } },
    { icon: Users, text: { cs: 'Zkušený tým', en: 'Experienced team', de: 'Erfahrenes Team' } },
    { icon: Calendar, text: { cs: 'Flexibilní termíny', en: 'Flexible scheduling', de: 'Flexible Termine' } },
  ];

  const teamMembers = [
    { name: 'Jan Novák', role: { cs: 'Vedoucí technik', en: 'Lead Technician', de: 'Leitender Techniker' }, experience: '12' },
    { name: 'Petr Svoboda', role: { cs: 'Senior specialista', en: 'Senior Specialist', de: 'Senior Spezialist' }, experience: '8' },
    { name: 'Martin Černý', role: { cs: 'Technik', en: 'Technician', de: 'Techniker' }, experience: '5' },
  ];

  const reviews = [
    { name: 'Martin Kovář', location: 'Praha', text: { cs: 'Výborná práce, rychlé jednání a profesionální přístup. Rozhodně doporučuji!', en: 'Excellent work, fast response and professional approach. Definitely recommend!', de: 'Ausgezeichnete Arbeit, schnelle Reaktion und professioneller Ansatz. Definitiv zu empfehlen!' }, rating: 5, date: '2024-01-15' },
    { name: 'Jana Procházková', location: 'Brno', text: { cs: 'Skvělá komunikace po celou dobu. Práce byla hotová včas a kvalitně.', en: 'Great communication throughout. Work was done on time and with quality.', de: 'Tolle Kommunikation durchgehend. Arbeit wurde pünktlich und qualitativ hochwertig erledigt.' }, rating: 5, date: '2024-01-10' },
    { name: 'Tomáš Horák', location: 'Ostrava', text: { cs: 'Profesionální tým s férovou cenou. Práci odvedli na jedničku.', en: 'Professional team with fair pricing. They did an excellent job.', de: 'Professionelles Team mit fairen Preisen. Sie haben eine ausgezeichnete Arbeit geleistet.' }, rating: 5, date: '2024-01-05' },
    { name: 'Lucie Dvořáková', location: 'Plzeň', text: { cs: 'Rychlí, spolehliví a čistá práce. Určitě využiji znovu.', en: 'Fast, reliable and clean work. Will definitely use again.', de: 'Schnell, zuverlässig und saubere Arbeit. Werde definitiv wieder nutzen.' }, rating: 5, date: '2023-12-28' },
  ];

  const galleryImages = [
    { title: { cs: 'Projekt 1', en: 'Project 1', de: 'Projekt 1' } },
    { title: { cs: 'Projekt 2', en: 'Project 2', de: 'Projekt 2' } },
    { title: { cs: 'Projekt 3', en: 'Project 3', de: 'Projekt 3' } },
    { title: { cs: 'Projekt 4', en: 'Project 4', de: 'Projekt 4' } },
    { title: { cs: 'Projekt 5', en: 'Project 5', de: 'Projekt 5' } },
    { title: { cs: 'Projekt 6', en: 'Project 6', de: 'Projekt 6' } },
  ];

  const workingHours = [
    { day: { cs: 'Pondělí - Pátek', en: 'Monday - Friday', de: 'Montag - Freitag' }, hours: '8:00 - 18:00' },
    { day: { cs: 'Sobota', en: 'Saturday', de: 'Samstag' }, hours: '9:00 - 14:00' },
    { day: { cs: 'Neděle', en: 'Sunday', de: 'Sonntag' }, hours: { cs: 'Zavřeno (pohotovost)', en: 'Closed (emergency)', de: 'Geschlossen (Notfall)' } },
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
          {language === 'cs' ? 'Toto je ukázkový web – může být váš!' : language === 'en' ? 'This is a demo website – it could be yours!' : 'Dies ist eine Demo-Website – sie könnte Ihnen gehören!'}
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
            <a href="#gallery" className="text-muted-foreground hover:text-foreground transition-colors">
              {language === 'cs' ? 'Galerie' : language === 'en' ? 'Gallery' : 'Galerie'}
            </a>
            <a href="#reviews" className="text-muted-foreground hover:text-foreground transition-colors">
              {language === 'cs' ? 'Recenze' : language === 'en' ? 'Reviews' : 'Bewertungen'}
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">{t('demo.contact')}</a>
          </div>
          <Button className={`${gradientClass} text-white font-semibold shadow-md`}>
            <Phone className="w-4 h-4 mr-2" />
            {t('demo.callnow')}
          </Button>
        </div>
      </nav>

      {/* Hero with Background Image */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt={tradeName}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent`} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="text-2xl">{tradeIcon}</span>
              <span className="font-medium">{tradeName}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
              {heroTitle[language]}
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {heroSubtitle[language]}
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4 mb-8">
              {features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <feature.icon className="w-4 h-4" />
                  <span className="text-sm">{feature.text[language]}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90 font-semibold text-lg px-8 group">
                <Phone className="w-5 h-5 mr-2" />
                +420 123 456 789
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold text-lg px-8">
                {t('demo.getquote')}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className={`py-8 ${gradientClass}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <div className="text-3xl sm:text-4xl font-display font-bold">{stat.value}</div>
                <div className="text-white/80 text-sm mt-1">{stat.label[language]}</div>
              </motion.div>
            ))}
          </div>
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
                {language === 'cs' ? 'Vaši spolehliví partneři pro každý projekt' : language === 'en' ? 'Your Reliable Partners for Every Project' : 'Ihre zuverlässigen Partner für jedes Projekt'}
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                {language === 'cs' 
                  ? 'Jsme tým zkušených odborníků s více než 15 lety zkušeností v oboru. Poskytujeme kvalitní služby za férové ceny s důrazem na spokojenost každého zákazníka.'
                  : language === 'en'
                  ? 'We are a team of experienced professionals with over 15 years of experience in the industry. We provide quality services at fair prices with a focus on every customer satisfaction.'
                  : 'Wir sind ein Team erfahrener Fachleute mit über 15 Jahren Erfahrung in der Branche. Wir bieten Qualitätsdienstleistungen zu fairen Preisen mit Fokus auf Kundenzufriedenheit.'}
              </p>
              <p className="text-muted-foreground mb-8">
                {language === 'cs' 
                  ? 'Naším cílem je poskytovat služby nejvyšší kvality s maximálním ohledem na potřeby našich zákazníků. Každý projekt bereme jako výzvu a vždy se snažíme překonat očekávání.'
                  : language === 'en'
                  ? 'Our goal is to provide the highest quality services with maximum regard for our customers needs. We treat every project as a challenge and always strive to exceed expectations.'
                  : 'Unser Ziel ist es, Dienstleistungen höchster Qualität mit maximaler Berücksichtigung der Bedürfnisse unserer Kunden zu erbringen. Wir behandeln jedes Projekt als Herausforderung.'}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                    <div className={`w-10 h-10 ${gradientClass} rounded-lg flex items-center justify-center`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-foreground font-medium">{feature.text[language]}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src={heroImage} 
                alt="Our team at work"
                className="rounded-3xl shadow-2xl w-full aspect-[4/3] object-cover"
              />
              <div className={`absolute -bottom-6 -left-6 ${gradientClass} rounded-2xl p-6 text-white shadow-xl`}>
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-8 h-8" />
                  <span className="font-display font-bold text-2xl">15+</span>
                </div>
                <span className="text-white/90">
                  {language === 'cs' ? 'let zkušeností' : language === 'en' ? 'years of experience' : 'Jahre Erfahrung'}
                </span>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-sm text-foreground font-medium">4.9/5 (250+ recenzí)</span>
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
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              {language === 'cs' ? 'Co pro vás můžeme udělat' : language === 'en' ? 'What We Can Do for You' : 'Was wir für Sie tun können'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cs' ? 'Nabízíme komplexní služby přizpůsobené vašim potřebám' : language === 'en' ? 'We offer comprehensive services tailored to your needs' : 'Wir bieten umfassende Dienstleistungen, die auf Ihre Bedürfnisse zugeschnitten sind'}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${gradientClass} rounded-xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {tradeIcon}
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{service.title[language]}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description[language]}</p>
                <Button variant="link" className="p-0 mt-4 group-hover:gap-3 transition-all" style={{ color: primaryColor }}>
                  {language === 'cs' ? 'Více informací' : language === 'en' ? 'Learn more' : 'Mehr erfahren'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className={`inline-block text-sm font-semibold uppercase tracking-wider mb-3`} style={{ color: primaryColor }}>
              {language === 'cs' ? 'Náš tým' : language === 'en' ? 'Our Team' : 'Unser Team'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              {language === 'cs' ? 'Seznamte se s našimi odborníky' : language === 'en' ? 'Meet Our Experts' : 'Lernen Sie unsere Experten kennen'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="relative mb-4 inline-block">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center text-5xl overflow-hidden group-hover:scale-105 transition-transform">
                    👷
                  </div>
                  <div className={`absolute bottom-0 right-0 w-10 h-10 ${gradientClass} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {member.experience}+
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground">{member.name}</h3>
                <p className="text-muted-foreground text-sm">{member.role[language]}</p>
                <p className="text-xs mt-2" style={{ color: primaryColor }}>
                  {member.experience} {language === 'cs' ? 'let zkušeností' : language === 'en' ? 'years experience' : 'Jahre Erfahrung'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className={`inline-block text-sm font-semibold uppercase tracking-wider mb-3`} style={{ color: primaryColor }}>
              {language === 'cs' ? 'Naše práce' : language === 'en' ? 'Our Work' : 'Unsere Arbeit'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              {language === 'cs' ? 'Galerie realizací' : language === 'en' ? 'Project Gallery' : 'Projektgalerie'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              >
                <img 
                  src={heroImage}
                  alt={image.title[language]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white">
                    <p className="font-semibold">{image.title[language]}</p>
                    <p className="text-sm text-white/80">{language === 'cs' ? 'Zobrazit detail' : language === 'en' ? 'View details' : 'Details anzeigen'}</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className={`inline-block text-sm font-semibold uppercase tracking-wider mb-3`} style={{ color: primaryColor }}>
              {language === 'cs' ? 'Recenze' : language === 'en' ? 'Reviews' : 'Bewertungen'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              {language === 'cs' ? 'Co o nás říkají klienti' : language === 'en' ? 'What Clients Say About Us' : 'Was Kunden über uns sagen'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-foreground mb-4 text-sm leading-relaxed">"{review.text[language]}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{review.name}</p>
                    <p className="text-muted-foreground text-xs">{review.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Google/Facebook reviews badge */}
          <div className="flex justify-center gap-6 mt-12">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              </div>
              <span className="text-sm text-foreground font-medium">4.9 na Google</span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm">
              <Facebook className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-foreground font-medium">98% doporučení</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 lg:py-24 ${gradientClass} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto text-white"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
              {language === 'cs' ? 'Potřebujete pomoc s projektem?' : language === 'en' ? 'Need Help With a Project?' : 'Brauchen Sie Hilfe bei einem Projekt?'}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {language === 'cs' ? 'Kontaktujte nás pro bezplatnou konzultaci a cenovou nabídku' : language === 'en' ? 'Contact us for a free consultation and quote' : 'Kontaktieren Sie uns für eine kostenlose Beratung und ein Angebot'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90 font-semibold text-lg px-8">
                <Phone className="w-5 h-5 mr-2" />
                +420 123 456 789
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold text-lg px-8">
                <Mail className="w-5 h-5 mr-2" />
                info@example.cz
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact with Map */}
      <section id="contact" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className={`inline-block text-sm font-semibold uppercase tracking-wider mb-3`} style={{ color: primaryColor }}>{t('demo.contact')}</span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-8">
                {language === 'cs' ? 'Kontaktujte nás' : language === 'en' ? 'Contact Us' : 'Kontaktieren Sie uns'}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${gradientClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {language === 'cs' ? 'Adresa' : language === 'en' ? 'Address' : 'Adresse'}
                    </h3>
                    <p className="text-muted-foreground">Václavské náměstí 1<br />110 00 Praha 1</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${gradientClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {language === 'cs' ? 'Telefon' : language === 'en' ? 'Phone' : 'Telefon'}
                    </h3>
                    <p className="text-muted-foreground">+420 123 456 789</p>
                    <p className="text-muted-foreground">+420 987 654 321</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${gradientClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">info@{tradeId}-example.cz</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${gradientClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {language === 'cs' ? 'Otevírací doba' : language === 'en' ? 'Opening Hours' : 'Öffnungszeiten'}
                    </h3>
                    {workingHours.map((item, index) => (
                      <p key={index} className="text-muted-foreground text-sm">
                        {item.day[language]}: {typeof item.hours === 'string' ? item.hours : item.hours[language]}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-4">
                  {language === 'cs' ? 'Sledujte nás' : language === 'en' ? 'Follow Us' : 'Folgen Sie uns'}
                </h3>
                <div className="flex gap-3">
                  {[Facebook, Instagram, Twitter, Linkedin].map((Icon, index) => (
                    <a 
                      key={index} 
                      href="#" 
                      className={`w-10 h-10 rounded-xl ${gradientClass} flex items-center justify-center text-white hover:opacity-80 transition-opacity`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Embedded Map */}
              <div className="rounded-2xl overflow-hidden shadow-lg h-80 mb-6">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.115078774669!2d14.427768376956567!3d50.08451477157226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b94e8e0f6cdbd%3A0xd28f741e285d4cee!2sWenceslas%20Square!5e0!3m2!1sen!2scz!4v1704067200000!5m2!1sen!2scz"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
              </div>

              {/* Contact Form */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">
                  {language === 'cs' ? 'Napište nám' : language === 'en' ? 'Send Us a Message' : 'Schreiben Sie uns'}
                </h3>
                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder={language === 'cs' ? 'Jméno' : language === 'en' ? 'Name' : 'Name'}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input 
                      type="email" 
                      placeholder="Email"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <input 
                    type="tel" 
                    placeholder={language === 'cs' ? 'Telefon' : language === 'en' ? 'Phone' : 'Telefon'}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <textarea 
                    placeholder={language === 'cs' ? 'Vaše zpráva...' : language === 'en' ? 'Your message...' : 'Ihre Nachricht...'}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <Button className={`w-full ${gradientClass} text-white font-semibold py-6`}>
                    {language === 'cs' ? 'Odeslat zprávu' : language === 'en' ? 'Send Message' : 'Nachricht senden'}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${gradientClass} rounded-lg flex items-center justify-center text-xl`}>
                  {tradeIcon}
                </div>
                <span className="font-display font-bold text-lg">{tradeName}</span>
              </div>
              <p className="text-background/70 text-sm">
                {language === 'cs' ? 'Profesionální služby pro vaše potřeby. Kvalita a spolehlivost na prvním místě.' : language === 'en' ? 'Professional services for your needs. Quality and reliability first.' : 'Professionelle Dienstleistungen für Ihre Bedürfnisse. Qualität und Zuverlässigkeit an erster Stelle.'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{language === 'cs' ? 'Rychlé odkazy' : language === 'en' ? 'Quick Links' : 'Schnelllinks'}</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#about" className="hover:text-background transition-colors">{t('demo.about')}</a></li>
                <li><a href="#services" className="hover:text-background transition-colors">{t('demo.services')}</a></li>
                <li><a href="#gallery" className="hover:text-background transition-colors">{language === 'cs' ? 'Galerie' : language === 'en' ? 'Gallery' : 'Galerie'}</a></li>
                <li><a href="#contact" className="hover:text-background transition-colors">{t('demo.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('demo.services')}</h4>
              <ul className="space-y-2 text-sm text-background/70">
                {services.slice(0, 4).map((service, index) => (
                  <li key={index}><a href="#services" className="hover:text-background transition-colors">{service.title[language]}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('demo.contact')}</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +420 123 456 789</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@example.cz</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Praha 1</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/70 text-sm">
              © 2024 {tradeName}. {language === 'cs' ? 'Všechna práva vyhrazena.' : language === 'en' ? 'All rights reserved.' : 'Alle Rechte vorbehalten.'}
            </p>
            <Link to="/" className="text-accent text-sm hover:underline flex items-center gap-2">
              <span className={`w-5 h-5 ${gradientClass} rounded flex items-center justify-center text-xs`}>⚡</span>
              {language === 'cs' ? 'Web vytvořen pomocí FastMedia.Pro' : language === 'en' ? 'Website created by FastMedia.Pro' : 'Website erstellt von FastMedia.Pro'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DemoLayout;
