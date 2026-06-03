import DemoLayout from '@/components/DemoLayout';

const HandmadeDemo = () => {
  return (
    <DemoLayout
      tradeId="handmade"
      tradeName="London Handmade Crafts"
      tradeIcon="🎨"
      heroTitle={{
        cs: 'Ruční výroba s příběhem',
        en: 'Handmade with a Story',
        de: 'Handgemacht mit Geschichte'
      }}
      heroSubtitle={{
        cs: 'Unikátní ručně vyráběné produkty. Šperky, keramika, svíčky a dárky s duší.',
        en: 'Unique handmade products. Jewelry, ceramics, candles and gifts with soul.',
        de: 'Einzigartige handgefertigte Produkte. Schmuck, Keramik, Kerzen und Geschenke mit Seele.'
      }}
      services={[
        { title: { cs: 'Ruční šperky', en: 'Handmade jewelry', de: 'Handgemachter Schmuck' }, description: { cs: 'Unikátní šperky z přírodních materiálů', en: 'Unique jewelry from natural materials', de: 'Einzigartiger Schmuck aus natürlichen Materialien' } },
        { title: { cs: 'Keramika', en: 'Ceramics', de: 'Keramik' }, description: { cs: 'Ručně točená a malovaná keramika', en: 'Hand-thrown and painted ceramics', de: 'Handgedrehte und bemalte Keramik' } },
        { title: { cs: 'Svíčky', en: 'Candles', de: 'Kerzen' }, description: { cs: 'Přírodní svíčky ze sójového vosku', en: 'Natural soy wax candles', de: 'Natürliche Sojakerzen' } },
        { title: { cs: 'Dárky na míru', en: 'Custom gifts', de: 'Individuelle Geschenke' }, description: { cs: 'Personalizované dárky pro blízké', en: 'Personalized gifts for loved ones', de: 'Personalisierte Geschenke für Ihre Liebsten' } },
        { title: { cs: 'Workshopy', en: 'Workshops', de: 'Workshops' }, description: { cs: 'Tvořivé kurzy pro dospělé i děti', en: 'Creative courses for adults and children', de: 'Kreativkurse für Erwachsene und Kinder' } },
        { title: { cs: 'Firemní dárky', en: 'Corporate gifts', de: 'Firmengeschenke' }, description: { cs: 'Zakázkové dárky pro firemní klienty', en: 'Custom gifts for corporate clients', de: 'Maßgeschneiderte Geschenke für Firmenkunden' } },
      ]}
      primaryColor="#d946ef"
      gradientClass="bg-gradient-to-br from-fuchsia-400 to-purple-500"
    />
  );
};

export default HandmadeDemo;
