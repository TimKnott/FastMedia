import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Map, Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQJsonLd from '@/components/FAQJsonLd';
import { useLanguage } from '@/contexts/LanguageContext';
import { nationalPool } from '@/data/grantRegions';

const copy = {
  cs: {
    seoTitle: 'Kreativní vouchery: podmínky způsobilosti a pravidla | FastMedia',
    seoDesc: 'Kompletní podmínky kreativních voucherů: kdo může žádat, co je uznatelné, míra podpory 85 %, strop 150 000 Kč, de minimis, předfinancování a právní upozornění.',
    switchLabel: 'English',
    kicker: 'Kreativní vouchery',
    h1: 'Podmínky způsobilosti: kdo na kreativní voucher dosáhne',
    sub: 'Kompletní přehled pravidel programu na jednom místě — bez marketingových slibů. Přečtěte si to před vyplněním navigátoru, ušetříte si zbytečnou práci.',
    wizard: 'Spustit navigátor',
    hubs: 'Mapa regionálních partnerů',
    quickTitle: 'Rychlý test způsobilosti',
    quickSub: 'Pokud u některého bodu odpovíte ne, program vás v této výzvě nepustí dál.',
    quick: [
      'Aktivní podnikání v ČR (OSVČ nebo právnická osoba), zpravidla alespoň 3 měsíce.',
      'Žádné nedoplatky na daních, sociálním a zdravotním pojištění a žádné insolvenční řízení.',
      'Za poslední 3 roky méně než 300 000 EUR podpory v režimu de minimis.',
      'Projekt obsahuje kreativní práci na míru, ne jen nasazení hotové šablony.',
      'Rozpočet projektu leží v rozmezí, které vaše výzva připouští.',
      'Dodavatel je zapsán v Celostátní galerii kreativců a není s vámi spojenou osobou.',
    ],
    eligibleTitle: 'Co voucher pokrývá',
    eligible: [
      'Strategický UX/UI design a návrh uživatelských cest',
      'Vizuální identita, logo, design systém',
      'Web a webové aplikace vytvořené na míru',
      'Interaktivní moduly, rezervační a zákaznické procesy na míru',
      'Propojení digitálních systémů (CRM, fakturace, kalendář)',
      'Copywriting, fotografie a audiovizuální obsah pro projekt',
    ],
    notEligibleTitle: 'Co voucher nepokrývá',
    notEligible: [
      'Hardware, notebooky, telefony, tiskárny',
      'Licence hotového softwaru a předplatné nástrojů',
      'Hosting, domény a běžný provoz — fakturujeme mimo dotaci',
      'Nákup reklamního prostoru a mediální rozpočty',
      'Šablonová řešení bez vlastní kreativní práce',
      'Náklady vzniklé před vydáním rozhodnutí nebo podpisem smlouvy',
    ],
    moneyTitle: 'Peníze: 85 %, strop a předfinancování',
    money: [
      { t: 'Míra podpory', d: 'Až 85 % způsobilých nákladů. Zbývajících 15 % (a vše nad stropem) hradíte ze svého.' },
      { t: 'Strop dotace', d: 'Podpora je omezena stropem 150 000 Kč. Nad rozpočet 176 470 Kč rostou už jen vaše vlastní náklady.' },
      { t: 'Předfinancování', d: 'Celou fakturu hradíte dodavateli sami. Dotace se vyplácí zpětně (ex-post) po realizaci a schválení vyúčtování.' },
      { t: 'DPH', d: 'Jako plátce DPH žádáte o podporu z ceny bez DPH. Neplátci mívají DPH součástí způsobilých nákladů — ověřte si to ve výzvě.' },
      { t: 'De minimis', d: 'Podpora se poskytuje v režimu de minimis: souhrn za tři roky nesmí u jednoho podniku přesáhnout 300 000 EUR.' },
    ],
    processTitle: 'Jak žádost probíhá',
    process: [
      { n: '01', t: 'Ověříte výzvu', d: 'U svého regionálního partnera si přečtěte aktuální text výzvy, termíny a rozmezí rozpočtu.' },
      { n: '02', t: 'Připravíte podklady', d: 'IČO, doklady o bezdlužnosti, prohlášení o de minimis, popis projektu a naši položkovou nabídku.' },
      { n: '03', t: 'Podáte žádost', d: 'Elektronicky u partnera nebo přes portál programu. Potřebujete elektronickou identitu a datovou schránku.' },
      { n: '04', t: 'Realizace po rozhodnutí', d: 'Práce začínají až po vydání rozhodnutí či podpisu smlouvy. Dřívější náklady nejsou uznatelné.' },
      { n: '05', t: 'Vyúčtování', d: 'Doložíte faktury, doklady o úhradě a výstupy. Po schválení dostanete 85 % zpět.' },
    ],
    faqTitle: 'Časté dotazy ke krokům navigátoru',
    faqs: [
      { q: 'Krok 1 — proč po mně chcete IČO a kraj?', a: 'IČO potřebujeme, abychom mohli připravit nabídku ve struktuře, kterou žádost vyžaduje, a kraj rozhoduje o tom, který regionální partner vaši žádost administruje. Údaje neposkytujeme třetím stranám a nepodáváme za vás žádost.' },
      { q: 'Krok 1 — co když nesplním jednu ze tří zákonných podmínek?', a: 'Navigátor vás poctivě zastaví a nabídne standardní nabídku bez dotace. Nedoplatky i insolvence jsou vylučovací podmínka programu, nikoli naše rozhodnutí. Jakmile je vyřešíte, můžete se do další výzvy vrátit.' },
      { q: 'Krok 2 — proč musím vybrat alespoň jeden prvek na míru?', a: 'Voucher je určen na kreativní práci na míru. Pokud by projekt byl jen instalací hotové šablony, do programu nespadá a žádost by byla vyřazena. Proto navigátor bez takové položky nepustí dál.' },
      { q: 'Krok 3 — proč mi kalkulace ukazuje strop 150 000 Kč?', a: 'Podpora tvoří 85 % rozpočtu, ale je zastropovaná na 150 000 Kč. U rozpočtu 176 470 Kč je strop právě vyčerpán; vše nad tuto částku už hradíte celé sami. Kalkulace to počítá automaticky.' },
      { q: 'Krok 3 — musím mít celou částku dopředu?', a: 'Ano, program je ex-post. Fakturu hradíte vy a 85 % vám poskytovatel vyplatí až po schválení vyúčtování. Platbu vám rádi rozložíme podle milníků projektu.' },
      { q: 'Krok 4 — co dělá regionální partner?', a: 'Vypisuje výzvu, přijímá a hodnotí žádosti a vyplácí podporu. My s ním nejednáme za vás — jen vám připravíme technické a cenové podklady a řekneme, koho kontaktovat.' },
      { q: 'Krok 5 — jak vzniká procento šance v hodnocení?', a: 'Umělá inteligence porovná vaše odpovědi, popis projektu a připravenost podkladů s podmínkami programu a vrátí orientační odhad. Není to rozhodnutí o dotaci ani jeho předpověď a poskytovatel se s ním nemusí shodovat.' },
      { q: 'Dostanu dotaci jistě, když mi navigátor dá vysoké procento?', a: 'Ne. Vysoké skóre znamená jen dobře připravenou žádost. O přiznání a výši podpory rozhoduje výhradně poskytovatel podle textu výzvy.' },
      { q: 'Co když dotaci nezískám?', a: 'Projekt postavíme za standardní ceny, s 30denní garancí vrácení peněz a možností rozložit platbu. Naše nabídka platí nezávisle na výsledku dotace.' },
    ],
    legalTitle: 'Právní upozornění',
    legal: [
      'FastMedia.Pro není poskytovatelem dotace ani dotačním poradcem a nemá vliv na rozhodnutí o žádosti.',
      'Obsah této stránky je informativní souhrn opakujících se podmínek. Vždy platí aktuální text konkrétní výzvy vašeho regionálního partnera.',
      'Nejde o právní ani daňové poradenství. Podporu vám nemůžeme přislíbit ani zaručit.',
      'Neodpovídáme za zamítnutí žádosti, změnu či zrušení výzvy, nevyplacení podpory ani za promeškané termíny.',
      'Za správnost údajů v žádosti odpovídá žadatel. Připravujeme technickou specifikaci a cenovou nabídku; žádost podává žadatel.',
    ],
    sourceTitle: 'Kde si pravidla ověříte',
    ctaTitle: 'Připraveni to zjistit?',
    ctaBody: 'Navigátor vás pětikrokovým dotazníkem provede za několik minut a vrátí hodnocení připravenosti i podklady, které si máte připravit.',
  },
  en: {
    seoTitle: 'Creative Vouchers: Eligibility Rules Explained | FastMedia',
    seoDesc: 'The full Kreativní vouchery rules: who can apply, eligible costs, the 85% support rate, the 150,000 CZK cap, de minimis, pre-financing and legal limits.',
    switchLabel: 'Čeština',
    kicker: 'Creative vouchers',
    h1: 'Eligibility rules: who qualifies for a creative voucher',
    sub: 'The whole rulebook in one place, with no marketing promises. Read it before you run the navigator and you will save yourself wasted effort.',
    wizard: 'Start the navigator',
    hubs: 'Map of regional partners',
    quickTitle: 'Quick eligibility test',
    quickSub: 'A "no" on any of these points means this call will not let you through.',
    quick: [
      'An active Czech business (sole trader or company), normally trading for at least 3 months.',
      'No outstanding tax, social or health insurance debts, and no insolvency proceedings.',
      'Less than €300,000 of de minimis support received over the past 3 years.',
      'The project includes bespoke creative work, not just a ready-made template.',
      'The project budget sits inside the range your call allows.',
      'The supplier is listed in the national gallery of creatives and is not connected to you.',
    ],
    eligibleTitle: 'What the voucher covers',
    eligible: [
      'Strategic UX/UI design and user journey work',
      'Visual identity, logo, design system',
      'Bespoke websites and web applications',
      'Custom interactive modules, booking and customer workflows',
      'Connecting digital systems (CRM, invoicing, calendars)',
      'Copywriting, photography and audiovisual content for the project',
    ],
    notEligibleTitle: 'What it does not cover',
    notEligible: [
      'Hardware: laptops, phones, printers',
      'Off-the-shelf software licences and tool subscriptions',
      'Hosting, domains and day-to-day running costs — we invoice these outside the grant',
      'Advertising space and media budgets',
      'Template-only builds with no original creative work',
      'Any cost incurred before the decision or contract is signed',
    ],
    moneyTitle: 'The money: 85%, the cap and pre-financing',
    money: [
      { t: 'Support rate', d: 'Up to 85% of eligible costs. The remaining 15% — and anything above the cap — is yours to pay.' },
      { t: 'Grant cap', d: 'Support is capped at 150,000 CZK. Above a 176,470 CZK budget, every extra crown is your own money.' },
      { t: 'Pre-financing', d: 'You pay the supplier invoice in full yourself. The grant is reimbursed after delivery and approved accounting.' },
      { t: 'VAT', d: 'VAT-registered applicants claim on the net price. Non-registered businesses can usually include VAT — check your call.' },
      { t: 'De minimis', d: 'Support is granted under de minimis rules: no more than €300,000 per business over three years.' },
    ],
    processTitle: 'How an application runs',
    process: [
      { n: '01', t: 'Check the call', d: 'Read your regional partner\u2019s current call: deadlines, budget range and scoring.' },
      { n: '02', t: 'Gather documents', d: 'Company ID, debt-free confirmations, de minimis declaration, project description and our itemised quotation.' },
      { n: '03', t: 'Submit', d: 'Apply electronically with the partner or through the programme portal. You need an electronic identity and a data box.' },
      { n: '04', t: 'Start after the decision', d: 'Work begins only after the decision or contract. Earlier costs are not eligible.' },
      { n: '05', t: 'Account for it', d: 'Submit invoices, proof of payment and the outputs. Once approved, you receive the 85% back.' },
    ],
    faqTitle: 'FAQ, step by step through the navigator',
    faqs: [
      { q: 'Step 1 — why do you need my company ID and region?', a: 'The company ID lets us prepare a quotation in the structure the application requires, and your region decides which regional partner handles it. We do not pass your details to third parties and we do not submit the application for you.' },
      { q: 'Step 1 — what if I fail one of the three legal conditions?', a: 'The navigator stops honestly and offers a standard quote without the grant. Tax debts and insolvency are programme exclusions, not our decision. Once resolved, you can come back for the next call.' },
      { q: 'Step 2 — why must I pick at least one bespoke item?', a: 'The voucher exists for bespoke creative work. A project that only installs a ready-made template falls outside the programme and would be rejected, so the navigator will not continue without one.' },
      { q: 'Step 3 — why does the calculation show a 150,000 CZK cap?', a: 'Support is 85% of the budget but capped at 150,000 CZK. At a budget of 176,470 CZK the cap is exactly reached; anything above that is fully yours. The calculator applies this automatically.' },
      { q: 'Step 3 — do I need the full amount up front?', a: 'Yes, the scheme reimburses after the fact. You pay the invoice and the provider pays the 85% back once the accounting is approved. We are happy to split payments across project milestones.' },
      { q: 'Step 4 — what does the regional partner actually do?', a: 'It publishes the call, receives and scores applications and pays out the support. We do not negotiate with them on your behalf — we prepare your technical and pricing documents and tell you who to contact.' },
      { q: 'Step 5 — how is the readiness percentage produced?', a: 'AI compares your answers, project description and document readiness against the programme conditions and returns an indicative estimate. It is not a grant decision or a prediction of one, and the provider may see it differently.' },
      { q: 'If the navigator gives me a high score, am I certain to get the grant?', a: 'No. A high score only means a well-prepared application. The provider alone decides whether and how much support is awarded, based on the text of the call.' },
      { q: 'What if I do not get the grant?', a: 'We build the project at our standard rates, with a 30-day money-back guarantee and the option to spread payments. Our quote stands regardless of the grant outcome.' },
    ],
    legalTitle: 'Legal notice',
    legal: [
      'FastMedia.Pro is not the grant provider or a grant consultancy and has no influence over any decision.',
      'This page is an informative summary of recurring conditions. The current text of your regional partner\u2019s call always prevails.',
      'This is not legal or tax advice. We cannot promise or guarantee any support.',
      'We are not liable for a rejected application, a changed or cancelled call, unpaid support or missed deadlines.',
      'The applicant is responsible for the accuracy of the application. We prepare the technical specification and quotation; the applicant submits.',
    ],
    sourceTitle: 'Where to verify the rules',
    ctaTitle: 'Ready to find out?',
    ctaBody: 'The navigator walks you through five steps in a few minutes and returns a readiness assessment plus the documents you should prepare.',
  },
} as const;

