import { useState } from 'react';
import { Activity, CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DiagResult {
  tracerLoaded: boolean;
  tracerLoadTime: number | null;
  apiStatus: number | null;
  apiOk: boolean;
  checkedAt: string;
}

const TrackingDiagnostics = () => {
  const [result, setResult] = useState<DiagResult | null>(null);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    const diag: DiagResult = {
      tracerLoaded: false,
      tracerLoadTime: null,
      apiStatus: null,
      apiOk: false,
      checkedAt: new Date().toLocaleTimeString(),
    };

    try {
      const start = performance.now();
      const scriptRes = await fetch('https://app.visitortracking.com/assets/js/tracer.js', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      diag.tracerLoadTime = Math.round(performance.now() - start);
      // no-cors returns opaque response (status 0) but if it doesn't throw, the server responded
      diag.tracerLoaded = true;
    } catch {
      diag.tracerLoaded = false;
    }

    try {
      const apiRes = await fetch(
        'https://app.visitortracking.com/api/vtservice/v1/website/getsite?id=7faf8105-a4f4-431b-8e8b-b55a29d9b284',
        { method: 'GET', mode: 'cors' }
      );
      diag.apiStatus = apiRes.status;
      diag.apiOk = apiRes.ok;
    } catch {
      diag.apiOk = false;
    }

    setResult(diag);
    setRunning(false);
  };

  const StatusIcon = ({ ok }: { ok: boolean }) =>
    ok ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-destructive" />
    );

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Tracking Diagnostics
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={runDiagnostics}
            disabled={running}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Checking…' : 'Run Check'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!result ? (
          <p className="text-sm text-muted-foreground">
            Click "Run Check" to test the visitor tracking script and API connectivity.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <StatusIcon ok={result.tracerLoaded} />
                <span className="text-sm font-medium">tracer.js</span>
              </div>
              <div className="flex items-center gap-2">
                {result.tracerLoadTime !== null && (
                  <Badge variant="secondary" className="gap-1 font-mono text-xs">
                    <Clock className="w-3 h-3" />
                    {result.tracerLoadTime}ms
                  </Badge>
                )}
                <Badge variant={result.tracerLoaded ? 'default' : 'destructive'}>
                  {result.tracerLoaded ? 'Reachable' : 'Unreachable'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <StatusIcon ok={result.apiOk} />
                <span className="text-sm font-medium">Tracking API</span>
              </div>
              <div className="flex items-center gap-2">
                {result.apiStatus !== null && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    HTTP {result.apiStatus}
                  </Badge>
                )}
                <Badge variant={result.apiOk ? 'default' : 'destructive'}>
                  {result.apiOk ? 'OK' : 'Error'}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-right">
              Last checked: {result.checkedAt}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackingDiagnostics;
