import DemoLayout from '@/components/DemoLayout';

const PaintingDemo = () => {
  return (
    <DemoLayout
      tradeName="Malíři & Natěrači"
      tradeIcon="🎨"
      heroTitle={{
        cs: 'Profesionální malířské práce',
        en: 'Professional Painting Services',
        de: 'Professionelle Malerarbeiten'
      }}
      heroSubtitle={{
        cs: 'Malování, lakování, tapetování. Interiéry i exteriéry. Čistá práce s garancí.',
        en: 'Painting, varnishing, wallpapering. Interiors and exteriors. Clean work with guarantee.',
        de: 'Malen, Lackieren, Tapezieren. Innen und Außen. Saubere Arbeit mit Garantie.'
      }}
      services={[
        { title: { cs: 'Malování interiérů', en: 'Interior painting', de: 'Innenmalerei' }, description: { cs: 'Malování stěn, stropů a dekorační techniky', en: 'Painting walls, ceilings and decorative techniques', de: 'Streichen von Wänden, Decken und dekorative Techniken' } },
        { title: { cs: 'Fasády', en: 'Facades', de: 'Fassaden' }, description: { cs: 'Nátěry a opravy venkovních fasád', en: 'Painting and repair of external facades', de: 'Anstrich und Reparatur von Außenfassaden' } },
        { title: { cs: 'Tapetování', en: 'Wallpapering', de: 'Tapezieren' }, description: { cs: 'Profesionální pokládka tapet a fototapet', en: 'Professional installation of wallpapers and photo wallpapers', de: 'Professionelles Verlegen von Tapeten und Fototapeten' } },
        { title: { cs: 'Lakování', en: 'Varnishing', de: 'Lackieren' }, description: { cs: 'Lakování dveří, oken a nábytku', en: 'Varnishing doors, windows and furniture', de: 'Lackieren von Türen, Fenstern und Möbeln' } },
        { title: { cs: 'Dekorativní techniky', en: 'Decorative techniques', de: 'Dekorative Techniken' }, description: { cs: 'Stěrky, patiny, benátský štuk', en: 'Stucco, patina, Venetian plaster', de: 'Stuck, Patina, venezianischer Putz' } },
        { title: { cs: 'Čištění fasád', en: 'Facade cleaning', de: 'Fassadenreinigung' }, description: { cs: 'Tlakové čištění a renovace fasád', en: 'Pressure cleaning and facade renovation', de: 'Hochdruckreinigung und Fassadensanierung' } },
      ]}
      primaryColor="#a855f7"
      gradientClass="bg-gradient-to-br from-pink-400 to-purple-500"
    />
  );
};

export default PaintingDemo;
