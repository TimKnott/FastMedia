import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Linkedin } from 'lucide-react';
import LearnMoreModal from '@/components/LearnMoreModal';

const teamMembers = [
  {
    name: 'Tim Knott',
    role: { cs: 'CEO & zakladatel', en: 'CEO & Founder', de: 'CEO & Gründer' },
    bio: {
      cs: 'Více než 15 let zkušeností v digitálním marketingu a webovém vývoji. Vede strategické směřování FastMedia.Pro.',
      en: 'Over 15 years of experience in digital marketing and web development. Leads the strategic direction of FastMedia.Pro.',
      de: 'Über 15 Jahre Erfahrung im digitalen Marketing und Webentwicklung. Leitet die strategische Ausrichtung von FastMedia.Pro.',
    },
    initials: 'TK',
    email: 'tim@fastmedia.pro',
    certs: ['Google Ads', 'Analytics'],
  },
  {
    name: 'Tereza Nováková',
    role: { cs: 'Konzultantka', en: 'Consultant', de: 'Beraterin' },
    bio: {
      cs: 'Specializuje se na poradenství pro řemeslníky a malé firmy. Pomáhá klientům najít ideální webové řešení.',
      en: 'Specializes in consulting for tradespeople and small businesses. Helps clients find the ideal web solution.',
      de: 'Spezialisiert auf Beratung für Handwerker und Kleinunternehmen. Hilft Kunden, die ideale Weblösung zu finden.',
    },
    initials: 'TN',
    email: 'tereza@fastmedia.pro',
    certs: ['CRM', 'UX Design'],
  },
  {
    name: 'Martin Dvořák',
    role: { cs: 'Lead Developer', en: 'Lead Developer', de: 'Lead Entwickler' },
    bio: {
      cs: 'Full-stack vývojář se zaměřením na výkon a konverzní optimalizaci. Stojí za technickým řešením všech šablon.',
      en: 'Full-stack developer focused on performance and conversion optimization. Behind the technical solution of all templates.',
      de: 'Full-Stack-Entwickler mit Fokus auf Leistung und Konversionsoptimierung. Verantwortlich für die technische Lösung aller Vorlagen.',
    },
    initials: 'MD',
    email: 'martin@fastmedia.pro',
    certs: ['React', 'TypeScript'],
  },
  {
    name: 'Petra Svobodová',
    role: { cs: 'UX/UI Designérka', en: 'UX/UI Designer', de: 'UX/UI Designerin' },
    bio: {
      cs: 'Vytváří vizuálně přitažlivé a konverzní designy. Dbá na to, aby každý web byl intuitivní a přístupný.',
      en: 'Creates visually appealing, conversion-focused designs. Ensures every website is intuitive and accessible.',
      de: 'Erstellt visuell ansprechende, konversionsorientierte Designs. Stellt sicher, dass jede Website intuitiv und zugänglich ist.',
    },
    initials: 'PS',
    email: 'petra@fastmedia.pro',
    certs: ['Figma', 'WCAG'],
  },
];

const learnMore = {
  title: { cs: 'Poznejte náš tým', en: 'Meet Our Team', de: 'Unser Team kennenlernen' },
  explanation: {
    cs: 'Za každým projektem stojí tým profesionálů s reálnými zkušenostmi. Osobní přístup a transparentní komunikace jsou naší prioritou.',
    en: 'Behind every project is a team of professionals with real experience. Personal approach and transparent communication are our priorities.',
    de: 'Hinter jedem Projekt steht ein Team von Fachleuten mit echter Erfahrung. Persönlicher Ansatz und transparente Kommunikation sind unsere Prioritäten.',
  },
  benefits: {
    cs: ['Buduje důvěru přes osobní kontakt', 'Ukazuje kvalifikaci a odbornost', 'Vytváří lidský rozměr značky'],
    en: ['Builds trust through personal contact', 'Shows qualifications and expertise', 'Creates a human dimension of the brand'],
    de: ['Baut Vertrauen durch persönlichen Kontakt auf', 'Zeigt Qualifikationen und Expertise', 'Schafft eine menschliche Dimension der Marke'],
  },
};

const TeamSection = () => {
  const { language } = useLanguage();
  const lang = language as 'cs' | 'en' | 'de';

  const title = {
    cs: 'Tým, kterému můžete důvěřovat',
    en: 'A Team You Can Trust',
    de: 'Ein Team, dem Sie vertrauen können',
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-1.5">
            {lang === 'cs' ? 'Náš Tým' : lang === 'de' ? 'Unser Team' : 'Our Team'}
            <LearnMoreModal
              title={learnMore.title[lang]}
              explanation={learnMore.explanation[lang]}
              benefits={learnMore.benefits[lang]}
            />
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mt-3">
            {title[lang]}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {teamMembers.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow group"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center text-primary-foreground font-display font-bold text-xl group-hover:scale-105 transition-transform">
                {member.initials}
              </div>
              <h3 className="font-display font-bold text-foreground">{member.name}</h3>
              <p className="text-accent text-sm font-medium mb-2">{member.role[lang]}</p>
              <p className="text-muted-foreground text-xs leading-relaxed mb-3">{member.bio[lang]}</p>
              <div className="flex flex-wrap justify-center gap-1 mb-3">
                {member.certs.map((cert) => (
                  <span key={cert} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                    {cert}
                  </span>
                ))}
              </div>
              <div className="flex justify-center gap-2">
                <a href={`mailto:${member.email}`} className="w-8 h-8 rounded-full bg-secondary hover:bg-accent/20 flex items-center justify-center transition-colors">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-secondary hover:bg-accent/20 flex items-center justify-center transition-colors">
                  <Linkedin className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
