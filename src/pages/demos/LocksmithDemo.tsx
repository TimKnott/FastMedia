import DemoLayout from '@/components/DemoLayout';

const LocksmithDemo = () => {
  return (
    <DemoLayout
      tradeId="locksmith"
      tradeName="Zámečnictví 24h"
      tradeIcon="🔐"
      heroTitle={{
        cs: 'Zámečnické služby nonstop',
        en: 'Locksmith Services 24/7',
        de: 'Schlüsseldienst rund um die Uhr'
      }}
      heroSubtitle={{
        cs: 'Otevírání zamčených dveří, výměna zámků, bezpečnostní systémy. Jsme tu pro vás 24/7.',
        en: 'Opening locked doors, lock replacement, security systems. We are here for you 24/7.',
        de: 'Öffnen verschlossener Türen, Schlossaustausch, Sicherheitssysteme. Wir sind 24/7 für Sie da.'
      }}
      services={[
        { title: { cs: 'Nouzové otevírání', en: 'Emergency opening', de: 'Notöffnung' }, description: { cs: 'Rychlé otevření zamčených dveří bez poškození', en: 'Quick opening of locked doors without damage', de: 'Schnelles Öffnen verschlossener Türen ohne Beschädigung' } },
        { title: { cs: 'Výměna zámků', en: 'Lock replacement', de: 'Schlossaustausch' }, description: { cs: 'Montáž bezpečnostních cylindrických vložek', en: 'Installation of security cylinder inserts', de: 'Installation von Sicherheitszylindereinsätzen' } },
        { title: { cs: 'Bezpečnostní dveře', en: 'Security doors', de: 'Sicherheitstüren' }, description: { cs: 'Prodej a montáž bezpečnostních dveří', en: 'Sale and installation of security doors', de: 'Verkauf und Montage von Sicherheitstüren' } },
        { title: { cs: 'Trezory', en: 'Safes', de: 'Tresore' }, description: { cs: 'Otevírání a servis trezorů', en: 'Opening and servicing of safes', de: 'Öffnung und Wartung von Tresoren' } },
        { title: { cs: 'Automobilové zámky', en: 'Car locks', de: 'Autoschlösser' }, description: { cs: 'Otevírání aut a výroba autoklíčů', en: 'Car opening and car key production', de: 'Autoöffnung und Autoschlüsselherstellung' } },
        { title: { cs: 'Elektronické systémy', en: 'Electronic systems', de: 'Elektronische Systeme' }, description: { cs: 'Instalace elektronických přístupových systémů', en: 'Installation of electronic access systems', de: 'Installation elektronischer Zugangssysteme' } },
      ]}
      primaryColor="#71717a"
      gradientClass="bg-gradient-to-br from-zinc-500 to-gray-600"
    />
  );
};

export default LocksmithDemo;
