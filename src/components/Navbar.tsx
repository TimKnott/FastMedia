import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import logo from '@/assets/logo.jpeg';

const Navbar = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '#demos', label: t('nav.demos') },
    { href: '#services', label: t('nav.services') },
    { href: '#reviews', label: t('nav.reviews') },
    { href: '#pricing', label: t('nav.pricing') },
    { href: '#faq', label: t('nav.faq') },
    { href: '/blog', label: 'Blog', isRoute: true },
    { href: '/consultant/jitka', label: t('nav.consultant'), isRoute: true },
    { href: '/calculator', label: t('nav.calculator'), isRoute: true },
    { href: '#contact', label: t('nav.contact') },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group mr-8 lg:mr-12 shrink-0">
            <img src={logo} alt="FastMedia.Pro" className="w-10 h-10 rounded-lg object-cover shadow-glow" />
            <span className="font-display font-bold text-xl text-foreground">
              Fast<span className="text-accent">Media</span>.Pro
            </span>
          </Link>

          {/* Separator */}
          <div className="hidden lg:block w-px h-8 bg-border/60 mr-6 shrink-0" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                </a>
              )
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 ml-auto pl-6">
            <LanguageSwitcher />

            {/* CTA Button */}
            <a href="#contact" className="hidden sm:block">
              <Button className="gradient-accent text-accent-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity">
                {t('nav.book')}
              </Button>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-2 text-foreground font-medium hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-2 text-foreground font-medium hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
              <a href="#contact" onClick={() => setIsOpen(false)}>
                <Button className="w-full gradient-accent text-accent-foreground font-semibold">
                  {t('nav.book')}
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
