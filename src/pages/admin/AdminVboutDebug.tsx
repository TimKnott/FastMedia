import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, RefreshCw, Activity, Cookie } from 'lucide-react';

type VbtHit = {
  url: string;
  startTime: number;
  duration: number;
  initiatorType: string;
  transferSize?: number;
  ts: number;
};

const COOKIE_KEY = 'fm_cookie_consent';

const getVisitorFields = () => {
  // Vbout exposes _vbset queue + _vbt runtime once script loads
  const w = window as any;
  const account = Array.isArray(w._vbset?.[0]) ? w._vbset[0][1] : undefined;
  const domain = Array.isArray(w._vbset?.[1]) ? w._vbset[1][1] : undefined;
  const cookies = document.cookie
    .split(';')
    .map(c => c.trim())
    .filter(c => /vbt|vbout|_vis/i.test(c));
  return {
    account,
    domain,
    scriptLoaded: typeof w._vbt !== 'undefined' || !!document.querySelector('script[src*="vbt.io"]'),
    visitorId: w._vbt?.visitorId ?? w._vbt?.vid ?? cookies.find(c => c.startsWith('vbt_vis'))?.split('=')[1] ?? null,
    sessionId: w._vbt?.sessionId ?? cookies.find(c => c.startsWith('vbt_ses'))?.split('=')[1] ?? null,
    consent: localStorage.getItem(COOKIE_KEY),
    userAgent: navigator.userAgent,
    referrer: document.referrer || '(direct)',
    pageUrl: window.location.href,
    language: navigator.language,
    cookies,
  };
};

const AdminVboutDebug = () => {
  const [hits, setHits] = useState<VbtHit[]>([]);
  const [visitor, setVisitor] = useState(getVisitorFields());
  const [observerActive, setObserverActive] = useState(false);

  const refreshVisitor = useCallback(() => setVisitor(getVisitorFields()), []);

  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return;

    // Backfill any hits already in the buffer
    const existing = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const initial: VbtHit[] = existing
      .filter(e => /vbt\.io|vbout/i.test(e.name))
      .map(e => ({
        url: e.name,
        startTime: e.startTime,
        duration: e.duration,
        initiatorType: e.initiatorType,
        transferSize: (e as any).transferSize,
        ts: Date.now() - (performance.now() - e.startTime),
      }));
    if (initial.length) setHits(initial);

    const observer = new PerformanceObserver(list => {
      const matches = list
        .getEntries()
        .filter(e => /vbt\.io|vbout/i.test(e.name))
        .map(e => ({
          url: e.name,
          startTime: e.startTime,
          duration: e.duration,
          initiatorType: (e as PerformanceResourceTiming).initiatorType,
          transferSize: (e as any).transferSize,
          ts: Date.now(),
        }));
      if (matches.length) {
        setHits(prev => [...matches, ...prev].slice(0, 50));
        refreshVisitor();
      }
    });

    try {
      observer.observe({ type: 'resource', buffered: true });
      setObserverActive(true);
    } catch {
      observer.observe({ entryTypes: ['resource'] });
      setObserverActive(true);
    }

    const interval = window.setInterval(refreshVisitor, 3000);
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, [refreshVisitor]);

  const consentAccepted = visitor.consent === 'accepted';
  const tracking = visitor.scriptLoaded && hits.length > 0;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold flex items-center gap-2">
            <Activity className="w-6 h-6 text-accent" />
            Vbout Tracking Debug
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live monitor of vbt.io network hits, visitor fields and consent state.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshVisitor}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </header>

      {!consentAccepted && (
        <Alert>
          <Cookie className="w-4 h-4" />
          <AlertTitle>Analytics cookies not accepted</AlertTitle>
          <AlertDescription>
            The Vbout script only loads after the visitor clicks <strong>Accept</strong> in the
            cookie banner. Current consent: <Badge variant="outline">{visitor.consent ?? 'unset'}</Badge>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Script loaded</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {visitor.scriptLoaded ? (
              <CheckCircle2 className="w-5 h-5 text-accent" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive" />
            )}
            <span className="text-sm">{visitor.scriptLoaded ? 'Yes' : 'No'}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tracker hits captured</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span className="text-2xl font-display">{hits.length}</span>
            <Badge variant={tracking ? 'default' : 'outline'}>
              {tracking ? 'Firing' : 'Idle'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Observer</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {observerActive ? (
              <CheckCircle2 className="w-5 h-5 text-accent" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive" />
            )}
            <span className="text-sm">{observerActive ? 'Listening' : 'Inactive'}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitor fields</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Account', visitor.account],
              ['Domain', visitor.domain],
              ['Visitor ID', visitor.visitorId],
              ['Session ID', visitor.sessionId],
              ['Consent', visitor.consent],
              ['Language', visitor.language],
              ['Referrer', visitor.referrer],
              ['Page URL', visitor.pageUrl],
            ].map(([k, v]) => (
              <div key={k as string} className="flex flex-col">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="font-mono break-all text-foreground">{(v as string) || '—'}</dd>
              </div>
            ))}
            <div className="sm:col-span-2 flex flex-col">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Cookies</dt>
              <dd className="font-mono break-all text-foreground">
                {visitor.cookies.length ? visitor.cookies.join('; ') : '—'}
              </dd>
            </div>
            <div className="sm:col-span-2 flex flex-col">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">User agent</dt>
              <dd className="font-mono break-all text-muted-foreground text-xs">{visitor.userAgent}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent vbt.io hits ({hits.length})</CardTitle>
          {hits.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setHits([])}>
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {hits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No requests captured yet. Accept cookies and reload, then navigate the site —
              tracker pings will appear here in real time.
            </p>
          ) : (
            <ul className="space-y-2">
              {hits.map((h, i) => (
                <li
                  key={`${h.url}-${h.startTime}-${i}`}
                  className="border border-border rounded-lg p-3 text-xs font-mono"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="outline">{h.initiatorType}</Badge>
                    <span className="text-muted-foreground">
                      {Math.round(h.duration)}ms
                    </span>
                    {h.transferSize !== undefined && (
                      <span className="text-muted-foreground">
                        {h.transferSize}B
                      </span>
                    )}
                    <span className="text-muted-foreground ml-auto">
                      {new Date(h.ts).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="break-all text-foreground">{h.url}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVboutDebug;
