import DemoLayout from '@/components/DemoLayout';

const InteriorDemo = () => {
  return (
    <DemoLayout
      tradeName="Interiér Studio"
      tradeIcon="🛋️"
      heroTitle={{
        cs: 'Interiérový design na míru',
        en: 'Custom Interior Design',
        de: 'Maßgeschneidertes Innendesign'
      }}
      heroSubtitle={{
        cs: 'Vytváříme prostory, ve kterých se budete cítit jako doma. Od návrhu po realizaci.',
        en: 'Creating spaces where you will feel at home. From design to implementation.',
        de: 'Wir schaffen Räume, in denen Sie sich wie zu Hause fühlen. Vom Design bis zur Umsetzung.'
      }}
      services={[
        { title: { cs: 'Návrhy interiérů', en: 'Interior designs', de: 'Innenraumgestaltung' }, description: { cs: '3D vizualizace a kompletní projekty', en: '3D visualization and complete projects', de: '3D-Visualisierung und komplette Projekte' } },
        { title: { cs: 'Realizace', en: 'Implementation', de: 'Umsetzung' }, description: { cs: 'Kompletní realizace dle návrhu', en: 'Complete implementation according to design', de: 'Komplette Umsetzung nach Design' } },
        { title: { cs: 'Výběr materiálů', en: 'Material selection', de: 'Materialauswahl' }, description: { cs: 'Pomoc s výběrem materiálů a doplňků', en: 'Help with selection of materials and accessories', de: 'Hilfe bei der Auswahl von Materialien und Zubehör' } },
        { title: { cs: 'Nábytek na míru', en: 'Custom furniture', de: 'Maßgeschneiderte Möbel' }, description: { cs: 'Návrh a výroba atypického nábytku', en: 'Design and production of custom furniture', de: 'Design und Herstellung von Sondermöbeln' } },
        { title: { cs: 'Osvětlení', en: 'Lighting', de: 'Beleuchtung' }, description: { cs: 'Návrhy světelných scén', en: 'Lighting scene designs', de: 'Lichtszenendesign' } },
        { title: { cs: 'Home staging', en: 'Home staging', de: 'Home Staging' }, description: { cs: 'Příprava nemovitostí na prodej', en: 'Preparing properties for sale', de: 'Vorbereitung von Immobilien für den Verkauf' } },
      ]}
      primaryColor="#eab308"
      gradientClass="bg-gradient-to-br from-amber-400 to-yellow-500"
    />
  );
};

export default InteriorDemo;
