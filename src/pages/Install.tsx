import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Smartphone, Monitor, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallContent = () => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
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
      <Navbar />
      <main className="container mx-auto px-6 py-16 max-w-2xl">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 mx-auto">
            <Smartphone className="w-10 h-10 text-accent" />
          </div>

          <h1 className="font-display text-4xl font-bold text-foreground">
            Nainstalujte si FastMedia.Pro
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Přidejte si aplikaci na domovskou obrazovku pro rychlý přístup — funguje offline a načítá se bleskově.
          </p>

          {isInstalled ? (
            <div className="flex items-center justify-center gap-3 text-accent">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-semibold">Aplikace je nainstalována!</span>
            </div>
          ) : deferredPrompt ? (
            <Button
              onClick={handleInstall}
              size="lg"
              className="gradient-accent text-accent-foreground font-semibold shadow-glow text-lg px-8"
            >
              <Download className="w-5 h-5 mr-2" />
              Nainstalovat aplikaci
            </Button>
          ) : isIOS ? (
            <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Share className="w-5 h-5 text-accent" />
                Instalace na iPhone / iPad
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Klepněte na ikonu <strong>Sdílet</strong> (čtvereček se šipkou nahoru)</li>
                <li>Posuňte menu dolů a vyberte <strong>Přidat na plochu</strong></li>
                <li>Potvrďte klepnutím na <strong>Přidat</strong></li>
              </ol>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Monitor className="w-5 h-5 text-accent" />
                Jak nainstalovat
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Otevřete tuto stránku v <strong>Chrome</strong> nebo <strong>Edge</strong></li>
                <li>Klikněte na ikonu instalace v adresním řádku (nebo menu → Nainstalovat aplikaci)</li>
                <li>Potvrďte instalaci</li>
              </ol>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            {[
              { icon: '⚡', title: 'Bleskové načítání', desc: 'Funguje i offline' },
              { icon: '📱', title: 'Jako nativní appka', desc: 'Na domovské obrazovce' },
              { icon: '🔔', title: 'Vždy aktuální', desc: 'Automatické aktualizace' },
            ].map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h4 className="font-semibold text-foreground text-sm">{f.title}</h4>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Install = () => (
  <LanguageProvider>
    <InstallContent />
  </LanguageProvider>
);

export default Install;
