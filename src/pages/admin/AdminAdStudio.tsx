import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Download, Copy, Link2, ShieldCheck, Phone, Sparkles, Loader2, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PRICING as P } from '@/lib/offerPricing';

interface AdFormat { id: string; label: string; w: number; h: number }
interface Platform { id: string; name: string; formats: AdFormat[]; note: string }

const platforms: Platform[] = [
  { id: 'facebook', name: 'Facebook', note: 'Feed 1:1 and Stories 9:16. Primary text up to 125 characters.', formats: [{ id: 'sq', label: 'Feed 1080×1080', w: 1080, h: 1080 }, { id: 'story', label: 'Story 1080×1920', w: 1080, h: 1920 }] },
  { id: 'instagram', name: 'Instagram', note: 'Feed 4:5 and Reels/Stories 9:16.', formats: [{ id: 'portrait', label: 'Feed 1080×1350', w: 1080, h: 1350 }, { id: 'story', label: 'Reel 1080×1920', w: 1080, h: 1920 }] },
  { id: 'tiktok', name: 'TikTok', note: 'Vertical 9:16 only. Keep the key text in the middle area.', formats: [{ id: 'story', label: 'In-feed 1080×1920', w: 1080, h: 1920 }] },
  { id: 'linkedin', name: 'LinkedIn', note: 'Single image landscape and square.', formats: [{ id: 'land', label: 'Landscape 1200×627', w: 1200, h: 627 }, { id: 'sq', label: 'Square 1200×1200', w: 1200, h: 1200 }] },
  { id: 'google', name: 'Google Display', note: 'Upload as responsive display images plus classic banner sizes.', formats: [{ id: 'mrec', label: '300×250', w: 300, h: 250 }, { id: 'leader', label: '728×90', w: 728, h: 90 }, { id: 'sky', label: '160×600', w: 160, h: 600 }, { id: 'land', label: '1200×628', w: 1200, h: 628 }] },
  { id: 'sklik', name: 'Seznam Sklik', note: 'Kombinovaná reklama sizes for the Czech Seznam network.', formats: [{ id: 'sq', label: '300×300', w: 300, h: 300 }, { id: 'wide', label: '480×300', w: 480, h: 300 }, { id: 'half', label: '300×600', w: 300, h: 600 }] },
  { id: 'pinterest', name: 'Pinterest', note: 'Standard pin 2:3.', formats: [{ id: 'pin', label: 'Pin 1000×1500', w: 1000, h: 1500 }] },
];

interface AdCopy { slug: string; kicker: string; headline: string; price: string; sub: string; cta: string; primary: string; theme: 'primary' | 'accent' | 'dark' }

