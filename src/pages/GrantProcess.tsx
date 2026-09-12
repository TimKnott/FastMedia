import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CalendarClock, FileCheck2, ListChecks, AlertTriangle, ExternalLink, Map, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { nationalPool } from '@/data/grantRegions';

const copy = {
  cs: {
    seoTitle: 'Kreativní vouchery: průběh žádosti, termíny a podklady | FastMedia',
    seoDesc: 'Jak probíhá žádost o kreativní voucher krok za krokem: fáze výzvy, termíny, které si musíte hlídat, a kompletní seznam podkladů a příloh k žádosti i k vyúčtování.',
    switchLabel: 'English',
    kicker: 'Kreativní vouchery',
    h1: 'Průběh žádosti, termíny a potřebné podklady',
    sub: 'Program má pevné fáze a lhůty. Tady najdete, co se kdy děje, které termíny nesmíte propásnout a jaké dokumenty si připravit — do žádosti i do vyúčtování.',
    wizard: 'Spustit navigátor',
    hubs: 'Najít svého partnera',
    phasesTitle: 'Fáze procesu',
    phases: [
      { n: '01', t: 'Vyhlášení výzvy', d: 'Regionální partner zveřejní text výzvy: rozmezí rozpočtu, uznatelné aktivity, hodnotící kritéria a termíny. Text výzvy je jediný závazný dokument — čtěte ho vždy celý.', when: 'Zpravidla několik týdnů před příjmem žádostí' },
      { n: '02', t: 'Příprava projektu a nabídky', d: 'Vyberete dodavatele z Celostátní galerie kreativců a necháte si zpracovat položkovou nabídku a technickou specifikaci. Od nás dostanete obojí ve struktuře, kterou žádost vyžaduje.', when: 'Počítejte s 1–2 týdny' },
      { n: '03', t: 'Podání žádosti', d: 'Žádost podáváte elektronicky u partnera nebo přes portál programu. Potřebujete elektronickou identitu a datovou schránku. U některých výzev rozhoduje i čas podání.', when: 'Pevné okno příjmu žádostí' },
      { n: '04', t: 'Hodnocení', d: 'Partner zkontroluje formální náležitosti a věcně vyhodnotí projekt. Může si vyžádat doplnění — na výzvu k doplnění reagujte obratem, lhůty bývají krátké.', when: 'Obvykle několik týdnů' },
      { n: '05', t: 'Rozhodnutí a smlouva', d: 'Po rozhodnutí či podpisu smlouvy můžete projekt zahájit. Náklady vzniklé dříve nejsou uznatelné, i kdyby žádost byla úspěšná.', when: 'Zahájení až po tomto kroku' },
      { n: '06', t: 'Realizace', d: 'Projekt realizujeme v termínu podle smlouvy. Průběžně sbíráme výstupy, které budete dokládat: návrhy, zdrojové soubory, odkaz na spuštěný web.', when: 'Podle rozsahu 6–12 týdnů' },
      { n: '07', t: 'Vyúčtování a proplacení', d: 'Doložíte fakturu, doklad o úhradě a výstupy. Po schválení vyúčtování vám partner vyplatí 85 % způsobilých nákladů, maximálně 150 000 Kč.', when: 'Výplata až po schválení' },
    ],
    whenLabel: 'Kdy',
    deadlinesTitle: 'Termíny, které si hlídejte',
    deadlines: [
      { t: 'Konec příjmu žádostí', d: 'Nejtvrdší termín celého procesu. Po uzávěrce se žádost nedá podat ani doplnit. Nechte si rezervu alespoň tři pracovní dny.' },
      { t: 'Lhůta na doplnění', d: 'Pokud partner vyzve k doplnění, lhůta bývá jen několik dní. Mějte podklady po ruce a sledujte datovou schránku.' },
      { t: 'Zahájení realizace', d: 'Nesmí být dříve než rozhodnutí či podpis smlouvy. Datum na faktuře i na smlouvě s dodavatelem musí toto pravidlo respektovat.' },
      { t: 'Konec realizace', d: 'Projekt musí být dokončen do data uvedeného ve smlouvě. Pozdější výstupy nemusí být uznány.' },
      { t: 'Podání vyúčtování', d: 'Vyúčtování se podává v pevné lhůtě po dokončení. Propásnutí může znamenat nevyplacení celé podpory.' },
      { t: 'Udržitelnost', d: 'Výstupy je nutné provozovat a udržet po dobu uvedenou ve výzvě — web tedy nelze krátce po proplacení vypnout.' },
    ],
    docsTitle: 'Podklady k žádosti',
    docs: [
      'Výpis z obchodního rejstříku nebo živnostenského registru',
      'IČO, DIČ a doklad o bankovním spojení',
      'Potvrzení o bezdlužnosti (finanční úřad, ČSSZ, zdravotní pojišťovna)',
      'Prohlášení o velikosti podniku (MSP)',
      'Prohlášení o podpoře de minimis za poslední 3 roky',
      'Popis projektu: cíl, cílová skupina, měřitelný přínos',
      'Položková cenová nabídka dodavatele s termíny plnění',
      'Technická specifikace kreativní práce na míru',
      'Doklad, že dodavatel je v Celostátní galerii kreativců',
      'Souhlas se zpracováním osobních údajů a čestná prohlášení dle výzvy',
    ],
    docsNote: 'Přesný seznam příloh se mezi výzvami liší. Vždy si ho ověřte v textu výzvy svého partnera — tento seznam je orientační souhrn nejčastěji požadovaných dokumentů.',
    closeDocsTitle: 'Podklady k vyúčtování',
    closeDocs: [
      'Faktura dodavatele s položkami odpovídajícími schválenému rozpočtu',
      'Doklad o úhradě celé fakturní částky',
      'Výstupy projektu: návrhy, zdrojové soubory, odkaz na spuštěný web',
      'Fotodokumentace nebo screenshoty dle požadavků výzvy',
      'Splnění pravidel publicity Národního plánu obnovy',
      'Závěrečná zpráva o realizaci projektu',
    ],
    oursTitle: 'Co z toho připravíme my',
    ours: [
      'Položkovou cenovou nabídku v požadované struktuře',
      'Technickou specifikaci kreativní práce na míru',
      'Harmonogram realizace odpovídající termínům výzvy',
      'Faktury a doklady ve formátu vhodném pro vyúčtování',
      'Výstupy a zdrojové soubory k doložení',
    ],
    packLink: 'Vyplnit podklady k žádosti',
    warnTitle: 'Na co si dát pozor',
    warn: 'Nezahajujte práce ani neplaťte zálohu dříve, než máte rozhodnutí či smlouvu — takové náklady nejsou uznatelné. A pozor na kohokoli, kdo vám garantuje schválení: o podpoře rozhoduje výhradně poskytovatel podle textu výzvy. My nejsme poskytovatel dotace ani dotační poradce.',
    verifyTitle: 'Kde si termíny ověříte',
    ctaTitle: 'Nevíte, jak silná je vaše žádost?',
    ctaBody: 'Navigátor vám za pět kroků řekne, jak jste připraveni, kolik zaplatíte ze svého a s jakým partnerem budete jednat.',
  },
  en: {
    seoTitle: 'Creative Vouchers: Process, Deadlines and Documents | FastMedia',
    seoDesc: 'How a Kreativní vouchery application runs step by step: the phases of a call, the deadlines you must not miss, and the full list of documents for the application and the final accounting.',
    switchLabel: 'Čeština',
    kicker: 'Creative vouchers',
    h1: 'The application process, deadlines and documents',
    sub: 'The programme runs in fixed phases with hard deadlines. Here is what happens when, which dates you cannot miss, and every document to prepare — for the application and for the final accounting.',
    wizard: 'Start the navigator',
    hubs: 'Find your partner',
    phasesTitle: 'Phases of the process',
    phases: [
      { n: '01', t: 'The call is published', d: 'Your regional partner publishes the call: budget range, eligible activities, scoring criteria and dates. The text of the call is the only binding document — read all of it.', when: 'Usually weeks before applications open' },
      { n: '02', t: 'Prepare the project and quote', d: 'Choose a supplier from the national gallery of creatives and get an itemised quotation and technical specification. We provide both in the structure the application requires.', when: 'Allow 1–2 weeks' },
      { n: '03', t: 'Submit the application', d: 'You apply electronically with the partner or through the programme portal. You need an electronic identity and a data box. In some calls, submission time itself counts.', when: 'A fixed submission window' },
      { n: '04', t: 'Assessment', d: 'The partner checks formalities and scores the project. They may ask for additions — respond immediately, these windows are short.', when: 'Typically several weeks' },
      { n: '05', t: 'Decision and contract', d: 'Only after the decision or signed contract may the project start. Costs incurred earlier are not eligible, even with a successful application.', when: 'Work starts after this point' },
      { n: '06', t: 'Delivery', d: 'We deliver within the contracted timeline, collecting the outputs you will submit as evidence: designs, source files and the link to the live site.', when: '6–12 weeks depending on scope' },
      { n: '07', t: 'Accounting and payout', d: 'You submit the invoice, proof of payment and the outputs. Once approved, the partner pays 85% of eligible costs, up to 150,000 CZK.', when: 'Paid only after approval' },
    ],
    whenLabel: 'When',
    deadlinesTitle: 'Deadlines to watch',
    deadlines: [
      { t: 'Application close', d: 'The hardest deadline in the process. Nothing can be submitted or amended afterwards. Leave yourself at least three working days.' },
      { t: 'Window for additions', d: 'If the partner requests additional documents, the window is often only a few days. Keep documents to hand and watch your data box.' },
      { t: 'Start of delivery', d: 'Never before the decision or signed contract. Supplier contract and invoice dates must respect this rule.' },
      { t: 'End of delivery', d: 'The project must be completed by the date in the contract. Later outputs may not be accepted.' },
      { t: 'Accounting submission', d: 'Final accounting has a fixed window after delivery. Missing it can mean losing the whole payout.' },
      { t: 'Sustainability period', d: 'Outputs must stay in operation for the period stated in the call — you cannot switch the website off soon after being paid.' },
    ],
    docsTitle: 'Documents for the application',
    docs: [
      'Extract from the commercial or trade register',
      'Company ID, VAT number and bank account confirmation',
      'Debt-free confirmations (tax office, social security, health insurer)',
      'Declaration of enterprise size (SME)',
      'De minimis declaration covering the past 3 years',
      'Project description: objective, target group, measurable benefit',
      'Itemised supplier quotation with delivery dates',
      'Technical specification of the bespoke creative work',
      'Evidence that the supplier is in the national gallery of creatives',
      'Data-processing consent and the declarations named in the call',
    ],
    docsNote: 'The exact annexes differ between calls. Always confirm the list in your partner\u2019s call text — this is an indicative summary of the documents most commonly requested.',
    closeDocsTitle: 'Documents for the final accounting',
    closeDocs: [
      'Supplier invoice with line items matching the approved budget',
      'Proof that the full invoice was paid',
      'Project outputs: designs, source files, link to the live site',
      'Photo documentation or screenshots as required by the call',
      'Compliance with National Recovery Plan publicity rules',
      'Final project report',
    ],
    oursTitle: 'What we prepare for you',
    ours: [
      'An itemised quotation in the required structure',
      'A technical specification of the bespoke creative work',
      'A delivery timeline matching the call deadlines',
      'Invoices and records formatted for the final accounting',
      'Outputs and source files for your evidence',
    ],
    packLink: 'Complete the application pack',
    warnTitle: 'What to watch out for',
    warn: 'Do not start work or pay a deposit before you hold the decision or contract — those costs are not eligible. And be wary of anyone guaranteeing approval: only the provider decides, based on the text of the call. We are not the grant provider or a grant consultancy.',
    verifyTitle: 'Where to verify the dates',
    ctaTitle: 'Not sure how strong your application is?',
    ctaBody: 'In five steps the navigator tells you how ready you are, what you pay yourself and which partner handles your application.',
  },
} as const;

