import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import WhyFastMediaSection from '@/components/WhyFastMediaSection';
import AutomationSection from '@/components/AutomationSection';
import DemosSection from '@/components/DemosSection';
import ServicesSection from '@/components/ServicesSection';
import ReviewsSection from '@/components/ReviewsSection';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import ConsultantSection from '@/components/ConsultantSection';
import CalculatorShowcase from '@/components/CalculatorShowcase';
import BookingSection from '@/components/BookingSection';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import SEOHead from '@/components/SEOHead';
import HomeJsonLd from '@/components/HomeJsonLd';
import PromoBanner from '@/components/PromoBanner';
import StickyCTABar from '@/components/StickyCTABar';
import CertificationsSection from '@/components/CertificationsSection';
import TeamSection from '@/components/TeamSection';
import AppointmentPoliciesSection from '@/components/AppointmentPoliciesSection';
import ServiceAreaMap from '@/components/ServiceAreaMap';
import OfferTeaser from '@/components/OfferTeaser';

const Index = () => {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  return (
    <>
      <SEOHead
        title={isEnglish ? 'FastMedia.Pro — Websites for Trades and Services' : 'FastMedia.Pro — Profesionální weby pro řemeslníky a služby'}
        description={isEnglish ? 'Conversion-focused websites for trades and services, with AI assistance, online bookings and lead capture. Delivered worldwide.' : 'FastMedia.Pro vytváří konverzní weby pro řemeslníky a servisní firmy. AI asistent, online rezervace a sběr poptávek.'}
        canonical="/"
        ogType="website"
        pagePath="/"
      />
      <HomeJsonLd />
      <div className="min-h-screen">
        <Navbar />
        <ScrollToTop />
        <OfferTeaser />
        <main id="main-site">
          <PromoBanner variant="compact" />
          <WhyFastMediaSection />
          <CertificationsSection />
          <AutomationSection />
          <DemosSection />
          <CalculatorShowcase />
          <ServicesSection />
          <PromoBanner variant="full" />
          <ReviewsSection />
          <TeamSection />
          <PricingSection />
          <FAQSection />
          <AppointmentPoliciesSection />
          <ConsultantSection />
          <ServiceAreaMap />
          <BookingSection />
        </main>
        <Footer />
        <StickyCTABar />
      </div>
    </>
  );
};

export default Index;
