import DemoLayout from '@/components/DemoLayout';

const DentalDemo = () => {
  return (
    <DemoLayout
      tradeId="dental"
      tradeName="Zubní Klinika"
      tradeIcon="🦷"
      heroTitle={{
        cs: 'Váš úsměv v těch nejlepších rukou',
        en: 'Your Smile in the Best Hands',
        de: 'Ihr Lächeln in den besten Händen'
      }}
      heroSubtitle={{
        cs: 'Moderní zubní péče s důrazem na komfort pacienta. Preventivní i estetická stomatologie.',
        en: 'Modern dental care with emphasis on patient comfort. Preventive and aesthetic dentistry.',
        de: 'Moderne Zahnpflege mit Schwerpunkt auf Patientenkomfort. Präventive und ästhetische Zahnmedizin.'
      }}
      services={[
        { title: { cs: 'Preventivní prohlídky', en: 'Preventive checkups', de: 'Vorsorgeuntersuchungen' }, description: { cs: 'Pravidelné kontroly a dentální hygiena', en: 'Regular checkups and dental hygiene', de: 'Regelmäßige Kontrollen und Zahnhygiene' } },
        { title: { cs: 'Bělení zubů', en: 'Teeth whitening', de: 'Zahnaufhellung' }, description: { cs: 'Profesionální bělení pro zářivý úsměv', en: 'Professional whitening for a radiant smile', de: 'Professionelle Aufhellung für ein strahlendes Lächeln' } },
        { title: { cs: 'Implantáty', en: 'Dental implants', de: 'Zahnimplantate' }, description: { cs: 'Špičkové zubní implantáty a korunky', en: 'Top-quality dental implants and crowns', de: 'Hochwertige Zahnimplantate und Kronen' } },
        { title: { cs: 'Rovnátka', en: 'Orthodontics', de: 'Kieferorthopädie' }, description: { cs: 'Neviditelná rovnátka a ortodontická léčba', en: 'Invisible braces and orthodontic treatment', de: 'Unsichtbare Zahnspangen und kieferorthopädische Behandlung' } },
        { title: { cs: 'Chirurgie', en: 'Oral surgery', de: 'Oralchirurgie' }, description: { cs: 'Šetrné chirurgické zákroky', en: 'Gentle surgical procedures', de: 'Schonende chirurgische Eingriffe' } },
        { title: { cs: 'Dětská stomatologie', en: 'Pediatric dentistry', de: 'Kinderzahnmedizin' }, description: { cs: 'Zubní péče pro nejmenší pacienty', en: 'Dental care for the youngest patients', de: 'Zahnpflege für die jüngsten Patienten' } },
      ]}
      primaryColor="#06b6d4"
      gradientClass="bg-gradient-to-br from-cyan-500 to-teal-600"
    />
  );
};

export default DentalDemo;
