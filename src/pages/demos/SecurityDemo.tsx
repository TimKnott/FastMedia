import DemoLayout from '@/components/DemoLayout';

const SecurityDemo = () => {
  return (
    <DemoLayout
      tradeId="security"
      tradeName="Bezpečnostní Služby"
      tradeIcon="🛡️"
      heroTitle={{
        cs: 'Vaše bezpečnost je naší prioritou',
        en: 'Your Security is Our Priority',
        de: 'Ihre Sicherheit ist unsere Priorität'
      }}
      heroSubtitle={{
        cs: 'Kamerové systémy, alarmy, ostraha objektů a osobní ochrana. Komplexní bezpečnostní řešení.',
        en: 'Camera systems, alarms, property guarding and personal protection. Comprehensive security solutions.',
        de: 'Kamerasysteme, Alarme, Objektschutz und Personenschutz. Umfassende Sicherheitslösungen.'
      }}
      services={[
        { title: { cs: 'Kamerové systémy', en: 'CCTV systems', de: 'Kamerasysteme' }, description: { cs: 'Instalace a monitoring bezpečnostních kamer', en: 'Installation and monitoring of security cameras', de: 'Installation und Überwachung von Sicherheitskameras' } },
        { title: { cs: 'Alarmy', en: 'Alarm systems', de: 'Alarmanlagen' }, description: { cs: 'Moderní zabezpečovací systémy', en: 'Modern security alarm systems', de: 'Moderne Sicherheitsalarmanlagen' } },
        { title: { cs: 'Ostraha', en: 'Guarding', de: 'Bewachung' }, description: { cs: 'Fyzická ostraha objektů a akcí', en: 'Physical guarding of properties and events', de: 'Physische Bewachung von Objekten und Veranstaltungen' } },
        { title: { cs: 'Osobní ochrana', en: 'Personal protection', de: 'Personenschutz' }, description: { cs: 'Bodyguard a osobní ochrana VIP', en: 'Bodyguard and VIP personal protection', de: 'Bodyguard und VIP-Personenschutz' } },
        { title: { cs: 'Přístupové systémy', en: 'Access control', de: 'Zugangskontrolle' }, description: { cs: 'Elektronické přístupové a docházkové systémy', en: 'Electronic access and attendance systems', de: 'Elektronische Zugangs- und Anwesenheitssysteme' } },
        { title: { cs: 'Bezpečnostní audit', en: 'Security audit', de: 'Sicherheitsaudit' }, description: { cs: 'Analýza rizik a bezpečnostní plány', en: 'Risk analysis and security plans', de: 'Risikoanalyse und Sicherheitspläne' } },
      ]}
      primaryColor="#475569"
      gradientClass="bg-gradient-to-br from-slate-600 to-gray-800"
    />
  );
};

export default SecurityDemo;
