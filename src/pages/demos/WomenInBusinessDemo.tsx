import DemoLayout from '@/components/DemoLayout';

const WomenInBusinessDemo = () => {
  return (
    <DemoLayout
      tradeId="womeninbusiness"
      tradeName="Women in Business"
      tradeIcon="👩‍💼"
      heroTitle={{
        cs: 'Podnikání žen na jednom místě',
        en: 'Empowering Women in Business',
        de: 'Frauen im Business stärken'
      }}
      heroSubtitle={{
        cs: 'Profesionální web, který reprezentuje vaši značku a přitahuje klienty automaticky.',
        en: 'A professional website that represents your brand and attracts clients automatically.',
        de: 'Eine professionelle Website, die Ihre Marke repräsentiert und automatisch Kunden anzieht.'
      }}
      services={[
        { title: { cs: 'Business koučink', en: 'Business coaching', de: 'Business Coaching' }, description: { cs: 'Individuální podnikatelské poradenství', en: 'Individual business consulting', de: 'Individuelle Unternehmensberatung' } },
        { title: { cs: 'Osobní branding', en: 'Personal branding', de: 'Personal Branding' }, description: { cs: 'Budování silné osobní značky', en: 'Building a strong personal brand', de: 'Aufbau einer starken persönlichen Marke' } },
        { title: { cs: 'Online kurzy', en: 'Online courses', de: 'Online-Kurse' }, description: { cs: 'Tvorba a prodej vzdělávacích kurzů', en: 'Creating and selling educational courses', de: 'Erstellung und Verkauf von Bildungskursen' } },
        { title: { cs: 'Mentoring', en: 'Mentoring', de: 'Mentoring' }, description: { cs: 'Skupinové a individuální mentoring programy', en: 'Group and individual mentoring programs', de: 'Gruppen- und Einzelmentoring-Programme' } },
        { title: { cs: 'Networking', en: 'Networking', de: 'Networking' }, description: { cs: 'Propojení s dalšími podnikatelkami', en: 'Connecting with other businesswomen', de: 'Vernetzung mit anderen Geschäftsfrauen' } },
        { title: { cs: 'Konzultace', en: 'Consulting', de: 'Beratung' }, description: { cs: 'Strategické plánování a rozvoj podnikání', en: 'Strategic planning and business development', de: 'Strategische Planung und Geschäftsentwicklung' } },
      ]}
      primaryColor="#ec4899"
      gradientClass="bg-gradient-to-br from-pink-500 to-fuchsia-500"
    />
  );
};

export default WomenInBusinessDemo;
