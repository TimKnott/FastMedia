import DemoLayout from '@/components/DemoLayout';

const DrivingSchoolDemo = () => {
  return (
    <DemoLayout
      tradeId="drivingschool"
      tradeName="Autoškola"
      tradeIcon="🚗"
      heroTitle={{
        cs: 'Řidičský průkaz snadno a rychle',
        en: "Get Your Driver's License Fast",
        de: 'Führerschein einfach und schnell'
      }}
      heroSubtitle={{
        cs: 'Individuální výuka řízení s vysokou úspěšností u zkoušek. Moderní vozový park.',
        en: 'Individual driving instruction with high exam pass rate. Modern vehicle fleet.',
        de: 'Individueller Fahrunterricht mit hoher Prüfungserfolgsquote. Moderner Fuhrpark.'
      }}
      services={[
        { title: { cs: 'Skupina B', en: 'Category B', de: 'Kategorie B' }, description: { cs: 'Řidičské oprávnění na osobní automobily', en: "Driver's license for passenger cars", de: 'Führerschein für PKW' } },
        { title: { cs: 'Kondiční jízdy', en: 'Refresher driving', de: 'Auffrischungsfahrten' }, description: { cs: 'Obnova jistoty za volantem', en: 'Restoring confidence behind the wheel', de: 'Vertrauen am Steuer wiederherstellen' } },
        { title: { cs: 'Motocykly', en: 'Motorcycles', de: 'Motorräder' }, description: { cs: 'Skupina A - motocyklový kurz', en: 'Category A - motorcycle course', de: 'Kategorie A - Motorradkurs' } },
        { title: { cs: 'Defenzivní jízda', en: 'Defensive driving', de: 'Defensives Fahren' }, description: { cs: 'Kurzy bezpečné a defenzivní jízdy', en: 'Safe and defensive driving courses', de: 'Sichere und defensive Fahrkurse' } },
        { title: { cs: 'Teorie online', en: 'Online theory', de: 'Online-Theorie' }, description: { cs: 'E-learning příprava na testy', en: 'E-learning preparation for tests', de: 'E-Learning-Vorbereitung auf Prüfungen' } },
        { title: { cs: 'Nákladní vozy', en: 'Trucks', de: 'LKW' }, description: { cs: 'Řidičské oprávnění skupiny C a D', en: 'Category C and D license', de: 'Führerschein Kategorie C und D' } },
      ]}
      primaryColor="#2563eb"
      gradientClass="bg-gradient-to-br from-blue-600 to-sky-700"
    />
  );
};

export default DrivingSchoolDemo;
