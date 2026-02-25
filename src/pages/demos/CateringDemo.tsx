import DemoLayout from '@/components/DemoLayout';

const CateringDemo = () => {
  return (
    <DemoLayout
      tradeId="catering"
      tradeName="Catering Dobroty"
      tradeIcon="🍽️"
      heroTitle={{
        cs: 'Catering a jídlo na každou akci',
        en: 'Catering & Food for Every Event',
        de: 'Catering & Essen für jedes Event'
      }}
      heroSubtitle={{
        cs: 'Svatby, firemní akce, oslavy, konference. Čerstvé jídlo, profesionální servis, nezapomenutelný zážitek.',
        en: 'Weddings, corporate events, celebrations, conferences. Fresh food, professional service, unforgettable experience.',
        de: 'Hochzeiten, Firmenevents, Feiern, Konferenzen. Frisches Essen, professioneller Service, unvergessliches Erlebnis.'
      }}
      services={[
        { title: { cs: 'Svatební catering', en: 'Wedding Catering', de: 'Hochzeits-Catering' }, description: { cs: 'Kompletní menu pro váš svatební den od přípitku po dort', en: 'Complete menu for your wedding day from toast to cake', de: 'Komplettes Menü für Ihren Hochzeitstag vom Toast bis zur Torte' } },
        { title: { cs: 'Firemní akce', en: 'Corporate Events', de: 'Firmenveranstaltungen' }, description: { cs: 'Občerstvení, obědy, konferenční catering pro firmy', en: 'Refreshments, lunches, conference catering for businesses', de: 'Erfrischungen, Mittagessen, Konferenz-Catering für Unternehmen' } },
        { title: { cs: 'Soukromé oslavy', en: 'Private Parties', de: 'Privatfeiern' }, description: { cs: 'Narozeniny, výročí, garden party, grilování', en: 'Birthdays, anniversaries, garden parties, BBQ', de: 'Geburtstage, Jubiläen, Gartenpartys, Grillen' } },
        { title: { cs: 'Rozvoz obědů', en: 'Lunch Delivery', de: 'Mittagslieferung' }, description: { cs: 'Denní menu s rozvozem do kanceláří', en: 'Daily menu with delivery to offices', de: 'Tagesmenü mit Lieferung ins Büro' } },
        { title: { cs: 'Food truck', en: 'Food Truck', de: 'Food Truck' }, description: { cs: 'Mobilní gastronomie pro festivaly a akce', en: 'Mobile gastronomy for festivals and events', de: 'Mobile Gastronomie für Festivals und Events' } },
        { title: { cs: 'Degustační menu', en: 'Tasting Menu', de: 'Degustationsmenü' }, description: { cs: 'Exkluzivní degustační zážitky na klíč', en: 'Exclusive turnkey tasting experiences', de: 'Exklusive schlüsselfertige Verkostungserlebnisse' } },
      ]}
      primaryColor="#f59e0b"
      gradientClass="bg-gradient-to-br from-amber-500 to-orange-500"
    />
  );
};

export default CateringDemo;
