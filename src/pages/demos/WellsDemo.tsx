import DemoLayout from '@/components/DemoLayout';

const WellsDemo = () => {
  return (
    <DemoLayout
      tradeId="wells"
      tradeName="Studny & Vrty"
      tradeIcon="💧"
      heroTitle={{
        cs: 'Hloubení studní a vrtů',
        en: 'Well Drilling Services',
        de: 'Brunnenbohrdienste'
      }}
      heroSubtitle={{
        cs: 'Profesionální vrtání studní a vrtů pro pitnou i užitkovou vodu.',
        en: 'Professional drilling of wells for drinking and utility water.',
        de: 'Professionelles Bohren von Brunnen für Trink- und Brauchwasser.'
      }}
      services={[
        { title: { cs: 'Vrtané studny', en: 'Drilled wells', de: 'Gebohrte Brunnen' }, description: { cs: 'Hloubení vrtaných studní do 150m', en: 'Drilling wells up to 150m deep', de: 'Bohren von Brunnen bis zu 150m Tiefe' } },
        { title: { cs: 'Kopaná studna', en: 'Dug wells', de: 'Gegrabene Brunnen' }, description: { cs: 'Tradiční kopané studny s betonováním', en: 'Traditional dug wells with concreting', de: 'Traditionelle gegrabene Brunnen mit Betonierung' } },
        { title: { cs: 'Čištění studní', en: 'Well cleaning', de: 'Brunnenreinigung' }, description: { cs: 'Revize a čištění stávajících studní', en: 'Inspection and cleaning of existing wells', de: 'Inspektion und Reinigung bestehender Brunnen' } },
        { title: { cs: 'Tepelné vrty', en: 'Geothermal drilling', de: 'Erdwärmebohrungen' }, description: { cs: 'Vrty pro tepelná čerpadla', en: 'Drilling for heat pumps', de: 'Bohrungen für Wärmepumpen' } },
        { title: { cs: 'Čerpadla', en: 'Pumps', de: 'Pumpen' }, description: { cs: 'Dodávka a instalace čerpadel', en: 'Supply and installation of pumps', de: 'Lieferung und Installation von Pumpen' } },
        { title: { cs: 'Rozbory vody', en: 'Water analysis', de: 'Wasseranalyse' }, description: { cs: 'Laboratorní rozbory kvality vody', en: 'Laboratory analysis of water quality', de: 'Laboranalyse der Wasserqualität' } },
      ]}
      primaryColor="#3b82f6"
      gradientClass="bg-gradient-to-br from-blue-600 to-indigo-500"
    />
  );
};

export default WellsDemo;
