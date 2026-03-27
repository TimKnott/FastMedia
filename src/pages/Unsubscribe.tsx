import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, MailX } from 'lucide-react';

type Status = 'loading' | 'valid' | 'already_unsubscribed' | 'invalid' | 'success' | 'error';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    const validate = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        if (!res.ok) { setStatus('invalid'); return; }
        const data = await res.json();
        if (data.valid === false && data.reason === 'already_unsubscribed') {
          setStatus('already_unsubscribed');
        } else if (data.valid) {
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch { setStatus('invalid'); }
    };
    validate();
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setConfirming(true);
    try {
      const { data, error } = await supabase.functions.invoke('handle-email-unsubscribe', {
        body: { token },
      });
      if (error) { setStatus('error'); }
      else if (data?.success) { setStatus('success'); }
      else if (data?.reason === 'already_unsubscribed') { setStatus('already_unsubscribed'); }
      else { setStatus('error'); }
    } catch { setStatus('error'); }
    setConfirming(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="p-8 text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Validating your request…</p>
            </>
          )}
          {status === 'valid' && (
            <>
              <MailX className="w-12 h-12 text-primary mx-auto" />
              <h1 className="text-xl font-bold text-foreground">Unsubscribe</h1>
              <p className="text-muted-foreground">
                Are you sure you want to unsubscribe from FastMedia.Pro emails?
              </p>
              <Button onClick={handleConfirm} disabled={confirming} className="w-full">
                {confirming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm Unsubscribe
              </Button>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h1 className="text-xl font-bold text-foreground">Unsubscribed</h1>
              <p className="text-muted-foreground">You've been successfully unsubscribed.</p>
            </>
          )}
          {status === 'already_unsubscribed' && (
            <>
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto" />
              <h1 className="text-xl font-bold text-foreground">Already Unsubscribed</h1>
              <p className="text-muted-foreground">You've already been unsubscribed from our emails.</p>
            </>
          )}
          {(status === 'invalid' || status === 'error') && (
            <>
              <XCircle className="w-12 h-12 text-destructive mx-auto" />
              <h1 className="text-xl font-bold text-foreground">
                {status === 'invalid' ? 'Invalid Link' : 'Something went wrong'}
              </h1>
              <p className="text-muted-foreground">
                {status === 'invalid'
                  ? 'This unsubscribe link is invalid or has expired.'
                  : 'Please try again later or contact support.'}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
