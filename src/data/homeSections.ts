import {
  Award,
  BadgePercent,
  BarChart3,
  Bot,
  BookOpen,
  CalendarCheck,
  Calculator,
  CreditCard,
  HelpCircle,
  Layout,
  MapPin,
  Megaphone,
  MousePointerClick,
  ShieldCheck,
  Star,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export interface HomeSectionField {
  /** site_content key the public component reads */
  key: string;
  labelEn: string;
  labelCs: string;
  multiline?: boolean;
  hint?: string;
  hintCs?: string;
  /** Built-in wording shown as the placeholder when no override exists */
  defaultCs?: string;
  defaultEn?: string;
}

export interface HomeSectionDef {
  id: string;
  /** site_settings key controlling visibility */
  settingKey: string;
  labelEn: string;
  labelCs: string;
  descEn: string;
  descCs: string;
  icon: LucideIcon;
  defaultEnabled: boolean;
  fields: HomeSectionField[];
}

const f = (
  key: string,
  labelEn: string,
  labelCs: string,
  multiline = false,
  extra: Partial<HomeSectionField> = {}
): HomeSectionField => ({ key, labelEn, labelCs, multiline, ...extra });

export const HOME_SECTIONS: HomeSectionDef[] = [
  {
    id: 'hero',
    settingKey: 'home_hero',
    labelEn: 'Launch hero',
    labelCs: 'Úvodní sekce (raketa)',
    descEn: 'Animated starry hero with the rocket and the services scene.',
    descCs: 'Animovaná hvězdná sekce s raketou a scénou služeb.',
    icon: Megaphone,
    defaultEnabled: true,
    fields: [
      f('hero.eyebrow', 'Small label above the headline', 'Malý text nad titulkem', false, {
        defaultCs: 'Vaše další kapitola je připravena',
        defaultEn: 'Your next chapter is ready',
      }),
      f('hero.headline', 'Headline', 'Titulek', true, {
        hint: 'One line per row — the last line is highlighted.',
        hintCs: 'Jeden řádek na řádek — poslední řádek je zvýrazněn.',
        defaultCs: 'Odstartujte\nsvé podnikání\na překonejte běžné hranice.',
        defaultEn: 'Launch\nyour business\nbeyond ordinary.',
      }),
      f('hero.body', 'Intro paragraph', 'Úvodní odstavec', true, {
        defaultCs: 'Krásné weby, chytrá automatizace a měřitelný růst — vše v jedné výkonné digitální startovací platformě.',
        defaultEn: 'Beautiful websites, intelligent automation and measurable growth — built into one powerful digital launchpad.',
      }),
      f('hero.cta_primary', 'Main button', 'Hlavní tlačítko', false, {
        defaultCs: 'Zahájit start',
        defaultEn: 'Start your launch',
      }),
      f('hero.cta_secondary', 'Second button', 'Druhé tlačítko', false, {
        defaultCs: 'Prohlédnout balíčky',
        defaultEn: 'Explore packages',
      }),
      f('hero.services_title', 'Services scene heading', 'Titulek scény služeb', false, {
        defaultCs: 'Vše, co potřebujete k růstu.',
        defaultEn: 'Everything you need to grow in orbit.',
      }),
      f('hero.services_body', 'Services scene text', 'Text scény služeb', true, {
        defaultCs: 'Jeden propojený systém promění pozornost v poptávky a poptávky ve věrné zákazníky.',
        defaultEn: 'One connected system turns attention into enquiries — and enquiries into loyal customers.',
      }),
    ],
  },
  {
    id: 'promo',
    settingKey: 'home_promo',
    labelEn: 'Promotion banners',
    labelCs: 'Propagační banery',
    descEn: 'Compact and full-width promotional strips.',
    descCs: 'Kompaktní a celoplošné propagační pásy.',
    icon: BadgePercent,
    defaultEnabled: true,
    fields: [],
  },
  {
    id: 'why',
    settingKey: 'home_why',
    labelEn: 'Why FastMedia',
    labelCs: 'Proč FastMedia',
    descEn: 'Key reasons to choose us.',
    descCs: 'Hlavní důvody, proč si nás vybrat.',
    icon: BarChart3,
    defaultEnabled: true,
    fields: [
      f('whyfastmedia.title', 'Heading', 'Titulek'),
      f('whyfastmedia.subtitle', 'Sub-heading', 'Podtitulek', true),
    ],
  },
  {
    id: 'certifications',
    settingKey: 'home_certifications',
    labelEn: 'Certifications',
    labelCs: 'Certifikace',
    descEn: 'Trust badges and accreditations.',
    descCs: 'Odznaky důvěry a akreditace.',
    icon: Award,
    defaultEnabled: true,
    fields: [],
  },
  {
    id: 'automation',
    settingKey: 'home_automation',
    labelEn: 'Automation',
    labelCs: 'Automatizace',
    descEn: 'AI and automation highlights.',
    descCs: 'Přehled AI a automatizace.',
    icon: Bot,
    defaultEnabled: true,
    fields: [
      f('automation.title', 'Heading', 'Titulek'),
      f('automation.subtitle', 'Sub-heading', 'Podtitulek', true),
    ],
  },
  {
    id: 'demos',
    settingKey: 'home_demos',
    labelEn: 'Demo websites',
    labelCs: 'Ukázkové weby',
    descEn: 'Grid of industry demo sites.',
    descCs: 'Přehled ukázkových webů podle oboru.',
    icon: Layout,
    defaultEnabled: true,
    fields: [
      f('demos.title', 'Heading', 'Titulek'),
      f('demos.subtitle', 'Sub-heading', 'Podtitulek', true),
    ],
  },
  {
    id: 'calculator',
    settingKey: 'home_calculator',
    labelEn: 'Price calculator',
    labelCs: 'Kalkulačka ceny',
    descEn: 'Showcase for the AI quote calculator.',
    descCs: 'Ukázka AI kalkulačky nabídky.',
    icon: Calculator,
    defaultEnabled: true,
    fields: [
      f('calculator_showcase.title', 'Heading', 'Titulek'),
      f('calculator_showcase.subtitle', 'Sub-heading', 'Podtitulek', true),
    ],
  },
  {
    id: 'services',
    settingKey: 'home_services',
    labelEn: 'Services',
    labelCs: 'Služby',
    descEn: 'What we deliver.',
    descCs: 'Co dodáváme.',
    icon: Zap,
    defaultEnabled: true,
    fields: [
      f('services.title', 'Heading', 'Titulek'),
      f('services.subtitle', 'Sub-heading', 'Podtitulek', true),
    ],
  },
  {
    id: 'reviews',
    settingKey: 'home_reviews',
    labelEn: 'Reviews',
    labelCs: 'Recenze',
    descEn: 'Customer testimonials.',
    descCs: 'Reference zákazníků.',
    icon: Star,
    defaultEnabled: true,
    fields: [
      f('reviews.title', 'Heading', 'Titulek'),
      f('reviews.subtitle', 'Sub-heading', 'Podtitulek', true),
    ],
  },
  {
    id: 'team',
    settingKey: 'home_team',
    labelEn: 'Team',
    labelCs: 'Tým',
    descEn: 'The people behind FastMedia.',
    descCs: 'Lidé za FastMedia.',
    icon: Users,
    defaultEnabled: true,
    fields: [],
  },
  {
    id: 'pricing',
    settingKey: 'show_pricing',
    labelEn: 'Price list',
    labelCs: 'Cenník',
    descEn: 'Public packages and prices (also controls the menu link).',
    descCs: 'Veřejné balíčky a ceny (řídí i odkaz v menu).',
    icon: CreditCard,
    defaultEnabled: false,
    fields: [
      f('pricing.title', 'Heading', 'Titulek'),
      f('pricing.subtitle', 'Sub-heading', 'Podtitulek', true),
    ],
  },
  {
    id: 'faq',
    settingKey: 'home_faq',
    labelEn: 'FAQ',
    labelCs: 'Časté otázky',
    descEn: 'Frequently asked questions.',
    descCs: 'Často kladené otázky.',
    icon: HelpCircle,
    defaultEnabled: true,
    fields: [
      f('faq.title', 'Heading', 'Titulek'),
      f('faq.subtitle', 'Sub-heading', 'Podtitulek', true),
    ],
  },
  {
    id: 'policies',
    settingKey: 'home_policies',
    labelEn: 'Appointment policies',
    labelCs: 'Podmínky schůzek',
    descEn: 'How appointments and cancellations work.',
    descCs: 'Jak fungují schůzky a zrušení.',
    icon: ShieldCheck,
    defaultEnabled: true,
    fields: [],
  },
  {
    id: 'consultant',
    settingKey: 'home_consultant',
    labelEn: 'Consultant',
    labelCs: 'Konzultant',
    descEn: 'Personal introduction block.',
    descCs: 'Osobní představení.',
    icon: BookOpen,
    defaultEnabled: true,
    fields: [
      f('consultant.title', 'Heading', 'Titulek'),
      f('consultant.subtitle', 'Sub-heading', 'Podtitulek', true),
      f('consultant.bio', 'Biography', 'Životopis', true),
    ],
  },
  {
    id: 'service_area',
    settingKey: 'home_service_area',
    labelEn: 'Service area map',
    labelCs: 'Mapa oblasti služeb',
    descEn: 'Where we work.',
    descCs: 'Kde pracujeme.',
    icon: MapPin,
    defaultEnabled: true,
    fields: [],
  },
  {
    id: 'booking',
    settingKey: 'home_booking',
    labelEn: 'Booking',
    labelCs: 'Rezervace',
    descEn: 'Book a call block at the end of the page.',
    descCs: 'Blok rezervace hovoru na konci stránky.',
    icon: CalendarCheck,
    defaultEnabled: true,
    fields: [
      f('booking.title', 'Heading', 'Titulek'),
      f('booking.subtitle', 'Sub-heading', 'Podtitulek', true),
    ],
  },
  {
    id: 'sticky_cta',
    settingKey: 'home_sticky_cta',
    labelEn: 'Sticky call-to-action bar',
    labelCs: 'Plovoucí výzva k akci',
    descEn: 'Bar that follows the visitor while scrolling.',
    descCs: 'Lišta, která sleduje návštěvníka při posouvání.',
    icon: MousePointerClick,
    defaultEnabled: true,
    fields: [],
  },
];

export const HOME_SETTING_KEYS = HOME_SECTIONS.map((s) => s.settingKey);
