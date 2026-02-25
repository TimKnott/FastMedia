import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo.jpeg';

const Footer = () => {
  const { t } = useLanguage();

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
    { href: '/consultant/jitka', label: t('nav.consultant') },
    { href: '/calculator', label: t('nav.calculator') },
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
            <p className="text-sm text-background/60 leading-relaxed">
              {t('hero.subtitle')}
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
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-background/80 mb-4">
              {t('footer.terms')}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-background/60 hover:text-accent transition-colors">
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-background/60 hover:text-accent transition-colors">
                  {t('footer.terms')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-background/10 text-center">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} FastMedia.Pro. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
