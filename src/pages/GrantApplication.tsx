import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, CheckCircle2, Loader2, FileText, Landmark, Scale,
  AlertTriangle, Printer, Building2, Wallet, ClipboardList, Sparkles, ExternalLink,
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
import { Separator } from '@/components/ui/separator';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { grantRegions, nationalPool } from '@/data/grantRegions';
import launchSky from '@/assets/launch-sky-moonlit.jpg';

type Lang = 'cs' | 'en';

export const GRANT_PREFILL_KEY = 'fastmedia-grant-prefill';

const DELIVERABLES = [
  { id: 'uiux', cs: 'Návrh UI/UX a vizuální identita na míru', en: 'Bespoke UI/UX design & brand identity' },
  { id: 'web', cs: 'Web nebo aplikace na míru', en: 'Custom website or application' },
  { id: 'booking', cs: 'Rezervační a objednávkový systém', en: 'Service booking engine' },
  { id: 'portal', cs: 'Back-office a zákaznický portál', en: 'Back-office & customer portal' },
  { id: 'crm', cs: 'Propojení s CRM a automatizace', en: 'CRM connectivity & automation' },
  { id: 'content', cs: 'Copywriting, fotografie a video obsah', en: 'Copywriting, photography & video content' },
  { id: 'interactive', cs: 'Interaktivní moduly zákaznické zkušenosti', en: 'Interactive customer experience modules' },
] as const;

const LEGAL_FORMS = [
  { id: 'osvc', cs: 'OSVČ (fyzická osoba podnikající)', en: 'Sole trader (OSVČ)' },
  { id: 'sro', cs: 's.r.o.', en: 'Limited company (s.r.o.)' },
  { id: 'as', cs: 'a.s.', en: 'Joint-stock company (a.s.)' },
  { id: 'other', cs: 'Jiná právní forma', en: 'Other legal form' },
] as const;

const SIZES = [
  { id: 'micro', cs: '1–9 zaměstnanců (mikropodnik)', en: '1–9 employees (micro)' },
  { id: 'small', cs: '10–49 zaměstnanců (malý podnik)', en: '10–49 employees (small)' },
  { id: 'medium', cs: '50–249 zaměstnanců (střední podnik)', en: '50–249 employees (medium)' },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fmtCzk = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === 'cs' ? 'cs-CZ' : 'en-GB', { maximumFractionDigits: 0 }).format(Math.round(n));