const GrantProcess = () => {
  const { language, setLanguage } = useLanguage();
  const lang = language === 'en' ? 'en' : 'cs';
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle} description={t.seoDesc} pagePath="/grant-process" />
      <Navbar />

      <header className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Badge variant="secondary" className="gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> {t.kicker}
            </Badge>
            <button
              type="button"
              onClick={() => setLanguage(lang === 'cs' ? 'en' : 'cs')}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t.switchLabel}
            </button>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{t.h1}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{t.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/grant-wizard">{t.wizard} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/grant-hubs"><Map className="mr-2 h-4 w-4" /> {t.hubs}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="font-display text-2xl font-bold md:text-3xl">{t.phasesTitle}</h2>
          <ol className="mt-8 space-y-4">
            {t.phases.map((phase) => (
              <li key={phase.n} className="rounded-lg border border-border bg-card p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <span className="font-display text-xl font-bold text-primary">{phase.n}</span>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold">{phase.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{phase.d}</p>
                  </div>
                  <div className="md:w-56 md:shrink-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.whenLabel}</p>
                    <p className="mt-1 flex items-start gap-2 text-sm">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {phase.when}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-y border-border bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold md:text-3xl">{t.deadlinesTitle}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {t.deadlines.map((item) => (
                <Card key={item.t}>
                  <CardContent className="p-6">
                    <h3 className="flex items-start gap-2 font-semibold">
                      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {item.t}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold md:text-3xl">
                <ListChecks className="h-6 w-6 text-primary" /> {t.docsTitle}
              </h2>
              <ul className="space-y-3">
                {t.docs.map((doc) => (
                  <li key={doc} className="flex gap-3 text-sm text-muted-foreground">
                    <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {doc}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{t.docsNote}</p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/grant-application">{t.packLink} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div>
              <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold md:text-3xl">
                <FileCheck2 className="h-6 w-6 text-primary" /> {t.closeDocsTitle}
              </h2>
              <ul className="space-y-3">
                {t.closeDocs.map((doc) => (
                  <li key={doc} className="flex gap-3 text-sm text-muted-foreground">
                    <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {doc}
                  </li>
                ))}
              </ul>
              <Card className="mt-8 border-primary/30">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold">{t.oursTitle}</h3>
                  <ul className="mt-4 space-y-2">
                    {t.ours.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto grid gap-8 px-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                  <AlertTriangle className="h-5 w-5 text-primary" /> {t.warnTitle}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.warn}</p>
              </CardContent>
            </Card>
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold">{t.verifyTitle}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{nationalPool[lang].note}</p>
                <a
                  href={nationalPool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  dpmk.cz <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <div className="mt-8">
                  <h3 className="font-display text-lg font-bold">{t.ctaTitle}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.ctaBody}</p>
                  <Button asChild className="mt-5">
                    <Link to="/grant-wizard">{t.wizard} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GrantProcess;
