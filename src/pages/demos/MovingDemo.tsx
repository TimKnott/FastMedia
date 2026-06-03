import DemoLayout from '@/components/DemoLayout';

const MovingDemo = () => {
  return (
    <DemoLayout
      tradeId="moving"
      tradeName="London Movers"
      tradeIcon="🚚"
      heroTitle={{
        cs: 'Stěhování bez starostí',
        en: 'Stress-Free Moving Services',
        de: 'Stressfreie Umzugsdienste'
      }}
      heroSubtitle={{
        cs: 'Byty, domy, kanceláře, klavíry. Balení, stěhování, montáž nábytku. Okamžitá cenová nabídka online.',
        en: 'Apartments, houses, offices, pianos. Packing, moving, furniture assembly. Instant online quote.',
        de: 'Wohnungen, Häuser, Büros, Klaviere. Verpackung, Umzug, Möbelmontage. Sofortiges Online-Angebot.'
      }}
      services={[
        { title: { cs: 'Stěhování bytů', en: 'Apartment Moving', de: 'Wohnungsumzug' }, description: { cs: 'Kompletní stěhování bytů od balení po vybalení', en: 'Complete apartment moving from packing to unpacking', de: 'Kompletter Wohnungsumzug vom Verpacken bis zum Auspacken' } },
        { title: { cs: 'Firemní stěhování', en: 'Office Relocation', de: 'Büroumzug' }, description: { cs: 'Přesun kanceláří s minimálním přerušením provozu', en: 'Office relocation with minimal business interruption', de: 'Büroumzug mit minimaler Geschäftsunterbrechung' } },
        { title: { cs: 'Balicí služby', en: 'Packing Services', de: 'Verpackungsservice' }, description: { cs: 'Profesionální zabalení a ochrana vašich věcí', en: 'Professional packing and protection of your belongings', de: 'Professionelles Verpacken und Schutz Ihrer Gegenstände' } },
        { title: { cs: 'Přeprava klavírů', en: 'Piano Moving', de: 'Klaviertransport' }, description: { cs: 'Speciální přeprava těžkých a rozměrných předmětů', en: 'Special transport for heavy and bulky items', de: 'Spezialtransport für schwere und sperrige Gegenstände' } },
        { title: { cs: 'Montáž nábytku', en: 'Furniture Assembly', de: 'Möbelmontage' }, description: { cs: 'Demontáž a opětovná montáž nábytku IKEA i dalšího', en: 'Disassembly and reassembly of IKEA and other furniture', de: 'Demontage und Wiedermontage von IKEA- und anderen Möbeln' } },
        { title: { cs: 'Skladování', en: 'Storage', de: 'Lagerung' }, description: { cs: 'Krátkodobé i dlouhodobé uskladnění v zabezpečeném skladu', en: 'Short and long-term storage in secure facilities', de: 'Kurz- und Langzeitlagerung in sicheren Einrichtungen' } },
      ]}
      primaryColor="#0891b2"
      gradientClass="bg-gradient-to-br from-cyan-600 to-teal-500"
    />
  );
};

export default MovingDemo;
