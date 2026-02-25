import DemoLayout from '@/components/DemoLayout';

const PhotographyDemo = () => {
  return (
    <DemoLayout
      tradeId="photography"
      tradeName="Studio Lucie"
      tradeIcon="📷"
      heroTitle={{
        cs: 'Profesionální fotografka pro každou příležitost',
        en: 'Professional Photography for Every Occasion',
        de: 'Professionelle Fotografie für jeden Anlass'
      }}
      heroSubtitle={{
        cs: 'Svatby, portréty, firemní focení, produktová fotografie. Online galerie a okamžitá rezervace.',
        en: 'Weddings, portraits, corporate, product photography. Online gallery and instant booking.',
        de: 'Hochzeiten, Porträts, Firmen-, Produktfotografie. Online-Galerie und sofortige Buchung.'
      }}
      services={[
        { title: { cs: 'Svatební fotografie', en: 'Wedding Photography', de: 'Hochzeitsfotografie' }, description: { cs: 'Zachytíme každý důležitý okamžik vašeho velkého dne', en: 'We capture every important moment of your big day', de: 'Wir halten jeden wichtigen Moment Ihres großen Tages fest' } },
        { title: { cs: 'Portrétní focení', en: 'Portrait Sessions', de: 'Porträtsitzungen' }, description: { cs: 'Profesionální portréty pro jednotlivce, páry i rodiny', en: 'Professional portraits for individuals, couples and families', de: 'Professionelle Porträts für Einzelpersonen, Paare und Familien' } },
        { title: { cs: 'Firemní focení', en: 'Corporate Photography', de: 'Unternehmensfotografie' }, description: { cs: 'Týmové fotky, headshoty, firemní akce', en: 'Team photos, headshots, corporate events', de: 'Teamfotos, Headshots, Firmenveranstaltungen' } },
        { title: { cs: 'Produktová fotografie', en: 'Product Photography', de: 'Produktfotografie' }, description: { cs: 'Profesionální snímky produktů pro e-shop a katalog', en: 'Professional product shots for e-shop and catalog', de: 'Professionelle Produktaufnahmen für E-Shop und Katalog' } },
        { title: { cs: 'Focení nemovitostí', en: 'Real Estate Photography', de: 'Immobilienfotografie' }, description: { cs: 'Kvalitní fotky pro realitní makléře a majitele', en: 'Quality photos for real estate agents and owners', de: 'Qualitätsfotos für Immobilienmakler und Eigentümer' } },
        { title: { cs: 'Video produkce', en: 'Video Production', de: 'Videoproduktion' }, description: { cs: 'Krátká promo videa, svatební videografie', en: 'Short promo videos, wedding videography', de: 'Kurze Promovideos, Hochzeitsvideografie' } },
      ]}
      primaryColor="#a855f7"
      gradientClass="bg-gradient-to-br from-purple-500 to-pink-500"
    />
  );
};

export default PhotographyDemo;
