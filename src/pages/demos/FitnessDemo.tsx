import DemoLayout from '@/components/DemoLayout';

const FitnessDemo = () => {
  return (
    <DemoLayout
      tradeId="fitness"
      tradeName="FitZone London"
      tradeIcon="💪"
      heroTitle={{
        cs: 'Vaše cesta k lepší kondici začíná zde',
        en: 'Your Path to Better Fitness Starts Here',
        de: 'Ihr Weg zu besserer Fitness beginnt hier'
      }}
      heroSubtitle={{
        cs: 'Osobní tréninky, skupinové lekce, výživové poradenství. Online rezervace a sledování pokroku.',
        en: 'Personal training, group classes, nutrition consulting. Online booking and progress tracking.',
        de: 'Personaltraining, Gruppenkurse, Ernährungsberatung. Online-Buchung und Fortschrittsverfolgung.'
      }}
      services={[
        { title: { cs: 'Osobní trénink', en: 'Personal Training', de: 'Personal Training' }, description: { cs: 'Individuální tréninky na míru vašim cílům a kondici', en: 'Customized individual workouts tailored to your goals', de: 'Individuelle Trainingseinheiten, maßgeschneidert auf Ihre Ziele' } },
        { title: { cs: 'Skupinové lekce', en: 'Group Classes', de: 'Gruppenkurse' }, description: { cs: 'HIIT, jóga, pilates, spinning a další', en: 'HIIT, yoga, pilates, spinning, and more', de: 'HIIT, Yoga, Pilates, Spinning und mehr' } },
        { title: { cs: 'Výživové poradenství', en: 'Nutrition Consulting', de: 'Ernährungsberatung' }, description: { cs: 'Jídelníčky a plány na míru pro optimální výsledky', en: 'Custom meal plans for optimal results', de: 'Individuelle Ernährungspläne für optimale Ergebnisse' } },
        { title: { cs: 'Online trénink', en: 'Online Training', de: 'Online Training' }, description: { cs: 'Trénujte odkudkoli s video lekcemi a plánem', en: 'Train from anywhere with video lessons and plans', de: 'Trainieren Sie von überall mit Videolektionen und Plänen' } },
        { title: { cs: 'Rehabilitace', en: 'Rehabilitation', de: 'Rehabilitation' }, description: { cs: 'Cvičení po zranění a zdravotní problémy', en: 'Exercise after injury and health issues', de: 'Übungen nach Verletzungen und Gesundheitsproblemen' } },
        { title: { cs: 'Sportovní příprava', en: 'Sports Conditioning', de: 'Sportvorbereitung' }, description: { cs: 'Specifická příprava pro váš sport', en: 'Sport-specific conditioning programs', de: 'Sportspezifische Konditionierungsprogramme' } },
      ]}
      primaryColor="#8b5cf6"
      gradientClass="bg-gradient-to-br from-violet-500 to-indigo-600"
    />
  );
};

export default FitnessDemo;
