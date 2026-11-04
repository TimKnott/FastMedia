import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Loader2, Plus, Trash2, ExternalLink, Info, History } from 'lucide-react';
import { QUOTE_ROLES, buildQuoteInputs, parseHours, formatMoney, type QuoteLine } from '@/lib/quoteForm';

/**
 * Public/reseller commercial quote assessment (/quote-assessment).
 * Pricing is computed server-side (public.quote_run); internal costs, the walk-away
 * floor, contingency and margin are never sent to the browser. Each complete
 * assessment spends 1 of 100 starter credits; when credits run out a paywall with
 * a top-up action is shown.
 */

const TOTAL_CREDITS = 100;

const T = {
  cs: {
    title: 'Předběžná cenová kalkulace',
    subtitle: 'Zadejte rozsah práce a získejte odhad ceny založený na veřejných tržních/source datech. Pouze pro zákazníky a partnery.',
    credits: 'Zbývajících kalkulací',
    signinTitle: 'Přihlaste se a získejte 100 bezplatných kalkulací',
    email: 'E-mail', password: 'Heslo',
    signin: 'Přihlásit se', signup: 'Vytvořit účet', magic: 'Poslat přihlašovací odkaz',
    authError: 'Přihlášení se nezdařilo.',
    authNote: 'Nový účet? Zadejte e-mail a heslo a klikněte na „Vytvořit účet“. Potvrzovací e-mail najdete ve své schránce.',
    projectTitle: 'Název projektu (nepovinné)',
    role: 'Role', hours: 'Hodiny',
    addLine: 'Přidat roli', remove: 'Odebrat',
    country: 'Země zadavatele', countryCz: 'Česko', countryDe: 'Německo', countryOther: 'Jiná / neuvedeno',
    weeks: 'Termín (týdny, nepovinné)',
    run: 'Spočítat odhad', running: 'Počítám…',
    resultTitle: 'Výsledek kalkulace',
    range: 'Odhad cenového rozpětí', recommended: 'Doporučená cena', hoursTotal: 'Odhadovaný rozsah', hoursStd: 'standardní', hoursSpec: 'specialista',
    confidence: 'Spolehlivost', confMedium: 'střední', confLow: 'nízká', confInsufficient: 'nedostatečná',
    benchmarks: 'Tržní benchmarky (zdroje)', contextOnly: 'Pouze pro orientaci',
    notes: 'Poznámky', missing: 'Chybí údaje',
    disclaimer: 'Pouze odhad — není to závazná nabídka. Konečná cena po krátkém telefonátu.',
    paywallTitle: 'Bezplatné kalkulace vyčerpány',
    paywallBody: 'Využili jste všech 100 bezplatných kalkulací. Dobijte kredity a pokračujte.',
    topup: 'Dobít kredity',
    topupSoon: 'Online dobití kredity spouštíme brzy. Do té doby napište na support@fastmedia.pro a kredity vám připravíme.',
    history: 'Vaše nedávné kalkulace',
    historyEmpty: 'Zatím žádné kalkulace.',
    quoteMissing: 'Chybí: ', authRequired: 'Nejste přihlášeni.',
  },
  en: {
    title: 'Commercial quote assessment',
    subtitle: 'Describe the work and get a price estimate grounded in cited public market data. For customers and resellers.',
    credits: 'Assessments left',
    signinTitle: 'Sign in to get 100 free assessments',
    email: 'Email', password: 'Password',
    signin: 'Sign in', signup: 'Create account', magic: 'Email me a sign-in link',
    authError: 'Sign-in failed.',
    authNote: 'New here? Enter an email and password and choose "Create account". Watch your inbox for the confirmation email.',
    projectTitle: 'Project name (optional)',
    role: 'Role', hours: 'Hours',
    addLine: 'Add role', remove: 'Remove',
    country: 'Buyer country', countryCz: 'Czechia', countryDe: 'Germany', countryOther: 'Other / not stated',
    weeks: 'Deadline (weeks, optional)',
    run: 'Run assessment', running: 'Working…',
    resultTitle: 'Assessment result',
    range: 'Estimated price range', recommended: 'Recommended price', hoursTotal: 'Estimated scope', hoursStd: 'standard', hoursSpec: 'specialist',
    confidence: 'Confidence', confMedium: 'medium', confLow: 'low', confInsufficient: 'insufficient',
    benchmarks: 'Market benchmarks (sources)', contextOnly: 'Context only',
    notes: 'Notes', missing: 'Missing information',
    disclaimer: 'Estimates only — not a binding quote. Final pricing follows a short call.',
    paywallTitle: 'Free assessments used up',
    paywallBody: "You've used all 100 free assessments. Top up credits to continue.",
    topup: 'Top up credits',
    topupSoon: 'Online credit top-ups are launching soon. In the meantime, email support@fastmedia.pro and we will arrange credits for you.',
    history: 'Your recent assessments',
    historyEmpty: 'No assessments yet.',
    quoteMissing: 'Missing: ', authRequired: 'You are not signed in.',
  },
  de: {
    title: 'Vorläufige Preiskalkulation',
    subtitle: 'Geben Sie den Umfang an und erhalten Sie eine Schätzung auf Basis belegter öffentlicher Marktdaten. Für Kunden und Reseller.',
    credits: 'Verbleibende Kalkulationen',
    signinTitle: 'Melden Sie sich an und erhalten Sie 100 kostenlose Kalkulationen',
    email: 'E-Mail', password: 'Passwort',
    signin: 'Anmelden', signup: 'Konto erstellen', magic: 'Anmeldelink per E-Mail senden',
    authError: 'Anmeldung fehlgeschlagen.',
    authNote: 'Neu hier? E-Mail und Passwort eingeben und „Konto erstellen“ wählen. Bestätigungsmail im Postfach prüfen.',
    projectTitle: 'Projektname (optional)',
    role: 'Rolle', hours: 'Stunden',
    addLine: 'Rolle hinzufügen', remove: 'Entfernen',
    country: 'Land des Auftraggebers', countryCz: 'Tschechien', countryDe: 'Deutschland', countryOther: 'Andere / keine Angabe',
    weeks: 'Termin (Wochen, optional)',
    run: 'Kalkulation starten', running: 'Berechne…',
    resultTitle: 'Ergebnis der Kalkulation',
    range: 'Geschätzte Preisspanne', recommended: 'Empfohlener Preis', hoursTotal: 'Geschätzter Umfang', hoursStd: 'Standard', hoursSpec: 'Spezialist',
    confidence: 'Zuverlässigkeit', confMedium: 'mittel', confLow: 'niedrig', confInsufficient: 'unzureichend',
    benchmarks: 'Markt-Benchmarks (Quellen)', contextOnly: 'Nur zur Orientierung',
    notes: 'Hinweise', missing: 'Fehlende Angaben',
    disclaimer: 'Nur Schätzung — kein verbindliches Angebot. Endpreis nach kurzem Anruf.',
    paywallTitle: 'Kostenlose Kalkulationen aufgebraucht',
    paywallBody: 'Sie haben alle 100 kostenlosen Kalkulationen genutzt. Laden Sie Kredite auf, um fortzufahren.',
    topup: 'Kredite aufladen',
    topupSoon: 'Online-Aufladung startet bald. Bis dahin schreiben Sie an support@fastmedia.pro und wir richten Kredite für Sie ein.',
    history: 'Ihre letzten Kalkulationen',
    historyEmpty: 'Noch keine Kalkulationen.',
    quoteMissing: 'Fehlt: ', authRequired: 'Sie sind nicht angemeldet.',
  },
} as const;

