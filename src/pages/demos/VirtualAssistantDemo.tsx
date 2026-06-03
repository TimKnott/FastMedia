import DemoLayout from '@/components/DemoLayout';

const VirtualAssistantDemo = () => {
  return (
    <DemoLayout
      tradeId="virtualassistant"
      tradeName="UK Virtual Assistant"
      tradeIcon="💻"
      heroTitle={{
        cs: 'Vaše virtuální pravá ruka',
        en: 'Your Virtual Right Hand',
        de: 'Ihre virtuelle rechte Hand'
      }}
      heroSubtitle={{
        cs: 'Profesionální vzdálená podpora pro podnikatele. Administrativa, sociální sítě, zákaznický servis.',
        en: 'Professional remote support for entrepreneurs. Admin, social media, customer service.',
        de: 'Professionelle Remote-Unterstützung für Unternehmer. Verwaltung, Social Media, Kundenservice.'
      }}
      services={[
        { title: { cs: 'Administrativa', en: 'Administration', de: 'Verwaltung' }, description: { cs: 'Správa e-mailů, kalendářů a dokumentů', en: 'Managing emails, calendars and documents', de: 'Verwaltung von E-Mails, Kalendern und Dokumenten' } },
        { title: { cs: 'Sociální sítě', en: 'Social media', de: 'Social Media' }, description: { cs: 'Správa a plánování obsahu na sítích', en: 'Managing and scheduling social media content', de: 'Verwaltung und Planung von Social-Media-Inhalten' } },
        { title: { cs: 'Zákaznický servis', en: 'Customer service', de: 'Kundenservice' }, description: { cs: 'Komunikace se zákazníky vaším jménem', en: 'Communicating with customers on your behalf', de: 'Kommunikation mit Kunden in Ihrem Namen' } },
        { title: { cs: 'Fakturace', en: 'Invoicing', de: 'Rechnungsstellung' }, description: { cs: 'Příprava faktur a sledování plateb', en: 'Preparing invoices and tracking payments', de: 'Rechnungserstellung und Zahlungsverfolgung' } },
        { title: { cs: 'Cestovní plánování', en: 'Travel planning', de: 'Reiseplanung' }, description: { cs: 'Organizace služebních cest a akcí', en: 'Organizing business trips and events', de: 'Organisation von Geschäftsreisen und Events' } },
        { title: { cs: 'Datový vstup', en: 'Data entry', de: 'Dateneingabe' }, description: { cs: 'Přepis a organizace dat a databází', en: 'Transcription and organization of data', de: 'Transkription und Organisation von Daten' } },
      ]}
      primaryColor="#8b5cf6"
      gradientClass="bg-gradient-to-br from-violet-500 to-purple-600"
    />
  );
};

export default VirtualAssistantDemo;
