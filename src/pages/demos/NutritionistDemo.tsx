import DemoLayout from '@/components/DemoLayout';

const NutritionistDemo = () => {
  return (
    <DemoLayout
      tradeId="nutritionist"
      tradeName="London Nutrition Coach"
      tradeIcon="🥗"
      heroTitle={{
        cs: 'Zdravá výživa na míru',
        en: 'Personalized Nutrition Plans',
        de: 'Personalisierte Ernährungspläne'
      }}
      heroSubtitle={{
        cs: 'Individuální jídelníčky a výživové poradenství pro zdraví, energii a vitalitu.',
        en: 'Individual meal plans and nutrition consulting for health, energy and vitality.',
        de: 'Individuelle Speisepläne und Ernährungsberatung für Gesundheit, Energie und Vitalität.'
      }}
      services={[
        { title: { cs: 'Jídelníčky na míru', en: 'Custom meal plans', de: 'Individuelle Speisepläne' }, description: { cs: 'Personalizované stravovací plány', en: 'Personalized dietary plans', de: 'Personalisierte Ernährungspläne' } },
        { title: { cs: 'Hubnutí', en: 'Weight loss', de: 'Gewichtsabnahme' }, description: { cs: 'Zdravé a udržitelné hubnutí', en: 'Healthy and sustainable weight loss', de: 'Gesunde und nachhaltige Gewichtsabnahme' } },
        { title: { cs: 'Sportovní výživa', en: 'Sports nutrition', de: 'Sporternährung' }, description: { cs: 'Výživa pro sportovce a aktivní lidi', en: 'Nutrition for athletes and active people', de: 'Ernährung für Sportler und aktive Menschen' } },
        { title: { cs: 'Detox programy', en: 'Detox programs', de: 'Detox-Programme' }, description: { cs: 'Očistné kúry a regenerační programy', en: 'Cleansing cures and regeneration programs', de: 'Reinigungskuren und Regenerationsprogramme' } },
        { title: { cs: 'Online konzultace', en: 'Online consulting', de: 'Online-Beratung' }, description: { cs: 'Poradenství na dálku přes video', en: 'Remote consulting via video', de: 'Fernberatung per Video' } },
        { title: { cs: 'Skupinové programy', en: 'Group programs', de: 'Gruppenprogramme' }, description: { cs: 'Motivační skupiny a workshopy', en: 'Motivational groups and workshops', de: 'Motivationsgruppen und Workshops' } },
      ]}
      primaryColor="#22c55e"
      gradientClass="bg-gradient-to-br from-green-400 to-emerald-500"
    />
  );
};

export default NutritionistDemo;
