import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Inbox, Clock, Mail, Sparkles, RefreshCw, Reply, Send, Archive, Check } from 'lucide-react';
import { format } from 'date-fns';
import EmailBody from '@/components/admin/EmailBody';

type InboundRow = {
  id: string;
  from_address: string;
  to_address: string;
  subject: string | null;
  body_plain: string | null;
  body_html: string | null;
  ai_reply: string | null;
  status: string;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
};

const statusColors: Record<string, string> = {
  received: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  read: 'bg-muted text-muted-foreground',
  replied: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-muted text-muted-foreground',
  skipped: 'bg-muted text-muted-foreground',
  ai_failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  ai_empty: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  send_failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const senderName = (address: string) => {
  const match = address.match(/^\s*"?([^"<]+?)"?\s*</);
  const label = (match ? match[1] : address.split('@')[0]).trim();
  return label.split(/\s+/)[0] || 'there';
};

const bareEmail = (address: string) => {
  const match = address.match(/<([^>]+)>/);
  return (match ? match[1] : address).trim();
};

export const AdminInbox = () => {
  const [selected, setSelected] = useState<InboundRow | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [tab, setTab] = useState<'open' | 'replied' | 'archived' | 'all'>('open');
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['inbound-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inbound_emails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as InboundRow[];
    },
    refetchInterval: 30_000,
  });

  const counts = {
    open: rows.filter(r => !['replied', 'archived'].includes(r.status)).length,
    replied: rows.filter(r => r.status === 'replied').length,
    archived: rows.filter(r => r.status === 'archived').length,
    all: rows.length,
  };
  const unread = rows.filter(r => r.status === 'received').length;

  const visible = rows.filter(r => {
    if (tab === 'all') return true;
    if (tab === 'open') return !['replied', 'archived'].includes(r.status);
    return r.status === tab;
  });

  const setStatus = async (row: InboundRow, status: string, quiet = false) => {
    const { data, error } = await supabase
      .from('inbound_emails')
      .update({ status })
      .eq('id', row.id)
      .select('id');
    if (error || !data || data.length === 0) {
      if (!quiet) toast.error('Could not update this message — you may not have permission.');
      return;
    }
    if (!quiet) toast.success(`Marked as ${status}.`);
    setSelected(prev => (prev && prev.id === row.id ? { ...prev, status } : prev));
    refetch();
  };

  const openMessage = (row: InboundRow) => {
    setSelected(row);
    if (row.status === 'received') setStatus(row, 'read', true);
  };

  const syncGoogle = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: { query: 'in:inbox newer_than:30d', maxResults: 40 },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      const res = data as { imported: number; scanned: number };
      toast.success(`Synced ${res.imported} new message${res.imported === 1 ? '' : 's'} from Google Workspace.`);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const startReply = (row: InboundRow) => {
    setSelected(row);
    const subject = row.subject?.toLowerCase().startsWith('re:') ? row.subject : `Re: ${row.subject || 'your message'}`;
    setReplySubject(subject);
    setReplyBody(`Hi ${senderName(row.from_address)},\n\nThank you for getting in touch with FastMedia.Pro.\n\n\n\nKind regards,\nTim\nFastMedia.Pro\n+420 797 864 432 | support@fastmedia.pro`);
    setReplyOpen(true);
  };

  const sendReply = async () => {
    if (!selected) return;
    if (!replyBody.trim()) {
      toast.error('Please write a reply first.');
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-send', {
        body: {
          to: bareEmail(selected.from_address),
          subject: replySubject,
          body: replyBody,
          inboundId: selected.id,
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      toast.success('Reply sent from your Google Workspace mailbox.');
      setReplyOpen(false);
      setSelected(prev => (prev ? { ...prev, status: 'replied' } : prev));
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The reply could not be sent.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground flex items-start gap-3">
          <Inbox className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            Every message arriving at <strong className="text-foreground">support@fastmedia.pro</strong> appears here.
            Replies are sent from that same Google Workspace mailbox, so the customer sees a normal email from you.
            {unread > 0 && <> <strong className="text-foreground">{unread} unread.</strong></>}
          </div>
          <Button size="sm" variant="outline" onClick={syncGoogle} disabled={syncing} className="flex-shrink-0">
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync now'}
          </Button>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
          <TabsTrigger value="replied">Replied ({counts.replied})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({counts.archived})</TabsTrigger>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Reply</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Loading…</span>
                    </TableCell>
                  </TableRow>
                ) : visible.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
                      Nothing here. Send a test email to <strong>support@fastmedia.pro</strong> and press Sync now.
                    </TableCell>
                  </TableRow>
                ) : visible.map(r => (
                  <TableRow
                    key={r.id}
                    className={`cursor-pointer hover:bg-muted/50 ${r.status === 'received' ? 'font-medium' : ''}`}
                    onClick={() => openMessage(r)}
                  >
                    <TableCell className="text-sm">{r.from_address}</TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate">{r.subject || '(no subject)'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[r.status] ?? 'bg-muted text-muted-foreground'} variant="secondary">
                        {r.status === 'received' ? 'unread' : r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(r.created_at), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={ev => { ev.stopPropagation(); startReply(r); }}>
                        <Reply className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected && !replyOpen} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.subject || '(no subject)'}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-[80px_1fr] gap-2 text-muted-foreground">
                <span>From:</span><span className="text-foreground">{selected.from_address}</span>
                <span>To:</span><span className="text-foreground">{selected.to_address}</span>
                <span>Received:</span><span className="text-foreground">{format(new Date(selected.created_at), 'dd.MM.yyyy HH:mm:ss')}</span>
                <span>Status:</span><span><Badge className={statusColors[selected.status] ?? 'bg-muted'} variant="secondary">{selected.status}</Badge></span>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Message</h4>
                <EmailBody html={selected.body_html} text={selected.body_plain} />
              </div>
              {selected.ai_reply && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Last reply sent</h4>
                  <pre className="whitespace-pre-wrap bg-primary/5 border border-primary/20 p-3 rounded text-xs">{selected.ai_reply}</pre>
                </div>
              )}
              {selected.error_message && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 text-destructive">Error</h4>
                  <pre className="whitespace-pre-wrap text-xs text-destructive">{selected.error_message}</pre>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" onClick={() => startReply(selected)}>
                  <Reply className="w-4 h-4 mr-2" /> Reply
                </Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(selected, 'read')}>
                  <Check className="w-4 h-4 mr-2" /> Mark as read
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(selected, 'archived')}>
                  <Archive className="w-4 h-4 mr-2" /> Archive
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={replyOpen} onOpenChange={(o) => { setReplyOpen(o); if (!o) setSending(false); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selected ? bareEmail(selected.from_address) : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={replySubject} onChange={e => setReplySubject(e.target.value)} placeholder="Subject" />
            <Textarea rows={12} value={replyBody} onChange={e => setReplyBody(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReplyOpen(false)} disabled={sending}>Cancel</Button>
              <Button onClick={sendReply} disabled={sending}>
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending…' : 'Send reply'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInbox;