const copy = {
  cs: {
    seoTitle: 'Žádost o kreativní voucher — příprava podkladů | FastMedia',
    seoDesc: 'Vyplňte podklady pro žádost o Kreativní voucher: údaje o firmě, projekt, rozpočet 85/15, čestná prohlášení a de minimis. Připravíme vám kompletní podklady k podání.',
    badge: 'Registrovaný dodavatel v Celostátní galerii kreativců',
    kicker: 'Kreativní vouchery',
    h1: 'Podklady k žádosti o kreativní voucher',
    sub: 'Formulář obsahuje všechny údaje, které výzva na kreativní vouchery obvykle vyžaduje. Vyplňte ho jednou a my vám do 24 hodin vrátíme technickou specifikaci, cenovou nabídku a přehled prohlášení ve struktuře pro podání.',
    heroNote: 'Žádost podáváte vy u svého regionálního partnera. My nejsme poskytovatel dotace a žádost za vás nepodáváme ani neschvalujeme.',
    fromWizard: 'Údaje z navigátoru jsme předvyplnili — zkontrolujte je prosím.',
    wizardLink: 'Nejste si jistí způsobilostí? Projděte navigátor',
    // sections
    s1: 'Žadatel',
    s1sub: 'Údaje musí odpovídat obchodnímu rejstříku nebo registru živnostenského podnikání.',
    business: 'Obchodní název / jméno',
    legalForm: 'Právní forma',
    ico: 'IČO',
    dic: 'DIČ (nepovinné)',
    address: 'Sídlo (adresa včetně PSČ)',
    region: 'Kraj realizace',
    size: 'Velikost podniku',
    since: 'Podnikáme od (měsíc a rok)',
    rep: 'Statutární zástupce / žadatel',
    position: 'Funkce',
    email: 'E-mail',
    phone: 'Telefon',
    website: 'Současný web (nepovinné)',
    bank: 'Bankovní účet pro refundaci',

    s2: 'Projekt',
    s2sub: 'Popis projektu je nejdůležitější část žádosti — hodnotitelé podle něj rozhodují.',
    title: 'Název projektu',
    description: 'Popis projektu (co vznikne a proč)',
    descriptionPh: 'Např. nový web pro instalatérskou firmu s rezervací termínů, zákaznickým portálem a propojením na fakturaci. Cílem je snížit telefonování o polovinu a získávat poptávky online.',
    goals: 'Očekávaný přínos a měřitelné cíle',
    goalsPh: 'Např. +40 % poptávek z webu do 6 měsíců, úspora 8 hodin administrativy týdně, spuštění do 31. 12.',
    deliverables: 'Kreativní výstupy, které požadujete',
    deliverablesHint: 'Vyberte alespoň jednu položku na míru — bez kreativní práce projekt do programu nespadá.',
    start: 'Plánované zahájení',
    end: 'Plánované dokončení',

    s3: 'Rozpočet a spolufinancování',
    s3sub: 'Orientační propočet v poměru 85 / 15. Konečnou výši stanoví poskytovatel podle výzvy.',
    budget: 'Rozpočet projektu (CZK, bez DPH)',
    vat: 'Jsme plátce DPH',
    total: 'Celková fakturovaná částka',
    reimb: 'Předpokládaná podpora (85 %)',
    share: 'Váš podíl (15 %)',
    prefinance: 'Celou fakturu předfinancujete sami. Podpora se vyplácí až po realizaci, doložení výstupů a schválení vyúčtování.',
    deMinimis: 'Dosud přijatá podpora de minimis za 3 roky (EUR)',

    s4: 'Dodavatel',
    s4sub: 'Práce musí být zadána kreativci zapsanému v Celostátní galerii kreativců.',
    supplierName: 'Dodavatel',
    supplierContact: 'Kontakt',
    supplierNote: 'Podrobné identifikační údaje dodavatele (IČO, sídlo, číslo v galerii kreativců) doplníme do nabídky, kterou vám pošleme jako přílohu žádosti.',

    s5: 'Čestná prohlášení',
    s5sub: 'Všechna prohlášení musí být zaškrtnutá. Odpovídáte za jejich pravdivost.',
    decls: [
      'Podnikáme aktivně alespoň 3 měsíce a máme sídlo nebo provozovnu v České republice.',
      'Nemáme nedoplatky na daních, sociálním ani zdravotním pojištění a nejsme v insolvenci ani v likvidaci.',
      'Za poslední 3 roky jsme obdrželi méně než 300 000 EUR podpory v režimu de minimis.',
      'Dodavatel není osobou spojenou s žadatelem (personálně ani majetkově).',
      'Práce na projektu jsme dosud nezahájili a nezahájíme je před vydáním rozhodnutí či podpisem smlouvy.',
      'Souhlasíme s pravidly publicity Národního plánu obnovy a doložíme výstupy projektu.',
      'Údaje v tomto formuláři jsou pravdivé a úplné; odpovídám za ně jako žadatel.',
      'Souhlasím se zpracováním uvedených údajů pro přípravu nabídky a komunikaci o poptávce podle politiky ochrany osobních údajů.',
    ],
    s6: 'Přílohy, které si připravte',
    s6sub: 'Zaškrtněte, co už máte. Chybějící položky vám pomůžeme doplnit.',
    attachments: [
      'Výpis z obchodního rejstříku nebo živnostenského registru',
      'Doklad o bezdlužnosti (finanční úřad, ČSSZ, zdravotní pojišťovna)',
      'Prohlášení o de minimis a velikosti podniku',
      'Cenová nabídka dodavatele s rozpisem prací',
      'Technická specifikace / zadání projektu',
      'Doklad o vlastnictví bankovního účtu',
      'Fotky realizací, logo nebo dosavadní vizuální materiály',
    ],
    submit: 'Odeslat podklady k žádosti',
    submitting: 'Odesílám…',
    successTitle: 'Podklady jsme přijali',
    successBody: 'Do 24 hodin vám pošleme technickou specifikaci, cenovou nabídku ve struktuře žádosti a seznam toho, co ještě doplnit. Níže si můžete svoje podklady vytisknout nebo uložit jako PDF.',
    print: 'Vytisknout / uložit jako PDF',
    summary: 'Přehled odeslaných údajů',
    another: 'Vyplnit další žádost',
    legalTitle: 'Právní upozornění',
    legalList: [
      'FastMedia.Pro není poskytovatelem dotace ani orgánem, který o žádosti rozhoduje, a nemá na rozhodnutí žádný vliv.',
      'Tento formulář není oficiální žádost. Oficiální žádost podává žadatel v systému svého regionálního partnera nebo na portálu DPMK.',
      'Neručíme za přiznání podpory, za změnu či zrušení výzvy ani za termíny poskytovatele. Naše cenová nabídka platí nezávisle na výsledku dotace.',
      'Před podáním si vždy ověřte aktuální text výzvy — podmínky a limity se mezi výzvami mění.',
    ],
    hubTitle: 'Váš regionální partner',
    required: 'Povinné pole',
  },
  en: {
    seoTitle: 'Creative Voucher application pack | FastMedia',
    seoDesc: 'Complete the Creative Voucher application pack: business details, project scope, 85/15 budget, declarations and de minimis. We return the full documents for submission.',
    badge: 'Registered provider in the Celostátní galerie kreativců',
    kicker: 'Creative Vouchers',
    h1: 'Creative Voucher application pack',
    sub: 'This form captures everything a creative voucher call normally asks for. Fill it in once and within 24 hours we return the technical specification, the priced proposal and a declarations checklist in submission format.',
    heroNote: 'You submit the application to your regional partner. We are not the grant provider and we neither submit nor approve applications.',
    fromWizard: 'We pre-filled your answers from the navigator — please check them.',
    wizardLink: 'Unsure about eligibility? Run the navigator',
    s1: 'Applicant',
    s1sub: 'Details must match the commercial or trade register entry.',
    business: 'Business / trading name',
    legalForm: 'Legal form',
    ico: 'IČO (business ID)',
    dic: 'VAT ID / DIČ (optional)',
    address: 'Registered address (including postcode)',
    region: 'Region of delivery',
    size: 'Company size',
    since: 'Trading since (month and year)',
    rep: 'Statutory representative / applicant',
    position: 'Position',
    email: 'Email',
    phone: 'Phone number',
    website: 'Current website (optional)',
    bank: 'Bank account for reimbursement',

    s2: 'Project',
    s2sub: 'The project description is the most important part — assessors score it.',
    title: 'Project title',
    description: 'Project description (what will be built and why)',
    descriptionPh: 'E.g. a new website for a plumbing firm with job booking, a customer portal and invoicing integration, aiming to halve inbound calls and win enquiries online.',
    goals: 'Expected benefits and measurable goals',
    goalsPh: 'E.g. +40% web enquiries within 6 months, 8 admin hours saved per week, launch by 31 December.',
    deliverables: 'Creative deliverables you need',
    deliverablesHint: 'Pick at least one bespoke item — without creative work the project falls outside the programme.',
    start: 'Planned start',
    end: 'Planned completion',

    s3: 'Budget and co-financing',
    s3sub: 'An indicative 85 / 15 split. The provider sets the final level per call.',
    budget: 'Project budget (CZK, excluding VAT)',
    vat: 'VAT registered (plátce DPH)',
    total: 'Total invoice amount',
    reimb: 'Expected support (85%)',
    share: 'Your share (15%)',
    prefinance: 'You pre-finance the full invoice. Support is reimbursed only after delivery, evidence of outputs and approval of your accounts.',
    deMinimis: 'De minimis support already received over 3 years (EUR)',

    s4: 'Supplier',
    s4sub: 'The work must be commissioned from a creative listed in the Celostátní galerie kreativců.',
    supplierName: 'Supplier',
    supplierContact: 'Contact',
    supplierNote: 'Full supplier identifiers (business ID, registered address, gallery listing number) are included in the proposal we send you as an application attachment.',

    s5: 'Declarations',
    s5sub: 'Every declaration must be ticked. You are responsible for their accuracy.',
    decls: [
      'We have been actively trading for at least 3 months and are based or operating in the Czech Republic.',
      'We have no arrears on tax, social security or health insurance and are not in insolvency or liquidation.',
      'Over the past 3 years we have received less than €300,000 of de minimis support.',
      'The supplier is not a party connected to the applicant (personally or by ownership).',
      'We have not started work on the project and will not start before a decision is issued or a contract signed.',
      'We accept the Národní plán obnovy publicity rules and will evidence the project outputs.',
      'The information in this form is true and complete; as the applicant I am responsible for it.',
      'I consent to these details being processed to prepare a proposal and respond to my enquiry, per the privacy policy.',
    ],
    s6: 'Attachments to prepare',
    s6sub: 'Tick what you already have. We will help you fill the gaps.',
    attachments: [
      'Extract from the commercial or trade register',
      'Proof of no arrears (tax office, social security, health insurer)',
      'De minimis and company-size declaration',
      'Supplier proposal with an itemised budget',
      'Technical specification / project brief',
      'Proof of bank account ownership',
      'Photos of your work, logo or existing brand materials',
    ],
    submit: 'Send my application pack',
    submitting: 'Sending…',
    successTitle: 'We have your application pack',
    successBody: 'Within 24 hours we send the technical specification, a priced proposal in application format and a list of anything still missing. You can print or save your submitted details below.',
    print: 'Print / save as PDF',
    summary: 'Summary of submitted details',
    another: 'Fill in another application',
    legalTitle: 'Legal notice',
    legalList: [
      'FastMedia.Pro is not the grant provider or the body deciding on applications, and has no influence on the decision.',
      'This form is not an official application. The official application is submitted by the applicant through their regional partner or the DPMK portal.',
      'We cannot guarantee support, and we are not liable for changed or cancelled calls or the provider’s deadlines. Our proposal stands regardless of the grant outcome.',
      'Always check the current call text before applying — conditions and limits change between calls.',
    ],
    hubTitle: 'Your regional partner',
    required: 'Required field',
  },
} as const;

