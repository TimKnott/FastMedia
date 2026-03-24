import DemoLayout from '@/components/DemoLayout';

const YogaDemo = () => {
  return (
    <DemoLayout
      tradeId="yoga"
      tradeName="Yoga Studio"
      tradeIcon="🧘‍♀️"
      heroTitle={{
        cs: 'Harmonie těla i mysli',
        en: 'Harmony of Body and Mind',
        de: 'Harmonie von Körper und Geist'
      }}
      heroSubtitle={{
        cs: 'Skupinové i individuální lekce jógy pro všechny úrovně. Online i osobně.',
        en: 'Group and individual yoga classes for all levels. Online and in person.',
        de: 'Gruppen- und Einzelyogakurse für alle Niveaus. Online und vor Ort.'
      }}
      services={[
        { title: { cs: 'Hatha jóga', en: 'Hatha yoga', de: 'Hatha Yoga' }, description: { cs: 'Klasická jóga pro rovnováhu a flexibilitu', en: 'Classic yoga for balance and flexibility', de: 'Klassisches Yoga für Balance und Flexibilität' } },
        { title: { cs: 'Vinyasa flow', en: 'Vinyasa flow', de: 'Vinyasa Flow' }, description: { cs: 'Dynamická jóga propojená s dechem', en: 'Dynamic yoga connected with breath', de: 'Dynamisches Yoga verbunden mit dem Atem' } },
        { title: { cs: 'Prenatální jóga', en: 'Prenatal yoga', de: 'Pränatales Yoga' }, description: { cs: 'Šetrné cvičení pro nastávající maminky', en: 'Gentle exercise for expecting mothers', de: 'Sanftes Training für werdende Mütter' } },
        { title: { cs: 'Meditace', en: 'Meditation', de: 'Meditation' }, description: { cs: 'Řízené meditace pro klid mysli', en: 'Guided meditations for peace of mind', de: 'Geführte Meditationen für inneren Frieden' } },
        { title: { cs: 'Online lekce', en: 'Online classes', de: 'Online-Kurse' }, description: { cs: 'Cvičte z pohodlí domova', en: 'Practice from the comfort of home', de: 'Üben Sie bequem von zu Hause' } },
        { title: { cs: 'Firemní jóga', en: 'Corporate yoga', de: 'Firmenyoga' }, description: { cs: 'Lekce jógy pro zaměstnance firem', en: 'Yoga classes for corporate employees', de: 'Yogakurse für Firmenmitarbeiter' } },
      ]}
      primaryColor="#a855f7"
      gradientClass="bg-gradient-to-br from-purple-400 to-violet-600"
    />
  );
};

export default YogaDemo;
