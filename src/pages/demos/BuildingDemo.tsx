import DemoLayout from '@/components/DemoLayout';

const BuildingDemo = () => {
  return (
    <DemoLayout
      tradeId="building"
      tradeName="Stavební Firma Praha"
      tradeIcon="🏗️"
      heroTitle={{
        cs: 'Stavíme vaše sny',
        en: 'Building Your Dreams',
        de: 'Wir bauen Ihre Träume'
      }}
      heroSubtitle={{
        cs: 'Od základů po střechu. Komplexní stavební služby s důrazem na kvalitu.',
        en: 'From foundation to roof. Comprehensive construction services with a focus on quality.',
        de: 'Vom Fundament bis zum Dach. Umfassende Bauleistungen mit Fokus auf Qualität.'
      }}
      services={[
        { title: { cs: 'Výstavba domů', en: 'House construction', de: 'Hausbau' }, description: { cs: 'Stavba rodinných domů na klíč', en: 'Turnkey family house construction', de: 'Schlüsselfertiger Einfamilienhausbau' } },
        { title: { cs: 'Rekonstrukce', en: 'Renovations', de: 'Renovierungen' }, description: { cs: 'Kompletní rekonstrukce bytů a domů', en: 'Complete renovation of apartments and houses', de: 'Komplettrenovierung von Wohnungen und Häusern' } },
        { title: { cs: 'Přístavby', en: 'Extensions', de: 'Anbauten' }, description: { cs: 'Rozšíření stávajících budov', en: 'Extension of existing buildings', de: 'Erweiterung bestehender Gebäude' } },
        { title: { cs: 'Základy', en: 'Foundations', de: 'Fundamente' }, description: { cs: 'Kvalitní základové práce pro jakýkoli projekt', en: 'Quality foundation work for any project', de: 'Qualitätsfundamentarbeiten für jedes Projekt' } },
        { title: { cs: 'Zděné konstrukce', en: 'Masonry', de: 'Mauerwerk' }, description: { cs: 'Profesionální zděné a betonové práce', en: 'Professional masonry and concrete work', de: 'Professionelle Maurer- und Betonarbeiten' } },
        { title: { cs: 'Demolice', en: 'Demolition', de: 'Abriss' }, description: { cs: 'Bezpečné bourací práce s odvozem odpadu', en: 'Safe demolition work with waste removal', de: 'Sichere Abrissarbeiten mit Abfallentsorgung' } },
      ]}
      primaryColor="#78716c"
      gradientClass="bg-gradient-to-br from-stone-500 to-amber-600"
    />
  );
};

export default BuildingDemo;
