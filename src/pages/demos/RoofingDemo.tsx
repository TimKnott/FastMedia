import DemoLayout from '@/components/DemoLayout';

const RoofingDemo = () => {
  return (
    <DemoLayout
      tradeId="roofing"
      tradeName="London Roofing Experts"
      tradeIcon="🏠"
      heroTitle={{
        cs: 'Střechy na celý život',
        en: 'Roofs for a Lifetime',
        de: 'Dächer fürs Leben'
      }}
      heroSubtitle={{
        cs: 'Kvalitní pokrývačské práce s garancí. Nové střechy, opravy, údržba.',
        en: 'Quality roofing work with guarantee. New roofs, repairs, maintenance.',
        de: 'Qualitätsdacharbeiten mit Garantie. Neue Dächer, Reparaturen, Wartung.'
      }}
      services={[
        { title: { cs: 'Nové střechy', en: 'New roofs', de: 'Neue Dächer' }, description: { cs: 'Kompletní pokládka nových střešních krytin', en: 'Complete installation of new roofing', de: 'Komplette Verlegung neuer Dacheindeckungen' } },
        { title: { cs: 'Opravy střech', en: 'Roof repairs', de: 'Dachreparaturen' }, description: { cs: 'Rychlé opravy a odstranění netěsností', en: 'Quick repairs and leak removal', de: 'Schnelle Reparaturen und Leckbeseitigung' } },
        { title: { cs: 'Rekonstrukce', en: 'Renovations', de: 'Renovierungen' }, description: { cs: 'Kompletní rekonstrukce starých střech', en: 'Complete renovation of old roofs', de: 'Komplettrenovierung alter Dächer' } },
        { title: { cs: 'Izolace', en: 'Insulation', de: 'Isolierung' }, description: { cs: 'Tepelná a hydroizolace střech', en: 'Thermal and waterproof roof insulation', de: 'Wärme- und Feuchtigkeitsisolierung von Dächern' } },
        { title: { cs: 'Okapy a svody', en: 'Gutters', de: 'Dachrinnen' }, description: { cs: 'Montáž a čištění okapových systémů', en: 'Installation and cleaning of gutter systems', de: 'Montage und Reinigung von Rinnensystemen' } },
        { title: { cs: 'Střešní okna', en: 'Skylights', de: 'Dachfenster' }, description: { cs: 'Instalace střešních oken a vikýřů', en: 'Installation of skylights and dormers', de: 'Installation von Dachfenstern und Gauben' } },
      ]}
      primaryColor="#ef4444"
      gradientClass="bg-gradient-to-br from-red-500 to-rose-600"
    />
  );
};

export default RoofingDemo;
