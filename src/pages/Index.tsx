import { useLanguage } from '@/contexts/LanguageContext';
import { useAllSiteSettings } from '@/hooks/useSiteSettings';
import Navbar from '@/components/Navbar';
import WhyFastMediaSection from '@/components/WhyFastMediaSection';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import SEOHead from '@/components/SEOHead';
import HomeJsonLd from '@/components/HomeJsonLd';
import PromoBanner from '@/components/PromoBanner';
import StickyCTABar from '@/components/StickyCTABar';
import OfferTeaser from '@/components/OfferTeaser';
import HomeDirectAnswer from '@/components/HomeDirectAnswer';
import ShowcaseCarousel from '@/components/ShowcaseCarousel';
import { lazy } from 'react';
import LazySection from '@/components/LazySection';
const AutomationSection = lazy(() => import('@/components/AutomationSection'));
const DemosSection = lazy(() => import('@/components/DemosSection'));
const CalculatorShowcase = lazy(() => import('@/components/CalculatorShowcase'));
const ServicesSection = lazy(() => import('@/components/ServicesSection'));
const CaseStudiesSection = lazy(() => import('@/components/CaseStudiesSection'));
const ReviewsSection = lazy(() => import('@/components/ReviewsSection'));
const TeamSection = lazy(() => import('@/components/TeamSection'));
const PricingSection = lazy(() => import('@/components/PricingSection'));
const FAQSection = lazy(() => import('@/components/FAQSection'));
const AppointmentPoliciesSection = lazy(() => import('@/components/AppointmentPoliciesSection'));
const ConsultantSection = lazy(() => import('@/components/ConsultantSection'));
const ServiceAreaMap = lazy(() => import('@/components/ServiceAreaMap'));
const BookingSection = lazy(() => import('@/components/BookingSection'));
const CertificationsSection = lazy(() => import('@/components/CertificationsSection'));

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
          <ShowcaseCarousel />
          {on('home_promo') && <PromoBanner variant="compact" />}
          <HomeDirectAnswer />
          {on('home_why') && <WhyFastMediaSection />}
          {on('home_certifications') && <LazySection><CertificationsSection /></LazySection>}
          {on('home_automation') && <LazySection><AutomationSection /></LazySection>}
          {on('home_demos') && <LazySection><DemosSection /></LazySection>}
          {on('home_calculator') && <LazySection><CalculatorShowcase /></LazySection>}
          {on('home_services') && <LazySection><ServicesSection /></LazySection>}
          {on('home_promo') && <PromoBanner variant="full" />}
          {on('home_case_studies') && <LazySection><CaseStudiesSection /></LazySection>}
          {on('home_reviews') && <LazySection><ReviewsSection /></LazySection>}
          {on('home_team') && <LazySection><TeamSection /></LazySection>}
          {on('show_pricing', false) && <LazySection><PricingSection /></LazySection>}
          {on('home_faq') && <LazySection><FAQSection /></LazySection>}
          {on('home_policies') && <LazySection><AppointmentPoliciesSection /></LazySection>}
          {on('home_consultant') && <LazySection><ConsultantSection /></LazySection>}
          {on('home_service_area') && <LazySection><ServiceAreaMap /></LazySection>}
          {on('home_booking') && <LazySection><BookingSection /></LazySection>}
        </main>
        <Footer />
        {on('home_sticky_cta') && <StickyCTABar />}
      </div>
    </>
  );
};

export default Index;
