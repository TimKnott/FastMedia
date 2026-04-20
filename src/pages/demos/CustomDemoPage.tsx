import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomDemo } from '@/hooks/useCustomDemos';
import { registerCustomTradeImages } from '@/data/tradeImages';
import DemoLayout from '@/components/DemoLayout';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const CustomDemoPage = () => {
  const { tradeId } = useParams<{ tradeId: string }>();
  const { language } = useLanguage();
  const { demo, loading } = useCustomDemo(tradeId);

  useEffect(() => {
    if (demo) {
      registerCustomTradeImages(demo.trade_id, demo.hero_image_url, demo.gallery_images || []);
    }
  }, [demo]);

  if (loading) return <PageLoader />;
  if (!demo) return <Navigate to="/" replace />;

  return (
    <DemoLayout
      tradeId={demo.trade_id}
      tradeName={demo.name[language] || demo.name.en || demo.trade_id}
      tradeIcon={demo.icon}
      heroTitle={demo.tagline}
      heroSubtitle={demo.description}
      services={demo.services.map((s) => ({
        title: s.title,
        description: s.description,
      }))}
      primaryColor="hsl(var(--primary))"
      gradientClass={demo.gradient || 'bg-gradient-to-br from-primary/80 to-accent/80'}
    />
  );
};

export default CustomDemoPage;
