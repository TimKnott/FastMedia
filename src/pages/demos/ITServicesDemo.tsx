import DemoLayout from '@/components/DemoLayout';

const ITServicesDemo = () => {
  return (
    <DemoLayout
      tradeId="itservices"
      tradeName="TechFix IT London"
      tradeIcon="💻"
      heroTitle={{
        cs: 'IT podpora a servis pro firmy i domácnosti',
        en: 'IT Support & Services for Business & Home',
        de: 'IT-Support & Services für Unternehmen & Privat'
      }}
      heroSubtitle={{
        cs: 'Opravy počítačů, správa sítí, kybernetická bezpečnost, cloudová řešení. Vzdálená podpora 24/7.',
        en: 'Computer repair, network management, cybersecurity, cloud solutions. Remote support 24/7.',
        de: 'Computerreparatur, Netzwerkverwaltung, Cybersicherheit, Cloud-Lösungen. Remote-Support 24/7.'
      }}
      services={[
        { title: { cs: 'Opravy počítačů', en: 'Computer Repair', de: 'Computerreparatur' }, description: { cs: 'Hardware a software opravy notebooků a stolních PC', en: 'Hardware and software repair for laptops and desktops', de: 'Hardware- und Softwarereparatur für Laptops und Desktops' } },
        { title: { cs: 'Správa sítí', en: 'Network Management', de: 'Netzwerkverwaltung' }, description: { cs: 'Instalace, údržba a monitoring firemních sítí', en: 'Installation, maintenance, and monitoring of business networks', de: 'Installation, Wartung und Überwachung von Unternehmensnetzwerken' } },
        { title: { cs: 'Kybernetická bezpečnost', en: 'Cybersecurity', de: 'Cybersicherheit' }, description: { cs: 'Ochrana dat, firewally, antivirová řešení', en: 'Data protection, firewalls, antivirus solutions', de: 'Datenschutz, Firewalls, Antiviruslösungen' } },
        { title: { cs: 'Cloudová řešení', en: 'Cloud Solutions', de: 'Cloud-Lösungen' }, description: { cs: 'Migrace do cloudu, zálohování, Microsoft 365', en: 'Cloud migration, backup, Microsoft 365', de: 'Cloud-Migration, Backup, Microsoft 365' } },
        { title: { cs: 'Vzdálená podpora', en: 'Remote Support', de: 'Remote-Support' }, description: { cs: 'Okamžitá pomoc na dálku pro naléhavé problémy', en: 'Instant remote assistance for urgent issues', de: 'Sofortige Fernunterstützung für dringende Probleme' } },
        { title: { cs: 'IT konzultace', en: 'IT Consulting', de: 'IT-Beratung' }, description: { cs: 'Strategické plánování IT infrastruktury pro vaši firmu', en: 'Strategic IT infrastructure planning for your business', de: 'Strategische IT-Infrastrukturplanung für Ihr Unternehmen' } },
      ]}
      primaryColor="#3b82f6"
      gradientClass="bg-gradient-to-br from-blue-500 to-indigo-600"
    />
  );
};

export default ITServicesDemo;
