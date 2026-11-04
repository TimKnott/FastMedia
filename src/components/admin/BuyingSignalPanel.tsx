import { analyseProspect, OFFER_LABEL } from '@/lib/buyingSignals';
import { Badge } from '@/components/ui/badge';

type Props = { prospect: { website?: string | null; notes?: string | null; research?: unknown } };

export function SignalBreakdown({ result }: { result: ReturnType<typeof analyseProspect>['result'] }) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-foreground">{result.confidence === 'not_assessed' ? 'Not assessed' : `${result.score}/100`}</span>
        <Badge variant="outline">Confidence: {result.confidence.replace('_', ' ')}</Badge>
        <Badge variant={result.intent === 'explicit_request' ? 'default' : 'secondary'}>
          {result.intent === 'explicit_request' ? 'Public request (not a guaranteed sale)' : result.intent === 'inferred_need' ? 'Hypothesis — inferred need' : 'No signal'}
        </Badge>
      </div>
      {result.breakdown.map((b) => (
        <p key={b.label} className="break-words">
          <span className={b.observed ? 'text-foreground' : 'italic'}>{b.observed ? 'Observed' : 'Hypothesis'}: {b.label}</span>{' '}
          (+{b.points}, {b.reason})
          {b.sourceUrl && (<> · <a className="text-primary underline" href={b.sourceUrl} target="_blank" rel="noopener noreferrer">source</a></>)}
        </p>
      ))}
      {!!result.offers.length && <p>Fit: {result.offers.map((o) => OFFER_LABEL[o]).join(', ')}</p>}
      {result.guardrails.map((g) => <p key={g} className="italic">{g}</p>)}
    </div>
  );
}

export default function BuyingSignalPanel({ prospect }: Props) {
  const { result } = analyseProspect(prospect);
  return (
    <details className="mt-2 rounded border border-border p-2 text-xs">
      <summary className="cursor-pointer text-foreground">
        Buying signals: {result.confidence === 'not_assessed' ? 'Not assessed · low confidence' : `${result.score} · ${result.confidence}`}
      </summary>
      <div className="mt-1"><SignalBreakdown result={result} /></div>
    </details>
  );
}
