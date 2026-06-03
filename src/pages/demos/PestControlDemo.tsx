import DemoLayout from '@/components/DemoLayout';

const PestControlDemo = () => {
  return (
    <DemoLayout
      tradeId="pestcontrol"
      tradeName="PestPro London"
      tradeIcon="🐛"
      heroTitle={{
        cs: 'Profesionální deratizace a dezinsekce',
        en: 'Professional Pest Control Services',
        de: 'Professionelle Schädlingsbekämpfung'
      }}
      heroSubtitle={{
        cs: 'Rychlý a diskrétní zásah proti škůdcům. Garantovaný výsledek s ekologickými prostředky.',
        en: 'Fast and discreet pest intervention. Guaranteed results with eco-friendly products.',
        de: 'Schnelle und diskrete Schädlingsintervention. Garantierte Ergebnisse mit umweltfreundlichen Produkten.'
      }}
      services={[
        { title: { cs: 'Deratizace', en: 'Rodent Control', de: 'Nagetierbekämpfung' }, description: { cs: 'Efektivní odstraňování hlodavců s preventivními opatřeními', en: 'Effective rodent removal with preventive measures', de: 'Effektive Nagetierentfernung mit vorbeugenden Maßnahmen' } },
        { title: { cs: 'Dezinsekce', en: 'Insect Control', de: 'Insektenbekämpfung' }, description: { cs: 'Likvidace štěnic, švábů, mravenců a dalšího hmyzu', en: 'Elimination of bedbugs, cockroaches, ants and other insects', de: 'Beseitigung von Bettwanzen, Kakerlaken, Ameisen und anderen Insekten' } },
        { title: { cs: 'Dezinfekce', en: 'Disinfection', de: 'Desinfektion' }, description: { cs: 'Profesionální dezinfekce prostor a povrchů', en: 'Professional disinfection of spaces and surfaces', de: 'Professionelle Desinfektion von Räumen und Oberflächen' } },
        { title: { cs: 'Hubení vos a sršňů', en: 'Wasp & Hornet Removal', de: 'Wespen- & Hornissenentfernung' }, description: { cs: 'Bezpečné odstranění hnízd vos a sršňů', en: 'Safe removal of wasp and hornet nests', de: 'Sichere Entfernung von Wespen- und Hornissennestern' } },
        { title: { cs: 'Prevence', en: 'Prevention', de: 'Prävention' }, description: { cs: 'Pravidelné preventivní prohlídky a ošetření', en: 'Regular preventive inspections and treatments', de: 'Regelmäßige vorbeugende Inspektionen und Behandlungen' } },
        { title: { cs: 'Pohotovost 24/7', en: '24/7 Emergency', de: '24/7 Notdienst' }, description: { cs: 'Nonstop pohotovostní služba pro akutní případy', en: 'Non-stop emergency service for acute cases', de: 'Rund-um-die-Uhr-Notdienst für akute Fälle' } },
      ]}
      primaryColor="#16a34a"
      gradientClass="bg-gradient-to-br from-green-600 to-emerald-500"
    />
  );
};

export default PestControlDemo;
