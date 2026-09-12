import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, BadgeCheck, Rocket, ShieldCheck, Sparkles, Landmark,
  AlertTriangle, CheckCircle2, Loader2, FileText, ExternalLink, Scale, Phone, Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import OfferEnquiryForm from '@/components/OfferEnquiryForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { grantRegions, nationalPool } from '@/data/grantRegions';
import { GRANT_PREFILL_KEY } from './GrantApplication';
import launchSky from '@/assets/launch-sky-moonlit.jpg';
import launchRocket from '@/assets/launch-rocket.png';

type Lang = 'cs' | 'en';

const UPGRADES = [
  { id: 'uiux', cs: 'Na míru navržené UI/UX a vizuální identita', en: 'Bespoke UI/UX redesign & brand identity' },
  { id: 'booking', cs: 'Rezervační a objednávkový systém na míru oboru', en: 'Custom service booking engine (job-specific workflows)' },
  { id: 'portal', cs: 'Back-office a zákaznický portál', en: 'Back-office & customer portal' },
  { id: 'crm', cs: 'Automatizované propojení s CRM a dalšími systémy', en: 'Automated CRM connectivity & integration' },
  { id: 'interactive', cs: 'Interaktivní moduly zákaznické zkušenosti', en: 'Interactive customer experience modules' },
] as const;

const INDUSTRIES = [
  { id: 'trades', cs: 'Řemesla a stavebnictví', en: 'Trades / construction' },
  { id: 'professional', cs: 'Profesionální služby', en: 'Professional services' },
  { id: 'education', cs: 'Vzdělávání', en: 'Education' },
  { id: 'auto', cs: 'Auto a mechanika', en: 'Auto / mechanical' },
  { id: 'retail', cs: 'Retail a e-shop', en: 'Retail' },
  { id: 'health', cs: 'Zdravotnictví a péče', en: 'Healthcare' },
  { id: 'other', cs: 'Jiné', en: 'Other' },
] as const;

