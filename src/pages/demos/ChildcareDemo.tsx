import DemoLayout from '@/components/DemoLayout';

const ChildcareDemo = () => {
  return (
    <DemoLayout
      tradeId="childcare"
      tradeName="London Childcare"
      tradeIcon="👶"
      heroTitle={{
        cs: 'Péče o děti s láskou',
        en: 'Childcare with Love',
        de: 'Kinderbetreuung mit Liebe'
      }}
      heroSubtitle={{
        cs: 'Bezpečné a podnětné prostředí pro vaše děti. Individuální přístup a vzdělávací programy.',
        en: 'Safe and stimulating environment for your children. Individual approach and educational programs.',
        de: 'Sichere und anregende Umgebung für Ihre Kinder. Individueller Ansatz und Bildungsprogramme.'
      }}
      services={[
        { title: { cs: 'Celodenní hlídání', en: 'Full-day care', de: 'Ganztagesbetreuung' }, description: { cs: 'Péče o děti od 1 do 6 let', en: 'Care for children from 1 to 6 years', de: 'Betreuung für Kinder von 1 bis 6 Jahren' } },
        { title: { cs: 'Příležitostné hlídání', en: 'Occasional care', de: 'Gelegentliche Betreuung' }, description: { cs: 'Flexibilní hlídání na hodiny', en: 'Flexible hourly babysitting', de: 'Flexible stundenweise Betreuung' } },
        { title: { cs: 'Vzdělávací programy', en: 'Educational programs', de: 'Bildungsprogramme' }, description: { cs: 'Montessori a kreativní rozvoj', en: 'Montessori and creative development', de: 'Montessori und kreative Entwicklung' } },
        { title: { cs: 'Letní tábory', en: 'Summer camps', de: 'Sommercamps' }, description: { cs: 'Prázdninové programy pro děti', en: 'Holiday programs for children', de: 'Ferienprogramme für Kinder' } },
        { title: { cs: 'Kroužky', en: 'After-school clubs', de: 'Nachmittagsgruppen' }, description: { cs: 'Výtvarné, hudební a sportovní kroužky', en: 'Art, music and sports clubs', de: 'Kunst-, Musik- und Sportgruppen' } },
        { title: { cs: 'Dětské oslavy', en: "Kids' parties", de: 'Kindergeburtstage' }, description: { cs: 'Organizace narozeninových oslav', en: 'Birthday party organization', de: 'Geburtstagsfeier-Organisation' } },
      ]}
      primaryColor="#0ea5e9"
      gradientClass="bg-gradient-to-br from-sky-400 to-blue-500"
    />
  );
};

export default ChildcareDemo;
