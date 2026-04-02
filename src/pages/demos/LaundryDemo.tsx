import DemoLayout from '@/components/DemoLayout';

const LaundryDemo = () => {
  return (
    <DemoLayout
      tradeId="laundry"
      tradeName="Prádelna & Čistírna"
      tradeIcon="👔"
      heroTitle={{
        cs: 'Čistota pro váš šatník',
        en: 'Cleanliness for Your Wardrobe',
        de: 'Sauberkeit für Ihren Kleiderschrank'
      }}
      heroSubtitle={{
        cs: 'Profesionální praní, čištění a žehlení. Šetrné zacházení s vašimi oděvy.',
        en: 'Professional washing, dry cleaning and ironing. Gentle care for your garments.',
        de: 'Professionelles Waschen, Chemische Reinigung und Bügeln. Schonende Behandlung Ihrer Kleidung.'
      }}
      services={[
        { title: { cs: 'Chemické čištění', en: 'Dry cleaning', de: 'Chemische Reinigung' }, description: { cs: 'Šetrné čištění citlivých materiálů', en: 'Gentle cleaning of delicate materials', de: 'Schonende Reinigung empfindlicher Materialien' } },
        { title: { cs: 'Praní prádla', en: 'Laundry service', de: 'Wäscheservice' }, description: { cs: 'Profesionální praní a sušení', en: 'Professional washing and drying', de: 'Professionelles Waschen und Trocknen' } },
        { title: { cs: 'Žehlení', en: 'Ironing', de: 'Bügeln' }, description: { cs: 'Precizní žehlení košil a obleků', en: 'Precise ironing of shirts and suits', de: 'Präzises Bügeln von Hemden und Anzügen' } },
        { title: { cs: 'Kožené zboží', en: 'Leather goods', de: 'Lederwaren' }, description: { cs: 'Čištění a ošetření kůže', en: 'Leather cleaning and conditioning', de: 'Lederreinigung und -pflege' } },
        { title: { cs: 'Úpravy oděvů', en: 'Alterations', de: 'Änderungen' }, description: { cs: 'Krejčovské úpravy a opravy', en: 'Tailoring alterations and repairs', de: 'Schneiderarbeiten und Reparaturen' } },
        { title: { cs: 'Svoz a rozvoz', en: 'Pickup & delivery', de: 'Abholung & Lieferung' }, description: { cs: 'Pohodlný svoz a doručení domů', en: 'Convenient pickup and home delivery', de: 'Bequeme Abholung und Lieferung nach Hause' } },
      ]}
      primaryColor="#0891b2"
      gradientClass="bg-gradient-to-br from-cyan-600 to-sky-700"
    />
  );
};

export default LaundryDemo;
