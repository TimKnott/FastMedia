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

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Navbar />
        <ScrollToTop />
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
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
