// Content for the GEO grant pages. Facts come only from owner-confirmed GEO facts
// and existing grant pages (85% support rate, 150,000 CZK cap, FastMedia is a
// supplier/preparer, not the grant-giving agency).
export type Lang = 'cs' | 'en';
export interface GrantPageCopy {
  seoTitle: string; seoDesc: string; kicker: string; h1: string;
  answer: string; // direct answer, first thing AI engines read
  sections: { h2: string; body?: string; list?: string[] }[];
  faqs: { q: string; a: string }[];
  cta: { label: string; to: string }[];
}
export interface GrantPage { path: string; schemaType: 'Service' | 'Course' | 'HowTo'; copy: Record<Lang, GrantPageCopy>; updated: string }

const UPDATED = '2026-09-24';

export const EU_LANGUAGES = [
  'Bulgarian', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Estonian', 'Finnish', 'French', 'German', 'Greek', 'Hungarian',
  'Irish', 'Italian', 'Latvian', 'Lithuanian', 'Maltese', 'Polish', 'Portuguese', 'Romanian', 'Slovak', 'Slovenian', 'Spanish', 'Swedish',
];
export const EU_LANGUAGES_CS = [
  'bulharština', 'chorvatština', 'čeština', 'dánština', 'nizozemština', 'angličtina', 'estonština', 'finština', 'francouzština', 'němčina', 'řečtina', 'maďarština',
  'irština', 'italština', 'lotyština', 'litevština', 'maltština', 'polština', 'portugalština', 'rumunština', 'slovenština', 'slovinština', 'španělština', 'švédština',
];

