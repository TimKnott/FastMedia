import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import DemosSection from '@/components/DemosSection';
import { useLanguage } from '@/contexts/LanguageContext';

const DemosPage = () => {
  const { language } = useLanguage();
  const title = language === 'de' ? 'Branchen-Demos – FastMedia.Pro' : language === 'en' ? 'Industry website demos – FastMedia.Pro' : 'Ukázky webů podle oboru – FastMedia.Pro';
  const description = language === 'de' ? 'Live-Demo-Websites für Handwerk, Dienstleistungen, Gesundheit und Gastronomie mit Online-Buchung.' : language === 'en' ? 'Live demo websites for trades, services, health and hospitality, with online booking.' : 'Živé ukázky webů pro řemeslníky, služby, zdraví a gastronomii s online rezervací.';
  return (
    <>
      <SEOHead title={title} description={description} canonical="/demos" pagePath="/demos" ogType="website" />
      <Navbar />
      <main className="pt-16"><DemosSection /></main>
      <Footer />
    </>
  );
};

export default DemosPage;
