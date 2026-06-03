import DemoLayout from '@/components/DemoLayout';

const TranslationDemo = () => {
  return (
    <DemoLayout
      tradeId="translation"
      tradeName="London Translation Agency"
      tradeIcon="🌍"
      heroTitle={{
        cs: 'Překlady bez hranic',
        en: 'Translations Without Borders',
        de: 'Übersetzungen ohne Grenzen'
      }}
      heroSubtitle={{
        cs: 'Odborné překlady, tlumočení a lokalizace. Více než 30 jazyků, vždy přesně a včas.',
        en: 'Professional translations, interpreting and localization. Over 30 languages, always accurate and on time.',
        de: 'Professionelle Übersetzungen, Dolmetschen und Lokalisierung. Über 30 Sprachen, immer genau und pünktlich.'
      }}
      services={[
        { title: { cs: 'Odborné překlady', en: 'Specialized translations', de: 'Fachübersetzungen' }, description: { cs: 'Právní, technické a lékařské překlady', en: 'Legal, technical and medical translations', de: 'Juristische, technische und medizinische Übersetzungen' } },
        { title: { cs: 'Tlumočení', en: 'Interpreting', de: 'Dolmetschen' }, description: { cs: 'Simultánní a konsekutivní tlumočení', en: 'Simultaneous and consecutive interpreting', de: 'Simultan- und Konsekutivdolmetschen' } },
        { title: { cs: 'Lokalizace', en: 'Localization', de: 'Lokalisierung' }, description: { cs: 'Lokalizace webů a aplikací', en: 'Website and application localization', de: 'Website- und App-Lokalisierung' } },
        { title: { cs: 'Soudní překlady', en: 'Certified translations', de: 'Beglaubigte Übersetzungen' }, description: { cs: 'Úředně ověřené překlady dokumentů', en: 'Officially certified document translations', de: 'Amtlich beglaubigte Dokumentenübersetzungen' } },
        { title: { cs: 'Korektury', en: 'Proofreading', de: 'Korrekturlesen' }, description: { cs: 'Jazykové korektury a editace textů', en: 'Language proofreading and text editing', de: 'Sprachliches Korrekturlesen und Textbearbeitung' } },
        { title: { cs: 'Copywriting', en: 'Copywriting', de: 'Copywriting' }, description: { cs: 'Tvorba marketingových textů v cizích jazycích', en: 'Creating marketing content in foreign languages', de: 'Erstellung von Marketingtexten in Fremdsprachen' } },
      ]}
      primaryColor="#0d9488"
      gradientClass="bg-gradient-to-br from-teal-500 to-emerald-600"
    />
  );
};

export default TranslationDemo;
