import DemoLayout from '@/components/DemoLayout';

const VeterinaryDemo = () => {
  return (
    <DemoLayout
      tradeId="veterinary"
      tradeName="London Veterinary Clinic"
      tradeIcon="🐾"
      heroTitle={{
        cs: 'Péče o vaše mazlíčky',
        en: 'Care for Your Pets',
        de: 'Pflege für Ihre Haustiere'
      }}
      heroSubtitle={{
        cs: 'Komplexní veterinární péče pro malá i velká zvířata. S láskou a profesionalitou.',
        en: 'Comprehensive veterinary care for small and large animals. With love and professionalism.',
        de: 'Umfassende Tierarztversorgung für kleine und große Tiere. Mit Liebe und Professionalität.'
      }}
      services={[
        { title: { cs: 'Preventivní prohlídky', en: 'Preventive care', de: 'Vorsorge' }, description: { cs: 'Pravidelné prohlídky a očkování', en: 'Regular checkups and vaccinations', de: 'Regelmäßige Untersuchungen und Impfungen' } },
        { title: { cs: 'Chirurgie', en: 'Surgery', de: 'Chirurgie' }, description: { cs: 'Chirurgické zákroky a sterilizace', en: 'Surgical procedures and sterilization', de: 'Chirurgische Eingriffe und Sterilisation' } },
        { title: { cs: 'Zubní péče', en: 'Dental care', de: 'Zahnpflege' }, description: { cs: 'Stomatologická péče pro zvířata', en: 'Dental care for animals', de: 'Zahnpflege für Tiere' } },
        { title: { cs: 'Laboratoř', en: 'Laboratory', de: 'Labor' }, description: { cs: 'Krevní testy a diagnostika', en: 'Blood tests and diagnostics', de: 'Bluttests und Diagnostik' } },
        { title: { cs: 'Pohotovost', en: 'Emergency', de: 'Notdienst' }, description: { cs: 'Veterinární pohotovost 24/7', en: '24/7 veterinary emergency service', de: '24/7 tierärztlicher Notdienst' } },
        { title: { cs: 'Výživa', en: 'Nutrition', de: 'Ernährung' }, description: { cs: 'Poradenství v oblasti výživy zvířat', en: 'Animal nutrition consulting', de: 'Tierernährungsberatung' } },
      ]}
      primaryColor="#d97706"
      gradientClass="bg-gradient-to-br from-amber-500 to-yellow-600"
    />
  );
};

export default VeterinaryDemo;
