import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink } from 'lucide-react';
import { HelpLabel, HowToUse, InfoTip } from '@/components/admin/AdminHelp';
import { QUOTE_ROLES, formatMoney } from '@/lib/quoteForm';

/**
 * Admin rate card for the public /quote-assessment tool (/admin/quote-settings).
 * Rates, contingency and margin stay server-side: the public tool only ever sees
 * the final price range, hours and cited benchmarks — never the walk-away floor,
 * contingency, margin or hourly rates.
 */

interface BenchRow {
  id: string; country: string; label: string; kind: string; unit: string;
  currency: string; low_cents: number | null; high_cents: number | null;
  url: string; date: string; period: string | null; source: string | null; note: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  web_developer: 'Web developer',
  designer: 'Designer',
  integration_specialist: 'Integration specialist',
  qa: 'QA / testing',
};

export default function AdminQuoteSettings() {
  const [currency, setCurrency] = useState('CZK');
  const [rates, setRates] = useState<Record<string, string>>({});
  const [contingency, setContingency] = useState('15');
  const [margin, setMargin] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchRow[]>([]);

  useEffect(() => {
    void (async () => {
      const [card, bms] = await Promise.all([
        supabase.from('quote_rate_card').select('*').eq('id', 1).maybeSingle(),
        supabase.from('quote_benchmarks').select('*').order('country'),
      ]);
      if (card.data) {
        const r = card.data as any;
        setCurrency(r.currency ?? 'CZK');
        setRates(Object.fromEntries(QUOTE_ROLES.map((role) => [role, r.rates?.[role] != null ? String((r.rates[role] as number) / 100) : ''])));
        setContingency(String(r.contingency_pct ?? 15));
        setMargin(r.margin_pct == null ? '' : String(r.margin_pct));
      }
      setBenchmarks((bms.data as BenchRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true); setMessage(null);
    try {
      const rateCents = Object.fromEntries(
        QUOTE_ROLES.map((role) => [role, Math.round((Number(String(rates[role] ?? '').replace(',', '.')) || 0) * 100)]),
      );
      const { data, error } = await supabase.rpc('quote_save_rate_card', {
        _rates: rateCents,
        _currency: currency.trim().toUpperCase() || 'CZK',
        _contingency_pct: Number(contingency) || 0,
        _margin_pct: margin.trim() === '' ? null : Number(margin),
      });
      if (error) throw error;
      setMessage(`Saved · updated ${(data as any)?.updated_at ? new Date((data as any).updated_at).toLocaleString() : ''}`);
    } catch (e: any) {
      setMessage(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Public quote rate card</h1>
        <p className="text-sm text-muted-foreground">
          Internal pricing for the public /quote-assessment tool. Customers and resellers never see these figures.
        </p>
      </div>

      <HowToUse toolKey="quote-settings">
        <ul className="list-disc space-y-1 pl-5">
          <li>Enter your hourly rate per role in whole currency units (e.g. 900 for 900 CZK/h). Leave blank to keep a role unavailable.</li>
          <li>The public tool only outputs the final price range, hours and cited benchmarks — the hourly rates, contingency, margin and walk-away floor stay on the server.</li>
          <li>Prices appear to visitors only when every role used by a quote has a rate AND a target margin % is set.</li>
          <li>Each visitor gets 100 free assessments; one credit is spent per complete assessment (incomplete ones are free).</li>
          <li>Benchmarks below are maintained centrally from cited public sources and cannot be edited here.</li>
        </ul>
      </HowToUse>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate card</CardTitle>
          <InfoTip label="Rate card" text="Hourly rates are FastMedia's own assumptions, in the rate-card currency, stored in cents." />
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading…</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <HelpLabel htmlFor="qs-currency" help="ISO currency code used for all rate-card amounts and the public output, e.g. CZK or EUR.">Currency</HelpLabel>
                  <Input id="qs-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3} />
                </div>
                <div className="space-y-1">
                  <HelpLabel htmlFor="qs-contingency" help="Percentage added on top of cost to absorb uncertainty. Hidden from the public output.">Contingency %</HelpLabel>
                  <Input id="qs-contingency" inputMode="numeric" value={contingency} onChange={(e) => setContingency(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <HelpLabel htmlFor="qs-margin" help="Target margin % applied to the walk-away floor to produce the recommended price. Required for the public tool to output prices.">Target margin %</HelpLabel>
                  <Input id="qs-margin" inputMode="numeric" value={margin} onChange={(e) => setMargin(e.target.value)} placeholder="required" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {QUOTE_ROLES.map((role) => {
                  const roleLabelText = `${ROLE_LABELS[role]} rate (${currency}/h)`;
                  return (
                    <div key={role} className="space-y-1">
                      <HelpLabel htmlFor={`qs-rate-${role}`} help={`Internal hourly rate for ${ROLE_LABELS[role]} in ${currency}, stored in cents and never shown publicly.`}>
                        {roleLabelText}
                      </HelpLabel>
                      <Input
                        id={`qs-rate-${role}`}
                        inputMode="decimal"
                        value={rates[role] ?? ''}
                        onChange={(e) => setRates((r) => ({ ...r, [role]: e.target.value }))}
                        placeholder="not configured"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Save rate card
                </Button>
                {message && <p className="text-sm text-muted-foreground">{message}</p>}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Public market benchmarks (cited sources)</CardTitle></CardHeader>
        <CardContent>
          {benchmarks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No benchmarks stored yet.</p>
          ) : (
            <ul className="space-y-3">
              {benchmarks.map((b) => {
                const contextOnly = b.kind === 'salary_derived' || b.unit === 'month';
                return (
                  <li key={b.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{b.country}</Badge>
                      <span className="font-medium">{b.label}</span>
                      {contextOnly ? <Badge variant="outline">Context only</Badge> : null}
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {b.unit === 'day'
                        ? `${formatMoney(b.low_cents, b.currency, 'en')}–${formatMoney(b.high_cents, b.currency, 'en')}/day`
                        : `${formatMoney(b.low_cents, b.currency, 'en')}–${formatMoney(b.high_cents, b.currency, 'en')}/${b.unit}`}
                      {' · '}{b.period ?? ''}{b.date ? ` · published ${b.date}` : ''}{b.source ? ` · ${b.source}` : ''}
                    </p>
                    {b.note ? <p className="mt-1 text-muted-foreground">{b.note}</p> : null}
                    <a className="mt-1 inline-flex items-center gap-1 text-primary underline" href={b.url} target="_blank" rel="noopener noreferrer">
                      {b.url}<ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
