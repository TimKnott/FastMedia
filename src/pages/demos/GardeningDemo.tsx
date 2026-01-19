import DemoLayout from '@/components/DemoLayout';

const GardeningDemo = () => {
  return (
    <DemoLayout
      tradeId="gardening"
      tradeName="Zahradní Služby"
      tradeIcon="🌿"
      heroTitle={{
        cs: 'Zahradnické a krajinářské služby',
        en: 'Gardening & Landscaping Services',
        de: 'Garten- und Landschaftsbaudienste'
      }}
      heroSubtitle={{
        cs: 'Návrhy zahrad, údržba, automatické zavlažování. Vytvoříme vaši zahradu snů.',
        en: 'Garden designs, maintenance, automatic irrigation. We will create your dream garden.',
        de: 'Gartengestaltung, Pflege, automatische Bewässerung. Wir erschaffen Ihren Traumgarten.'
      }}
      services={[
        { title: { cs: 'Návrhy zahrad', en: 'Garden designs', de: 'Gartengestaltung' }, description: { cs: '3D vizualizace a profesionální projekty', en: '3D visualization and professional projects', de: '3D-Visualisierung und professionelle Projekte' } },
        { title: { cs: 'Realizace zahrad', en: 'Garden implementation', de: 'Gartenrealisierung' }, description: { cs: 'Kompletní realizace dle projektu', en: 'Complete implementation according to project', de: 'Komplette Umsetzung nach Projekt' } },
        { title: { cs: 'Údržba zeleně', en: 'Green maintenance', de: 'Grünpflege' }, description: { cs: 'Pravidelná péče o trávníky a rostliny', en: 'Regular care of lawns and plants', de: 'Regelmäßige Pflege von Rasen und Pflanzen' } },
        { title: { cs: 'Zavlažování', en: 'Irrigation', de: 'Bewässerung' }, description: { cs: 'Automatické zavlažovací systémy', en: 'Automatic irrigation systems', de: 'Automatische Bewässerungssysteme' } },
        { title: { cs: 'Jezírka a vodní prvky', en: 'Ponds and water features', de: 'Teiche und Wasserspiele' }, description: { cs: 'Stavba zahradních jezírek a fontán', en: 'Construction of garden ponds and fountains', de: 'Bau von Gartenteichen und Brunnen' } },
        { title: { cs: 'Kácení stromů', en: 'Tree felling', de: 'Baumfällung' }, description: { cs: 'Bezpečné kácení a ořez stromů', en: 'Safe tree felling and pruning', de: 'Sichere Baumfällung und Beschneidung' } },
      ]}
      primaryColor="#84cc16"
      gradientClass="bg-gradient-to-br from-green-500 to-lime-400"
    />
  );
};

export default GardeningDemo;
