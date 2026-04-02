import DemoLayout from '@/components/DemoLayout';

const AccountingDemo = () => {
  return (
    <DemoLayout
      tradeId="accounting"
      tradeName="Účetní Kancelář"
      tradeIcon="📊"
      heroTitle={{
        cs: 'Účetnictví bez starostí',
        en: 'Worry-Free Accounting',
        de: 'Sorgenfreie Buchhaltung'
      }}
      heroSubtitle={{
        cs: 'Vedení účetnictví, daňové poradenství a mzdová agenda. Spolehlivě a včas.',
        en: 'Bookkeeping, tax consulting and payroll. Reliable and on time.',
        de: 'Buchhaltung, Steuerberatung und Lohnbuchhaltung. Zuverlässig und pünktlich.'
      }}
      services={[
        { title: { cs: 'Vedení účetnictví', en: 'Bookkeeping', de: 'Buchhaltung' }, description: { cs: 'Kompletní vedení podvojného účetnictví', en: 'Complete double-entry bookkeeping', de: 'Vollständige doppelte Buchführung' } },
        { title: { cs: 'Daňové přiznání', en: 'Tax returns', de: 'Steuererklärungen' }, description: { cs: 'Příprava a podání daňových přiznání', en: 'Preparation and filing of tax returns', de: 'Erstellung und Einreichung von Steuererklärungen' } },
        { title: { cs: 'Mzdová agenda', en: 'Payroll', de: 'Lohnbuchhaltung' }, description: { cs: 'Zpracování mezd a personální agenda', en: 'Payroll processing and HR administration', de: 'Lohnabrechnung und Personalverwaltung' } },
        { title: { cs: 'Poradenství', en: 'Consulting', de: 'Beratung' }, description: { cs: 'Finanční a daňové poradenství', en: 'Financial and tax consulting', de: 'Finanz- und Steuerberatung' } },
        { title: { cs: 'Založení firmy', en: 'Company formation', de: 'Firmengründung' }, description: { cs: 'Pomoc při zakládání společností', en: 'Assistance with company formation', de: 'Hilfe bei der Firmengründung' } },
        { title: { cs: 'Audit', en: 'Audit', de: 'Wirtschaftsprüfung' }, description: { cs: 'Interní audit a kontrola účetnictví', en: 'Internal audit and accounting review', de: 'Interne Prüfung und Buchhaltungskontrolle' } },
      ]}
      primaryColor="#059669"
      gradientClass="bg-gradient-to-br from-emerald-500 to-green-700"
    />
  );
};

export default AccountingDemo;