const GrantEligibility = () => {
  const { language, setLanguage } = useLanguage();
  const lang = language === 'en' ? 'en' : 'cs';
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle} description={t.seoDesc} pagePath="/grant-eligibility" />
      <FAQJsonLd faqs={t.faqs.map((f) => ({ question: f.q, answer: f.a }))} />
      <Navbar />

      <header className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Badge variant="secondary" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> {t.kicker}
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
          <h2 className="font-display text-2xl font-bold md:text-3xl">{t.quickTitle}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t.quickSub}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {t.quick.map((item) => (
              <Card key={item}>
                <CardContent className="flex gap-3 p-5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto grid gap-10 px-4 md:grid-cols-2">
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold md:text-3xl">{t.eligibleTitle}</h2>
              <ul className="space-y-4">
                {t.eligible.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold md:text-3xl">{t.notEligibleTitle}</h2>
              <ul className="space-y-4">
                {t.notEligible.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="font-display text-2xl font-bold md:text-3xl">{t.moneyTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {t.money.map((item) => (
              <Card key={item.t}>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold">{item.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold md:text-3xl">{t.processTitle}</h2>
            <ol className="mt-8 space-y-5">
              {t.process.map((step) => (
                <li key={step.n} className="flex gap-5 rounded-lg border border-border bg-card p-5">
                  <span className="font-display text-xl font-bold text-primary">{step.n}</span>
                  <div>
                    <h3 className="font-semibold">{step.t}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="mb-8 font-display text-2xl font-bold md:text-3xl">{t.faqTitle}</h2>
          <Accordion type="single" collapsible className="max-w-3xl">
            {t.faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="border-t border-border bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto grid gap-8 px-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                  <Scale className="h-5 w-5 text-primary" /> {t.legalTitle}
                </h2>
                <ul className="mt-5 space-y-3">
                  {t.legal.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold">{t.sourceTitle}</h2>
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

export default GrantEligibility;
