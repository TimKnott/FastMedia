import DemoLayout from '@/components/DemoLayout';

const MassageDemo = () => {
  return (
    <DemoLayout
      tradeId="massage"
      tradeName="London Massage Studio"
      tradeIcon="💆‍♀️"
      heroTitle={{
        cs: 'Relaxace a úleva od bolesti',
        en: 'Relaxation & Pain Relief',
        de: 'Entspannung & Schmerzlinderung'
      }}
      heroSubtitle={{
        cs: 'Profesionální masáže pro regeneraci těla a mysli. Klasické, sportovní i relaxační.',
        en: 'Professional massages for body and mind recovery. Classic, sports and relaxation.',
        de: 'Professionelle Massagen für Körper- und Geistregeneration. Klassisch, Sport und Entspannung.'
      }}
      services={[
        { title: { cs: 'Klasická masáž', en: 'Classic massage', de: 'Klassische Massage' }, description: { cs: 'Tradiční masáž pro uvolnění svalů', en: 'Traditional massage for muscle relaxation', de: 'Traditionelle Massage zur Muskelentspannung' } },
        { title: { cs: 'Sportovní masáž', en: 'Sports massage', de: 'Sportmassage' }, description: { cs: 'Regenerace po sportovním výkonu', en: 'Recovery after athletic performance', de: 'Regeneration nach sportlicher Leistung' } },
        { title: { cs: 'Lávové kameny', en: 'Hot stones', de: 'Hot Stone' }, description: { cs: 'Hluboká relaxace teplými kameny', en: 'Deep relaxation with hot stones', de: 'Tiefenentspannung mit heißen Steinen' } },
        { title: { cs: 'Lymfodrenáž', en: 'Lymphatic drainage', de: 'Lymphdrainage' }, description: { cs: 'Podpora lymfatického systému', en: 'Supporting the lymphatic system', de: 'Unterstützung des Lymphsystems' } },
        { title: { cs: 'Thajská masáž', en: 'Thai massage', de: 'Thai-Massage' }, description: { cs: 'Tradiční thajská technika', en: 'Traditional Thai technique', de: 'Traditionelle Thai-Technik' } },
        { title: { cs: 'Těhotenská masáž', en: 'Prenatal massage', de: 'Schwangerschaftsmassage' }, description: { cs: 'Šetrná masáž pro nastávající maminky', en: 'Gentle massage for expecting mothers', de: 'Sanfte Massage für werdende Mütter' } },
      ]}
      primaryColor="#06b6d4"
      gradientClass="bg-gradient-to-br from-cyan-400 to-teal-500"
    />
  );
};

export default MassageDemo;
