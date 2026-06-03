import DemoLayout from '@/components/DemoLayout';

const PlumbingDemo = () => {
  return (
    <DemoLayout
      tradeId="plumbing"
      tradeName="London Plumbing Co."
      tradeIcon="🔧"
      heroTitle={{
        cs: 'Spolehlivé instalatérské služby',
        en: 'Reliable Plumbing Services',
        de: 'Zuverlässige Klempnerdienste'
      }}
      heroSubtitle={{
        cs: 'Rychlý servis, kvalitní práce, férové ceny. Volejte 24/7 pro nouzové opravy.',
        en: 'Fast service, quality work, fair prices. Call 24/7 for emergency repairs.',
        de: 'Schneller Service, Qualitätsarbeit, faire Preise. Rufen Sie 24/7 für Notfallreparaturen an.'
      }}
      services={[
        { title: { cs: 'Opravy vodovodů', en: 'Water pipe repairs', de: 'Wasserrohrreparaturen' }, description: { cs: 'Rychlá diagnostika a oprava jakéhokoli úniku vody', en: 'Fast diagnosis and repair of any water leak', de: 'Schnelle Diagnose und Reparatur von Wasserlecks' } },
        { title: { cs: 'Instalace kotlů', en: 'Boiler installation', de: 'Kesselinstallation' }, description: { cs: 'Profesionální montáž moderních kotelních systémů', en: 'Professional installation of modern boiler systems', de: 'Professionelle Installation moderner Kesselsysteme' } },
        { title: { cs: 'Kanalizace', en: 'Sewage systems', de: 'Abwassersysteme' }, description: { cs: 'Čištění a opravy odpadních potrubí', en: 'Cleaning and repair of waste pipes', de: 'Reinigung und Reparatur von Abwasserleitungen' } },
        { title: { cs: 'Koupelny', en: 'Bathrooms', de: 'Badezimmer' }, description: { cs: 'Kompletní rekonstrukce a instalace koupelen', en: 'Complete bathroom renovation and installation', de: 'Komplette Badezimmerrenovierung und -installation' } },
        { title: { cs: 'Topení', en: 'Heating', de: 'Heizung' }, description: { cs: 'Instalace a servis topných systémů', en: 'Heating system installation and service', de: 'Installation und Service von Heizungsanlagen' } },
        { title: { cs: 'Nouzový servis', en: 'Emergency service', de: 'Notdienst' }, description: { cs: 'Dostupní 24/7 pro urgentní případy', en: 'Available 24/7 for urgent cases', de: 'Rund um die Uhr für dringende Fälle verfügbar' } },
      ]}
      primaryColor="#0ea5e9"
      gradientClass="bg-gradient-to-br from-blue-500 to-cyan-400"
    />
  );
};

export default PlumbingDemo;
