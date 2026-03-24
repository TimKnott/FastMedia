import DemoLayout from '@/components/DemoLayout';

const NailSalonDemo = () => {
  return (
    <DemoLayout
      tradeId="nailsalon"
      tradeName="Nehtové Studio"
      tradeIcon="💅"
      heroTitle={{
        cs: 'Krásné nehty, šťastné ruce',
        en: 'Beautiful Nails, Happy Hands',
        de: 'Schöne Nägel, glückliche Hände'
      }}
      heroSubtitle={{
        cs: 'Gelové, akrylové a přírodní nehty. Manikúra a pedikúra v příjemném prostředí.',
        en: 'Gel, acrylic and natural nails. Manicure and pedicure in a welcoming environment.',
        de: 'Gel-, Acryl- und Naturnägel. Maniküre und Pediküre in angenehmer Atmosphäre.'
      }}
      services={[
        { title: { cs: 'Gelové nehty', en: 'Gel nails', de: 'Gelnägel' }, description: { cs: 'Modeláž a doplnění gelových nehtů', en: 'Gel nail modeling and refills', de: 'Gelnagel-Modellage und Auffüllungen' } },
        { title: { cs: 'Manikúra', en: 'Manicure', de: 'Maniküre' }, description: { cs: 'Klasická i japonská manikúra', en: 'Classic and Japanese manicure', de: 'Klassische und japanische Maniküre' } },
        { title: { cs: 'Pedikúra', en: 'Pedicure', de: 'Pediküre' }, description: { cs: 'Wellness pedikúra s masáží', en: 'Wellness pedicure with massage', de: 'Wellness-Pediküre mit Massage' } },
        { title: { cs: 'Nail art', en: 'Nail art', de: 'Nail Art' }, description: { cs: 'Kreativní zdobení a designy', en: 'Creative decorations and designs', de: 'Kreative Verzierungen und Designs' } },
        { title: { cs: 'Lakování', en: 'Nail polish', de: 'Nagellack' }, description: { cs: 'Běžný a gel lak, shellac', en: 'Regular and gel polish, shellac', de: 'Normallack und Gellack, Shellac' } },
        { title: { cs: 'Péče o ruce', en: 'Hand care', de: 'Handpflege' }, description: { cs: 'Parafínové zábaly a hydratace', en: 'Paraffin wraps and hydration', de: 'Paraffinpackungen und Hydratation' } },
      ]}
      primaryColor="#e11d48"
      gradientClass="bg-gradient-to-br from-rose-500 to-pink-600"
    />
  );
};

export default NailSalonDemo;
