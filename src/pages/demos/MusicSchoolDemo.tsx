import DemoLayout from '@/components/DemoLayout';

const MusicSchoolDemo = () => {
  return (
    <DemoLayout
      tradeId="musicschool"
      tradeName="London Music School"
      tradeIcon="🎵"
      heroTitle={{
        cs: 'Hudba pro každého',
        en: 'Music for Everyone',
        de: 'Musik für Alle'
      }}
      heroSubtitle={{
        cs: 'Výuka hry na hudební nástroje, zpěv a hudební teorie pro všechny věkové kategorie.',
        en: 'Music instrument lessons, singing and music theory for all ages.',
        de: 'Musikinstrumentenunterricht, Gesang und Musiktheorie für alle Altersgruppen.'
      }}
      services={[
        { title: { cs: 'Klavír', en: 'Piano', de: 'Klavier' }, description: { cs: 'Lekce klavíru pro začátečníky i pokročilé', en: 'Piano lessons for beginners and advanced', de: 'Klavierunterricht für Anfänger und Fortgeschrittene' } },
        { title: { cs: 'Kytara', en: 'Guitar', de: 'Gitarre' }, description: { cs: 'Klasická, akustická i elektrická kytara', en: 'Classical, acoustic and electric guitar', de: 'Klassische, akustische und elektrische Gitarre' } },
        { title: { cs: 'Zpěv', en: 'Vocal lessons', de: 'Gesangsunterricht' }, description: { cs: 'Hlasový trénink a pěvecké techniky', en: 'Voice training and singing techniques', de: 'Stimmtraining und Gesangstechniken' } },
        { title: { cs: 'Bicí', en: 'Drums', de: 'Schlagzeug' }, description: { cs: 'Výuka hry na bicí a perkuse', en: 'Drum and percussion lessons', de: 'Schlagzeug- und Perkussionsunterricht' } },
        { title: { cs: 'Hudební teorie', en: 'Music theory', de: 'Musiktheorie' }, description: { cs: 'Základy hudební teorie a kompozice', en: 'Basics of music theory and composition', de: 'Grundlagen der Musiktheorie und Komposition' } },
        { title: { cs: 'Kapely a ansámbly', en: 'Bands & ensembles', de: 'Bands & Ensembles' }, description: { cs: 'Skupinová hra a vystoupení', en: 'Group playing and performances', de: 'Gruppenspiel und Auftritte' } },
      ]}
      primaryColor="#7c3aed"
      gradientClass="bg-gradient-to-br from-violet-600 to-indigo-700"
    />
  );
};

export default MusicSchoolDemo;
