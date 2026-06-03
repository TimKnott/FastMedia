import DemoLayout from '@/components/DemoLayout';

const ElectricalDemo = () => {
  return (
    <DemoLayout
      tradeId="electrical"
      tradeName="Sparks Electrical London"
      tradeIcon="⚡"
      heroTitle={{
        cs: 'Profesionální elektrikářské služby',
        en: 'Professional Electrical Services',
        de: 'Professionelle Elektrodienstleistungen'
      }}
      heroSubtitle={{
        cs: 'Bezpečné a spolehlivé elektrické instalace pro váš domov i firmu.',
        en: 'Safe and reliable electrical installations for your home and business.',
        de: 'Sichere und zuverlässige Elektroinstallationen für Ihr Zuhause und Geschäft.'
      }}
      services={[
        { title: { cs: 'Elektroinstalace', en: 'Electrical installations', de: 'Elektroinstallationen' }, description: { cs: 'Kompletní elektroinstalace pro novostavby i rekonstrukce', en: 'Complete electrical installations for new buildings and renovations', de: 'Komplette Elektroinstallationen für Neubauten und Renovierungen' } },
        { title: { cs: 'Revize', en: 'Inspections', de: 'Inspektionen' }, description: { cs: 'Pravidelné revize a kontroly elektrických zařízení', en: 'Regular inspections of electrical equipment', de: 'Regelmäßige Inspektionen elektrischer Geräte' } },
        { title: { cs: 'Opravy', en: 'Repairs', de: 'Reparaturen' }, description: { cs: 'Rychlé opravy poruch a výpadků proudu', en: 'Quick repairs of faults and power outages', de: 'Schnelle Reparaturen von Fehlern und Stromausfällen' } },
        { title: { cs: 'Osvětlení', en: 'Lighting', de: 'Beleuchtung' }, description: { cs: 'Návrh a instalace moderního osvětlení', en: 'Design and installation of modern lighting', de: 'Planung und Installation moderner Beleuchtung' } },
        { title: { cs: 'Smart home', en: 'Smart home', de: 'Smart Home' }, description: { cs: 'Inteligentní domácí systémy a automatizace', en: 'Smart home systems and automation', de: 'Smart-Home-Systeme und Automatisierung' } },
        { title: { cs: 'Dobíjecí stanice', en: 'Charging stations', de: 'Ladestationen' }, description: { cs: 'Instalace dobíjecích stanic pro elektromobily', en: 'Installation of charging stations for electric vehicles', de: 'Installation von Ladestationen für Elektrofahrzeuge' } },
      ]}
      primaryColor="#f59e0b"
      gradientClass="bg-gradient-to-br from-yellow-400 to-orange-500"
    />
  );
};

export default ElectricalDemo;
