import DemoLayout from '@/components/DemoLayout';

const SolarDemo = () => {
  return (
    <DemoLayout
      tradeId="solar"
      tradeName="Solar Energy CZ"
      tradeIcon="☀️"
      heroTitle={{
        cs: 'Solární energie pro váš domov',
        en: 'Solar Energy for Your Home',
        de: 'Solarenergie für Ihr Zuhause'
      }}
      heroSubtitle={{
        cs: 'Fotovoltaické systémy a solární panely. Ušetřete za energie a pomozte planetě.',
        en: 'Photovoltaic systems and solar panels. Save on energy and help the planet.',
        de: 'Photovoltaikanlagen und Solarmodule. Sparen Sie Energie und helfen Sie dem Planeten.'
      }}
      services={[
        { title: { cs: 'Fotovoltaika', en: 'Photovoltaics', de: 'Photovoltaik' }, description: { cs: 'Kompletní fotovoltaické systémy na klíč', en: 'Complete turnkey photovoltaic systems', de: 'Komplette schlüsselfertige Photovoltaikanlagen' } },
        { title: { cs: 'Bateriová úložiště', en: 'Battery storage', de: 'Batteriespeicher' }, description: { cs: 'Ukládání přebytků energie do baterií', en: 'Storing excess energy in batteries', de: 'Speicherung von Überschussenergie in Batterien' } },
        { title: { cs: 'Ohřev vody', en: 'Water heating', de: 'Warmwasserbereitung' }, description: { cs: 'Solární systémy pro ohřev teplé vody', en: 'Solar systems for hot water heating', de: 'Solarsysteme für Warmwasserbereitung' } },
        { title: { cs: 'Střešní instalace', en: 'Roof installation', de: 'Dachinstallation' }, description: { cs: 'Bezpečná montáž panelů na střechu', en: 'Safe installation of panels on the roof', de: 'Sichere Montage von Paneelen auf dem Dach' } },
        { title: { cs: 'Dotace', en: 'Subsidies', de: 'Subventionen' }, description: { cs: 'Pomoc se získáním dotací', en: 'Help with obtaining subsidies', de: 'Hilfe bei der Beantragung von Fördermitteln' } },
        { title: { cs: 'Servis', en: 'Service', de: 'Service' }, description: { cs: 'Údržba a čištění solárních panelů', en: 'Maintenance and cleaning of solar panels', de: 'Wartung und Reinigung von Solarmodulen' } },
      ]}
      primaryColor="#84cc16"
      gradientClass="bg-gradient-to-br from-yellow-400 to-green-500"
    />
  );
};

export default SolarDemo;
