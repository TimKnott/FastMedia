import DemoLayout from '@/components/DemoLayout';

const RealEstateDemo = () => {
  return (
    <DemoLayout
      tradeId="realestate"
      tradeName="Reality Centrum"
      tradeIcon="🏢"
      heroTitle={{
        cs: 'Najdeme vám vysněný domov',
        en: 'We Will Find Your Dream Home',
        de: 'Wir finden Ihr Traumhaus'
      }}
      heroSubtitle={{
        cs: 'Prodej, pronájem a správa nemovitostí. Osobní přístup a odborné poradenství.',
        en: 'Sales, rentals and property management. Personal approach and expert advice.',
        de: 'Verkauf, Vermietung und Immobilienverwaltung. Persönlicher Ansatz und Fachberatung.'
      }}
      services={[
        { title: { cs: 'Prodej nemovitostí', en: 'Property sales', de: 'Immobilienverkauf' }, description: { cs: 'Kompletní servis při prodeji vaší nemovitosti', en: 'Complete service for selling your property', de: 'Kompletter Service für den Verkauf Ihrer Immobilie' } },
        { title: { cs: 'Pronájem', en: 'Rentals', de: 'Vermietung' }, description: { cs: 'Hledání spolehlivých nájemníků', en: 'Finding reliable tenants', de: 'Zuverlässige Mieter finden' } },
        { title: { cs: 'Správa nemovitostí', en: 'Property management', de: 'Immobilienverwaltung' }, description: { cs: 'Profesionální správa a údržba', en: 'Professional management and maintenance', de: 'Professionelle Verwaltung und Instandhaltung' } },
        { title: { cs: 'Odhady', en: 'Valuations', de: 'Bewertungen' }, description: { cs: 'Tržní odhady a znalecké posudky', en: 'Market valuations and expert reports', de: 'Marktbewertungen und Gutachten' } },
        { title: { cs: 'Hypotéky', en: 'Mortgages', de: 'Hypotheken' }, description: { cs: 'Poradenství a zprostředkování hypoték', en: 'Mortgage consulting and brokerage', de: 'Hypothekenberatung und -vermittlung' } },
        { title: { cs: 'Investice', en: 'Investments', de: 'Investitionen' }, description: { cs: 'Investiční příležitosti v nemovitostech', en: 'Real estate investment opportunities', de: 'Immobilien-Investitionsmöglichkeiten' } },
      ]}
      primaryColor="#8b5cf6"
      gradientClass="bg-gradient-to-br from-violet-500 to-purple-700"
    />
  );
};

export default RealEstateDemo;
