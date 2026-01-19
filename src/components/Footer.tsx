import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">F</span>
            </div>
            <span className="font-display font-bold text-lg">
              Fast<span className="text-accent">Media</span>.Pro
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-background/70">
            <a href="#" className="hover:text-background transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="hover:text-background transition-colors">
              {t('footer.terms')}
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-background/70">
            © 2024 FastMedia.Pro. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
