import DemoLayout from '@/components/DemoLayout';

const DrywallDemo = () => {
  return (
    <DemoLayout
      tradeName="SDK Montáže"
      tradeIcon="🧱"
      heroTitle={{
        cs: 'Sádrokartonové konstrukce',
        en: 'Drywall Construction',
        de: 'Trockenbaukonstruktionen'
      }}
      heroSubtitle={{
        cs: 'Profesionální SDK práce - příčky, podhledy, zateplení podkroví.',
        en: 'Professional drywall work - partitions, ceilings, attic insulation.',
        de: 'Professionelle Trockenbauarbeiten - Trennwände, Decken, Dachbodendämmung.'
      }}
      services={[
        { title: { cs: 'SDK příčky', en: 'Drywall partitions', de: 'Trockenbauwände' }, description: { cs: 'Stavba příček a dělících stěn', en: 'Construction of partitions and dividing walls', de: 'Bau von Trennwänden und Raumteilern' } },
        { title: { cs: 'Podhledy', en: 'Suspended ceilings', de: 'Abgehängte Decken' }, description: { cs: 'Instalace sádrokartonových podhledů', en: 'Installation of drywall suspended ceilings', de: 'Installation von Gipskarton-Abhangdecken' } },
        { title: { cs: 'Zateplení podkroví', en: 'Attic insulation', de: 'Dachbodendämmung' }, description: { cs: 'Tepelná izolace podkrovních prostor', en: 'Thermal insulation of attic spaces', de: 'Wärmedämmung von Dachbodenräumen' } },
        { title: { cs: 'Obklady', en: 'Cladding', de: 'Verkleidungen' }, description: { cs: 'Obklady stěn a stropů', en: 'Wall and ceiling cladding', de: 'Wand- und Deckenverkleidungen' } },
        { title: { cs: 'Šachtové stěny', en: 'Shaft walls', de: 'Schachtwände' }, description: { cs: 'Konstrukce pro vedení instalací', en: 'Construction for installation routing', de: 'Konstruktion für Installationsführung' } },
        { title: { cs: 'Akustické řešení', en: 'Acoustic solutions', de: 'Akustiklösungen' }, description: { cs: 'Protihlukové a akustické příčky', en: 'Soundproof and acoustic partitions', de: 'Schallschutz- und Akustikwände' } },
      ]}
      primaryColor="#64748b"
      gradientClass="bg-gradient-to-br from-gray-400 to-slate-500"
    />
  );
};

export default DrywallDemo;
