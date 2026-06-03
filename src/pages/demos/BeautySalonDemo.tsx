import DemoLayout from '@/components/DemoLayout';

const BeautySalonDemo = () => {
  return (
    <DemoLayout
      tradeId="beautysalon"
      tradeName="London Beauty Salon"
      tradeIcon="💅"
      heroTitle={{
        cs: 'Váš salon krásy v centru Prahy',
        en: 'Your Beauty Salon in the Heart of Prague',
        de: 'Ihr Schönheitssalon im Herzen von Prag'
      }}
      heroSubtitle={{
        cs: 'Kadeřnictví, kosmetika, manikúra, masáže. Online rezervace a věrnostní program.',
        en: 'Hairdressing, cosmetics, manicure, massage. Online booking and loyalty program.',
        de: 'Friseur, Kosmetik, Maniküre, Massage. Online-Buchung und Treueprogramm.'
      }}
      services={[
        { title: { cs: 'Kadeřnictví', en: 'Hairdressing', de: 'Friseur' }, description: { cs: 'Střihy, barvení, styling a vlasové ošetření', en: 'Cuts, coloring, styling, and hair treatment', de: 'Schnitte, Färben, Styling und Haarbehandlung' } },
        { title: { cs: 'Kosmetika', en: 'Cosmetics', de: 'Kosmetik' }, description: { cs: 'Ošetření pleti, čištění, hydratace a anti-aging', en: 'Skin treatment, cleansing, hydration and anti-aging', de: 'Hautbehandlung, Reinigung, Hydratation und Anti-Aging' } },
        { title: { cs: 'Manikúra & pedikúra', en: 'Manicure & Pedicure', de: 'Maniküre & Pediküre' }, description: { cs: 'Klasická, gelová i luxusní japonská manikúra', en: 'Classic, gel, and luxury Japanese manicure', de: 'Klassische, Gel- und luxuriöse japanische Maniküre' } },
        { title: { cs: 'Masáže', en: 'Massage', de: 'Massage' }, description: { cs: 'Relaxační, sportovní a lymfatické masáže', en: 'Relaxation, sports, and lymphatic massage', de: 'Entspannungs-, Sport- und Lymphmassage' } },
        { title: { cs: 'Permanentní make-up', en: 'Permanent Makeup', de: 'Permanent Make-up' }, description: { cs: 'Obočí, linky, rty – přirozený a dlouhotrvající efekt', en: 'Brows, liner, lips – natural and long-lasting effect', de: 'Augenbrauen, Liner, Lippen – natürlicher und langanhaltender Effekt' } },
        { title: { cs: 'Depilace', en: 'Hair Removal', de: 'Haarentfernung' }, description: { cs: 'Vosk, laser a IPL depilace celého těla', en: 'Wax, laser, and IPL full body hair removal', de: 'Wachs-, Laser- und IPL-Ganzkörper-Haarentfernung' } },
      ]}
      primaryColor="#ec4899"
      gradientClass="bg-gradient-to-br from-pink-500 to-rose-400"
    />
  );
};

export default BeautySalonDemo;
