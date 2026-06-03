import DemoLayout from '@/components/DemoLayout';

const CarpentryDemo = () => {
  return (
    <DemoLayout
      tradeId="carpentry"
      tradeName="London Joinery & Carpentry"
      tradeIcon="🪵"
      heroTitle={{
        cs: 'Truhlářské práce na míru',
        en: 'Custom Carpentry Work',
        de: 'Maßgeschneiderte Tischlerarbeiten'
      }}
      heroSubtitle={{
        cs: 'Výroba nábytku, kuchyní, vestavěných skříní. Kvalitní řemeslo s láskou k detailu.',
        en: 'Furniture production, kitchens, built-in wardrobes. Quality craftsmanship with attention to detail.',
        de: 'Möbelproduktion, Küchen, Einbauschränke. Qualitätshandwerk mit Liebe zum Detail.'
      }}
      services={[
        { title: { cs: 'Kuchyně na míru', en: 'Custom kitchens', de: 'Maßküchen' }, description: { cs: 'Návrh a výroba kuchyňských linek', en: 'Design and production of kitchen units', de: 'Design und Herstellung von Küchenzeilen' } },
        { title: { cs: 'Vestavěné skříně', en: 'Built-in wardrobes', de: 'Einbauschränke' }, description: { cs: 'Šatní skříně a úložné systémy', en: 'Wardrobes and storage systems', de: 'Kleiderschränke und Aufbewahrungssysteme' } },
        { title: { cs: 'Nábytek', en: 'Furniture', de: 'Möbel' }, description: { cs: 'Výroba atypického nábytku dle přání', en: 'Production of custom furniture as per request', de: 'Herstellung von Sondermöbeln nach Wunsch' } },
        { title: { cs: 'Dveře a zárubně', en: 'Doors and frames', de: 'Türen und Zargen' }, description: { cs: 'Interiérové dveře a obložkové zárubně', en: 'Interior doors and wooden frames', de: 'Innentüren und Holzzargen' } },
        { title: { cs: 'Schody', en: 'Stairs', de: 'Treppen' }, description: { cs: 'Dřevěná schodiště a zábradlí', en: 'Wooden staircases and railings', de: 'Holztreppen und Geländer' } },
        { title: { cs: 'Renovace', en: 'Renovation', de: 'Renovierung' }, description: { cs: 'Renovace a opravy starého nábytku', en: 'Renovation and repair of old furniture', de: 'Renovierung und Reparatur alter Möbel' } },
      ]}
      primaryColor="#ea580c"
      gradientClass="bg-gradient-to-br from-amber-600 to-orange-700"
    />
  );
};

export default CarpentryDemo;
