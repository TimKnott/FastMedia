import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, Share2, Download, MessageCircle, Contact, LayoutDashboard, CreditCard, UserCircle2, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpeg';

const PAYMENTS_ENV: 'sandbox' | 'live' =
  (import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined)?.startsWith('pk_test_')
    ? 'sandbox'
    : 'live';

const Navbar = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
      setUserEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthed(!!data.session);
      setUserEmail(data.session?.user?.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const openBillingPortal = async () => {
    if (!userEmail) {
      toast.error('Sign in first to manage billing.');
      return;
    }
    setBillingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('payments-customer-portal', {
        body: {
          email: userEmail,
          return_url: `${window.location.origin}/account`,
          environment: PAYMENTS_ENV,
        },
      });
      if (error) throw error;
      const url = (data as { url?: string; error?: string })?.url;
      if (!url) throw new Error((data as { error?: string })?.error ?? 'No portal URL returned.');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not open the billing portal.';
      console.error('[Navbar billing]', e);
      toast.error(msg);
    } finally {
      setBillingLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };


  const navLinks: { href: string; label: string; isRoute?: boolean; mobileOnly?: boolean }[] = [
    { href: '#demos', label: t('nav.demos') },
    { href: '#services', label: t('nav.services') },
    { href: '#reviews', label: t('nav.reviews') },
    { href: '#pricing', label: t('nav.pricing') },
    { href: '#faq', label: t('nav.faq') },
    { href: '/blog', label: 'Blog', isRoute: true },
    { href: '/consultant/tereza', label: t('nav.consultant'), isRoute: true },
    { href: '/calculator', label: t('nav.calculator'), isRoute: true },
    { href: '/inquiry', label: t('nav.inquiry'), isRoute: true },
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

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 ml-auto">
            {/* Quick contact actions - desktop only */}
            <div className="hidden md:flex items-center gap-1.5 mr-1">
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

            {/* Website Builder shortcut — visible whenever a user is signed in */}
            {isAuthed && (
              <Link to="/admin/client-projects" className="shrink-0">
                <Button
                  size="sm"
                  className="h-9 px-3 sm:px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow border border-accent/40"
                  title="Open the Website Builder"
                >
                  <LayoutDashboard className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Builder</span>
                </Button>
              </Link>
            )}

            {/* Account / billing dropdown — signed-in users only */}
            {isAuthed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-2 sm:px-3 shrink-0"
                    title="Account"
                    aria-label="Account menu"
                  >
                    <UserCircle2 className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="truncate">
                    {userEmail ?? 'Signed in'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      void openBillingPortal();
                    }}
                    disabled={billingLoading}
                  >
                    {billingLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Manage billing
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <UserCircle2 className="w-4 h-4" />
                      Account page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); void signOut(); }}>
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <LanguageSwitcher />

            {/* CTA Button - hidden on mobile, visible sm+ */}
            <a href="#contact" className="hidden sm:block">
              <Button className="gradient-accent text-accent-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity">
                {t('nav.book')}
              </Button>
            </a>

            {/* Hamburger Menu Toggle - always visible */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground shrink-0 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle menu"
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
            className="bg-card border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {isAuthed && (
                <Link
                  to="/admin/client-projects"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-glow"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Open Website Builder
                  </span>
                  <span className="text-[10px] uppercase tracking-wide opacity-80">Signed in</span>
                </Link>
              )}
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
