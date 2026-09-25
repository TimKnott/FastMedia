import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import SEOHead from '@/components/SEOHead';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Phone, Mail, Globe2, User, FileText, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublishedCaseStudies } from '@/hooks/useCaseStudies';

const About = () => {
  const { language } = useLanguage();
  const en = language !== 'cs';
  const { data: studies } = usePublishedCaseStudies();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: 'https://fastmedia.pro/about',
    mainEntity: {
      '@type': 'ProfessionalService',
      name: 'FastMedia.Pro',
      url: 'https://fastmedia.pro',
      email: 'support@fastmedia.pro',
      telephone: '+420797864432',
      founder: { '@type': 'Person', name: 'Timothy Knott', jobTitle: 'Founder' },
      identifier: { '@type': 'PropertyValue', propertyID: 'IČO', value: '17308551' },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Louny',
        postalCode: '440 01',
        addressRegion: 'Ústecký kraj',
        addressCountry: 'CZ',
      },
      areaServed: [
        { '@type': 'Country', name: 'Czech Republic' },
        { '@type': 'Place', name: 'European Union' },
      ],
    },
  };

  const facts = [
    { icon: Building2, label: en ? 'Legal entity' : 'Právní subjekt', value: en ? 'Timothy Knott, sole trader (OSVČ)' : 'Timothy Knott, OSVČ' },
    { icon: FileText, label: 'IČO', value: '17308551' },
    { icon: MapPin, label: en ? 'Registered location' : 'Sídlo', value: en ? 'Louny 440 01, Ústí nad Labem Region, Czech Republic' : 'Louny 440 01, Ústecký kraj, Česká republika' },
    { icon: Phone, label: en ? 'Phone' : 'Telefon', value: '+420 797 864 432' },
    { icon: Mail, label: 'E-mail', value: 'support@fastmedia.pro' },
  ];

  return (
    <>
      <SEOHead
        title={en ? 'About FastMedia.Pro — Timothy Knott, Louny, Czech Republic' : 'O nás — FastMedia.Pro, Timothy Knott, Louny'}
        description={
          en
            ? 'FastMedia.Pro is run by Timothy Knott (IČO 17308551) from Louny, Czech Republic. Websites, calculators and booking systems for businesses across the Czech Republic and the EU.'
            : 'FastMedia.Pro provozuje Timothy Knott (IČO 17308551) z Loun. Weby, kalkulačky a rezervační systémy pro firmy v Česku a celé EU.'
        }
        canonical="/about"
        pagePath="/about"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="min-h-screen">
        <Navbar />
        <ScrollToTop />
        <main id="main-site">
          <section className="container mx-auto px-4 pt-28 pb-12 md:pt-32">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{en ? 'About FastMedia.Pro' : 'O FastMedia.Pro'}</h1>
              <p className="text-lg text-muted-foreground">
                {en
                  ? 'FastMedia.Pro builds websites, price calculators, booking forms and system integrations for small businesses. It is run by Timothy Knott, a British national based in Louny, Czech Republic, working in English and Czech.'
                  : 'FastMedia.Pro tvoří weby, cenové kalkulačky, rezervační formuláře a propojení systémů pro malé firmy. Vede ji Timothy Knott, britský občan žijící v Lounech, a komunikuje česky i anglicky.'}
              </p>
            </div>
          </section>

          <section className="container mx-auto px-4 pb-12 grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">{en ? 'Business details' : 'Údaje o firmě'}</h2>
              <dl className="space-y-3">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3">
                    <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-sm text-muted-foreground">{label}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </Card>
            <div className="grid gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><User className="w-5 h-5 text-primary" />{en ? 'Team' : 'Tým'}</h2>
                <p className="font-semibold">Timothy Knott</p>
                <p className="text-sm text-muted-foreground">
                  {en
                    ? 'Founder. Handles every project personally, from the first call to launch and support.'
                    : 'Zakladatel. Každý projekt vede osobně, od prvního hovoru po spuštění a podporu.'}
                </p>
              </Card>
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Globe2 className="w-5 h-5 text-primary" />{en ? 'Areas served' : 'Kde působíme'}</h2>
                <p className="text-sm text-muted-foreground">
                  {en
                    ? 'Louny and the Ústí nad Labem Region in person; the whole Czech Republic and EU remotely. Websites can be delivered in any official EU language.'
                    : 'Osobně Louny a Ústecký kraj; celá Česká republika a EU na dálku. Weby dodáme v jakémkoli úředním jazyce EU.'}
                </p>
              </Card>
            </div>
          </section>

          <section className="container mx-auto px-4 pb-20">
            <h2 className="text-2xl font-bold mb-3">{en ? 'Case studies' : 'Případové studie'}</h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              {en
                ? 'The studies below are illustrative model projects. Figures are not client-verified results; verified client evidence will be added as it becomes available.'
                : 'Níže uvedené studie jsou ukázkové modelové projekty. Čísla nejsou ověřené výsledky klientů; ověřené reference doplníme, jakmile budou k dispozici.'}
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 mb-6">
              {(studies ?? []).map((s) => (
                <li key={s.id}><Card className="p-4 font-medium">{s.brand}</Card></li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button asChild><Link to="/case-studies">{en ? 'View case studies' : 'Zobrazit studie'}<ArrowRight className="w-4 h-4" /></Link></Button>
              <Button asChild variant="outline"><Link to="/contact">{en ? 'Contact us' : 'Kontakt'}</Link></Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default About;