export const grantPages: GrantPage[] = [
  {
    path: '/eu-creative-grant',
    schemaType: 'Service',
    updated: UPDATED,
    copy: {
      en: {
        seoTitle: 'EU Creative Grant for Websites: Free Help to Apply | FastMedia.Pro',
        seoDesc: 'How Czech businesses can use the creative voucher (Kreativní vouchery) to fund up to 85% of a bespoke website, capped at 150,000 CZK. Free course, business plan and AI prompts.',
        kicker: 'EU creative grant · Kreativní vouchery',
        h1: 'EU creative grant for websites: how to get up to 85% funded',
        answer: 'Czech businesses can use the creative voucher programme (Kreativní vouchery) to cover up to 85% of eligible bespoke creative work, such as a custom website, capped at 150,000 CZK. FastMedia.Pro is a web supplier, not the grant agency: we prepare you with a free course, a ready-made business plan and application drafts, and AI prompts that work in any language.',
        sections: [
          { h2: 'What the grant pays for', list: ['Bespoke website and web app development', 'Interactive price calculators and booking forms', 'API connections and CRM integration', 'UX/UI design and visual identity', 'Full language versions of your site, written for each market'] },
          { h2: 'What FastMedia.Pro gives you for free', list: ['A free online course on the EU creative grant', 'A pro-forma business plan and application drafts', 'AI prompts that help you write your application in any language', 'An eligibility wizard and regional hub map'] },
          { h2: 'How it works, step by step', list: ['Check eligibility with the wizard (about 5 minutes).', 'Take the free grant course.', 'Use the business plan template and AI prompts to draft your application.', 'Submit through your regional hub or the national pool. We never apply on your behalf.', 'We build the website; you pay upfront and the grant reimburses the eligible share.'] },
          { h2: 'Important limits', body: 'Grant decisions are made by the programme administrator, not by FastMedia.Pro. Costs must usually be pre-financed, and hosting, domains and software licences are not eligible. Rules can change with each call, so always check the current call text.' },
        ],
        faqs: [
          { q: 'Can the EU creative grant pay for a website?', a: 'Yes, when the website is bespoke creative work by a registered creative supplier. Up to 85% of eligible costs is covered, capped at 150,000 CZK.' },
          { q: 'Does FastMedia.Pro apply for the grant for me?', a: 'No. We are not the grant-giving agency and do not submit applications. We prepare you with a free course, a business plan template and AI prompts.' },
          { q: 'Can I prepare my application in my own language?', a: 'Yes. Our AI prompts help you draft and check your application text in any language, then produce the Czech version the programme requires.' },
          { q: 'Is the grant course free?', a: 'Yes, the EU creative grant course on our Courses page is free.' },
        ],
        cta: [{ label: 'Check eligibility', to: '/grant-wizard' }, { label: 'Free grant course', to: '/courses/eu-creative-grants' }, { label: 'Business plan & AI prompts', to: '/grant-business-plan' }],
      },
      cs: {
        seoTitle: 'Kreativní vouchery na web: bezplatná příprava žádosti | FastMedia.Pro',
        seoDesc: 'Jak využít kreativní vouchery k pokrytí až 85 % nákladů na web na míru (strop 150 000 Kč). Bezplatný kurz, podnikatelský plán a AI prompty v jakémkoli jazyce.',
        kicker: 'Kreativní vouchery · EU dotace',
        h1: 'Kreativní vouchery na web: jak získat až 85 % nákladů',
        answer: 'České firmy mohou z programu Kreativní vouchery pokrýt až 85 % způsobilých nákladů na kreativní práci na míru, například web, se stropem 150 000 Kč. FastMedia.Pro je dodavatel webů, nikoli poskytovatel dotace: připravíme vás bezplatným kurzem, hotovým podnikatelským plánem a návrhy žádosti a AI prompty, které fungují v jakémkoli jazyce.',
        sections: [
          { h2: 'Co dotace pokryje', list: ['Web a webové aplikace na míru', 'Interaktivní kalkulačky a rezervační formuláře', 'Napojení API a CRM', 'UX/UI design a vizuální identitu', 'Plnohodnotné jazykové verze webu psané pro daný trh'] },
          { h2: 'Co od nás získáte zdarma', list: ['Bezplatný online kurz o kreativních voucherech', 'Vzorový podnikatelský plán a návrhy žádosti', 'AI prompty pro psaní žádosti v jakémkoli jazyce', 'Navigátor způsobilosti a mapu regionálních partnerů'] },
          { h2: 'Postup krok za krokem', list: ['Ověřte způsobilost v navigátoru (asi 5 minut).', 'Projděte bezplatný kurz.', 'S šablonou plánu a AI prompty připravte žádost.', 'Podejte ji přes regionálního partnera nebo národní pool. Za vás ji nepodáváme.', 'Web postavíme; vy předfinancujete a dotace proplatí způsobilou část.'] },
          { h2: 'Důležitá omezení', body: 'O dotaci rozhoduje administrátor programu, ne FastMedia.Pro. Náklady je obvykle nutné předfinancovat; hosting, domény a licence softwaru nejsou způsobilé. Pravidla se mohou s každou výzvou měnit.' },
        ],
        faqs: [
          { q: 'Může kreativní voucher zaplatit web?', a: 'Ano, pokud jde o kreativní práci na míru od registrovaného dodavatele. Pokryje až 85 % způsobilých nákladů, maximálně 150 000 Kč.' },
          { q: 'Podá FastMedia.Pro žádost za mě?', a: 'Ne. Nejsme poskytovatel dotace a žádosti nepodáváme. Připravíme vás kurzem, šablonou plánu a AI prompty.' },
          { q: 'Mohu žádost připravit ve svém jazyce?', a: 'Ano. AI prompty vám pomohou napsat a zkontrolovat text v jakémkoli jazyce a připravit požadovanou českou verzi.' },
          { q: 'Je kurz zdarma?', a: 'Ano, kurz o kreativních voucherech na stránce Kurzy je zdarma.' },
        ],
        cta: [{ label: 'Ověřit způsobilost', to: '/grant-wizard' }, { label: 'Bezplatný kurz', to: '/courses/eu-creative-grants' }, { label: 'Plán a AI prompty', to: '/grant-business-plan' }],
      },
    },
  },
  {
    path: '/grant-business-plan',
    schemaType: 'HowTo',
    updated: UPDATED,
    copy: {
      en: {
        seoTitle: 'Creative Voucher Business Plan Template & AI Prompts | FastMedia.Pro',
        seoDesc: 'A free pro-forma business plan and application draft for the Czech creative voucher, with copy-ready AI prompts to write it in any language.',
        kicker: 'Free tools',
        h1: 'Business plan template and AI prompts for the creative voucher',
        answer: 'FastMedia.Pro provides a free pro-forma business plan and application draft for the Czech creative voucher, plus AI prompts you can paste into ChatGPT, Gemini or Copilot to write, check and translate your application in any language. You stay the applicant; we only help you prepare.',
        sections: [
          { h2: 'What the business plan covers', list: ['Your business and its current digital situation', 'The problem the new website solves', 'The creative work requested and why it must be bespoke', 'Budget, the 85% grant share and your 15% share', 'Expected measurable results'] },
          { h2: 'AI prompt: draft your project description', body: 'Copy and adapt: "Act as a grant writer. My business is [business, region, years active]. I want a bespoke website with [features]. Write a 250-word project description for the Czech Kreativní vouchery programme explaining the business problem, the creative work and measurable results. Write it in [your language], then give a Czech version."' },
          { h2: 'AI prompt: check your application', body: 'Copy and adapt: "Review this grant project description against these rules: bespoke creative work only, no hardware, hosting or licences, budget within the call limits. List anything missing or risky, then suggest improvements. Text: [paste]."' },
          { h2: 'AI prompt: budget explanation', body: 'Copy and adapt: "Explain this budget in plain language for a grant assessor: total [CZK], grant 85% capped at 150,000 CZK, my share [CZK]. Keep it under 120 words."' },
        ],
        faqs: [
          { q: 'Is the business plan template free?', a: 'Yes. It is available to anyone preparing a creative voucher application.' },
          { q: 'Which AI tools do the prompts work with?', a: 'Any general AI assistant, such as ChatGPT, Gemini or Microsoft Copilot. Always check the output yourself before submitting.' },
          { q: 'Can I write my application in a language other than Czech?', a: 'You can draft in any language with the prompts; the final application must follow the programme language requirements.' },
        ],
        cta: [{ label: 'Download templates', to: '/grant-application' }, { label: 'Free grant course', to: '/courses/eu-creative-grants' }, { label: 'Check eligibility', to: '/grant-wizard' }],
      },
      cs: {
        seoTitle: 'Podnikatelský plán a AI prompty pro kreativní voucher | FastMedia.Pro',
        seoDesc: 'Bezplatný vzorový podnikatelský plán a návrh žádosti o kreativní voucher s AI prompty pro psaní v jakémkoli jazyce.',
        kicker: 'Nástroje zdarma',
        h1: 'Šablona podnikatelského plánu a AI prompty pro kreativní voucher',
        answer: 'FastMedia.Pro nabízí zdarma vzorový podnikatelský plán a návrh žádosti o kreativní voucher a AI prompty pro ChatGPT, Gemini nebo Copilot, se kterými žádost napíšete, zkontrolujete a přeložíte v jakémkoli jazyce. Žadatelem zůstáváte vy; my vám jen pomáháme s přípravou.',
        sections: [
          { h2: 'Co plán obsahuje', list: ['Vaše firma a její současná digitální situace', 'Problém, který nový web řeší', 'Požadovaná kreativní práce a proč musí být na míru', 'Rozpočet, 85% podíl dotace a vašich 15 %', 'Očekávané měřitelné výsledky'] },
          { h2: 'AI prompt: popis projektu', body: 'Zkopírujte a upravte: „Jsi autor žádostí o dotace. Moje firma je [firma, kraj, doba podnikání]. Chci web na míru s [funkce]. Napiš 250slovný popis projektu pro program Kreativní vouchery: problém firmy, kreativní práce a měřitelné výsledky. Napiš to v [váš jazyk] a pak v češtině.“' },
          { h2: 'AI prompt: kontrola žádosti', body: 'Zkopírujte a upravte: „Zkontroluj tento popis projektu podle pravidel: pouze kreativní práce na míru, žádný hardware, hosting ani licence, rozpočet v limitech výzvy. Vypiš, co chybí nebo je rizikové, a navrhni zlepšení. Text: [vložit].“' },
          { h2: 'AI prompt: vysvětlení rozpočtu', body: 'Zkopírujte a upravte: „Vysvětli hodnotiteli srozumitelně tento rozpočet: celkem [Kč], dotace 85 % se stropem 150 000 Kč, můj podíl [Kč]. Maximálně 120 slov.“' },
        ],
        faqs: [
          { q: 'Je šablona plánu zdarma?', a: 'Ano, je k dispozici každému, kdo připravuje žádost o kreativní voucher.' },
          { q: 'S jakými AI nástroji prompty fungují?', a: 'S běžnými AI asistenty jako ChatGPT, Gemini nebo Microsoft Copilot. Výstup vždy zkontrolujte.' },
          { q: 'Mohu žádost psát v jiném jazyce než češtině?', a: 'Koncept můžete psát v jakémkoli jazyce; finální žádost musí splnit jazykové požadavky programu.' },
        ],
        cta: [{ label: 'Stáhnout šablony', to: '/grant-application' }, { label: 'Bezplatný kurz', to: '/courses/eu-creative-grants' }, { label: 'Ověřit způsobilost', to: '/grant-wizard' }],
      },
    },
  },
  {
    path: '/eu-language-websites',
    schemaType: 'Service',
    updated: UPDATED,
    copy: {
      en: {
        seoTitle: 'Websites in Every EU Language, Written for Each Market | FastMedia.Pro',
        seoDesc: 'FastMedia.Pro builds full language versions of your website in any of the 24 official EU languages, written for each market rather than just translated.',
        kicker: 'All 24 EU languages',
        h1: 'Websites in every official EU language, not just translations',
        answer: 'FastMedia.Pro builds full language versions of a website in any of the 24 official EU languages. Each version is written for its own market, with local wording, examples and calls to action, rather than a word-for-word translation. Language versions can form part of a creative voucher project when they are bespoke creative work.',
        sections: [
          { h2: 'Languages we supply', body: EU_LANGUAGES.join(', ') + '.' },
          { h2: 'What each language version includes', list: ['Copy written for the local market and search terms', 'Localised forms, calculators and booking flows', 'Local page titles, descriptions and structured data', 'Review before publishing'] },
          { h2: 'Also available with web development', list: ['Interactive price calculators', 'Booking forms', 'API and CRM integrations', 'Innovation projects funded through the creative voucher'] },
        ],
        faqs: [
          { q: 'Which languages can my website be built in?', a: 'Any of the 24 official EU languages, including German, French, Polish, Slovak and Hungarian.' },
          { q: 'Is it just machine translation?', a: 'No. Each version is written and reviewed for its market before it is published.' },
          { q: 'Can the creative voucher pay for language versions?', a: 'It can when the language version is bespoke creative work within your project; check the current call rules.' },
        ],
        cta: [{ label: 'Get a price', to: '/calculator' }, { label: 'EU creative grant', to: '/eu-creative-grant' }, { label: 'Contact us', to: '/contact' }],
      },
      cs: {
        seoTitle: 'Weby ve všech jazycích EU, psané pro každý trh | FastMedia.Pro',
        seoDesc: 'FastMedia.Pro vytváří plnohodnotné jazykové verze webu ve všech 24 úředních jazycích EU, psané pro daný trh, ne jen přeložené.',
        kicker: 'Všech 24 jazyků EU',
        h1: 'Weby ve všech úředních jazycích EU, ne jen překlady',
        answer: 'FastMedia.Pro vytváří plnohodnotné jazykové verze webu v kterémkoli z 24 úředních jazyků EU. Každá verze je psaná pro svůj trh, s místní terminologií, příklady a výzvami k akci, nikoli překlad slovo od slova. Jazykové verze mohou být součástí projektu z kreativního voucheru, pokud jde o kreativní práci na míru.',
        sections: [
          { h2: 'Jazyky, které dodáváme', body: EU_LANGUAGES_CS.join(', ') + '.' },
          { h2: 'Co jazyková verze obsahuje', list: ['Texty psané pro místní trh a vyhledávání', 'Lokalizované formuláře, kalkulačky a rezervace', 'Místní titulky, popisy a strukturovaná data', 'Kontrolu před zveřejněním'] },
          { h2: 'K dispozici také s vývojem webu', list: ['Interaktivní cenové kalkulačky', 'Rezervační formuláře', 'Napojení API a CRM', 'Inovační projekty financované z kreativního voucheru'] },
        ],
        faqs: [
          { q: 'V jakých jazycích může být můj web?', a: 'V kterémkoli z 24 úředních jazyků EU, včetně němčiny, francouzštiny, polštiny, slovenštiny a maďarštiny.' },
          { q: 'Jde jen o strojový překlad?', a: 'Ne. Každá verze je napsaná a zkontrolovaná pro svůj trh před zveřejněním.' },
          { q: 'Zaplatí jazykové verze kreativní voucher?', a: 'Může, pokud je jazyková verze kreativní prací na míru v rámci projektu; ověřte pravidla aktuální výzvy.' },
        ],
        cta: [{ label: 'Spočítat cenu', to: '/calculator' }, { label: 'Kreativní vouchery', to: '/eu-creative-grant' }, { label: 'Kontakt', to: '/contact' }],
      },
    },
  },
];
