import { useLanguage } from '@/contexts/LanguageContext';
import { useAllSiteSettings } from '@/hooks/useSiteSettings';
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
import CaseStudiesSection from '@/components/CaseStudiesSection';

const Index = () => {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const { isEnabled } = useAllSiteSettings();
  const on = (key: string, fallback = true) => isEnabled(key, fallback);
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
        {on('home_hero') && <OfferTeaser />}
        <main id="main-site">
          {on('home_promo') && <PromoBanner variant="compact" />}
          {on('home_why') && <WhyFastMediaSection />}
          {on('home_certifications') && <CertificationsSection />}
          {on('home_automation') && <AutomationSection />}
          {on('home_demos') && <DemosSection />}
          {on('home_calculator') && <CalculatorShowcase />}
          {on('home_services') && <ServicesSection />}
          {on('home_promo') && <PromoBanner variant="full" />}
          {on('home_case_studies') && <CaseStudiesSection />}
          {on('home_reviews') && <ReviewsSection />}
          {on('home_team') && <TeamSection />}
          {on('show_pricing', false) && <PricingSection />}
          {on('home_faq') && <FAQSection />}
          {on('home_policies') && <AppointmentPoliciesSection />}
          {on('home_consultant') && <ConsultantSection />}
          {on('home_service_area') && <ServiceAreaMap />}
          {on('home_booking') && <BookingSection />}
        </main>
        <Footer />
        {on('home_sticky_cta') && <StickyCTABar />}
      </div>
    </>
  );
};

export default Index;
