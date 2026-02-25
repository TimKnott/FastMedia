import DemoLayout from '@/components/DemoLayout';

const AutoRepairDemo = () => {
  return (
    <DemoLayout
      tradeId="autorepair"
      tradeName="AutoServis Novák"
      tradeIcon="🔩"
      heroTitle={{
        cs: 'Váš spolehlivý autoservis v Praze',
        en: 'Your Reliable Auto Repair Shop',
        de: 'Ihre zuverlässige Autowerkstatt'
      }}
      heroSubtitle={{
        cs: 'Kompletní opravy, servis a diagnostika všech značek. Online objednávka servisu 24/7.',
        en: 'Complete repairs, service, and diagnostics for all brands. Online service booking 24/7.',
        de: 'Komplette Reparaturen, Service und Diagnose aller Marken. Online-Servicebuchung 24/7.'
      }}
      services={[
        { title: { cs: 'Diagnostika závad', en: 'Fault Diagnostics', de: 'Fehlerdiagnose' }, description: { cs: 'Moderní počítačová diagnostika pro přesné odhalení problémů', en: 'Modern computer diagnostics for precise problem detection', de: 'Moderne Computerdiagnose zur präzisen Fehlererkennung' } },
        { title: { cs: 'Servis brzd', en: 'Brake Service', de: 'Bremsenservice' }, description: { cs: 'Výměna destiček, kotoučů a kompletní kontrola brzdového systému', en: 'Pad and disc replacement with complete brake system inspection', de: 'Belag- und Scheibenwechsel mit kompletter Bremssystemprüfung' } },
        { title: { cs: 'Výměna oleje', en: 'Oil Change', de: 'Ölwechsel' }, description: { cs: 'Rychlá výměna oleje a filtrů pro optimální chod motoru', en: 'Quick oil and filter change for optimal engine performance', de: 'Schneller Öl- und Filterwechsel für optimale Motorleistung' } },
        { title: { cs: 'Pneuservis', en: 'Tire Service', de: 'Reifenservice' }, description: { cs: 'Přezutí, vyvážení a skladování pneumatik', en: 'Tire changing, balancing, and storage', de: 'Reifenwechsel, Auswuchten und Einlagerung' } },
        { title: { cs: 'Klimatizace', en: 'AC Service', de: 'Klimaanlagenservice' }, description: { cs: 'Plnění, čištění a dezinfekce klimatizace', en: 'AC refilling, cleaning, and disinfection', de: 'Klimaanlagen befüllen, reinigen und desinfizieren' } },
        { title: { cs: 'STK příprava', en: 'MOT Preparation', de: 'TÜV-Vorbereitung' }, description: { cs: 'Kompletní příprava vozidla na technickou kontrolu', en: 'Complete vehicle preparation for technical inspection', de: 'Komplette Fahrzeugvorbereitung für die Hauptuntersuchung' } },
      ]}
      primaryColor="#ef4444"
      gradientClass="bg-gradient-to-br from-red-500 to-orange-600"
    />
  );
};

export default AutoRepairDemo;
