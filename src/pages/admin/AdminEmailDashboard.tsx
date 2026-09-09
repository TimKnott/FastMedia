import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Inbox, Send, MailOpen, Reply, Archive, RefreshCw, Radio, RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';

type InboundEmail = {
  id: string;
  from_address: string | null;
  to_address: string | null;
  subject: string | null;
  body_plain: string | null;
  body_html: string | null;
  ai_reply: string | null;
  status: string | null;
  error_message: string | null;
  created_at: string;
};

type SentEmail = {
  id: string;
  message_id: string | null;
  template_name: string | null;
  recipient_email: string | null;
  status: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const isArchived = (s: string | null) => s === 'archived';
const inboxStatus = (s: string | null) =>
  s === 'read' || s === 'replied' || s === 'archived' ? s : 'unread';

const statusBadge = (s: string | null) => {
  switch (inboxStatus(s)) {
    case 'read': return <Badge variant="secondary">Read</Badge>;
    case 'replied': return <Badge className="bg-accent text-accent-foreground">Replied</Badge>;
    case 'archived': return <Badge variant="outline">Archived</Badge>;
    default: return <Badge>Unread</Badge>;
  }
};

const AdminEmailDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInbound, setSelectedInbound] = useState<InboundEmail | null>(null);
  const [selectedSent, setSelectedSent] = useState<SentEmail | null>(null);

  const { data: inbound = [], isLoading: loadingInbound, refetch: refetchInbound } = useQuery({
    queryKey: ['admin-inbound-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inbound_emails')
        .select('id, from_address, to_address, subject, body_plain, body_html, ai_reply, status, error_message, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as InboundEmail[];
    },
  });

  const { data: sent = [], isLoading: loadingSent, refetch: refetchSent } = useQuery({
    queryKey: ['admin-sent-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_send_log')
        .select('id, message_id, template_name, recipient_email, status, error_message, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as SentEmail[];
    },
  });

  // Near-real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-email-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbound_emails' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-inbound-emails'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_send_log' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-sent-emails'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const counts = useMemo(() => {
    const active = inbound.filter((e) => !isArchived(e.status));
    return {
      inbox: active.filter((e) => inboxStatus(e.status) === 'unread').length,
      sent: sent.filter((e) => e.status === 'sent').length,
      read: active.filter((e) => e.status === 'read').length,
      replied: active.filter((e) => e.status === 'replied').length,
      archived: inbound.filter((e) => isArchived(e.status)).length,
    };
  }, [inbound, sent]);

  const setInboundStatus = async (email: InboundEmail, status: string | null) => {
    const { error } = await supabase
      .from('inbound_emails')
      .update({ status })
      .eq('id', email.id)
      .select('id');
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    setSelectedInbound((cur) => (cur && cur.id === email.id ? { ...cur, status } : cur));
    queryClient.invalidateQueries({ queryKey: ['admin-inbound-emails'] });
  };

  const openInbound = (email: InboundEmail) => {
    setSelectedInbound(email);
    if (inboxStatus(email.status) === 'unread') {
      void setInboundStatus(email, 'read');
    }
  };

  const statCards = [
    { label: 'Inbox (unread)', value: counts.inbox, icon: Inbox },
    { label: 'Sent', value: counts.sent, icon: Send },
    { label: 'Read', value: counts.read, icon: MailOpen },
    { label: 'Replied', value: counts.replied, icon: Reply },
    { label: 'Archived', value: counts.archived, icon: Archive },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Dashboard</h1>
          <p className="text-sm text-muted-foreground">Incoming mail to support@fastmedia.pro and everything the site has sent.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1"><Radio className="h-3 w-3 text-accent" /> Live</Badge>
          <Button variant="outline" size="sm" onClick={() => { refetchInbound(); refetchSent(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox ({inbound.filter((e) => !isArchived(e.status)).length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({counts.archived})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingInbound ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
                  ) : inbound.filter((e) => !isArchived(e.status)).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No inbound emails yet. Once mail to support@fastmedia.pro is forwarded into the app, it will appear here.</TableCell></TableRow>
                  ) : (
                    inbound.filter((e) => !isArchived(e.status)).map((email) => (
                      <TableRow key={email.id} className="cursor-pointer" onClick={() => openInbound(email)}>
                        <TableCell className={inboxStatus(email.status) === 'unread' ? 'font-semibold' : ''}>{email.from_address || '—'}</TableCell>
                        <TableCell className={inboxStatus(email.status) === 'unread' ? 'font-semibold' : ''}>{email.subject || '(no subject)'}</TableCell>
                        <TableCell>{statusBadge(email.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(email.created_at), 'dd MMM yyyy HH:mm')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inbound.filter((e) => isArchived(e.status)).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nothing archived.</TableCell></TableRow>
                  ) : (
                    inbound.filter((e) => isArchived(e.status)).map((email) => (
                      <TableRow key={email.id} className="cursor-pointer" onClick={() => openInbound(email)}>
                        <TableCell>{email.from_address || '—'}</TableCell>
                        <TableCell>{email.subject || '(no subject)'}</TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(email.created_at), 'dd MMM yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); void setInboundStatus(email, 'read'); }}>
                            <RotateCcw className="h-4 w-4 mr-1" /> Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>To</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingSent ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
                  ) : sent.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No sent emails logged yet.</TableCell></TableRow>
                  ) : (
                    sent.map((email) => (
                      <TableRow key={email.id} className="cursor-pointer" onClick={() => setSelectedSent(email)}>
                        <TableCell>{email.recipient_email || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{email.template_name || '—'}</TableCell>
                        <TableCell>
                          {email.status === 'sent'
                            ? <Badge className="bg-accent text-accent-foreground">Sent</Badge>
                            : <Badge variant="destructive">{email.status || 'unknown'}</Badge>}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(email.created_at), 'dd MMM yyyy HH:mm')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inbound email body viewer */}
      <Dialog open={!!selectedInbound} onOpenChange={(open) => !open && setSelectedInbound(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedInbound && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedInbound.subject || '(no subject)'}</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">From:</span> {selectedInbound.from_address || '—'}</p>
                <p><span className="font-medium text-foreground">To:</span> {selectedInbound.to_address || '—'}</p>
                <p><span className="font-medium text-foreground">Received:</span> {format(new Date(selectedInbound.created_at), 'dd MMM yyyy HH:mm')}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => void setInboundStatus(selectedInbound, 'read')}>
                  <MailOpen className="h-4 w-4 mr-1" /> Mark read
                </Button>
                <Button variant="outline" size="sm" onClick={() => void setInboundStatus(selectedInbound, 'replied')}>
                  <Reply className="h-4 w-4 mr-1" /> Mark replied
                </Button>
                <Button variant="outline" size="sm" onClick={() => { void setInboundStatus(selectedInbound, 'archived'); setSelectedInbound(null); }}>
                  <Archive className="h-4 w-4 mr-1" /> Archive
                </Button>
              </div>
              <div className="pt-4">
                {selectedInbound.body_html ? (
                  <iframe
                    title="Email body"
                    sandbox=""
                    srcDoc={selectedInbound.body_html}
                    className="w-full min-h-[320px] rounded-md border border-border bg-background"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-4 text-sm text-foreground">
                    {selectedInbound.body_plain || '(no body)'}
                  </pre>
                )}
              </div>
              {selectedInbound.ai_reply && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-foreground pb-1">Suggested reply</p>
                  <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">{selectedInbound.ai_reply}</pre>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sent email detail viewer */}
      <Dialog open={!!selectedSent} onOpenChange={(open) => !open && setSelectedSent(null)}>
        <DialogContent className="max-w-2xl">
          {selectedSent && (
            <>
              <DialogHeader>
                <DialogTitle>Sent email</DialogTitle>
              </DialogHeader>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">To:</span> {selectedSent.recipient_email || '—'}</p>
                <p><span className="font-medium">Template:</span> {selectedSent.template_name || '—'}</p>
                <p><span className="font-medium">Status:</span> {selectedSent.status || 'unknown'}</p>
                <p><span className="font-medium">Sent:</span> {format(new Date(selectedSent.created_at), 'dd MMM yyyy HH:mm')}</p>
                {selectedSent.message_id && <p className="text-muted-foreground break-all"><span className="font-medium text-foreground">Message ID:</span> {selectedSent.message_id}</p>}
                {selectedSent.error_message && (
                  <p className="text-destructive"><span className="font-medium">Error:</span> {selectedSent.error_message}</p>
                )}
              </div>
              {typeof selectedSent.metadata?.html === 'string' ? (
                <iframe
                  title="Sent email body"
                  sandbox=""
                  srcDoc={selectedSent.metadata.html as string}
                  className="w-full min-h-[320px] rounded-md border border-border bg-background"
                />
              ) : (
                <p className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-4">
                  The full body of sent emails is rendered by the email service and is not stored in the log. Use the Email Templates page to preview what this template looks like.
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmailDashboard;
