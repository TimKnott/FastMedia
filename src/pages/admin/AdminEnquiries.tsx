import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Inbox, Clock, Mail, Reply, Phone, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Enquiry = {
  id: string;
  kind: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  details: Record<string, string> | null;
  status: string;
  email_status: string | null;
  email_message_id: string | null;
  created_at: string;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  trade: string;
  score: number;
  classification: string;
  status: string;
  special_request: string | null;
  source: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  read: 'bg-muted text-muted-foreground',
  replied: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-muted text-muted-foreground',
};

const mailtoFor = (email: string, name: string, subject: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi ${name.split(' ')[0]},\n\nThank you for getting in touch with FastMedia.Pro.\n\n`)}`;

export const AdminEnquiries = ({ mailbox = 'contact' }: { mailbox?: 'contact' | 'quote' }) => {
  const isQuoteMailbox = mailbox === 'quote';
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [search, setSearch] = useState('');

  const { data: enquiries = [], isLoading: loadingEnquiries } = useQuery({
    queryKey: ['contact-enquiries', mailbox],
    queryFn: async () => {
      const query = supabase
        .from('contact_enquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);
      const { data, error } = isQuoteMailbox
        ? await query.eq('kind', 'quote')
        : await query.neq('kind', 'quote');
      if (error) throw error;
      return (data ?? []) as unknown as Enquiry[];
    },
    refetchInterval: 30_000,
  });

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ['enquiries-leads'],
    enabled: isQuoteMailbox,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id,name,email,phone,trade,score,classification,status,special_request,source,created_at')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as unknown as Lead[];
    },
    refetchInterval: 60_000,
  });

  const term = search.trim().toLowerCase();
  const match = (...values: (string | null | undefined)[]) =>
    !term || values.some(v => (v ?? '').toLowerCase().includes(term));

  const filteredEnquiries = enquiries.filter(e => match(e.name, e.email, e.company, e.message));
  const filteredLeads = leads.filter(l => match(l.name, l.email, l.trade, l.special_request));

  const markStatus = async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('contact_enquiries')
      .update({ status })
      .eq('id', id)
      .select('id');
    if (error || !data || data.length === 0) {
      toast.error('Could not update this enquiry — you may not have permission.');
      return;
    }
    toast.success(`Marked as ${status}.`);

    queryClient.invalidateQueries({ queryKey: ['contact-enquiries'] });
    setSelected(prev => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground flex items-start gap-3">
          <Inbox className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            Every message from the contact page and quote request page appears here, alongside calculator leads.
            Each one is also emailed to your private address as it arrives.
          </div>
        </CardContent>
      </Card>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email or text…" className="pl-9" />
      </div>

      <Tabs defaultValue="enquiries">
        <TabsList>
          <TabsTrigger value="enquiries">Enquiries ({filteredEnquiries.length})</TabsTrigger>
          <TabsTrigger value="leads">Leads ({filteredLeads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="enquiries" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead className="text-right">Reply</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingEnquiries ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-muted-foreground" />
                          <span className="text-muted-foreground">Loading…</span>
                        </TableCell>
                      </TableRow>
                    ) : filteredEnquiries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
                          No enquiries yet.
                        </TableCell>
                      </TableRow>
                    ) : filteredEnquiries.map(e => (
                      <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(e)}>
                        <TableCell className="text-sm">
                          <div className="font-medium text-foreground">{e.name}</div>
                          <div className="text-xs text-muted-foreground">{e.email}</div>
                        </TableCell>
                        <TableCell><Badge variant="secondary">{e.kind === 'quote' ? 'Quote' : 'Contact'}</Badge></TableCell>
                        <TableCell className="text-sm max-w-[280px] truncate">{e.message || '—'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[e.status] ?? 'bg-muted text-muted-foreground'} variant="secondary">{e.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(e.created_at), 'dd.MM.yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            onClick={ev => { ev.stopPropagation(); markStatus(e.id, 'replied'); }}
                          >
                            <a href={mailtoFor(e.email, e.name, e.kind === 'quote' ? 'Your quote from FastMedia.Pro' : 'Re: your message to FastMedia.Pro')}>
                              <Reply className="w-4 h-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Calculator and intake leads</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Trade</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead className="text-right">Reply</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingLeads ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-muted-foreground" />
                          <span className="text-muted-foreground">Loading…</span>
                        </TableCell>
                      </TableRow>
                    ) : filteredLeads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No leads found.</TableCell>
                      </TableRow>
                    ) : filteredLeads.map(l => (
                      <TableRow key={l.id}>
                        <TableCell className="text-sm">
                          <div className="font-medium text-foreground">{l.name}</div>
                          <div className="text-xs text-muted-foreground">{l.email}</div>
                        </TableCell>
                        <TableCell className="text-sm">{l.trade}</TableCell>
                        <TableCell className="text-sm">{l.score} <span className="text-xs text-muted-foreground">({l.classification})</span></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{l.source}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(l.created_at), 'dd.MM.yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <a href={mailtoFor(l.email, l.name, 'Your enquiry with FastMedia.Pro')}>
                              <Reply className="w-4 h-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.kind === 'quote' ? 'Quote request' : 'Contact enquiry'} — {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-[110px_1fr] gap-2 text-muted-foreground">
                <span>Email:</span><span className="text-foreground">{selected.email}</span>
                {selected.phone && (<><span>Phone:</span><span className="text-foreground">{selected.phone}</span></>)}
                {selected.company && (<><span>Company:</span><span className="text-foreground">{selected.company}</span></>)}
                <span>Received:</span><span className="text-foreground">{format(new Date(selected.created_at), 'dd.MM.yyyy HH:mm:ss')}</span>
                <span>Notification:</span><span className="text-foreground">{selected.email_status ?? 'unknown'}</span>
              </div>
              {selected.details && Object.keys(selected.details).length > 0 && (
                <div className="border-t pt-4 grid grid-cols-[130px_1fr] gap-2 text-muted-foreground">
                  {Object.entries(selected.details).map(([k, v]) => (
                    <div key={k} className="contents"><span>{k}:</span><span className="text-foreground">{v}</span></div>
                  ))}
                </div>
              )}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Message</h4>
                <pre className="whitespace-pre-wrap bg-muted/40 p-3 rounded text-xs">{selected.message || '(empty)'}</pre>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" asChild onClick={() => markStatus(selected.id, 'replied')}>
                  <a href={mailtoFor(selected.email, selected.name, selected.kind === 'quote' ? 'Your quote from FastMedia.Pro' : 'Re: your message to FastMedia.Pro')}>
                    <Reply className="w-4 h-4 mr-2" /> Reply by email
                  </a>
                </Button>
                {selected.phone && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${selected.phone}`}><Phone className="w-4 h-4 mr-2" /> Call</a>
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => markStatus(selected.id, 'read')}>Mark as read</Button>
                <Button size="sm" variant="ghost" onClick={() => markStatus(selected.id, 'archived')}>Archive</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEnquiries;
