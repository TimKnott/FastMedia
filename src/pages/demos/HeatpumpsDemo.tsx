import DemoLayout from '@/components/DemoLayout';

const HeatpumpsDemo = () => {
  return (
    <DemoLayout
      tradeName="Tepelná Čerpadla Plus"
      tradeIcon="♨️"
      heroTitle={{
        cs: 'Tepelná čerpadla pro váš dům',
        en: 'Heat Pumps for Your Home',
        de: 'Wärmepumpen für Ihr Haus'
      }}
      heroSubtitle={{
        cs: 'Ekologické a úsporné vytápění. Vzduch-voda, země-voda, voda-voda systémy.',
        en: 'Ecological and economical heating. Air-to-water, ground-to-water, water-to-water systems.',
        de: 'Ökologisches und wirtschaftliches Heizen. Luft-Wasser-, Erd-Wasser-, Wasser-Wasser-Systeme.'
      }}
      services={[
        { title: { cs: 'Vzduch-voda', en: 'Air-to-water', de: 'Luft-Wasser' }, description: { cs: 'Nejpopulárnější typ tepelného čerpadla', en: 'Most popular type of heat pump', de: 'Beliebtester Typ der Wärmepumpe' } },
        { title: { cs: 'Země-voda', en: 'Ground-to-water', de: 'Erd-Wasser' }, description: { cs: 'Využití geotermální energie ze země', en: 'Using geothermal energy from the ground', de: 'Nutzung geothermischer Energie aus dem Boden' } },
        { title: { cs: 'Voda-voda', en: 'Water-to-water', de: 'Wasser-Wasser' }, description: { cs: 'Čerpání tepla z podzemní vody', en: 'Extracting heat from groundwater', de: 'Wärmegewinnung aus Grundwasser' } },
        { title: { cs: 'Hybridní systémy', en: 'Hybrid systems', de: 'Hybridsysteme' }, description: { cs: 'Kombinace s plynovým kotlem', en: 'Combination with gas boiler', de: 'Kombination mit Gaskessel' } },
        { title: { cs: 'Dotační programy', en: 'Subsidy programs', de: 'Förderprogramme' }, description: { cs: 'Asistence s čerpáním dotací NZÚ', en: 'Assistance with NZÚ subsidies', de: 'Unterstützung bei NZÚ-Fördermitteln' } },
        { title: { cs: 'Servis a údržba', en: 'Service and maintenance', de: 'Service und Wartung' }, description: { cs: 'Pravidelná údržba pro maximální účinnost', en: 'Regular maintenance for maximum efficiency', de: 'Regelmäßige Wartung für maximale Effizienz' } },
      ]}
      primaryColor="#14b8a6"
      gradientClass="bg-gradient-to-br from-teal-400 to-emerald-500"
    />
  );
};

export default HeatpumpsDemo;