const copy = {
  cs: {
    seoTitle: 'Kreativní vouchery: navigátor žádosti | FastMedia',
    seoDesc: 'Interaktivní průvodce připraveností na Kreativní vouchery pro české firmy. Zjistěte za pár minut, jak silná je vaše žádost, co chybí a jaký je váš podíl 15 %.',
    switchLabel: 'English',
    badge: 'Registrovaný dodavatel v Celostátní galerii kreativců',
    kicker: 'Kreativní vouchery',
    h1: 'Navigátor kreativních voucherů',
    tagline: 'Nastartujte svůj projekt s podporou až 85 %',
    sub: 'Čtyři kroky a víte, jestli je vaše firma na žádost připravená, kolik zaplatíte ze svého a s jakým regionálním partnerem budete jednat. Umělá inteligence vám navíc řekne, co ve vaší žádosti chybí.',
    heroNote: 'Nejsme poskytovatel dotace. Připravíme vás na žádost, ale samotnou žádost podává a rozhoduje o ní vždy poskytovatel.',
    start: 'Spustit navigátor',
    rules: 'Pravidla a podmínky',
    stepLabel: 'Krok',
    of: 'ze',
    // Step 1
    s1title: 'Základní způsobilost firmy',
    s1sub: 'Údaje potřebujeme jen pro posouzení a přípravu nabídky.',
    business: 'Název firmy',
    ico: 'IČO',
    region: 'Kraj',
    regionPlaceholder: 'Vyberte kraj',
    chk1: 'Aktivní podnikání (OSVČ / s.r.o.) fungující alespoň 3 měsíce',
    chk2: 'Bez dluhů na daních, sociálním a zdravotním pojištění a bez insolvence',
    chk3: 'Za poslední 3 roky jsme obdrželi méně než 300 000 EUR podpory de minimis',
    gateTitle: 'Zatím nemusíte splňovat podmínky',
    gateBody: 'Na 85% dotaci teď možná nedosáhnete, ale váš projekt rádi postavíme za našich standardních konkurenčních cen. Napište nám a připravíme rozpočet bez dotace.',
    gateBack: 'Zpět k dotazníku',
    // Step 2
    s2title: 'Rozsah a kreativní prvky',
    s2sub: 'Voucher je určen na kreativní práci na míru, ne na hotová šablonová řešení.',
    industry: 'Hlavní obor',
    upgrades: 'Požadované kreativní prvky',
    upgradeHint: 'Vyberte alespoň jednu položku na míru — bez ní projekt do programu nespadá.',
    // Step 3
    s3title: 'Rozpočet a váš podíl',
    s3sub: 'Orientační propočet. Konečnou výši podpory stanoví poskytovatel.',
    budget: 'Navržený rozpočet projektu',
    vat: 'Jsme plátce DPH',
    total: 'Celková fakturovaná částka',
    reimb: 'Refundace státu (85 %)',
    share: 'Váš podíl (15 %)',
    prefinance: 'Pozor: celou fakturu musíte předfinancovat sami. Refundace 85 % přichází až po ukončení a vyúčtování projektu.',
    vatNote: 'Jako plátce DPH žádáte o podporu z ceny bez DPH; DPH si odečtete v daňovém přiznání.',
    vatNoteNo: 'Jako neplátce DPH bývá DPH obvykle součástí způsobilých nákladů — ověřte si to ve výzvě.',
    // Step 4
    s4title: 'Regionální partner a kontakt',
    s4sub: 'Podle vašeho kraje vám přiřadíme partnera a připravíme podklady.',
    hubTitle: 'Váš regionální inovační partner',
    contactName: 'Kontaktní osoba',
    email: 'E-mail',
    phone: 'Telefon',
    project: 'Popis projektu (co chcete vytvořit a proč)',
    projectPlaceholder: 'Např. nový web pro instalatérskou firmu s rezervací termínů, portálem pro zákazníky a propojením na fakturaci. Cílem je snížit telefonování o polovinu.',
    hasWebsite: 'Máme současný web, který lze doložit',
    hasBranding: 'Máme logo a základní vizuální identitu',
    hasPortfolio: 'Máme fotky realizací / portfolio prací',
    submit: 'Vygenerovat rozsah projektu a rezervovat konzultaci',
    submitting: 'Analyzuji…',
    next: 'Pokračovat',
    back: 'Zpět',
    // Report
    reportTitle: 'Vaše hodnocení připravenosti',
    chance: 'Odhadovaná šance na úspěch žádosti',
    strengths: 'Co máte silné',
    gaps: 'Co ve vaší žádosti chybí',
    improvements: 'Jak si šanci zvýšit',
    documents: 'Podklady, které si připravte',
    reportDisclaimer: 'Toto hodnocení je orientační odhad připravenosti vytvořený umělou inteligencí na základě vámi zadaných údajů. Nejde o rozhodnutí o dotaci ani o jeho předpověď.',
    sent: 'Vaše údaje jsme přijali. Ozveme se do 24 hodin.',
    again: 'Vyplnit znovu',
    // Rules
    rulesTitle: 'Pravidla a podmínky programu',
    rulesIntro: 'Níže shrnujeme podmínky, které se u kreativních voucherů opakují. Vždy platí text konkrétní výzvy vašeho regionálního partnera — ten si přečtěte před podáním žádosti.',
    rulesList: [
      { t: 'Kdo může žádat', d: 'Malé a střední podniky (OSVČ i právnické osoby) se sídlem nebo provozovnou v ČR, aktivní zpravidla alespoň 3 měsíce, bez nedoplatků na daních, sociálním a zdravotním pojištění a bez insolvenčního řízení.' },
      { t: 'Na co je voucher určen', d: 'Kreativní služby na míru: design a UI/UX, vizuální identita, tvorba webu a aplikací na míru, audiovizuální obsah, fotografie, copywriting, produktový a průmyslový design. Nikoli hardware, licence hotového softwaru, reklamní prostor nebo běžný provoz.' },
      { t: 'Míra podpory a limity', d: 'Podpora dosahuje běžně až 85 % způsobilých nákladů, s pevným minimem a maximem podle výzvy. Zbytek hradí žadatel. Rozpočet mimo rozmezí výzvy je důvod k vyřazení.' },
      { t: 'Předfinancování', d: 'Žadatel hradí celou fakturu dodavateli sám. Podpora se vyplácí zpětně po realizaci, doložení výstupů a schválení vyúčtování.' },
      { t: 'Dodavatel z galerie kreativců', d: 'Práce musí být zadána kreativci či studiu zapsanému v Celostátní galerii kreativců. Dodavatel nesmí být osobou spojenou s žadatelem.' },
      { t: 'De minimis', d: 'Podpora se poskytuje v režimu de minimis. Souhrn podpory de minimis nesmí za tři roky přesáhnout 300 000 EUR na jeden podnik.' },
      { t: 'Časový rámec', d: 'Projekt se realizuje až po vydání rozhodnutí či podpisu smlouvy — náklady vzniklé dříve nejsou uznatelné. Realizace i vyúčtování mají v každé výzvě pevné termíny.' },
      { t: 'Výstupy a publicita', d: 'Výstupy je nutné doložit (návrhy, zdrojové soubory, odkaz na spuštěný web) a dodržet pravidla publicity Národního plánu obnovy.' },
      { t: 'Hodnocení a soutěž', d: 'Žádosti se hodnotí podle kvality a připravenosti, u některých výzev rozhoduje i čas podání. Splnění podmínek nezakládá právo na podporu.' },
    ],
    legalTitle: 'Právní upozornění a omezení odpovědnosti',
    legalList: [
      'FastMedia.Pro není poskytovatelem dotace, dotačním poradcem ani orgánem, který o žádosti rozhoduje. Nejsme státní úřad a nemáme na rozhodování žádný vliv.',
      'Výsledek tohoto navigátoru je nezávazný orientační odhad připravenosti, nikoli posouzení žádosti, právní ani daňové poradenství.',
      'Rozhodnutí o přiznání podpory a o její výši činí výhradně poskytovatel dotace podle textu příslušné výzvy. Žádnou podporu vám nemůžeme přislíbit ani zaručit.',
      'Neodpovídáme za zamítnutí žádosti, za změnu či zrušení výzvy, za nevyplacení podpory, za promeškané termíny ani za jakoukoli přímou či nepřímou škodu s tím spojenou.',
      'Za správnost a úplnost údajů uvedených v žádosti odpovídá vždy žadatel. Připravujeme technickou specifikaci a cenovou nabídku; žádost podává žadatel sám nebo se svým poradcem.',
      'Naše cenová nabídka a smluvní podmínky platí nezávisle na výsledku dotace — pokud podpora nebude přiznána, dílo se hradí podle sjednané ceny.',
      'Podmínky programů se mění. Před podáním žádosti si vždy ověřte aktuální text výzvy u svého regionálního partnera nebo na portálu DPMK.',
      'Zadané údaje zpracováváme pouze pro vyhodnocení dotazníku a kontaktování ve věci vaší poptávky, v souladu s naší politikou ochrany osobních údajů.',
    ],
    contactTitle: 'Chcete to probrat s člověkem?',
    contactSub: 'Napište nám a připravíme rozsah projektu i cenovou nabídku ve struktuře, kterou žádost vyžaduje.',
    grantsLink: 'Přečtěte si náš průvodce dotacemi',
    calcLink: 'Spočítat cenu v kalkulátoru',
    applyLink: 'Vyplnit podklady k žádosti',
    applyNote: 'Připraveni pokračovat? Vyplňte kompletní podklady k žádosti — údaje z navigátoru předvyplníme.',
  },
  en: {
    seoTitle: 'Creative Vouchers: application navigator | FastMedia',
    seoDesc: 'An interactive readiness navigator for the Czech Creative Vouchers programme. See in minutes how strong your application is, what is missing, and your 15% share.',
    switchLabel: 'Čeština',
    badge: 'Registered provider in the Celostátní galerie kreativců',
    kicker: 'Creative Vouchers',
    h1: 'Creative Voucher Navigator',
    tagline: 'Launch your project with up to 85% covered',
    sub: 'Four steps tell you whether your business is ready to apply, what you pay out of pocket, and which regional partner handles your case. AI then explains exactly what your application is missing.',
    heroNote: 'We are not the grant provider. We prepare you for the application; the provider always receives it and decides.',
    start: 'Start the navigator',
    rules: 'Rules and conditions',
    stepLabel: 'Step',
    of: 'of',
    s1title: 'Basic business eligibility',
    s1sub: 'We only use these details to assess your case and prepare a proposal.',
    business: 'Business name',
    ico: 'IČO (business ID)',
    region: 'Region (kraj)',
    regionPlaceholder: 'Select your region',
    chk1: 'Active business (OSVČ / s.r.o.) operating for at least 3 months',
    chk2: 'No active tax debts, unpaid social security, or insolvency proceedings',
    chk3: 'Received less than €300,000 in de minimis state support over the past 3 years',
    gateTitle: 'You may not qualify right now',
    gateBody: 'You may not qualify for the 85% grant right now, but we can still build your project under our standard competitive rates. Send us a line and we will price it without the grant.',
    gateBack: 'Back to the questions',
    s2title: 'Scope & creative features',
    s2sub: 'The voucher funds bespoke creative work, not off-the-shelf templates.',
    industry: 'Primary industry',
    upgrades: 'Desired creative upgrades',
    upgradeHint: 'Pick at least one bespoke item — without it the project falls outside the programme.',
    s3title: 'Budget and your share',
    s3sub: 'An indicative calculation. The provider sets the final support level.',
    budget: 'Proposed project budget',
    vat: 'VAT registered (plátce DPH)',
    total: 'Total invoice amount',
    reimb: 'State reimbursement (85%)',
    share: 'Your out-of-pocket share (15%)',
    prefinance: 'Note: you must pre-finance the full invoice yourself. The 85% reimbursement arrives only after the project is delivered and accounted for.',
    vatNote: 'As a VAT payer you claim support on the net amount; you reclaim VAT through your tax return.',
    vatNoteNo: 'If you are not VAT registered, VAT is usually part of eligible costs — confirm it in the call text.',
    s4title: 'Regional partner and contact',
    s4sub: 'We match your region to its partner and prepare your documents.',
    hubTitle: 'Your regional innovation partner',
    contactName: 'Contact person',
    email: 'Email',
    phone: 'Phone number',
    project: 'Project description (what you want built and why)',
    projectPlaceholder: 'E.g. a new website for a plumbing firm with job booking, a customer portal and invoicing integration, aiming to halve inbound phone calls.',
    hasWebsite: 'We have a current website we can show',
    hasBranding: 'We have a logo and basic brand identity',
    hasPortfolio: 'We have photos of our work / a portfolio',
    submit: 'Generate grant scope & book pre-qualification call',
    submitting: 'Assessing…',
    next: 'Continue',
    back: 'Back',
    reportTitle: 'Your readiness assessment',
    chance: 'Estimated chance of a successful application',
    strengths: 'What you have going for you',
    gaps: 'What your application is missing',
    improvements: 'How to improve your chances',
    documents: 'Documents to prepare',
    reportDisclaimer: 'This assessment is an indicative AI readiness estimate based on the details you entered. It is not a grant decision, nor a prediction of one.',
    sent: 'We have your details and will be in touch within 24 hours.',
    again: 'Start again',
    rulesTitle: 'Programme rules and conditions',
    rulesIntro: 'Below is a summary of the conditions that recur across creative voucher calls. The binding text is always your regional partner’s current call — read it before you apply.',
    rulesList: [
      { t: 'Who can apply', d: 'Small and medium enterprises (sole traders and companies) based or operating in the Czech Republic, usually trading for at least 3 months, with no arrears on tax, social security or health insurance, and not in insolvency.' },
      { t: 'What the voucher funds', d: 'Bespoke creative services: design and UI/UX, brand identity, custom websites and applications, audiovisual content, photography, copywriting, product and industrial design. Not hardware, off-the-shelf software licences, ad space or routine operating costs.' },
      { t: 'Support level and limits', d: 'Support commonly reaches up to 85% of eligible costs, with a fixed minimum and maximum per call. You fund the remainder. A budget outside the call’s range is grounds for rejection.' },
      { t: 'Pre-financing', d: 'You pay the supplier’s invoice in full yourself. Support is reimbursed after delivery, evidence of outputs and approval of your accounts.' },
      { t: 'Supplier from the creatives gallery', d: 'The work must be commissioned from a creative or studio listed in the Celostátní galerie kreativců. The supplier must not be a party connected to the applicant.' },
      { t: 'De minimis', d: 'Support is granted under the de minimis regime. Total de minimis support must not exceed €300,000 per undertaking over three years.' },
      { t: 'Timing', d: 'Work may only start after the decision or contract — costs incurred earlier are ineligible. Each call sets firm deadlines for delivery and for final accounts.' },
      { t: 'Outputs and publicity', d: 'You must evidence outputs (designs, source files, a link to the live site) and follow the National Recovery Plan publicity rules.' },
      { t: 'Assessment and competition', d: 'Applications are scored on quality and readiness, and in some calls on submission time. Meeting the conditions does not create a right to support.' },
    ],
    legalTitle: 'Legal notice and limitation of liability',
    legalList: [
      'FastMedia.Pro is not the grant provider, a grant consultancy, or the body that decides on applications. We are not a state authority and have no influence over decisions.',
      'The output of this navigator is a non-binding, indicative readiness estimate. It is not an assessment of your application, nor legal or tax advice.',
      'The decision to award support, and its amount, rests solely with the grant provider under the terms of the relevant call. We cannot promise or guarantee any support.',
      'We accept no liability for a rejected application, for a call being changed or cancelled, for support not being paid out, for missed deadlines, or for any direct or indirect loss arising from these.',
      'The applicant is always responsible for the accuracy and completeness of the application. We prepare the technical specification and quotation; the application is submitted by you or your adviser.',
      'Our quotation and contract terms apply regardless of the grant outcome — if support is not awarded, the work is payable at the agreed price.',
      'Programme conditions change. Always verify the current call text with your regional partner or on the DPMK portal before applying.',
      'We process the details you enter only to evaluate this questionnaire and to contact you about your enquiry, in line with our privacy policy.',
    ],
    contactTitle: 'Prefer to talk it through with a person?',
    contactSub: 'Send us a line and we will prepare the project scope and a quotation in the structure the application requires.',
    grantsLink: 'Read our grant guide',
    calcLink: 'Price it in the calculator',
    applyLink: 'Fill in the application pack',
    applyNote: 'Ready to go further? Complete the full application pack — we pre-fill it from the navigator.',
  },
} as const;

