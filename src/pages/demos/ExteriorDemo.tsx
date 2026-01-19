import DemoLayout from '@/components/DemoLayout';

const ExteriorDemo = () => {
  return (
    <DemoLayout
      tradeName="Fasády & Exteriéry"
      tradeIcon="🏡"
      heroTitle={{
        cs: 'Fasády a venkovní úpravy',
        en: 'Facades & Exterior Work',
        de: 'Fassaden & Außenarbeiten'
      }}
      heroSubtitle={{
        cs: 'Zateplení, fasádní systémy, venkovní úpravy. Dodáme vašemu domu nový vzhled.',
        en: 'Insulation, facade systems, exterior modifications. We will give your house a new look.',
        de: 'Dämmung, Fassadensysteme, Außenarbeiten. Wir geben Ihrem Haus ein neues Aussehen.'
      }}
      services={[
        { title: { cs: 'Zateplení ETICS', en: 'ETICS insulation', de: 'WDVS-Dämmung' }, description: { cs: 'Kompletní kontaktní zateplovací systémy', en: 'Complete contact insulation systems', de: 'Komplette Kontaktdämmsysteme' } },
        { title: { cs: 'Fasádní omítky', en: 'Facade plasters', de: 'Fassadenputze' }, description: { cs: 'Silikátové, silikonové a minerální omítky', en: 'Silicate, silicone and mineral plasters', de: 'Silikat-, Silikon- und Mineralputze' } },
        { title: { cs: 'Obklady fasád', en: 'Facade cladding', de: 'Fassadenverkleidung' }, description: { cs: 'Kamenné a cihelné obklady', en: 'Stone and brick cladding', de: 'Stein- und Ziegelverkleidung' } },
        { title: { cs: 'Terasy a pergoly', en: 'Terraces and pergolas', de: 'Terrassen und Pergolen' }, description: { cs: 'Stavba venkovních teras a zastínění', en: 'Construction of outdoor terraces and shading', de: 'Bau von Außenterrassen und Beschattung' } },
        { title: { cs: 'Oplocení', en: 'Fencing', de: 'Einzäunung' }, description: { cs: 'Montáž plotů a vstupních bran', en: 'Installation of fences and entrance gates', de: 'Installation von Zäunen und Eingangstoren' } },
        { title: { cs: 'Dlažby a zámková dlažba', en: 'Paving', de: 'Pflasterung' }, description: { cs: 'Venkovní dlažby příjezdových cest', en: 'Outdoor paving of driveways', de: 'Außenpflasterung von Zufahrten' } },
      ]}
      primaryColor="#14b8a6"
      gradientClass="bg-gradient-to-br from-emerald-500 to-teal-400"
    />
  );
};

export default ExteriorDemo;
