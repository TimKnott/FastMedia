import DemoLayout from '@/components/DemoLayout';

const BakeryDemo = () => {
  return (
    <DemoLayout
      tradeId="bakery"
      tradeName="London Bakery & Patisserie"
      tradeIcon="🧁"
      heroTitle={{
        cs: 'Sladké chvilky na objednávku',
        en: 'Sweet Moments Made to Order',
        de: 'Süße Momente auf Bestellung'
      }}
      heroSubtitle={{
        cs: 'Domácí dorty, zákusky a pečivo. Každý kousek s láskou a z kvalitních surovin.',
        en: 'Homemade cakes, pastries and baked goods. Every piece made with love and quality ingredients.',
        de: 'Hausgemachte Kuchen, Gebäck und Backwaren. Jedes Stück mit Liebe und Qualitätszutaten.'
      }}
      services={[
        { title: { cs: 'Dorty na míru', en: 'Custom cakes', de: 'Maßgeschneiderte Torten' }, description: { cs: 'Svatební, narozeninové a firemní dorty', en: 'Wedding, birthday and corporate cakes', de: 'Hochzeits-, Geburtstags- und Firmentorten' } },
        { title: { cs: 'Zákusky', en: 'Pastries', de: 'Gebäck' }, description: { cs: 'Tradiční i moderní zákusky', en: 'Traditional and modern pastries', de: 'Traditionelles und modernes Gebäck' } },
        { title: { cs: 'Bezlepkové pečivo', en: 'Gluten-free', de: 'Glutenfrei' }, description: { cs: 'Nabídka pro alergiky a speciální diety', en: 'Options for allergies and special diets', de: 'Optionen für Allergiker und Spezialdiäten' } },
        { title: { cs: 'Cateringové balíčky', en: 'Catering packages', de: 'Catering-Pakete' }, description: { cs: 'Sladké stoly pro akce a svatby', en: 'Sweet tables for events and weddings', de: 'Süße Tische für Events und Hochzeiten' } },
        { title: { cs: 'Kavárna', en: 'Café', de: 'Café' }, description: { cs: 'Posezení s kávou a domácím zákuskem', en: 'Sit down with coffee and homemade pastry', de: 'Kaffee und hausgemachtes Gebäck genießen' } },
        { title: { cs: 'Kurzy pečení', en: 'Baking classes', de: 'Backkurse' }, description: { cs: 'Workshopy pro začátečníky i pokročilé', en: 'Workshops for beginners and advanced', de: 'Workshops für Anfänger und Fortgeschrittene' } },
      ]}
      primaryColor="#f59e0b"
      gradientClass="bg-gradient-to-br from-amber-400 to-orange-500"
    />
  );
};

export default BakeryDemo;