const fmtCzk = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === 'cs' ? 'cs-CZ' : 'en-GB', { maximumFractionDigits: 0 }).format(Math.round(n));

type Report = {
  chancePercent: number;
  verdict: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  improvements: string[];
  documents: string[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const GrantWizard = () => {
  const { language } = useLanguage();
  const lang: Lang = language === 'cs' ? 'cs' : 'en';
  const t = copy[lang];

  const [step, setStep] = useState(1);
  const [gateFailed, setGateFailed] = useState(false);
  const [business, setBusiness] = useState('');
  const [ico, setIco] = useState('');
  const [regionId, setRegionId] = useState('');
  const [activeBusiness, setActiveBusiness] = useState(false);
  const [noDebts, setNoDebts] = useState(false);
  const [deMinimisOk, setDeMinimisOk] = useState(false);

  const [industry, setIndustry] = useState<string>('');
  const [upgrades, setUpgrades] = useState<string[]>([]);

  const [budget, setBudget] = useState(150000);
  const [vatRegistered, setVatRegistered] = useState(false);

  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [hasWebsite, setHasWebsite] = useState(false);
  const [hasBranding, setHasBranding] = useState(false);
  const [hasPortfolio, setHasPortfolio] = useState(false);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [sent, setSent] = useState(false);

  const region = grantRegions.find(r => r.id === regionId);
  const reimbursement = budget * 0.85;
  const share = budget * 0.15;

  const baselineScore = useMemo(() => {
    let s = 30;
    if (activeBusiness) s += 10;
    if (noDebts) s += 10;
    if (deMinimisOk) s += 8;
    s += Math.min(upgrades.length * 6, 18);
    if (budget >= 60000 && budget <= 176000) s += 8;
    const words = projectDescription.trim().split(/\s+/).filter(Boolean).length;
    if (words >= 30) s += 8;
    else if (words >= 15) s += 4;
    if (hasWebsite) s += 2;
    if (hasBranding) s += 3;
    if (hasPortfolio) s += 3;
    return Math.min(95, s);
  }, [activeBusiness, noDebts, deMinimisOk, upgrades.length, budget, projectDescription, hasWebsite, hasBranding, hasPortfolio]);

  const toggleUpgrade = (id: string) =>
    setUpgrades(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const goStep1Next = () => {
    if (!business.trim()) return toast.error(lang === 'cs' ? 'Zadejte název firmy.' : 'Please enter your business name.');
    if (!/^\d{6,10}$/.test(ico.replace(/\s/g, ''))) return toast.error(lang === 'cs' ? 'Zadejte platné IČO (6–10 číslic).' : 'Please enter a valid IČO (6–10 digits).');
    if (!regionId) return toast.error(lang === 'cs' ? 'Vyberte kraj.' : 'Please select your region.');
    if (!activeBusiness || !noDebts || !deMinimisOk) {
      setGateFailed(true);
      return;
    }
    setStep(2);
  };

  const goStep2Next = () => {
    if (!industry) return toast.error(lang === 'cs' ? 'Vyberte hlavní obor.' : 'Please select your primary industry.');
    if (upgrades.length === 0) return toast.error(t.upgradeHint);
    setStep(3);
  };

  const submit = async () => {
    if (!contactName.trim()) return toast.error(lang === 'cs' ? 'Zadejte kontaktní osobu.' : 'Please enter a contact name.');
    if (!EMAIL_RE.test(email.trim())) return toast.error(lang === 'cs' ? 'Zadejte platný e-mail.' : 'Please enter a valid email address.');
    if (!phone.trim()) return toast.error(lang === 'cs' ? 'Zadejte telefon.' : 'Please enter a phone number.');
    if (projectDescription.trim().length < 30) {
      return toast.error(lang === 'cs' ? 'Popište projekt alespoň jednou až dvěma větami.' : 'Please describe the project in a sentence or two.');
    }

    setLoading(true);
    try {
      sessionStorage.setItem(GRANT_PREFILL_KEY, JSON.stringify({
        business: business.trim(),
        ico: ico.trim(),
        regionId,
        contactName: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        projectDescription: projectDescription.trim(),
        budget,
        vatRegistered,
        deliverables: upgrades,
      }));
    } catch {
      /* storage unavailable */
    }
    const upgradeLabels = upgrades.map(id => UPGRADES.find(u => u.id === id)?.[lang] ?? id);
    const industryLabel = INDUSTRIES.find(i => i.id === industry)?.[lang] ?? industry;
    const regionLabel = region ? region[lang] : '';

    try {
      const { data, error } = await supabase.functions.invoke('grant-wizard-assess', {
        body: {
          language: lang,
          region: regionLabel,
          industry: industryLabel,
          upgrades: upgradeLabels,
          budgetCzk: budget,
          vatRegistered,
          activeBusiness,
          noDebts,
          deMinimisOk,
          projectDescription: projectDescription.trim(),
          hasWebsite,
          hasBranding,
          hasPortfolio,
          baselineScore,
        },
      });
      if (error) throw error;
      const payload = data as { report?: Report; error?: string };
      if (payload?.error) throw new Error(payload.error);
      if (payload?.report) setReport(payload.report);

      const { error: enquiryError } = await supabase.functions.invoke('submit-enquiry', {
        body: {
          kind: 'offer',
          name: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: business.trim(),
          message: projectDescription.trim(),
          details: {
            Source: 'Creative voucher navigator (/grant-wizard)',
            Language: lang === 'cs' ? 'Czech' : 'English',
            'IČO': ico.trim(),
            Region: regionLabel,
            'Regional hub': region?.hub ?? '',
            Industry: industryLabel,
            'Creative upgrades': upgradeLabels.join(', '),
            'Project budget (CZK)': String(budget),
            'VAT registered': vatRegistered ? 'Yes' : 'No',
            'Estimated reimbursement (CZK)': String(Math.round(reimbursement)),
            'Client share (CZK)': String(Math.round(share)),
            'Readiness score': String(payload?.report?.chancePercent ?? baselineScore),
            'Has website': hasWebsite ? 'Yes' : 'No',
            'Has branding': hasBranding ? 'Yes' : 'No',
            'Has portfolio': hasPortfolio ? 'Yes' : 'No',
          },
        },
      });
      if (!enquiryError) setSent(true);
      setStep(5);
    } catch (err) {
      toast.error(err instanceof Error && err.message
        ? err.message
        : lang === 'cs' ? 'Hodnocení se nepodařilo vytvořit. Zkuste to prosím znovu.' : 'We could not generate the assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setReport(null);
    setSent(false);
    setGateFailed(false);
    setStep(1);
  };

  const progress = Math.min(100, (Math.min(step, 4) / 4) * 100);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle} description={t.seoDesc} pagePath="/grant-wizard" />

      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="font-display font-bold text-lg">FastMedia<span className="text-accent">.Pro</span></Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero: road to the launch pads */}
      <section className="launch-hero relative isolate overflow-hidden bg-launch text-launch-foreground">
        <img src={launchSky} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 launch-stars" aria-hidden />
        <div className="absolute inset-0 launch-hero__shade" aria-hidden />
        <div className="absolute inset-0 launch-hero__vignette" aria-hidden />
        <span className="absolute shooting-star" aria-hidden />
        <span className="absolute shooting-star shooting-star--two" aria-hidden />

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-56 md:h-72 grant-road" aria-hidden />
        <div className="absolute bottom-0 left-0 right-0 h-56 md:h-72 grant-road__lines" aria-hidden />

        {/* Launch pads either side */}
        <div className="absolute bottom-20 left-2 sm:left-8 md:left-16" aria-hidden>
          <span className="block w-1.5 h-16 mx-auto grant-pad-trail rounded-full" />
          <img src={launchRocket} alt="" className="grant-pad-rocket w-10 sm:w-14 md:w-20 -mt-16 rotate-[-8deg]" />
        </div>
        <div className="absolute bottom-24 right-2 sm:right-8 md:right-16" aria-hidden>
          <span className="block w-1.5 h-16 mx-auto grant-pad-trail grant-pad-trail--right rounded-full" />
          <img src={launchRocket} alt="" className="grant-pad-rocket grant-pad-rocket--right w-8 sm:w-12 md:w-16 -mt-16 rotate-[8deg]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-14 pb-40 md:pt-20 md:pb-52 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-launch-border bg-launch-surface px-4 py-2 text-xs sm:text-sm"
          >
            <BadgeCheck className="w-4 h-4 text-launch-accent" />
            {t.badge}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="mt-8 text-launch-accent tracking-[0.24em] uppercase text-xs"
          >
            {t.kicker}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-3 font-display font-bold text-3xl sm:text-5xl md:text-6xl leading-tight"
          >
            {t.h1}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-4 text-lg sm:text-2xl text-launch-accent font-semibold"
          >
            {t.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="mt-5 max-w-2xl mx-auto text-launch-muted text-sm sm:text-base"
          >
            {t.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <a href="#wizard">
              <Button size="lg" className="w-full sm:w-auto gradient-accent text-accent-foreground font-semibold">
                <Rocket className="w-4 h-4 mr-2" />
                {t.start}
              </Button>
            </a>
            <a href="#rules">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-launch-border text-launch-foreground hover:bg-launch-foreground/10">
                {t.rules}
              </Button>
            </a>
          </motion.div>

          <p className="mt-6 text-xs text-launch-muted max-w-xl mx-auto flex items-start gap-2 justify-center">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t.heroNote}</span>
          </p>
        </div>
      </section>

      {/* Wizard */}
      <section id="wizard" className="py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {step <= 4 && !gateFailed && (
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{t.stepLabel} {step} {t.of} 4</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {gateFailed && (
            <Card className="border-destructive/40">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
                  <div>
                    <h2 className="text-xl font-bold mb-2">{t.gateTitle}</h2>
                    <p className="text-muted-foreground">{t.gateBody}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <OfferEnquiryForm lang={lang} source="Creative voucher navigator — not eligible (/grant-wizard)" />
                </div>
                <Button variant="ghost" className="mt-4" onClick={() => setGateFailed(false)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />{t.gateBack}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 1 */}
          {!gateFailed && step === 1 && (
            <Card>
              <CardContent className="p-6 md:p-8 space-y-5">
                <div>
                  <h2 className="text-2xl font-bold">{t.s1title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{t.s1sub}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gw-business">{t.business}</Label>
                    <Input id="gw-business" value={business} onChange={e => setBusiness(e.target.value)} maxLength={160} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gw-ico">{t.ico}</Label>
                    <Input id="gw-ico" value={ico} onChange={e => setIco(e.target.value)} inputMode="numeric" maxLength={12} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gw-region">{t.region}</Label>
                  <select
                    id="gw-region"
                    value={regionId}
                    onChange={e => setRegionId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">{t.regionPlaceholder}</option>
                    {grantRegions.map(r => (
                      <option key={r.id} value={r.id}>{r[lang]}</option>
                    ))}
                  </select>
                </div>
                <Separator />
                <div className="space-y-4">
                  {([
                    [t.chk1, activeBusiness, setActiveBusiness, 'gw-c1'],
                    [t.chk2, noDebts, setNoDebts, 'gw-c2'],
                    [t.chk3, deMinimisOk, setDeMinimisOk, 'gw-c3'],
                  ] as const).map(([label, val, set, id]) => (
                    <div key={id} className="flex items-start gap-3">
                      <Checkbox id={id} checked={val} onCheckedChange={v => set(v === true)} className="mt-0.5" />
                      <Label htmlFor={id} className="text-sm font-normal leading-snug">{label}</Label>
                    </div>
                  ))}
                </div>
                <Button size="lg" className="w-full" onClick={goStep1Next}>
                  {t.next}<ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2 */}
          {!gateFailed && step === 2 && (
            <Card>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{t.s2title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{t.s2sub}</p>
                </div>
                <div className="space-y-3">
                  <Label>{t.industry}</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {INDUSTRIES.map(i => (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => setIndustry(i.id)}
                        className={`text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                          industry === i.id ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:bg-muted'
                        }`}
                      >
                        {i[lang]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>{t.upgrades}</Label>
                  <p className="text-xs text-muted-foreground">{t.upgradeHint}</p>
                  <div className="space-y-3">
                    {UPGRADES.map(u => (
                      <div key={u.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                        <Checkbox id={`gw-u-${u.id}`} checked={upgrades.includes(u.id)} onCheckedChange={() => toggleUpgrade(u.id)} className="mt-0.5" />
                        <Label htmlFor={`gw-u-${u.id}`} className="text-sm font-normal leading-snug">{u[lang]}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" />{t.back}</Button>
                  <Button className="flex-1" onClick={goStep2Next}>{t.next}<ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3 */}
          {!gateFailed && step === 3 && (
            <Card>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{t.s3title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{t.s3sub}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gw-budget">{t.budget}</Label>
                    <span className="font-display font-bold text-lg">{fmtCzk(budget, lang)} CZK</span>
                  </div>
                  <Slider
                    id="gw-budget"
                    min={60000}
                    max={176000}
                    step={1000}
                    value={[budget]}
                    onValueChange={v => setBudget(v[0])}
                  />
                  <Input
                    type="number"
                    min={60000}
                    max={176000}
                    value={budget}
                    onChange={e => {
                      const n = Number(e.target.value);
                      if (Number.isFinite(n)) setBudget(Math.min(176000, Math.max(60000, Math.round(n))));
                    }}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="gw-vat" checked={vatRegistered} onCheckedChange={v => setVatRegistered(v === true)} className="mt-0.5" />
                  <Label htmlFor="gw-vat" className="text-sm font-normal">{t.vat}</Label>
                </div>
                <Card className="bg-muted/40 border-primary/30">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.total}</span>
                      <span className="font-semibold">{fmtCzk(budget, lang)} CZK</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.reimb}</span>
                      <span className="font-semibold text-primary">{fmtCzk(reimbursement, lang)} CZK</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t.share}</span>
                      <span className="font-display font-bold text-xl text-accent">{fmtCzk(share, lang)} CZK</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{t.prefinance}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{vatRegistered ? t.vatNote : t.vatNoteNo}</p>
                  </CardContent>
                </Card>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2" />{t.back}</Button>
                  <Button className="flex-1" onClick={() => setStep(4)}>{t.next}<ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4 */}
          {!gateFailed && step === 4 && (
            <Card>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{t.s4title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{t.s4sub}</p>
                </div>

                <Card className="bg-muted/40">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <Landmark className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{nationalPool[lang].name}</p>
                        <p className="text-sm text-muted-foreground">{nationalPool[lang].note}</p>
                        <a href={nationalPool.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary inline-flex items-center gap-1 mt-1">
                          dpmk.cz <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    {region && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.hubTitle}</p>
                          <p className="font-semibold">{region.hub}</p>
                          <p className="text-sm text-muted-foreground">{region[lang]}</p>
                          <a href={region.hubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary inline-flex items-center gap-1 mt-1">
                            {region.hubUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gw-name">{t.contactName}</Label>
                    <Input id="gw-name" value={contactName} onChange={e => setContactName(e.target.value)} maxLength={120} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gw-email">{t.email}</Label>
                    <Input id="gw-email" type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={200} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="gw-phone">{t.phone}</Label>
                    <Input id="gw-phone" value={phone} onChange={e => setPhone(e.target.value)} maxLength={40} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gw-project">{t.project}</Label>
                  <Textarea
                    id="gw-project"
                    rows={5}
                    value={projectDescription}
                    onChange={e => setProjectDescription(e.target.value)}
                    placeholder={t.projectPlaceholder}
                    maxLength={2000}
                  />
                </div>

                <div className="space-y-3">
                  {([
                    [t.hasWebsite, hasWebsite, setHasWebsite, 'gw-hw'],
                    [t.hasBranding, hasBranding, setHasBranding, 'gw-hb'],
                    [t.hasPortfolio, hasPortfolio, setHasPortfolio, 'gw-hp'],
                  ] as const).map(([label, val, set, id]) => (
                    <div key={id} className="flex items-start gap-3">
                      <Checkbox id={id} checked={val} onCheckedChange={v => set(v === true)} className="mt-0.5" />
                      <Label htmlFor={id} className="text-sm font-normal">{label}</Label>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} disabled={loading}>
                    <ArrowLeft className="w-4 h-4 mr-2" />{t.back}
                  </Button>
                  <Button className="flex-1" size="lg" onClick={submit} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {loading ? t.submitting : t.submit}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report */}
          {step === 5 && report && (
            <div className="space-y-6">
              <Card className="border-primary/40">
                <CardContent className="p-6 md:p-8">
                  <Badge variant="secondary" className="mb-3">{t.reportTitle}</Badge>
                  <div className="flex items-end gap-4">
                    <span className="font-display font-bold text-5xl text-primary">{report.chancePercent}%</span>
                    <span className="text-muted-foreground pb-2 text-sm">{t.chance}</span>
                  </div>
                  <Progress value={report.chancePercent} className="h-2 mt-4" />
                  {report.verdict && <p className="mt-4 font-medium">{report.verdict}</p>}
                  {report.summary && <p className="mt-2 text-muted-foreground">{report.summary}</p>}

                  <div className="grid sm:grid-cols-2 gap-6 mt-8">
                    {([
                      [t.strengths, report.strengths, CheckCircle2],
                      [t.gaps, report.gaps, AlertTriangle],
                      [t.improvements, report.improvements, Sparkles],
                      [t.documents, report.documents, FileText],
                    ] as const).map(([title, items, Icon]) => items.length > 0 && (
                      <div key={title}>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Icon className="w-4 h-4 text-primary" />{title}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {items.map((x, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span><span>{x}</span></li>)}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground flex items-start gap-2">
                    <Scale className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{t.reportDisclaimer}</span>
                  </div>

                  <p className="mt-6 text-sm text-muted-foreground">{t.applyNote}</p>

                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Link to="/grant-application" className="flex-1">
                      <Button className="w-full">{t.applyLink}<ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </Link>
                    <Link to="/calculator" className="flex-1">
                      <Button className="w-full">{t.calcLink}<ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </Link>
                    <Button variant="outline" onClick={restart}>{t.again}</Button>
                  </div>

                  {sent && (
                    <p className="mt-4 text-sm text-primary flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />{t.sent}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Rules */}
      <section id="rules" className="py-14 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">{t.rulesTitle}</h2>
          <p className="text-muted-foreground mb-6">{t.rulesIntro}</p>
          <Accordion type="single" collapsible className="w-full">
            {t.rulesList.map((r, i) => (
              <AccordionItem key={i} value={`rule-${i}`}>
                <AccordionTrigger className="text-left">{r.t}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{r.d}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="mt-10 border-destructive/30">
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-xl flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-destructive" />{t.legalTitle}
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {t.legalList.map((x, i) => (
                  <li key={i} className="flex gap-2"><span className="text-destructive">•</span><span>{x}</span></li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link to="/grants" className="text-primary inline-flex items-center gap-1">{t.grantsLink}<ArrowRight className="w-3 h-3" /></Link>
            <Link to="/calculator" className="text-primary inline-flex items-center gap-1">{t.calcLink}<ArrowRight className="w-3 h-3" /></Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold">{t.contactTitle}</h2>
            <p className="text-muted-foreground mt-2">{t.contactSub}</p>
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
              <a href="tel:+420797864432" className="inline-flex items-center gap-2 text-primary"><Phone className="w-4 h-4" />+420 797 864 432</a>
              <a href="mailto:support@fastmedia.pro" className="inline-flex items-center gap-2 text-primary"><Mail className="w-4 h-4" />support@fastmedia.pro</a>
            </div>
          </div>
          <OfferEnquiryForm lang={lang} source="Creative voucher navigator (/grant-wizard)" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GrantWizard;
