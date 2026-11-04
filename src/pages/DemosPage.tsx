import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import DemosSection from '@/components/DemosSection';
import { useLanguage } from '@/contexts/LanguageContext';

const DemosPage = () => {
  const { language } = useLanguage();
  const title = language === 'de' ? 'Branchen-Demos – FastMedia.Pro' : language === 'en' ? 'Industry website demos – FastMedia.Pro' : 'Ukázky webů podle oboru – FastMedia.Pro';
  const description = language === 'de' ? 'Live-Demo-Websites für Handwerk, Dienstleistungen, Gesundheit und Gastronomie mit Online-Buchung.' : language === 'en' ? 'Live demo websites for trades, services, health and hospitality, with online booking.' : 'Živé ukázky webů pro řemeslníky, služby, zdraví a gastronomii s online rezervací.';
  const heading = language === 'de' ? 'Website-Demos nach Branche: Handwerk, Dienstleistungen, Gesundheit und Gastronomie' : language === 'en' ? 'Website demos by industry: trades, services, health and hospitality' : 'Ukázky webů podle oboru: řemesla, služby, zdraví a gastronomie';
  const intro = language === 'de'
    ? 'Jede Demo ist eine Beispiel-Website mit Musterinhalten, keine echte Kundenfirma. Öffnen Sie eine Demo, um Aufbau, Seiten und Anfrage- oder Buchungsformulare auszuprobieren, bevor Sie Ihre eigene Website planen.'
    : language === 'en'
      ? 'Each demo is a sample website with placeholder content, not a real client business. Open one to try the layout, pages and enquiry or booking forms before planning your own site.'
      : 'Každá ukázka je vzorový web s ilustračním obsahem, nikoli skutečná firma klienta. Otevřete ji a vyzkoušejte rozvržení, stránky a poptávkový či rezervační formulář dřív, než začnete plánovat vlastní web.';
  return (
    <>
      <SEOHead title={title} description={description} canonical="/demos" pagePath="/demos" ogType="website" />
      <Navbar />
      <main className="pt-16">
        <h1 className="container mx-auto px-4 pt-10 text-center font-display text-3xl font-bold text-foreground md:text-4xl">
          {heading}
        </h1>
        <p className="container mx-auto mt-4 max-w-3xl px-4 text-center text-muted-foreground">{intro}</p>
        <DemosSection />
      </main>
      <Footer />
    </>
  );
};

export default DemosPage;
