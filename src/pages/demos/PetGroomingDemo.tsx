import DemoLayout from '@/components/DemoLayout';

const PetGroomingDemo = () => {
  return (
    <DemoLayout
      tradeId="petgrooming"
      tradeName="London Pet Grooming"
      tradeIcon="🐾"
      heroTitle={{
        cs: 'Péče o vašeho mazlíčka',
        en: 'Caring for Your Pet',
        de: 'Pflege für Ihr Haustier'
      }}
      heroSubtitle={{
        cs: 'Profesionální stříhání, koupání a wellness pro psy a kočky. S láskou k zvířatům.',
        en: 'Professional grooming, bathing and wellness for dogs and cats. With love for animals.',
        de: 'Professionelle Fellpflege, Baden und Wellness für Hunde und Katzen. Mit Liebe zu Tieren.'
      }}
      services={[
        { title: { cs: 'Stříhání psů', en: 'Dog grooming', de: 'Hundefrisur' }, description: { cs: 'Stříhání všech plemen podle standardu', en: 'Grooming all breeds to standard', de: 'Pflege aller Rassen nach Standard' } },
        { title: { cs: 'Koupání', en: 'Bathing', de: 'Baden' }, description: { cs: 'Koupání s profesionální kosmetikou', en: 'Bathing with professional cosmetics', de: 'Baden mit professioneller Kosmetik' } },
        { title: { cs: 'Stříhání drápků', en: 'Nail trimming', de: 'Krallenschneiden' }, description: { cs: 'Šetrné zkrácení drápků', en: 'Gentle nail trimming', de: 'Sanftes Krallenkürzen' } },
        { title: { cs: 'Péče o uši', en: 'Ear care', de: 'Ohrenpflege' }, description: { cs: 'Čištění a kontrola ušních kanálků', en: 'Cleaning and checking ear canals', de: 'Reinigung und Kontrolle der Gehörgänge' } },
        { title: { cs: 'SPA pro mazlíčky', en: 'Pet SPA', de: 'Haustier-SPA' }, description: { cs: 'Relaxační balíčky pro vašeho miláčka', en: 'Relaxation packages for your pet', de: 'Entspannungspakete für Ihr Haustier' } },
        { title: { cs: 'Trimování', en: 'Trimming', de: 'Trimmen' }, description: { cs: 'Ruční trimování drátosrstých plemen', en: 'Hand stripping for wire-haired breeds', de: 'Handtrimmen für drahthaarige Rassen' } },
      ]}
      primaryColor="#f97316"
      gradientClass="bg-gradient-to-br from-orange-400 to-amber-500"
    />
  );
};

export default PetGroomingDemo;
