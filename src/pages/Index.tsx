import { LanguageProvider } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import DemosSection from '@/components/DemosSection';
import ServicesSection from '@/components/ServicesSection';
import ReviewsSection from '@/components/ReviewsSection';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import ConsultantSection from '@/components/ConsultantSection';
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
        <DemosSection />
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
