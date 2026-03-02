import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, Share2, Download, MessageCircle, Contact } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import logo from '@/assets/logo.jpeg';

const Navbar = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks: { href: string; label: string; isRoute?: boolean; mobileOnly?: boolean }[] = [
    { href: '#demos', label: t('nav.demos') },
    { href: '#services', label: t('nav.services') },
    { href: '#reviews', label: t('nav.reviews') },
    { href: '#pricing', label: t('nav.pricing') },
    { href: '#faq', label: t('nav.faq') },
    { href: '/blog', label: 'Blog', isRoute: true },
    { href: '/consultant/tereza', label: t('nav.consultant'), isRoute: true },
    { href: '/calculator', label: t('nav.calculator'), isRoute: true },
    { href: '#contact', label: t('nav.contact') },
    { href: '/install', label: t('nav.install'), isRoute: true, mobileOnly: true },
    { href: '/admin/login', label: t('nav.admin'), isRoute: true },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto px-3 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img src={logo} alt="FastMedia.Pro" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shadow-glow" />
            <span className="font-display font-bold text-lg sm:text-xl text-foreground">
              Fast<span className="text-accent">Media</span>.Pro
            </span>
          </Link>

          {/* Quick contact actions - desktop only */}
          <div className="hidden lg:flex items-center gap-1.5 ml-8 mr-4 shrink-0">
            <a
              href="https://wa.me/4407926400060"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-colors"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <MessageCircle className="w-4.5 h-4.5" />
            </a>
            <a
              href="/tim-knott.vcf"
              download="tim-knott.vcf"
              className="p-2 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
              aria-label="Save Contact"
              title="Save Contact"
            >
              <Contact className="w-4.5 h-4.5" />
            </a>
          </div>

          {/* Separator */}
          <div className="hidden lg:block w-px h-8 bg-border/60 mr-6 shrink-0" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.filter(l => !l.mobileOnly).map((link) =>
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
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 ml-auto">
            <LanguageSwitcher />

            {/* CTA Button - hidden on mobile, visible sm+ desktop */}
            <a href="#contact" className="hidden sm:block">
              <Button className="gradient-accent text-accent-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity">
                {t('nav.book')}
              </Button>
            </a>

            {/* Mobile Menu Toggle - always visible on mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground shrink-0"
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
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block py-2 font-medium hover:text-accent transition-colors ${link.mobileOnly ? 'text-accent flex items-center gap-2' : 'text-foreground'}`}
                  >
                    {link.mobileOnly && <Download className="w-4 h-4" />}
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

              {/* Quick actions row */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <a
                  href="https://wa.me/4407926400060"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-foreground font-medium hover:text-green-500 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <a
                  href="/tim-knott.vcf"
                  download="tim-knott.vcf"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-foreground font-medium hover:text-accent transition-colors"
                >
                  <Contact className="w-4 h-4" />
                  Save Contact
                </a>
                {'share' in navigator && (
                  <button
                    onClick={() => {
                      navigator.share({ title: document.title, url: window.location.href }).catch(() => {});
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 py-2 text-foreground font-medium hover:text-accent transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                )}
              </div>

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
