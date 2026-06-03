import DemoLayout from '@/components/DemoLayout';

const TattooDemo = () => {
  return (
    <DemoLayout
      tradeId="tattoo"
      tradeName="London Tattoo Studio"
      tradeIcon="🎨"
      heroTitle={{
        cs: 'Umění na vaší kůži',
        en: 'Art on Your Skin',
        de: 'Kunst auf Ihrer Haut'
      }}
      heroSubtitle={{
        cs: 'Originální tetování od zkušených umělců. Každý kousek je unikátní dílo.',
        en: 'Original tattoos from experienced artists. Every piece is a unique work of art.',
        de: 'Originale Tätowierungen von erfahrenen Künstlern. Jedes Stück ist ein einzigartiges Kunstwerk.'
      }}
      services={[
        { title: { cs: 'Tetování na míru', en: 'Custom tattoos', de: 'Individuelle Tätowierungen' }, description: { cs: 'Originální návrhy podle vašich představ', en: 'Original designs according to your vision', de: 'Originelle Designs nach Ihren Vorstellungen' } },
        { title: { cs: 'Cover-up', en: 'Cover-up', de: 'Cover-up' }, description: { cs: 'Překrytí starých nebo nevydařených tetování', en: 'Covering old or unwanted tattoos', de: 'Überdecken alter oder unerwünschter Tätowierungen' } },
        { title: { cs: 'Realistické tetování', en: 'Realistic tattoos', de: 'Realistische Tätowierungen' }, description: { cs: 'Fotorealistická díla s úžasným detailem', en: 'Photo-realistic work with amazing detail', de: 'Fotorealistische Arbeiten mit erstaunlichen Details' } },
        { title: { cs: 'Minimalistické', en: 'Minimalist', de: 'Minimalistisch' }, description: { cs: 'Jemné linie a minimalistický styl', en: 'Fine lines and minimalist style', de: 'Feine Linien und minimalistischer Stil' } },
        { title: { cs: 'Piercing', en: 'Piercing', de: 'Piercing' }, description: { cs: 'Profesionální piercing se sterilním vybavením', en: 'Professional piercing with sterile equipment', de: 'Professionelles Piercing mit sterilem Equipment' } },
        { title: { cs: 'Konzultace', en: 'Consultation', de: 'Beratung' }, description: { cs: 'Bezplatná konzultace a návrh motivu', en: 'Free consultation and design proposal', de: 'Kostenlose Beratung und Designvorschlag' } },
      ]}
      primaryColor="#dc2626"
      gradientClass="bg-gradient-to-br from-red-600 to-rose-800"
    />
  );
};

export default TattooDemo;
