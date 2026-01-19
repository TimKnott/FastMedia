import DemoLayout from '@/components/DemoLayout';

const HeatingDemo = () => {
  return (
    <DemoLayout
      tradeName="Topení & Plyn"
      tradeIcon="🔥"
      heroTitle={{
        cs: 'Topenářské a plynařské práce',
        en: 'Heating & Gas Services',
        de: 'Heizungs- und Gasdienstleistungen'
      }}
      heroSubtitle={{
        cs: 'Instalace, servis a opravy topných systémů. Plynové kotle a rozvody.',
        en: 'Installation, service and repair of heating systems. Gas boilers and distribution.',
        de: 'Installation, Service und Reparatur von Heizungsanlagen. Gaskessel und Verteilung.'
      }}
      services={[
        { title: { cs: 'Plynové kotle', en: 'Gas boilers', de: 'Gaskessel' }, description: { cs: 'Instalace a servis kondenzačních kotlů', en: 'Installation and service of condensing boilers', de: 'Installation und Service von Brennwertkesseln' } },
        { title: { cs: 'Podlahové topení', en: 'Underfloor heating', de: 'Fußbodenheizung' }, description: { cs: 'Montáž teplovodních podlahových systémů', en: 'Installation of hydronic underfloor systems', de: 'Installation von Warmwasser-Fußbodensystemen' } },
        { title: { cs: 'Radiátory', en: 'Radiators', de: 'Heizkörper' }, description: { cs: 'Výměna a instalace radiátorů', en: 'Replacement and installation of radiators', de: 'Austausch und Installation von Heizkörpern' } },
        { title: { cs: 'Servis kotlů', en: 'Boiler service', de: 'Kesselservice' }, description: { cs: 'Pravidelný servis a údržba kotlů', en: 'Regular boiler service and maintenance', de: 'Regelmäßiger Kesselservice und Wartung' } },
        { title: { cs: 'Plynové rozvody', en: 'Gas distribution', de: 'Gasverteilung' }, description: { cs: 'Montáž a revize plynových rozvodů', en: 'Installation and inspection of gas distribution', de: 'Installation und Inspektion der Gasverteilung' } },
        { title: { cs: 'Tepelná čerpadla', en: 'Heat pumps', de: 'Wärmepumpen' }, description: { cs: 'Alternativní zdroje vytápění', en: 'Alternative heating sources', de: 'Alternative Heizquellen' } },
      ]}
      primaryColor="#f97316"
      gradientClass="bg-gradient-to-br from-orange-500 to-red-500"
    />
  );
};

export default HeatingDemo;
