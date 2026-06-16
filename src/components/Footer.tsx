import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useA11y } from '@/contexts/A11yContext';
import { MessageCircle, Contact, Accessibility } from 'lucide-react';
import logo from '@/assets/logo.jpeg';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';
import LearnMoreModal from '@/components/LearnMoreModal';

const Footer = () => {
  const { t } = useLanguage();
  const { setOpen } = useA11y();
  const { getContent, invalidate } = useSiteContent();

  const siteLinks = [
    { href: '/#demos', label: t('nav.demos') },
    { href: '/#services', label: t('nav.services') },
    { href: '/#reviews', label: t('nav.reviews') },
    { href: '/#pricing', label: t('nav.pricing') },
    { href: '/#faq', label: t('nav.faq') },
    { href: '/#contact', label: t('nav.contact') },
  ];

  const pageLinks = [
    { href: '/blog', label: 'Blog' },
    { href: '/consultant/tereza', label: t('nav.consultant') },
    { href: '/calculator', label: t('nav.calculator') },
    { href: '/inquiry', label: t('nav.inquiry') },
    { href: '/install', label: t('nav.install') },
  ];

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="FastMedia.Pro" className="w-8 h-8 rounded-lg object-cover" />
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
                    to={link.href}
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
                title="Accessibility & Compliance"
                explanation="FastMedia.Pro is committed to accessibility (WCAG 2.1 AA), GDPR compliance, and transparent data handling across all our websites."
                benefits={['WCAG 2.1 AA accessible', 'GDPR compliant data handling', 'Multi-language support (CS/EN/DE)']}
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
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/gdpr" className="text-sm text-background/60 hover:text-accent transition-colors">
                  GDPR
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy-policy?region=us" className="text-sm text-background/60 hover:text-accent transition-colors">
                  US Privacy Notice
                </Link>
              </li>
              <li>
                <Link to="/legal/dpa" className="text-sm text-background/60 hover:text-accent transition-colors">
                  Data Processing Agreement
                </Link>
              </li>
              <li>
                <Link to="/legal/acceptable-use" className="text-sm text-background/60 hover:text-accent transition-colors">
                  Acceptable Use
                </Link>
              </li>
              <li>
                <Link to="/legal/refund-policy" className="text-sm text-background/60 hover:text-accent transition-colors">
                  Refunds &amp; Cancellation
                </Link>
              </li>
              <li>
                <Link to="/legal/imprint" className="text-sm text-background/60 hover:text-accent transition-colors">
                  Imprint
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} FastMedia.Pro. {t('footer.rights')}.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm text-background/60 hover:text-accent transition-colors"
            >
              <Accessibility className="w-4 h-4" />
              Accessibility
            </button>
            <span className="text-background/20">|</span>
            <a
              href="https://wa.me/4407926400060"
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
              Save Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
