import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, FileText, Languages } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import FAQJsonLd from '@/components/FAQJsonLd';
import { useLanguage } from '@/contexts/LanguageContext';

const copy = {
  en: {
    h2: 'What FastMedia.Pro does',
    answer: 'FastMedia.Pro builds bespoke websites, interactive price calculators, booking forms and API/CRM integrations for businesses in the Czech Republic and across the EU, in any of the 24 official EU languages. We also help Czech businesses prepare for the EU creative grant (Kreativní vouchery), which can cover up to 85% of eligible bespoke work, capped at 150,000 CZK, with a free course, a business plan template and AI prompts.',
    cards: [
      { icon: GraduationCap, t: 'Free EU grant course', d: 'Learn how the creative voucher works, step by step.', to: '/courses/eu-creative-grants' },
      { icon: FileText, t: 'Business plan & AI prompts', d: 'Free template and prompts to write your application in any language.', to: '/grant-business-plan' },
      { icon: Languages, t: 'Websites in every EU language', d: 'Each version written for its market, not just translated.', to: '/eu-language-websites' },
    ],
    more: 'How the EU creative grant works',
    faqs: [
      { q: 'What does FastMedia.Pro do?', a: 'FastMedia.Pro builds bespoke websites, calculators, booking forms and API/CRM integrations, in any official EU language, and helps Czech businesses prepare for the EU creative grant.' },
      { q: 'Can the EU creative grant pay for my website?', a: 'The Czech creative voucher can cover up to 85% of eligible bespoke creative work, capped at 150,000 CZK. FastMedia.Pro prepares you but is not the grant agency.' },
      { q: 'Does FastMedia.Pro offer free grant help?', a: 'Yes: a free EU creative grant course, a free business plan template and AI prompts that work in any language.' },
    ],
  },
  cs: {
    h2: 'Co FastMedia.Pro dělá',
    answer: 'FastMedia.Pro vytváří weby na míru, interaktivní cenové kalkulačky, rezervační formuláře a napojení API/CRM pro firmy v Česku i v celé EU, v kterémkoli z 24 úředních jazyků EU. Českým firmám také pomáháme připravit se na Kreativní vouchery, které mohou pokrýt až 85 % způsobilých nákladů na práci na míru (strop 150 000 Kč), a to bezplatným kurzem, šablonou podnikatelského plánu a AI prompty.',
    cards: [
      { icon: GraduationCap, t: 'Bezplatný kurz o dotaci', d: 'Jak kreativní voucher funguje, krok za krokem.', to: '/courses/eu-creative-grants' },
      { icon: FileText, t: 'Plán a AI prompty', d: 'Šablona a prompty pro žádost v jakémkoli jazyce zdarma.', to: '/grant-business-plan' },
      { icon: Languages, t: 'Weby ve všech jazycích EU', d: 'Každá verze psaná pro svůj trh, ne jen přeložená.', to: '/eu-language-websites' },
    ],
    more: 'Jak fungují Kreativní vouchery',
    faqs: [
      { q: 'Co FastMedia.Pro dělá?', a: 'FastMedia.Pro vytváří weby na míru, kalkulačky, rezervační formuláře a napojení API/CRM v kterémkoli jazyce EU a pomáhá českým firmám s přípravou na Kreativní vouchery.' },
      { q: 'Zaplatí kreativní voucher můj web?', a: 'Kreativní voucher může pokrýt až 85 % způsobilých nákladů na kreativní práci na míru, maximálně 150 000 Kč. FastMedia.Pro vás připraví, ale není poskytovatel dotace.' },
      { q: 'Nabízí FastMedia.Pro pomoc s dotací zdarma?', a: 'Ano: bezplatný kurz, šablonu podnikatelského plánu a AI prompty v jakémkoli jazyce.' },
    ],
  },
  de: {
    h2: 'Was FastMedia.Pro für Ihr Unternehmen entwickelt',
    answer: 'FastMedia.Pro entwickelt Websites, Preisrechner, Buchungsformulare und individuell vereinbarte CRM/API-Verbindungen für Unternehmen in Tschechien und Europa. Private Marketingwerkzeuge helfen bei der Vorbereitung von Inhalten und der Recherche öffentlicher Geschäftskontakte. Direkte Social-Media-Veröffentlichung und weitere Integrationen werden separat geprüft und sind nicht automatisch enthalten.',
    cards: [
      { icon: GraduationCap, t: 'Informationen zu Förderprogrammen', d: 'Unsere Förderinformationen beziehen sich auf tschechische Programme; die jeweilige Förderstelle entscheidet.', to: '/eu-creative-grant' },
      { icon: FileText, t: 'Projekt und Kosten planen', d: 'Für größere Websites: Funktionen auswählen und einen unverbindlichen Kostenrahmen ermitteln.', to: '/calculator' },
      { icon: Languages, t: 'Unsere Website-Projekte', d: 'Entdecken Sie unser Portfolio auf myname.co.uk.', to: 'https://myname.co.uk' },
    ],
    more: 'Webdesign-Pakete und Folgekosten ansehen',
    faqs: [],
  },
};

export default function HomeDirectAnswer() {
  const { language } = useLanguage();
  const t = copy[language];
  return (
    <section className="border-b border-border bg-background py-14" aria-labelledby="home-answer">
      <FAQJsonLd faqs={t.faqs.map((f) => ({ question: f.q, answer: f.a }))} />
      <div className="container mx-auto max-w-5xl px-4">
        <h2 id="home-answer" className="font-display text-2xl font-bold md:text-3xl">{t.h2}</h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground" data-speakable>{t.answer}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {t.cards.map((c) => (
            <Link key={c.to} to={c.to} target={c.to.startsWith('https://') ? '_blank' : undefined} rel={c.to.startsWith('https://') ? 'noopener noreferrer' : undefined} className="group">
              <Card className="h-full transition-colors group-hover:border-accent">
                <CardContent className="p-5">
                  <c.icon className="mb-3 h-6 w-6 text-accent" />
                  <h3 className="font-semibold">{c.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Link to={language === 'de' ? '/de/offer' : '/eu-creative-grant'} className="mt-6 inline-flex items-center gap-1 font-medium text-accent hover:underline">
          {t.more} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
