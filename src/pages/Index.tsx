import { LanguageProvider } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
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

const Index = () => {
  return (
    <LanguageProvider>
      <SEOHead
        title="FastMedia.Pro — Profesionální weby pro řemeslníky a služby"
        description="FastMedia.Pro vytváří konverzní weby pro řemeslníky a servisní firmy. AI chatbot, online rezervace, sběr poptávek. 24 oborových šablon, dodání do 10 dní."
        canonical="/"
        ogType="website"
      />
      <div className="min-h-screen">
        <Navbar />
        <ScrollToTop />
        <main>
          <HeroSection />
          <WhyFastMediaSection />
          <AutomationSection />
          <DemosSection />
          <CalculatorShowcase />
          <ServicesSection />
          <ReviewsSection />
          <PricingSection />
          <FAQSection />
          <ConsultantSection />
          <BookingSection />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
