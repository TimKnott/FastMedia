import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SendTestEmail = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('timnott2011@gmail.com');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'newsletter-welcome',
          recipientEmail: email.trim(),
          idempotencyKey: `manual-test-${Date.now()}`,
          templateData: { recipientEmail: email.trim() },
        },
      });
      if (error) throw error;
      if ((data as { success?: boolean })?.success) {
        toast.success(`Test email queued for ${email.trim()}`);
        setOpen(false);
      } else {
        toast.error('Send failed: ' + JSON.stringify(data));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Send className="w-4 h-4" /> Send test email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a test email</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="test-recipient">Recipient</Label>
          <Input id="test-recipient" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p className="text-xs text-muted-foreground">
            Uses the <code>newsletter-welcome</code> template via the outbound queue. The result will appear in the Outbound log within ~5 seconds.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={send} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendTestEmail;