const ads: AdCopy[] = [
  { slug: 'own_6900', kicker: 'Web pro řemeslníky', headline: 'Hotový web za', price: P.ownPrice, sub: '1. rok hostingu a .cz domény v ceně', cta: 'Chci web', primary: `Kompletní web pro vaši živnost za ${P.ownPrice}. Hosting i doména na první rok zdarma, 30denní garance vrácení peněz.`, theme: 'primary' },
  { slug: 'zero_upfront', kicker: '0 Kč předem', headline: 'Web jako služba', price: `${P.subMonthly}/měs.`, sub: 'Hosting, doména i úpravy v ceně', cta: 'Začít za 0 Kč', primary: `Žádná vstupní investice. Web, hosting, doména a 45 minut úprav měsíčně za ${P.subMonthly} měsíčně.`, theme: 'accent' },
  { slug: 'guarantee', kicker: '30 dní garance', headline: 'Nelíbí se? Vrátíme peníze.', price: P.ownPrice, sub: 'Web i doména jsou 100 % vaše', cta: 'Zjistit víc', primary: 'Pokud nebudete do 30 dnů spokojeni, vrátíme vám peníze. Web i doména jsou od prvního dne vaše.', theme: 'dark' },
  { slug: 'plumber', kicker: 'Instalatéři a topenáři', headline: 'Víc zakázek z vašeho okresu', price: P.ownPrice, sub: 'Tlačítko pro zavolání na mobilu', cta: 'Ukázka webu', primary: `Instalatéři: profesionální web, který zákazníkům z okolí umožní zavolat jedním dotykem. ${P.ownPrice}.`, theme: 'primary' },
  { slug: 'electrician', kicker: 'Elektrikáři', headline: 'Na Google a Firmy.cz do 10 dnů', price: P.ownPrice, sub: 'Zápis do Google Map v ceně', cta: 'Chci web', primary: `Elektrikáři: web se zápisem do Google Map a Firmy.cz za ${P.ownPrice}. Spuštění do 10 pracovních dnů.`, theme: 'accent' },
  { slug: 'autorepair', kicker: 'Autoservisy', headline: 'Služby, ceny a volání na jednom místě', price: P.ownPrice, sub: 'Rychlý web pro mobil', cta: 'Ukázka webu', primary: `Autoservisy a pneuservisy: přehledný web s okamžitým voláním za ${P.ownPrice}.`, theme: 'dark' },
  { slug: 'salon', kicker: 'Salony a kosmetika', headline: 'Ukažte svou práci', price: `${P.subMonthly}/měs.`, sub: 'Galerie, ceník a WhatsApp', cta: 'Začít za 0 Kč', primary: `Kadeřnictví a kosmetika: moderní web s galerií a ceníkem za 0 Kč předem a ${P.subMonthly} měsíčně.`, theme: 'primary' },
  { slug: 'calculator', kicker: 'Větší projekt?', headline: 'E-shop, rezervace, více stránek', price: `od ${P.customFrom}`, sub: 'Spočítejte si cenu online', cta: 'Kalkulačka', primary: `Potřebujete e-shop, online rezervace nebo vícestránkový web? Cenu si spočítáte za 2 minuty. Od ${P.customFrom}.`, theme: 'accent' },
  { slug: 'compare', kicker: 'Proč přeplácet?', headline: 'Profesionální web bez agenturních cen', price: P.ownPrice, sub: 'Jasná cena, žádné skryté poplatky', cta: 'Zobrazit cenu', primary: `Profesionální web nemusí stát desítky tisíc. Kompletní web za ${P.ownPrice} včetně prvního roku provozu.`, theme: 'dark' },
  { slug: 'renewal', kicker: 'Férově i po 1. roce', headline: 'Provoz od 2. roku', price: `${P.renewalYear}/rok`, sub: 'Hosting, doména, SSL a zálohy', cta: 'Zjistit víc', primary: `Žádná překvapení: od druhého roku jen ${P.renewalYear} ročně za hosting, doménu, SSL a zálohy. Bez vázanosti.`, theme: 'primary' },
];

const themeBg: Record<AdCopy['theme'], string> = {
  primary: 'bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground',
  accent: 'bg-gradient-to-br from-accent via-accent to-primary text-accent-foreground',
  dark: 'bg-gradient-to-br from-background via-card to-primary text-foreground',
};

const utm = (platform: string, slug: string) =>
  `${P.offerUrl}?utm_source=${platform}&utm_medium=paid&utm_campaign=${slug}`;

