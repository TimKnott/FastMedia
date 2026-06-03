import DemoLayout from '@/components/DemoLayout';

const WeddingPlannerDemo = () => {
  return (
    <DemoLayout
      tradeId="weddingplanner"
      tradeName="London Wedding Planners"
      tradeIcon="💍"
      heroTitle={{
        cs: 'Dokonalá svatba bez starostí',
        en: 'Your Perfect Wedding, Stress-Free',
        de: 'Ihre perfekte Hochzeit, stressfrei'
      }}
      heroSubtitle={{
        cs: 'Kompletní organizace svateb od A do Z. Vaše vize, naše realizace.',
        en: 'Complete wedding planning from A to Z. Your vision, our execution.',
        de: 'Komplette Hochzeitsplanung von A bis Z. Ihre Vision, unsere Umsetzung.'
      }}
      services={[
        { title: { cs: 'Kompletní organizace', en: 'Full planning', de: 'Komplettplanung' }, description: { cs: 'Celková koordinace svatebního dne', en: 'Complete coordination of the wedding day', de: 'Komplette Koordination des Hochzeitstages' } },
        { title: { cs: 'Výběr místa', en: 'Venue selection', de: 'Locationauswahl' }, description: { cs: 'Pomoc s výběrem ideálního místa konání', en: 'Help choosing the ideal venue', de: 'Hilfe bei der Wahl der idealen Location' } },
        { title: { cs: 'Dekorace', en: 'Decorations', de: 'Dekoration' }, description: { cs: 'Květinová výzdoba a styling', en: 'Floral decoration and styling', de: 'Blumendekoration und Styling' } },
        { title: { cs: 'Catering', en: 'Catering', de: 'Catering' }, description: { cs: 'Svatební menu a dort na míru', en: 'Custom wedding menu and cake', de: 'Individuelles Hochzeitsmenü und Torte' } },
        { title: { cs: 'Fotograf & video', en: 'Photo & video', de: 'Foto & Video' }, description: { cs: 'Doporučení a koordinace fotografů', en: 'Photographer recommendations and coordination', de: 'Fotografenempfehlungen und Koordination' } },
        { title: { cs: 'Koordinace na místě', en: 'On-site coordination', de: 'Vor-Ort-Koordination' }, description: { cs: 'Řízení svatebního dne v reálném čase', en: 'Real-time management on the wedding day', de: 'Echtzeitmanagement am Hochzeitstag' } },
      ]}
      primaryColor="#f43f5e"
      gradientClass="bg-gradient-to-br from-rose-400 to-pink-600"
    />
  );
};

export default WeddingPlannerDemo;
