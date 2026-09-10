import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Smartphone, Monitor, Share, Wifi, Zap, Bell } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallContent = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) setIsInstalled(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => setIsInstalled(true);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen pt-20">
      <SEOHead
         title={en ? 'Install the FastMedia.Pro app on your phone or desktop' : 'Nainstalujte si aplikaci FastMedia.Pro do telefonu nebo počítače'}
         description={en ? 'Add FastMedia.Pro to your home screen or desktop as a Progressive Web App.' : 'Přidejte si FastMedia.Pro na domovskou obrazovku nebo plochu jako progresivní webovou aplikaci.'}
        canonical="/install"
      />
      <Navbar />
      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 mx-auto">
            <Smartphone className="w-10 h-10 text-accent" />
          </div>

          <h1 className="font-display text-4xl font-bold text-foreground">
             {en ? 'Install the FastMedia.Pro app' : 'Nainstalujte si aplikaci FastMedia.Pro'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             {en ? 'Add FastMedia.Pro to your home screen or desktop in one tap. It works as a Progressive Web App with fast loading and offline access, without an app-store account.' : 'Přidejte si FastMedia.Pro jedním klepnutím na domovskou obrazovku nebo plochu. Funguje jako progresivní webová aplikace s rychlým načítáním a přístupem offline, bez účtu v obchodě s aplikacemi.'}
          </p>

          {isInstalled ? (
            <div className="flex items-center justify-center gap-3 text-accent">
              <CheckCircle className="w-6 h-6" />
               <span className="text-lg font-semibold">{en ? 'The app is installed on this device.' : 'Aplikace je v tomto zařízení nainstalována.'}</span>
            </div>
          ) : deferredPrompt ? (
            <Button
              onClick={handleInstall}
              size="lg"
              className="gradient-accent text-accent-foreground font-semibold shadow-glow text-lg px-8"
            >
              <Download className="w-5 h-5 mr-2" />
               {en ? 'Install the app' : 'Nainstalovat aplikaci'}
            </Button>
          ) : isIOS ? (
            <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Share className="w-5 h-5 text-accent" />
                 {en ? 'Install on iPhone or iPad' : 'Instalace na iPhone nebo iPad'}
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                 <li>{en ? 'Open this page in Safari.' : 'Otevřete tuto stránku v Safari.'}</li>
                 <li>{en ? 'Tap the Share icon in the bottom toolbar.' : 'Klepněte na ikonu Sdílet ve spodní liště.'}</li>
                 <li>{en ? 'Choose Add to Home Screen.' : 'Zvolte Přidat na plochu.'}</li>
                 <li>{en ? 'Confirm the name and tap Add.' : 'Potvrďte název a klepněte na Přidat.'}</li>
              </ol>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Monitor className="w-5 h-5 text-accent" />
                 {en ? 'Install on Android, Windows or macOS' : 'Instalace na Android, Windows nebo macOS'}
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                 <li>{en ? 'Open this page in Chrome, Edge or Brave.' : 'Otevřete tuto stránku v Chrome, Edge nebo Brave.'}</li>
                 <li>{en ? 'Use the install icon in the address bar or choose Install app in the browser menu.' : 'Použijte ikonu instalace v adresním řádku nebo v nabídce prohlížeče zvolte Nainstalovat aplikaci.'}</li>
                 <li>{en ? 'Confirm adding FastMedia.Pro to your home screen or desktop.' : 'Potvrďte přidání FastMedia.Pro na domovskou obrazovku nebo plochu.'}</li>
              </ol>
            </div>
          )}

          <section className="text-left space-y-4 pt-8">
            <h2 className="font-display text-2xl font-bold text-foreground">
               {en ? 'Why install FastMedia.Pro as an app?' : 'Proč si FastMedia.Pro nainstalovat jako aplikaci?'}
            </h2>
            <p className="text-muted-foreground">
              FastMedia.Pro is a Progressive Web App (PWA). That means you install it straight from
              your browser — no App Store or Play Store account needed, no download queue, no
              tracking permissions. The app itself weighs less than a megabyte and updates
              automatically in the background whenever we ship improvements, so you never have to
              reinstall or fiddle with app-store approvals.
            </p>
            <p className="text-muted-foreground">
              Once installed, FastMedia.Pro launches from your home screen or desktop in its own
              window, hiding the browser's address bar for a full-screen, native feel. Your saved
              demos, in-progress quotes and dashboard load instantly because the app shell is
              cached on your device, and core pages continue to work when your connection drops —
              handy when you're on a client site with poor reception.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              { icon: Zap, title: 'Instant loading', desc: 'App shell cached on your device — opens in under a second.' },
              { icon: Wifi, title: 'Works offline', desc: 'Read saved demos and quotes without a connection.' },
              { icon: Bell, title: 'Always up to date', desc: 'Silent background updates — no manual reinstall.' },
            ].map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-lg p-4 text-left">
                <f.icon className="w-6 h-6 text-accent mb-2" />
                <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </div>
            ))}
          </div>

          <section className="text-left space-y-4 pt-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground">Does installing use my mobile data?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No. The app shell weighs about 900 kB and is cached locally; day-to-day use only
                  fetches the small amount of data required for the specific page you open.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground">Can I uninstall it later?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Yes — remove it exactly like any other app. Long-press the icon on iOS or Android
                  and choose Remove/Uninstall, or right-click the desktop icon and choose Uninstall.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground">What if the install button doesn't appear?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Some browsers (Firefox on iOS, in-app browsers inside Instagram or Facebook)
                  don't support PWA install. Open the page in Safari, Chrome, Edge or Brave and try
                  again, or email <a className="text-accent underline" href="mailto:support@fastmedia.pro">support@fastmedia.pro</a> and we'll walk you through it.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Install = () => <InstallContent />;

export default Install;