const ROLE_LABELS: Record<string, Record<string, string>> = {
  web_developer: { cs: 'Webový vývojář', en: 'Web developer', de: 'Webentwickler' },
  designer: { cs: 'Designér', en: 'Designer', de: 'Designer' },
  integration_specialist: { cs: 'Specialista na integrace', en: 'Integration specialist', de: 'Integrations-Spezialist' },
  qa: { cs: 'QA / testování', en: 'QA / testing', de: 'QA / Tests' },
};

interface QuoteResult {
  ok?: boolean; reason?: string; missing?: string[]; balance?: number;
  lines?: { name?: string; role: string; hours: number; tier?: string }[];
  hours?: { total?: number; standard?: number; specialist?: number };
  competitive_cents?: number; recommended_cents?: number; premium_cents?: number;
  confidence?: string; notes?: string[]; currency?: string;
  benchmarks?: { label?: string; kind?: string; unit?: string; currency?: string; low_cents?: number; high_cents?: number; url?: string; date?: string; period?: string; source?: string; note?: string; context_only?: boolean }[];
}

const safeHttpUrl = (u?: string | null) => (u && /^https?:\/\/\S+$/.test(u) ? u : null);

export default function QuoteAssessment() {
  const { language } = useLanguage();
  const t = (T as Record<string, typeof T.cs>)[language] ?? T.cs;
  const roleLabel = (r: string) => (ROLE_LABELS[r] ? ROLE_LABELS[r][language] ?? ROLE_LABELS[r].en : r);

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showTopup, setShowTopup] = useState(false);

  const [title, setTitle] = useState('');
  const [lines, setLines] = useState<QuoteLine[]>([{ role: 'web_developer', hours: 20 }]);
  const [country, setCountry] = useState('CZ');
  const [weeks, setWeeks] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteResult | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const signedIn = !!data.session;
      setAuthed(signedIn);
      if (signedIn) void refreshStatus();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      if (session) void refreshStatus();
    });
    return () => { active = false; sub?.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshStatus = async () => {
    const { data } = await supabase.rpc('quote_status');
    if (data) {
      setBalance((data as any).balance ?? TOTAL_CREDITS);
      setHistory((data as any).assessments ?? []);
    }
  };

  const handleAuth = async (mode: 'signin' | 'signup' | 'magic') => {
    setAuthBusy(true); setAuthMsg(null);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { email_redirect_to: window.location.origin + '/quote-assessment' } });
        if (error) throw error;
        setAuthMsg(t.authNote);
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { email_redirect_to: window.location.origin + '/quote-assessment' } });
        if (error) throw error;
        setAuthMsg(t.authNote);
      }
    } catch (e: any) {
      setAuthMsg(`${t.authError} ${e?.message ?? ''}`.trim());
    } finally {
      setAuthBusy(false);
    }
  };

  const run = async () => {
    setBusy(true); setError(null);
    try {
      const inputs = { ...buildQuoteInputs(lines, country === 'OTHER' ? null : country, weeks), title: title.trim() || null };
      const { data, error: rpcError } = await supabase.rpc('quote_run', { _inputs: inputs });
      if (rpcError) { setError(rpcError.message); return; }
      const r = data as QuoteResult;
      if (r?.reason === 'auth_required') { setAuthed(false); return; }
      if (r?.reason === 'no_credits') { setBalance(0); setResult(null); return; }
      if (typeof r?.balance === 'number') setBalance(r.balance);
      setResult(r);
      void refreshStatus();
    } finally {
      setBusy(false);
    }
  };

  const confLabel = (c?: string) => (c === 'medium' ? t.confMedium : c === 'low' ? t.confLow : t.confInsufficient);
  const setLine = (i: number, patch: Partial<QuoteLine>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const money = (cents?: number | null, cur?: string | null) => formatMoney(cents ?? null, cur ?? result?.currency ?? '', language);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEOHead title={t.title} description={t.subtitle} canonical="/quote-assessment" pagePath="/quote-assessment" />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
        </header>

        {authed === false || authed === null ? (
          <Card className="mb-8">
            <CardHeader><CardTitle className="text-base">{t.signinTitle}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label htmlFor="qa-email">{t.email}</Label>
                  <Input id="qa-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="space-y-1"><Label htmlFor="qa-password">{t.password}</Label>
                  <Input id="qa-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleAuth('signin')} disabled={authBusy || !email || !password}>
                  {authBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{t.signin}
                </Button>
                <Button variant="outline" onClick={() => handleAuth('signup')} disabled={authBusy || !email || !password}>{t.signup}</Button>
                <Button variant="ghost" onClick={() => handleAuth('magic')} disabled={authBusy || !email}>{t.magic}</Button>
              </div>
              {authMsg && <p className="text-sm text-muted-foreground">{authMsg}</p>}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Credit countdown */}
            <Card className="mb-8">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.credits}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted" role="progressbar" aria-valuenow={balance ?? TOTAL_CREDITS} aria-valuemin={0} aria-valuemax={TOTAL_CREDITS}>
                    <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${Math.max(0, Math.min(100, ((balance ?? TOTAL_CREDITS) / TOTAL_CREDITS) * 100))}%` }} />
                  </div>
                </div>
                <p className="text-2xl font-bold tabular-nums">{balance ?? TOTAL_CREDITS}<span className="text-muted-foreground text-base"> / {TOTAL_CREDITS}</span></p>
              </CardContent>
            </Card>

            {balance !== null && balance <= 0 ? (
              <Card className="mb-8 border-accent/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Lock className="h-4 w-4" aria-hidden="true" />{t.paywallTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t.paywallBody}</p>
                  <Button onClick={() => setShowTopup(true)}>{t.topup}</Button>
                  {showTopup && <p className="text-sm text-muted-foreground"><Info className="mr-1 inline h-4 w-4" aria-hidden="true" />{t.topupSoon}</p>}
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-8">
                <CardHeader><CardTitle className="text-base">{t.role}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1"><Label htmlFor="qa-title">{t.projectTitle}</Label>
                    <Input id="qa-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} /></div>

                  <div className="space-y-2">
                    {lines.map((line, i) => (
                      <div key={i} className="flex flex-wrap items-end gap-2">
                        <div className="min-w-40 flex-1 space-y-1">
                          <Label htmlFor={`qa-role-${i}`}>{t.role}</Label>
                          <Select value={line.role} onValueChange={(v) => setLine(i, { role: v })}>
                            <SelectTrigger id={`qa-role-${i}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {QUOTE_ROLES.map((r) => <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-28 space-y-1">
                          <Label htmlFor={`qa-hours-${i}`}>{t.hours}</Label>
                          <Input id={`qa-hours-${i}`} inputMode="decimal" value={line.hours} onChange={(e) => setLine(i, { hours: e.target.value as unknown as number })} />
                        </div>
                        <Button variant="ghost" size="icon" aria-label={t.remove} onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))} disabled={lines.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setLines((ls) => [...ls, { role: 'designer', hours: 8 }])}>
                      <Plus className="mr-1 h-4 w-4" />{t.addLine}
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="qa-country">{t.country}</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="qa-country"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CZ">{t.countryCz}</SelectItem>
                          <SelectItem value="DE">{t.countryDe}</SelectItem>
                          <SelectItem value="OTHER">{t.countryOther}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="qa-weeks">{t.weeks}</Label>
                      <Input id="qa-weeks" inputMode="numeric" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
                    </div>
                  </div>

                  <Button onClick={run} disabled={busy || (balance ?? 1) <= 0}>
                    {busy ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />{t.running}</> : t.run}
                  </Button>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
              </Card>
            )}

            {result && (
              <Card className="mb-8">
                <CardHeader><CardTitle className="text-base">{t.resultTitle}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {result.ok ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">{t.range}</p>
                          <p className="text-lg font-semibold tabular-nums">{money(result.competitive_cents)} – {money(result.premium_cents)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.recommended}</p>
                          <p className="text-lg font-semibold tabular-nums">{money(result.recommended_cents)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.hoursTotal}</p>
                          <p className="font-medium">{result.hours?.total ?? 0} h
                            <span className="text-muted-foreground"> ({result.hours?.standard ?? 0} {t.hoursStd} / {result.hours?.specialist ?? 0} {t.hoursSpec})</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.confidence}</p>
                          <p className="font-medium">{confLabel(result.confidence)}</p>
                        </div>
                      </div>

                      {(result.benchmarks?.length ?? 0) > 0 && (
                        <div>
                          <p className="mb-2 text-sm font-medium">{t.benchmarks}</p>
                          <ul className="space-y-2">
                            {result.benchmarks!.map((b, i) => {
                              const url = safeHttpUrl(b.url);
                              return (
                                <li key={i} className="rounded-lg border border-border p-3 text-sm">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">{b.label}</span>
                                    {b.context_only ? <Badge variant="outline">{t.contextOnly}</Badge> : null}
                                  </div>
                                  <p className="mt-1 text-muted-foreground">
                                    {b.unit === 'hour' || b.unit === 'day' ? `${money(b.low_cents, b.currency)}–${money(b.high_cents, b.currency)}/h` : `${money(b.low_cents, b.currency)}–${money(b.high_cents, b.currency)}`}
                                    {b.date ? ` · ${b.date}` : ''}{b.source ? ` · ${b.source}` : ''}
                                  </p>
                                  {b.note ? <p className="mt-1 text-muted-foreground">{b.note}</p> : null}
                                  {url ? <a className="mt-1 inline-flex items-center gap-1 text-primary underline" href={url} target="_blank" rel="noopener noreferrer">{url}<ExternalLink className="h-3 w-3" /></a> : null}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {(result.notes?.length ?? 0) > 0 && (
                        <div>
                          <p className="mb-1 text-sm font-medium">{t.notes}</p>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground">
                            {result.notes!.map((n, i) => <li key={i}>{n}</li>)}
                          </ul>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{t.disclaimer}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t.quoteMissing}{(result.missing ?? []).join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><History className="h-4 w-4" aria-hidden="true" />{t.history}</CardTitle></CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.historyEmpty}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {history.map((h) => (
                      <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                        <span className="font-medium">{h.title || h.id?.slice(0, 8)}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {money(h.recommended_cents, h.currency)} · {h.hours ?? '—'} h
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
