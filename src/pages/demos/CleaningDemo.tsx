import DemoLayout from '@/components/DemoLayout';

const CleaningDemo = () => {
  return (
    <DemoLayout
      tradeId="cleaning"
      tradeName="Úklid Premium"
      tradeIcon="✨"
      heroTitle={{
        cs: 'Profesionální úklidové služby',
        en: 'Professional Cleaning Services',
        de: 'Professionelle Reinigungsdienste'
      }}
      heroSubtitle={{
        cs: 'Úklid domácností, kanceláří i průmyslových prostor. Spolehlivost a kvalita.',
        en: 'Cleaning of households, offices and industrial premises. Reliability and quality.',
        de: 'Reinigung von Haushalten, Büros und Industrieräumen. Zuverlässigkeit und Qualität.'
      }}
      services={[
        { title: { cs: 'Pravidelný úklid', en: 'Regular cleaning', de: 'Regelmäßige Reinigung' }, description: { cs: 'Pravidelná údržba domácností a kanceláří', en: 'Regular maintenance of households and offices', de: 'Regelmäßige Wartung von Haushalten und Büros' } },
        { title: { cs: 'Generální úklid', en: 'Deep cleaning', de: 'Grundreinigung' }, description: { cs: 'Kompletní důkladný úklid prostor', en: 'Complete thorough cleaning of premises', de: 'Komplette gründliche Reinigung von Räumlichkeiten' } },
        { title: { cs: 'Mytí oken', en: 'Window cleaning', de: 'Fensterreinigung' }, description: { cs: 'Profesionální mytí oken a výloh', en: 'Professional cleaning of windows and shop fronts', de: 'Professionelle Reinigung von Fenstern und Schaufenstern' } },
        { title: { cs: 'Čištění koberců', en: 'Carpet cleaning', de: 'Teppichreinigung' }, description: { cs: 'Hloubkové čištění koberců a čalounění', en: 'Deep cleaning of carpets and upholstery', de: 'Tiefenreinigung von Teppichen und Polstern' } },
        { title: { cs: 'Úklid po stavbě', en: 'Post-construction cleaning', de: 'Bauendreinigung' }, description: { cs: 'Specializovaný úklid po rekonstrukcích', en: 'Specialized cleaning after renovations', de: 'Spezialisierte Reinigung nach Renovierungen' } },
        { title: { cs: 'Dezinfekce', en: 'Disinfection', de: 'Desinfektion' }, description: { cs: 'Profesionální dezinfekce prostor', en: 'Professional disinfection of premises', de: 'Professionelle Desinfektion von Räumlichkeiten' } },
      ]}
      primaryColor="#22d3ee"
      gradientClass="bg-gradient-to-br from-cyan-400 to-blue-400"
    />
  );
};

export default CleaningDemo;