export default function GrantApplication() {
  const { language } = useLanguage();
  const lang: Lang = language === 'en' ? 'en' : 'cs';
  const t = copy[lang];

  const [business, setBusiness] = useState('');
  const [legalForm, setLegalForm] = useState<string>('osvc');
  const [ico, setIco] = useState('');
  const [dic, setDic] = useState('');
  const [address, setAddress] = useState('');
  const [regionId, setRegionId] = useState('');
  const [size, setSize] = useState<string>('micro');
  const [since, setSince] = useState('');
  const [rep, setRep] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [bank, setBank] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [budget, setBudget] = useState(150000);
  const [vatRegistered, setVatRegistered] = useState(false);
  const [deMinimisEur, setDeMinimisEur] = useState('0');

  const [decls, setDecls] = useState<boolean[]>(() => t.decls.map(() => false));
  const [attachments, setAttachments] = useState<boolean[]>(() => t.attachments.map(() => false));

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [summary, setSummary] = useState<Record<string, string>>({});

  const region = useMemo(() => grantRegions.find(r => r.id === regionId), [regionId]);
  const reimbursement = budget * 0.85;
  const share = budget * 0.15;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(GRANT_PREFILL_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (typeof p.business === 'string' && p.business) setBusiness(p.business);
      if (typeof p.ico === 'string' && p.ico) setIco(p.ico);
      if (typeof p.regionId === 'string' && p.regionId) setRegionId(p.regionId);
      if (typeof p.contactName === 'string' && p.contactName) setRep(p.contactName);
      if (typeof p.email === 'string' && p.email) setEmail(p.email);
      if (typeof p.phone === 'string' && p.phone) setPhone(p.phone);
      if (typeof p.projectDescription === 'string' && p.projectDescription) setDescription(p.projectDescription);
      if (typeof p.budget === 'number' && Number.isFinite(p.budget)) setBudget(p.budget);
      if (typeof p.vatRegistered === 'boolean') setVatRegistered(p.vatRegistered);
      if (Array.isArray(p.deliverables)) {
        const ids = (p.deliverables as unknown[]).filter((x): x is string => typeof x === 'string');
        const valid = ids.filter(id => DELIVERABLES.some(d => d.id === id));
        if (valid.length) setDeliverables(valid);
      }
      setPrefilled(true);
    } catch {
      /* ignore malformed prefill */
    }
  }, []);

  const toggleDeliverable = (id: string) =>
    setDeliverables(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const submit = async () => {
    const err = (cs: string, en: string) => toast.error(lang === 'cs' ? cs : en);
    if (business.trim().length < 2) return err('Zadejte obchodní název.', 'Please enter your business name.');
    if (!/^\d{6,10}$/.test(ico.trim())) return err('Zadejte platné IČO (6–10 číslic).', 'Please enter a valid IČO (6–10 digits).');
    if (address.trim().length < 8) return err('Zadejte sídlo firmy.', 'Please enter your registered address.');
    if (!regionId) return err('Vyberte kraj realizace.', 'Please select your region.');
    if (rep.trim().length < 2) return err('Zadejte statutárního zástupce.', 'Please enter the statutory representative.');
    if (!EMAIL_RE.test(email.trim())) return err('Zadejte platný e-mail.', 'Please enter a valid email address.');
    if (phone.trim().length < 6) return err('Zadejte telefon.', 'Please enter a phone number.');
    if (bank.trim().length < 6) return err('Zadejte bankovní účet pro refundaci.', 'Please enter the bank account for reimbursement.');
    if (title.trim().length < 3) return err('Zadejte název projektu.', 'Please enter a project title.');
    if (description.trim().length < 80) return err('Popište projekt podrobněji (alespoň 80 znaků).', 'Please describe the project in more detail (at least 80 characters).');
    if (goals.trim().length < 20) return err('Popište očekávaný přínos projektu.', 'Please describe the expected benefits.');
    if (deliverables.length === 0) return err(t.deliverablesHint, t.deliverablesHint);
    if (!startDate || !endDate) return err('Zadejte plánované termíny.', 'Please enter the planned dates.');
    if (endDate < startDate) return err('Dokončení nemůže být před zahájením.', 'Completion cannot be before the start date.');
    if (budget < 60000 || budget > 176000) return err('Rozpočet musí být mezi 60 000 a 176 000 CZK.', 'The budget must be between CZK 60,000 and 176,000.');
    if (decls.some(d => !d)) return err('Zaškrtněte všechna čestná prohlášení.', 'Please tick every declaration.');

    const deliverableLabels = deliverables.map(id => DELIVERABLES.find(d => d.id === id)?.[lang] ?? id);
    const attachmentLabels = t.attachments.filter((_, i) => attachments[i]);

    const details: Record<string, string> = {
      Source: 'Creative voucher application pack (/grant-application)',
      Language: lang === 'cs' ? 'Czech' : 'English',
      'Business name': business.trim(),
      'Legal form': LEGAL_FORMS.find(f => f.id === legalForm)?.en ?? legalForm,
      'IČO': ico.trim(),
      'DIČ': dic.trim() || '—',
      'Registered address': address.trim(),
      Region: region ? region.en : '',
      'Regional hub': region?.hub ?? '',
      'Company size': SIZES.find(s => s.id === size)?.en ?? size,
      'Trading since': since.trim() || '—',
      'Statutory representative': rep.trim(),
      Position: position.trim() || '—',
      'Bank account': bank.trim(),
      Website: website.trim() || '—',
      'Project title': title.trim(),
      'Expected benefits': goals.trim(),
      Deliverables: deliverableLabels.join(', '),
      'Planned start': startDate,
      'Planned completion': endDate,
      'Project budget (CZK)': String(budget),
      'VAT registered': vatRegistered ? 'Yes' : 'No',
      'Expected support 85% (CZK)': String(Math.round(reimbursement)),
      'Client share 15% (CZK)': String(Math.round(share)),
      'De minimis received (EUR)': deMinimisEur.trim() || '0',
      'Declarations signed': 'All confirmed',
      'Attachments ready': attachmentLabels.length ? attachmentLabels.join('; ') : 'None yet',
    };

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('submit-enquiry', {
        body: {
          kind: 'offer',
          name: rep.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: business.trim(),
          message: `${title.trim()}\n\n${description.trim()}`,
          details,
        },
      });
      if (error) throw error;
      setSummary(details);
      setSent(true);
      sessionStorage.removeItem(GRANT_PREFILL_KEY);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      toast.error(
        lang === 'cs'
          ? 'Podklady se nepodařilo odeslat. Zkuste to prosím znovu nebo napište na support@fastmedia.pro.'
          : 'We could not send your pack. Please try again or email support@fastmedia.pro.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle} description={t.seoDesc} pagePath="/grant-application" />

      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border print:hidden">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="font-display font-bold text-lg">FastMedia<span className="text-accent">.Pro</span></Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero */}
      <section className="launch-hero relative isolate overflow-hidden bg-launch text-launch-foreground print:hidden">
        <img src={launchSky} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 launch-stars" aria-hidden />
        <div className="absolute inset-0 launch-hero__shade" aria-hidden />
        <div className="absolute inset-0 launch-hero__vignette" aria-hidden />
        <span className="absolute shooting-star" aria-hidden />

        <div className="container mx-auto px-4 relative z-10 py-14 md:py-20 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-launch-border bg-launch-surface px-4 py-2 text-xs sm:text-sm"
          >
            <BadgeCheck className="w-4 h-4 text-launch-accent" />
            {t.badge}
          </motion.div>
          <p className="mt-6 text-launch-accent tracking-[0.24em] uppercase text-xs">{t.kicker}</p>
          <h1 className="mt-3 font-display font-bold text-3xl md:text-5xl">{t.h1}</h1>
          <p className="mt-4 text-launch-foreground/80 text-sm md:text-base">{t.sub}</p>
          <p className="mt-6 text-xs text-launch-foreground/70 max-w-xl mx-auto">{t.heroNote}</p>
          <Link to="/grant-wizard" className="mt-6 inline-flex items-center gap-1 text-sm text-launch-accent">
            {t.wizardLink} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          {sent ? (
            <Card className="border-primary/40">
              <CardContent className="p-6 md:p-8">
                <Badge variant="secondary" className="mb-3">{t.kicker}</Badge>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-primary" />{t.successTitle}
                </h2>
                <p className="text-muted-foreground mt-2">{t.successBody}</p>

                <h3 className="font-semibold mt-8 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />{t.summary}</h3>
                <dl className="text-sm divide-y divide-border">
                  {Object.entries(summary).map(([k, v]) => (
                    <div key={k} className="py-2 grid grid-cols-[minmax(0,11rem)_1fr] gap-3">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium break-words">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 print:hidden">
                  <Button onClick={() => window.print()} className="flex-1">
                    <Printer className="w-4 h-4 mr-2" />{t.print}
                  </Button>
                  <Button variant="outline" onClick={() => { setSent(false); setSummary({}); }}>{t.another}</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {prefilled && (
                <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{t.fromWizard}</span>
                </div>
              )}

              {/* Applicant */}
              <Card>
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" />{t.s1}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t.s1sub}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="ga-business">{t.business}</Label>
                      <Input id="ga-business" value={business} onChange={e => setBusiness(e.target.value)} maxLength={160} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-legal">{t.legalForm}</Label>
                      <select
                        id="ga-legal" value={legalForm} onChange={e => setLegalForm(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {LEGAL_FORMS.map(f => <option key={f.id} value={f.id}>{f[lang]}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-size">{t.size}</Label>
                      <select
                        id="ga-size" value={size} onChange={e => setSize(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {SIZES.map(s => <option key={s.id} value={s.id}>{s[lang]}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-ico">{t.ico}</Label>
                      <Input id="ga-ico" value={ico} onChange={e => setIco(e.target.value.replace(/\D/g, ''))} maxLength={10} inputMode="numeric" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-dic">{t.dic}</Label>
                      <Input id="ga-dic" value={dic} onChange={e => setDic(e.target.value)} maxLength={20} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="ga-address">{t.address}</Label>
                      <Input id="ga-address" value={address} onChange={e => setAddress(e.target.value)} maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-region">{t.region}</Label>
                      <select
                        id="ga-region" value={regionId} onChange={e => setRegionId(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">—</option>
                        {grantRegions.map(r => <option key={r.id} value={r.id}>{r[lang]}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-since">{t.since}</Label>
                      <Input id="ga-since" type="month" value={since} onChange={e => setSince(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-rep">{t.rep}</Label>
                      <Input id="ga-rep" value={rep} onChange={e => setRep(e.target.value)} maxLength={120} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-position">{t.position}</Label>
                      <Input id="ga-position" value={position} onChange={e => setPosition(e.target.value)} maxLength={80} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-email">{t.email}</Label>
                      <Input id="ga-email" type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={160} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-phone">{t.phone}</Label>
                      <Input id="ga-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={40} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-website">{t.website}</Label>
                      <Input id="ga-website" value={website} onChange={e => setWebsite(e.target.value)} maxLength={160} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-bank">{t.bank}</Label>
                      <Input id="ga-bank" value={bank} onChange={e => setBank(e.target.value)} maxLength={60} />
                    </div>
                  </div>

                  {region && (
                    <div className="rounded-lg bg-muted/50 p-4 text-sm">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.hubTitle}</p>
                      <p className="font-semibold flex items-center gap-2 mt-1"><Landmark className="w-4 h-4 text-primary" />{region.hub}</p>
                      <a href={region.hubUrl} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 mt-1 text-xs">
                        {region.hubUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Project */}
              <Card>
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" />{t.s2}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t.s2sub}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ga-title">{t.title}</Label>
                    <Input id="ga-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={140} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ga-desc">{t.description}</Label>
                    <Textarea id="ga-desc" rows={6} value={description} onChange={e => setDescription(e.target.value)} maxLength={4000} placeholder={t.descriptionPh} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ga-goals">{t.goals}</Label>
                    <Textarea id="ga-goals" rows={4} value={goals} onChange={e => setGoals(e.target.value)} maxLength={2000} placeholder={t.goalsPh} />
                  </div>
                  <div className="space-y-3">
                    <Label>{t.deliverables}</Label>
                    <p className="text-xs text-muted-foreground">{t.deliverablesHint}</p>
                    {DELIVERABLES.map(d => (
                      <div key={d.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                        <Checkbox id={`ga-d-${d.id}`} checked={deliverables.includes(d.id)} onCheckedChange={() => toggleDeliverable(d.id)} className="mt-0.5" />
                        <Label htmlFor={`ga-d-${d.id}`} className="text-sm font-normal leading-snug">{d[lang]}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ga-start">{t.start}</Label>
                      <Input id="ga-start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-end">{t.end}</Label>
                      <Input id="ga-end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget */}
              <Card>
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" />{t.s3}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t.s3sub}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ga-budget">{t.budget}</Label>
                      <Input
                        id="ga-budget" type="number" min={60000} max={176000} step={1000} value={budget}
                        onChange={e => {
                          const n = Number(e.target.value);
                          if (Number.isFinite(n)) setBudget(Math.round(n));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ga-dm">{t.deMinimis}</Label>
                      <Input id="ga-dm" inputMode="decimal" value={deMinimisEur} onChange={e => setDeMinimisEur(e.target.value)} maxLength={16} />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="ga-vat" checked={vatRegistered} onCheckedChange={v => setVatRegistered(v === true)} className="mt-0.5" />
                    <Label htmlFor="ga-vat" className="text-sm font-normal">{t.vat}</Label>
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
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{t.prefinance}</span>
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Supplier */}
              <Card>
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-primary" />{t.s4}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t.s4sub}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
                    <p><span className="text-muted-foreground">{t.supplierName}: </span><span className="font-semibold">FastMedia.Pro</span></p>
                    <p><span className="text-muted-foreground">{t.supplierContact}: </span>
                      <a href="mailto:support@fastmedia.pro" className="text-primary">support@fastmedia.pro</a>
                      {' · '}
                      <a href="tel:+420797864432" className="text-primary">+420 797 864 432</a>
                    </p>
                    <p className="text-xs text-muted-foreground pt-2">{t.supplierNote}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Declarations */}
              <Card>
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><Scale className="w-5 h-5 text-primary" />{t.s5}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t.s5sub}</p>
                  </div>
                  <div className="space-y-3">
                    {t.decls.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                        <Checkbox
                          id={`ga-decl-${i}`} checked={decls[i] ?? false}
                          onCheckedChange={v => setDecls(prev => prev.map((x, j) => (j === i ? v === true : x)))}
                          className="mt-0.5"
                        />
                        <Label htmlFor={`ga-decl-${i}`} className="text-sm font-normal leading-snug">{d}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card>
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />{t.s6}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t.s6sub}</p>
                  </div>
                  <div className="space-y-3">
                    {t.attachments.map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Checkbox
                          id={`ga-att-${i}`} checked={attachments[i] ?? false}
                          onCheckedChange={v => setAttachments(prev => prev.map((x, j) => (j === i ? v === true : x)))}
                          className="mt-0.5"
                        />
                        <Label htmlFor={`ga-att-${i}`} className="text-sm font-normal leading-snug">{a}</Label>
                      </div>
                    ))}
                  </div>
                  <Button size="lg" className="w-full" onClick={submit} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    {loading ? t.submitting : t.submit}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Legal */}
          <Card className="bg-muted/30">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-lg font-bold mb-3">{t.legalTitle}</h2>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {t.legalList.map((l, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span><span>{l}</span></li>)}
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                <a href={nationalPool.url} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1">
                  {nationalPool[lang].name} <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