function AdCanvas({ ad, f }: { ad: AdCopy; f: AdFormat }) {
  const unit = Math.min(f.w, f.h) / 100; // px per 1% of shortest side
  const wide = f.w / f.h > 3;
  const s = (n: number) => `${n * unit}px`;
  return (
    <div className={`relative overflow-hidden flex ${wide ? 'flex-row items-center justify-between' : 'flex-col justify-between'} ${themeBg[ad.theme]}`}
      style={{ width: f.w, height: f.h, padding: s(wide ? 10 : 7), fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
      <div className="absolute rounded-full bg-accent/30 blur-3xl" style={{ width: s(70), height: s(70), right: s(-20), top: s(-20) }} />
      <div className="relative" style={{ fontSize: s(wide ? 22 : 5), fontWeight: 700, letterSpacing: '0.02em' }}>
        FastMedia<span className="opacity-70">.Pro</span>
      </div>
      <div className="relative" style={{ maxWidth: wide ? '55%' : '100%' }}>
        {!wide && <div className="inline-block rounded-full bg-background/20" style={{ fontSize: s(4), padding: `${s(1.2)} ${s(3)}`, marginBottom: s(3), fontWeight: 600 }}>{ad.kicker}</div>}
        <div style={{ fontSize: s(wide ? 22 : 8), lineHeight: 1.05, fontWeight: 700 }}>{ad.headline}</div>
        <div style={{ fontSize: s(wide ? 34 : 15), lineHeight: 1, fontWeight: 800, marginTop: s(wide ? 2 : 2) }}>{ad.price}</div>
        {!wide && <div style={{ fontSize: s(4.4), marginTop: s(3), opacity: 0.9 }}>{ad.sub}</div>}
      </div>
      <div className={`relative flex items-center ${wide ? 'gap-4' : 'justify-between'}`} style={{ gap: s(3) }}>
        <span className="rounded-full bg-background text-foreground" style={{ fontSize: s(wide ? 18 : 4.6), padding: `${s(wide ? 6 : 2.2)} ${s(wide ? 14 : 5)}`, fontWeight: 700 }}>{ad.cta} →</span>
        {!wide && <span className="flex items-center opacity-90" style={{ fontSize: s(3.6), gap: s(1) }}><ShieldCheck style={{ width: s(4.5), height: s(4.5) }} />30 dní garance</span>}
      </div>
    </div>
  );
}

function AdTile({ ad, f, platform }: { ad: AdCopy; f: AdFormat; platform: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const boxW = 300;
  const scale = Math.min(boxW / f.w, 360 / f.h);

  const download = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      const url = await toPng(ref.current, { width: f.w, height: f.h, pixelRatio: 1, cacheBust: true });
      const a = document.createElement('a');
      a.href = url; a.download = `fastmedia-${platform}-${ad.slug}-${f.w}x${f.h}.png`; a.click();
    } catch { toast.error('Could not create the image. Try again.'); }
    finally { setBusy(false); }
  };
  const copy = (txt: string, what: string) => navigator.clipboard.writeText(txt).then(() => toast.success(`${what} copied`));

  return (
    <Card className="border-border/60">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-center rounded-lg bg-muted/50 overflow-hidden" style={{ height: f.h * scale + 8 }}>
          <div style={{ width: f.w * scale, height: f.h * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: f.w, height: f.h }}>
              <div ref={ref}><AdCanvas ad={ad} f={f} /></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{f.label}</Badge>
          <span className="text-xs text-muted-foreground truncate">{ad.slug}</span>
        </div>
        <p className="text-sm">{ad.primary}</p>
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" onClick={download} disabled={busy}><Download className="w-4 h-4" />PNG</Button>
          <Button size="sm" variant="outline" onClick={() => copy(`${ad.headline} ${ad.price}\n\n${ad.primary}\n\nCTA: ${ad.cta}`, 'Ad text')}><Copy className="w-4 h-4" />Text</Button>
          <Button size="sm" variant="outline" onClick={() => copy(utm(platform, ad.slug), 'Link')}><Link2 className="w-4 h-4" />Link</Button>
        </div>
      </CardContent>
    </Card>
  );
}

type GenAd = AdCopy & { hashtags?: string; image_prompt?: string };
interface SavedRow { id: string; platform: string; ad: GenAd }

function AiGenerator() {
  const [platform, setPlatform] = useState('facebook');
  const [audience, setAudience] = useState('Instalatéři a topenáři');
  const [offer, setOffer] = useState('starter 6 900 Kč');
  const [tone, setTone] = useState('direct');
  const [angle, setAngle] = useState('');
  const [count, setCount] = useState(3);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<GenAd[]>([]);
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const fmt = (platforms.find((p) => p.id === platform) ?? platforms[0]).formats[0];

  const loadSaved = async () => {
    const { data } = await supabase.from('saved_ads' as never).select('id, platform, ad').order('created_at', { ascending: false }).limit(60);
    setSaved((data as unknown as SavedRow[]) ?? []);
  };
  useEffect(() => { loadSaved(); }, []);

  const generate = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('ad-generator', { body: { platform, audience, offer, tone, angle, count } });
      if (error || !data?.ok) {
        let msg = data?.error;
        try { msg = msg ?? (await (error as { context?: Response })?.context?.json())?.error; } catch { /* ignore */ }
        throw new Error(msg || 'Could not generate adverts.');
      }
      setResults(data.ads);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not generate adverts.'); }
    finally { setBusy(false); }
  };
  const save = async (ad: GenAd) => {
    const { error } = await supabase.from('saved_ads' as never).insert({ platform, ad } as never);
    if (error) toast.error('Could not save.'); else { toast.success('Saved to library'); loadSaved(); }
  };
  const remove = async (id: string) => { await supabase.from('saved_ads' as never).delete().eq('id', id); loadSaved(); };
  const fmtFor = (pid: string) => (platforms.find((p) => p.id === pid) ?? platforms[0]).formats[0];

  return (
    <Card className="border-primary/40">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /><h2 className="text-xl font-semibold">Create new adverts with AI</h2></div>
        <p className="text-sm text-muted-foreground">Uses AI credits (a fraction of a cent per batch), not build credits. Copy is written in Czech from your real prices only.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <label className="text-sm space-y-1"><span>Platform</span>
            <select className="w-full rounded-md border border-input bg-background p-2" value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></label>
          <label className="text-sm space-y-1"><span>Who is it for?</span>
            <input className="w-full rounded-md border border-input bg-background p-2" value={audience} onChange={(e) => setAudience(e.target.value)} /></label>
          <label className="text-sm space-y-1"><span>Offer</span>
            <select className="w-full rounded-md border border-input bg-background p-2" value={offer} onChange={(e) => setOffer(e.target.value)}>
              <option value="starter 6 900 Kč">Starter 6 900 Kč</option>
              <option value="subscription 990 Kč/month, 0 Kč upfront">990 Kč / month</option>
              <option value="bigger site via calculator from 18 900 Kč">Bigger site (calculator)</option>
              <option value="30-day money-back guarantee">30-day guarantee</option>
            </select></label>
          <label className="text-sm space-y-1"><span>Tone</span>
            <select className="w-full rounded-md border border-input bg-background p-2" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="direct">Direct and punchy</option><option value="friendly">Friendly</option>
              <option value="humorous">Light humour</option><option value="problem-solving">Problem / solution</option>
            </select></label>
          <label className="text-sm space-y-1"><span>How many?</span>
            <select className="w-full rounded-md border border-input bg-background p-2" value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[1, 3, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select></label>
          <label className="text-sm space-y-1"><span>Extra idea (optional)</span>
            <input className="w-full rounded-md border border-input bg-background p-2" placeholder="e.g. busy season, no time for marketing" value={angle} onChange={(e) => setAngle(e.target.value)} /></label>
        </div>
        <Button onClick={generate} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}{busy ? 'Writing adverts…' : 'Generate adverts'}</Button>
        {results.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map((ad, i) => (
              <div key={`${ad.slug}-${i}`} className="space-y-2">
                <AdTile ad={ad} f={fmt} platform={platform} />
                {ad.hashtags && <p className="text-xs text-muted-foreground">{ad.hashtags}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => save(ad)}><Save className="w-4 h-4" />Save</Button>
                  {ad.image_prompt && <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(ad.image_prompt!).then(() => toast.success('Image prompt copied'))}><Copy className="w-4 h-4" />Image prompt</Button>}
                </div>
              </div>
            ))}
          </div>
        )}
        {saved.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold">Saved library ({saved.length})</h3>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {saved.map((r) => (
                <div key={r.id} className="space-y-2">
                  <AdTile ad={r.ad} f={fmtFor(r.platform)} platform={r.platform} />
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" />Remove</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const AdminAdStudio = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold">Ad Studio</h1>
      <p className="text-muted-foreground">Ready adverts for every platform. Each one links to the offer page with tracking, so you can see which ad brought the enquiry.</p>
      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2"><Phone className="w-4 h-4" />Landing page: {P.offerUrl}</p>
    </div>
    <AiGenerator />
    <Tabs defaultValue="facebook">
      <TabsList className="flex flex-wrap h-auto">
        {platforms.map((p) => <TabsTrigger key={p.id} value={p.id}>{p.name}</TabsTrigger>)}
      </TabsList>
      {platforms.map((p) => (
        <TabsContent key={p.id} value={p.id} className="space-y-4">
          <p className="text-sm text-muted-foreground">{p.note} 10 adverts × {p.formats.length} size{p.formats.length > 1 ? 's' : ''}.</p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {ads.flatMap((ad) => p.formats.map((f) => <AdTile key={`${ad.slug}-${f.id}`} ad={ad} f={f} platform={p.id} />))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  </div>
);

export default AdminAdStudio;
