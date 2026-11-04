import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useA11y } from '@/contexts/A11yContext';
import { MessageCircle, Contact, Accessibility, Shield } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import logo from '@/assets/logo.jpeg';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';
import { localizedPath } from '@/lib/publicLanguage';
import LearnMoreModal from '@/components/LearnMoreModal';
import kreativniCeskoLogo from '@/assets/logos/kreativni-cesko.svg';

const Footer = () => {
  const { t, language } = useLanguage();
  const isEnglish = language === 'en';
  const { setOpen } = useA11y();
  const { getContent, invalidate } = useSiteContent();

  const siteLinks = [
    { href: '/#demos', label: t('nav.demos') },
    { href: '/#services', label: t('nav.services') },
    { href: '/#reviews', label: t('nav.reviews') },
    { href: '/offer#cenik', label: t('nav.pricing') },
    { href: '/#faq', label: t('nav.faq') },
    { href: '/#contact', label: t('nav.contact') },
  ];

  const pageLinks = [
    { href: '/blog', label: 'Blog' },
    { href: '/consultant/tereza', label: t('nav.consultant') },
    { href: '/calculator', label: t('nav.calculator') },
    { href: '/inquiry', label: t('nav.inquiry') },
    { href: '/about', label: language === 'de' ? 'Über uns' : (isEnglish ? 'About' : 'O nás') },
    { href: '/websites-for/plumbers', label: language === 'de' ? 'Websites für Sanitärbetriebe' : (isEnglish ? 'Websites for plumbers' : 'Weby pro instalatéry') },
    { href: '/websites-for/electricians', label: language === 'de' ? 'Websites für Elektrobetriebe' : (isEnglish ? 'Websites for electricians' : 'Weby pro elektrikáře') },
    { href: '/websites-for/small-service-businesses', label: language === 'de' ? 'Websites für kleine Unternehmen' : (isEnglish ? 'Websites for small businesses' : 'Weby pro malé firmy') },
    { href: '/contact', label: language === 'de' ? 'Kontakt' : (isEnglish ? 'Contact' : 'Kontakt') },
    { href: '/quote-request', label: language === 'de' ? 'Angebot anfordern' : (isEnglish ? 'Request a quote' : 'Nezávazná nabídka') },
    { href: '/quote-assessment', label: language === 'de' ? 'Preiskalkulation' : (isEnglish ? 'Quote assessment' : 'Cenová kalkulace') },
    { href: '/grant-wizard', label: t('nav.grant') },
    { href: '/media-kit', label: language === 'de' ? 'Presseunterlagen' : (isEnglish ? 'Press kit' : 'Tiskový kit') },
    { href: '/reviews', label: language === 'de' ? 'Bewertungen' : (isEnglish ? 'Reviews' : 'Recenze') },
    { href: '/launch', label: language === 'de' ? 'Start' : (isEnglish ? 'Launch' : 'Start') },
    { href: '/install', label: t('nav.install') },
    { href: '/offer', label: language === 'de' ? 'Angebot' : (isEnglish ? 'Offer' : 'Nabídka') },
    { href: '/case-studies', label: language === 'de' ? 'Projektbeispiele' : (isEnglish ? 'Case studies' : 'Případové studie') },
    { href: '/courses', label: language === 'de' ? 'Kurse' : (isEnglish ? 'Courses' : 'Kurzy') },
    { href: '/grant-eligibility', label: t('nav.grant_rules') },
    { href: '/eugrants', label: t('nav.grant_hubs') },
    { href: '/eu-creative-grant', label: language === 'de' ? 'EU-Kreativförderung' : (isEnglish ? 'EU creative grant' : 'Kreativní vouchery') },
    { href: '/eu-language-websites', label: language === 'de' ? 'Websites in EU-Sprachen' : (isEnglish ? 'EU language websites' : 'Weby v jazycích EU') },
  ];

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img loading="lazy" decoding="async" src={logo} alt="FastMedia.Pro" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-display font-bold text-lg">
                Fast<span className="text-accent">Media</span>.Pro
              </span>
            </Link>
            <EditableText
              contentKey="footer.tagline"
              defaultValue={t('hero.subtitle')}
              value={getContent('footer.tagline', '') || undefined}
              onSave={invalidate}
              as="p"
              className="text-sm text-background/60 leading-relaxed"
              multiline
            />
            <p className="mt-4 text-xs text-background/50 leading-relaxed">
              {language === 'de' ? 'Timothy Knott — Gründer' : (isEnglish ? 'Timothy Knott — Founder' : 'Timothy Knott — zakladatel')} · IČO 17308551 · {language === 'de' ? 'Nicht umsatzsteuerpflichtig registriert' : (isEnglish ? 'Not VAT registered' : 'Neplátce DPH')}
              <br />
              {language === 'de' ? 'Louny 440 01, Region Ústí nad Labem, Tschechien' : (isEnglish
                ? 'Louny 440 01, Ústí nad Labem Region, Czech Republic'
                : 'Louny 440 01, Ústecký kraj, Česká republika')}
            </p>
          </div>

          {/* Site Navigation */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-background/80 mb-4">
              {t('nav.demos')}
            </h4>
            <ul className="space-y-2.5">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-background/80 mb-4">
              {t('nav.services')}
            </h4>
            <ul className="space-y-2.5">
              {pageLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={localizedPath(link.href, language)}
                    className="text-sm text-background/60 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-background/80 mb-4 inline-flex items-center gap-1.5">
              {t('footer.terms')}
              <LearnMoreModal
                title={language === 'de' ? 'Barrierefreiheit und Datenschutz' : (isEnglish ? 'Accessibility & Compliance' : 'Přístupnost a soulad s předpisy')}
                explanation={isEnglish ? 'FastMedia.Pro builds with WCAG 2.1 AA accessibility criteria in mind, GDPR compliance and transparent data handling.' : 'FastMedia.Pro staví weby s ohledem na kritéria přístupnosti WCAG 2.1 AA, soulad s GDPR a transparentní zpracování údajů.'}
                benefits={isEnglish ? ['WCAG 2.1 AA accessible', 'GDPR-compliant data handling', 'Czech and British English'] : ['Přístupnost WCAG 2.1 AA', 'Zpracování údajů v souladu s GDPR', 'Čeština a britská angličtina']}
              />
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/legal/privacy-policy" className="text-sm text-background/60 hover:text-accent transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/legal/terms-of-service" className="text-sm text-background/60 hover:text-accent transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/legal/cookie-policy" className="text-sm text-background/60 hover:text-accent transition-colors">
                   {language === 'de' ? 'Cookie-Richtlinie' : (isEnglish ? 'Cookie Policy' : 'Zásady používání cookies')}
                </Link>
              </li>
              <li>
                <Link to="/legal/gdpr" className="text-sm text-background/60 hover:text-accent transition-colors">
                  GDPR
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy-policy?region=us" className="text-sm text-background/60 hover:text-accent transition-colors">
                   {language === 'de' ? 'US-Datenschutzhinweise' : (isEnglish ? 'US Privacy Notice' : 'Ochrana soukromí v USA')}
                </Link>
              </li>
              <li>
                <Link to="/legal/dpa" className="text-sm text-background/60 hover:text-accent transition-colors">
                   {language === 'de' ? 'Auftragsverarbeitungsvertrag' : (isEnglish ? 'Data Processing Agreement' : 'Smlouva o zpracování údajů')}
                </Link>
              </li>
              <li>
                <Link to="/legal/acceptable-use" className="text-sm text-background/60 hover:text-accent transition-colors">
                   {language === 'de' ? 'Nutzungsregeln' : (isEnglish ? 'Acceptable Use' : 'Pravidla přijatelného používání')}
                </Link>
              </li>
              <li>
                <Link to="/legal/refund-policy" className="text-sm text-background/60 hover:text-accent transition-colors">
                   {language === 'de' ? 'Erstattung und Kündigung' : (isEnglish ? 'Refunds & Cancellation' : 'Vrácení peněz a zrušení')}
                </Link>
              </li>
              <li>
                <Link to="/legal/imprint" className="text-sm text-background/60 hover:text-accent transition-colors">
                   {language === 'de' ? 'Impressum' : (isEnglish ? 'Imprint' : 'Identifikační údaje')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Discreet referral-partner CTA */}
        <p className="pb-6 text-sm text-background/60">
          {language === 'de'
            ? 'Kennen Sie ein Unternehmen, das eine bessere Website braucht? Werden Sie Partner von FastMedia.Pro und erhalten Sie Prämien für erfolgreiche Empfehlungen. '
            : isEnglish
              ? 'Know a business that needs a better website? Partner with FastMedia.Pro and earn rewards for successful referrals. '
              : 'Znáte firmu, která potřebuje lepší web? Staňte se partnerem FastMedia.Pro a získejte odměnu za úspěšná doporučení. '}
          <Link to="/partners" className="text-accent hover:underline font-medium">
            {language === 'de' ? 'Empfehlungspartner werden →' : isEnglish ? 'Become a referral partner →' : 'Stát se partnerem →'}
          </Link>
        </p>

        {/* Discreet state-register credential */}
        <p className="pb-8">
          <a
            href="https://www.kreativnicesko.cz/cs/galerie-kreativcu/aa2be57a-4b76-4faa-8d45-3a8a606e1918"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex max-w-full flex-wrap items-center gap-2.5 rounded-lg border border-background/10 px-3 py-2 text-xs text-background/60 transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <img
              loading="lazy"
              decoding="async"
              src={kreativniCeskoLogo}
              alt=""
              aria-hidden="true"
              className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100"
            />
            <span>
              {language === 'de'
                ? 'Offiziell registriertes Unternehmen in Tschechien'
                : isEnglish
                  ? 'Officially registered Czech business'
                  : 'Oficiálně registrovaný podnik v ČR'}
            </span>
            <span className="sr-only">
              {language === 'de' ? ' (Kreativní Česko, öffnet in neuem Tab)' : isEnglish ? ' (Kreativní Česko, opens in a new tab)' : ' (Kreativní Česko, otevře se v nové kartě)'}
            </span>
          </a>
        </p>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} FastMedia.Pro. {t('footer.rights')}.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ThemeToggle variant="inverted" />
            <span className="text-background/20">|</span>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm text-background/60 hover:text-accent transition-colors"
            >
              <Accessibility className="w-4 h-4" />
               {language === 'de' ? 'Barrierefreiheit' : (isEnglish ? 'Accessibility' : 'Přístupnost')}
            </button>
            <span className="text-background/20">|</span>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-sm text-background/60 hover:text-accent transition-colors"
            >
              <Shield className="w-4 h-4" />
              {language === 'de' ? 'Admin-Bereich' : (isEnglish ? 'Admin Portal' : 'Administrace')}
            </Link>
            <span className="text-background/20">|</span>
            <a
              href="https://wa.me/447926400060"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-background/60 hover:text-green-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <span className="text-background/20">|</span>
            <a
              href="/tim-knott.vcf"
              download="tim-knott.vcf"
              className="inline-flex items-center gap-1.5 text-sm text-background/60 hover:text-accent transition-colors"
            >
              <Contact className="w-4 h-4" />
               {language === 'de' ? 'Kontakt speichern' : (isEnglish ? 'Save Contact' : 'Uložit kontakt')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
