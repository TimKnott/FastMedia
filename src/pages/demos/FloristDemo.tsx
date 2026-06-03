import DemoLayout from '@/components/DemoLayout';

const FloristDemo = () => {
  return (
    <DemoLayout
      tradeId="florist"
      tradeName="London Florist"
      tradeIcon="🌸"
      heroTitle={{
        cs: 'Květiny pro každou příležitost',
        en: 'Flowers for Every Occasion',
        de: 'Blumen für jeden Anlass'
      }}
      heroSubtitle={{
        cs: 'Čerstvé kytice, svatební floristika a dekorace s doručením po celém městě.',
        en: 'Fresh bouquets, wedding floristry and decorations with delivery across the city.',
        de: 'Frische Sträuße, Hochzeitsfloristik und Dekorationen mit Lieferung in der ganzen Stadt.'
      }}
      services={[
        { title: { cs: 'Kytice na objednávku', en: 'Custom bouquets', de: 'Individuelle Sträuße' }, description: { cs: 'Kytice sestavené podle vašich přání', en: 'Bouquets arranged according to your wishes', de: 'Sträuße nach Ihren Wünschen' } },
        { title: { cs: 'Svatební floristika', en: 'Wedding floristry', de: 'Hochzeitsfloristik' }, description: { cs: 'Kompletní květinový servis pro svatby', en: 'Complete floral service for weddings', de: 'Kompletter Blumenservice für Hochzeiten' } },
        { title: { cs: 'Firemní dekorace', en: 'Corporate decorations', de: 'Firmendekorationen' }, description: { cs: 'Pravidelné dodávky květin do kanceláří', en: 'Regular flower deliveries to offices', de: 'Regelmäßige Blumenlieferungen ins Büro' } },
        { title: { cs: 'Smuteční kytice', en: 'Funeral arrangements', de: 'Trauergestecke' }, description: { cs: 'Pietní kytice a věnce', en: 'Memorial bouquets and wreaths', de: 'Gedenksträuße und Kränze' } },
        { title: { cs: 'Rostliny', en: 'Plants', de: 'Pflanzen' }, description: { cs: 'Pokojové a venkovní rostliny', en: 'Indoor and outdoor plants', de: 'Zimmer- und Außenpflanzen' } },
        { title: { cs: 'Rozvoz květin', en: 'Flower delivery', de: 'Blumenlieferung' }, description: { cs: 'Expresní doručení po celém městě', en: 'Express delivery across the city', de: 'Expresslieferung in der ganzen Stadt' } },
      ]}
      primaryColor="#f472b6"
      gradientClass="bg-gradient-to-br from-pink-400 to-rose-500"
    />
  );
};

export default FloristDemo;
